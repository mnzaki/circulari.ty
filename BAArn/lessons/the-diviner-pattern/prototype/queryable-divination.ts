/**
 * QueryableDivination 🌀
 *
 * Bridges Divination Engine with spire-loom's BoundQuery architecture.
 *
 * A QueryableDivination is a Queryable item that wraps a Divination.
 * It can be used as a source item in BoundQuery, enabling filtering/sorting
 * on divined (computed) values.
 *
 * "The BoundQuery filters what the Divination reveals."
 */

import type {
  LanguageDefinitionImperative
} from '../../../../o19/packages/spire-loom/machinery/reed/language/imperative.js';

// ============================================================================
// Core Divination Types (minimal, compatible with v2)
// ============================================================================

export interface Divination<T> {
  readonly _tag: 'divination';
  readonly id: string;

  /** The shape/structure of the result */
  readonly shape: DivinationShape<T>;

  /** Resolution state */
  resolved: boolean;
  value?: T;

  /** Resolve the divination (may take multiple rounds) */
  resolve(): Promise<T>;

  /** Watch resolution progress */
  watch(): AsyncGenerator<DivinationRound<T>>;
}

export interface DivinationShape<T> {
  /** The TypeScript type (for inference) */
  _type?: T;

  /** Dependencies this divination has */
  deps: string[];

  /** How to compute the value given resolved deps */
  compute: (deps: Record<string, any>) => Promise<T> | T;
}

export interface DivinationRound<T> {
  round: number;
  resolved: Map<string, any>;
  complete: boolean;
  value?: T;
}

// ============================================================================
// QueryableDivination Interface
// ============================================================================

/**
 * A Divination that implements Queryable, enabling BoundQuery compatibility.
 *
 * This bridges the gap between:
 * - Divination: async, multi-round computation
 * - Queryable: synchronous item with language/tag metadata
 */
export interface QueryableDivination<T = any> {
  // ===== Queryable Interface (for BoundQuery compatibility) =====

  /** Language definition (from spire-loom) */
  lang: LanguageDefinitionImperative;

  /** Optional tags for filtering */
  tags?: string[];

  /** Clone with different language (required by Queryable) */
  cloneWithLang(lang: LanguageDefinitionImperative): QueryableDivination<T>;

  // ===== Divination Interface =====

  /** The underlying divination */
  readonly divination: Divination<T>;

  /** Access the resolved value (throws if not resolved) */
  get value(): T;

  /** Check if resolved */
  get isResolved(): boolean;

  /** Resolve the divination */
  resolve(): Promise<T>;

  // ===== BoundQuery Integration =====

  /**
   * For filtering: gets the value to compare.
   * If not resolved, returns undefined (item won't match filters).
   */
  getFilterValue(): T | undefined;
}

// ============================================================================
// Implementation
// ============================================================================

let divinationIdCounter = 0;

export function createDivination<T>(
  shape: DivinationShape<T>,
  options: {
    lang: LanguageDefinitionImperative;
    tags?: string[];
  }
): Divination<T> {
  const id = `divination_${++divinationIdCounter}`;

  const divination: Divination<T> = {
    _tag: 'divination',
    id,
    shape,
    resolved: false,

    async resolve(): Promise<T> {
      if (this.resolved) return this.value!;

      // Simple single-round resolution for now
      // (Multi-round would iterate through deps)
      const depValues: Record<string, any> = {};

      const result = await shape.compute(depValues);
      this.value = result;
      this.resolved = true;

      return result;
    },

    async *watch(): AsyncGenerator<DivinationRound<T>> {
      // Yield initial state
      yield {
        round: 0,
        resolved: new Map(),
        complete: false
      };

      // Resolve
      const result = await this.resolve();

      // Yield final state
      yield {
        round: 1,
        resolved: new Map(),
        complete: true,
        value: result
      };
    }
  };

  return divination;
}

export function createQueryableDivination<T>(
  shape: DivinationShape<T>,
  options: {
    lang: LanguageDefinitionImperative;
    tags?: string[];
  }
): QueryableDivination<T> {
  const divination = createDivination(shape, options);

  const self: QueryableDivination<T> = {
    // Queryable interface
    lang: options.lang,
    tags: options.tags,

    cloneWithLang(newLang: LanguageDefinitionImperative): QueryableDivination<T> {
      // Create new QueryableDivination with same shape, different language
      return createQueryableDivination(this.divination.shape, {
        lang: newLang,
        tags: this.tags
      });
    },

    // Divination interface
    divination,

    get value(): T {
      if (!divination.resolved) {
        throw new Error(`Divination ${divination.id} not resolved. Call resolve() first.`);
      }
      return divination.value!;
    },

    get isResolved(): boolean {
      return divination.resolved;
    },

    async resolve(): Promise<T> {
      return divination.resolve();
    },

    // BoundQuery integration
    getFilterValue(): T | undefined {
      return divination.resolved ? divination.value : undefined;
    }
  };

  return self;
}

// ============================================================================
// BoundQuery Adapter
// ============================================================================

import { BoundQuery, createQueryAPI } from '../../../../o19/packages/spire-loom/machinery/sley/query.js';

/**
 * Create a BoundQuery from QueryableDivinations.
 *
 * The divinations must be resolved BEFORE filtering will work correctly.
 * This is because BoundQuery's evaluate() is synchronous.
 */
export function createDivinationQuery<T>(
  divinations: QueryableDivination<T>[],
  contextName: string = 'divinations'
): BoundQuery<QueryableDivination<T>> {
  return createQueryAPI(divinations, contextName);
}

/**
 * Resolve all divinations in a query, then return filtered results.
 *
 * This is the recommended pattern when you need to filter on divined values:
 *
 * ```typescript
 * const query = createDivinationQuery(myDivinations);
 * const resolved = await resolveAndFilter(query, d => d.value.count > 5);
 * ```
 */
export async function resolveAndFilter<T>(
  query: BoundQuery<QueryableDivination<T>>,
  predicate: (value: T) => boolean
): Promise<T[]> {
  // Resolve all divinations first
  const all = query.all;
  await Promise.all(all.map(d => d.resolve()));

  // Now filter on resolved values
  return all
    .filter(d => predicate(d.value))
    .map(d => d.value);
}

// ============================================================================
// Examples
// ============================================================================

/**
 * Example: ImportEntry divination compatible with BoundQuery.
 */
export interface ImportEntry {
  name: string;
  path: string;
  isEntity: boolean;
}

/**
 * Create a QueryableDivination for imports from methods.
 */
export function createImportsDivinationQueryable(
  methods: Array<{ name: string; returnType: { name: string; isEntity: boolean } }>,
  lang: LanguageDefinitionImperative
): QueryableDivination<ImportEntry[]> {
  return createQueryableDivination<ImportEntry[]>(
    {
      deps: [], // No external deps - methods are provided at creation
      compute: async () => {
        // Collect entity imports
        const imports = methods
          .filter(m => m.returnType.isEntity)
          .map(m => ({
            name: m.returnType.name,
            path: `./entities/${m.returnType.name}`,
            isEntity: true
          }));

        // Deduplicate
        const seen = new Set<string>();
        return imports.filter(imp => {
          if (seen.has(imp.name)) return false;
          seen.add(imp.name);
          return true;
        });
      }
    },
    {
      lang,
      tags: ['imports', 'generated']
    }
  );
}

/**
 * Example usage with BoundQuery:
 *
 * ```typescript
 * const methods = [...]; // Method metadata
 *
 * // Create divinations for each method's imports
 * const importDivinations = methods.map(m =>
 *   createQueryableDivination({ ... }, { lang: typescript })
 * );
 *
 * // Create BoundQuery (divinations not resolved yet!)
 * const query = createDivinationQuery(importDivinations);
 *
 * // Option 1: Resolve then filter
 * const entityImports = await resolveAndFilter(
 *   query,
 *   entries => entries.some(e => e.isEntity)
 * );
 *
 * // Option 2: Use tags (synchronous, no resolution needed)
 * const importQueries = query.tag('imports').all;
 * ```
 */
