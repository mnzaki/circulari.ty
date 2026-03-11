/**
 * DeferredValue 🌀
 *
 * A promise-like container for multi-pass computation with lazy query API.
 *
 * "The value that will be, queried as if it already is."
 *
 * Inspired by spire-loom's Diviner pattern, but generalized for any
 * computation that may need multiple passes to stabilize.
 *
 * Key features:
 * - Returns stub values immediately (template-friendly)
 * - Provides lazy query API (BoundQuery-like)
 * - Multi-pass computation with feedback
 * - Configurable convergence criteria
 */

// ============================================================================
// Types
// ============================================================================

/** Result of a computation pass */
export interface ComputationResult<T> {
  /** The computed value */
  value: T;
  /** If true, another pass is needed */
  needsAnotherPass: boolean;
  /** Optional feedback on what changed */
  delta?: unknown;
}

/** Configuration for DeferredValue */
export interface DeferredValueConfig<T, S = string> {
  /** What to return during Phase 1 (collecting) */
  stub: S;
  /** The computation function - called each pass */
  compute: (previous: T | undefined, pass: number) => ComputationResult<T>;
  /** Maximum number of passes before forcing completion (default: 3) */
  maxPasses?: number;
  /** Called when computation completes */
  onComplete?: (value: T, passes: number) => void;
  /** Called on each pass */
  onPass?: (pass: number, result: ComputationResult<T>) => void;
}

/** Query predicate function */
export type Predicate<T> = (item: T) => boolean;

/** Transform function */
export type Transform<T, U> = (item: T) => U;

// ============================================================================
// Lazy Query API
// ============================================================================

/**
 * Chainable, lazy query over a deferred value.
 *
 * Similar to BoundQuery but designed for single values that will become
 * collections (or single values that need transformation).
 */
export class DeferredQuery<T> implements Iterable<T> {
  private filters: Predicate<T>[] = [];
  private transformations: Transform<any, any>[] = [];
  private cachedResult: T[] | undefined;

  constructor(
    private getSource: () => T[],
    private contextName: string = 'deferred'
  ) {}

  /** Add a filter - returns new query (immutable) */
  filter(predicate: Predicate<T>): DeferredQuery<T> {
    const q = this._clone();
    q.filters.push(predicate);
    return q;
  }

  /** Transform items - returns new query with different type */
  map<U>(fn: Transform<T, U>): DeferredQuery<U> {
    const q = this._clone() as DeferredQuery<U>;
    q.transformations.push(fn as Transform<any, any>);
    return q;
  }

  /** Get all matching items (terminal) */
  get all(): T[] {
    if (this.cachedResult === undefined) {
      this._evaluate();
    }
    return this.cachedResult!;
  }

  /** Get first matching item (terminal) */
  get first(): T | undefined {
    return this.all[0];
  }

  /** Get count of matching items (terminal) */
  get count(): number {
    return this.all.length;
  }

  /** Check if any items match (terminal) */
  get hasAny(): boolean {
    return this.all.length > 0;
  }

  /** Find single item matching predicate (terminal) */
  find(predicate: Predicate<T>): T | undefined {
    return this.all.find(predicate);
  }

  /** Check if any item matches predicate (terminal) */
  some(predicate: Predicate<T>): boolean {
    return this.all.some(predicate);
  }

  /** Check if all items match predicate (terminal) */
  every(predicate: Predicate<T>): boolean {
    return this.all.every(predicate);
  }

  /** Iterate over items */
  *[Symbol.iterator](): Iterator<T> {
    yield* this.all;
  }

  /** Clear cached result - forces re-evaluation */
  invalidate(): void {
    this.cachedResult = undefined;
  }

  private _evaluate(): void {
    let result = this.getSource();

    // Apply transformations
    for (const transform of this.transformations) {
      result = result.map(transform);
    }

    // Apply filters
    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    this.cachedResult = result;
  }

  private _clone(): DeferredQuery<T> {
    const q = new DeferredQuery<T>(this.getSource, this.contextName);
    q.filters = [...this.filters];
    q.transformations = [...this.transformations];
    return q;
  }
}

// ============================================================================
// DeferredValue Implementation
// ============================================================================

/**
 * A value that will be computed in multiple passes.
 *
 * During Phase 1 (collecting), returns a stub value suitable for templates.
 * During Phase 2 (rendering), returns the actual computed value.
 *
 * Provides a lazy query API for querying the eventual value.
 */
export class DeferredValue<T, S = string> {
  private stage: 'collecting' | 'rendering' = 'collecting';
  private cachedValue: T | undefined;
  private passCount = 0;
  private queryInstance: DeferredQuery<T>;

  constructor(private config: DeferredValueConfig<T, S>) {
    // Create query that will eventually query over the computed value
    this.queryInstance = new DeferredQuery<T>(
      () => this._getValueAsArray(),
      'deferred'
    );
  }

  // ========================================================================
  // Phase Management
  // ========================================================================

  /** Current stage of computation */
  get stage(): 'collecting' | 'rendering' {
    return this.stage;
  }

  /** Number of passes completed */
  get passesCompleted(): number {
    return this.passCount;
  }

  /** Whether computation is complete */
  get isComplete(): boolean {
    return this.stage === 'rendering';
  }

  // ========================================================================
  // Value Access
  // ========================================================================

  /**
   * Get the value.
   *
   * Phase 1: Returns the configured stub
   * Phase 2: Returns the computed value
   */
  get value(): T | S {
    if (this.stage === 'collecting') {
      return this.config.stub;
    }
    return this.cachedValue as T;
  }

  /**
   * Get the value as a string (for templates).
   *
   * In Phase 1, returns a placeholder that can trigger re-render.
   * In Phase 2, returns the string representation of the value.
   */
  toString(): string {
    if (this.stage === 'collecting') {
      // Return a placeholder that the template system can recognize
      return `{{ DEFERRED[${this.config.stub}] }}`;
    }
    return String(this.cachedValue);
  }

  /**
   * Force access to the actual value (may be undefined in Phase 1).
   */
  get actualValue(): T | undefined {
    return this.cachedValue;
  }

  // ========================================================================
  // Computation
  // ========================================================================

  /**
   * Run one pass of computation.
   *
   * @returns Object indicating completion status and whether another pass is needed
   */
  runPass(): { complete: boolean; needsAnotherPass: boolean; delta?: unknown } {
    this.passCount++;

    const result = this.config.compute(this.cachedValue, this.passCount);
    this.cachedValue = result.value;

    // Notify onPass callback
    this.config.onPass?.(this.passCount, result);

    // Check if complete
    const maxPasses = this.config.maxPasses ?? 3;
    const forcedComplete = this.passCount >= maxPasses;

    if (!result.needsAnotherPass || forcedComplete) {
      this.stage = 'rendering';
      this.config.onComplete?.(result.value, this.passCount);
      return {
        complete: true,
        needsAnotherPass: false,
        delta: result.delta
      };
    }

    return {
      complete: false,
      needsAnotherPass: true,
      delta: result.delta
    };
  }

  /**
   * Run computation until complete.
   *
   * @returns The final value
   */
  runToCompletion(): T {
    while (this.stage === 'collecting') {
      const result = this.runPass();
      if (result.complete) break;
    }
    return this.cachedValue!;
  }

  // ========================================================================
  // Query API
  // ========================================================================

  /**
   * Get a query API over the eventual value.
   *
   * The query is lazy - it won't evaluate until a terminal operation is called.
   * If the value is not yet an array, it will be wrapped as one.
   */
  get query(): DeferredQuery<T> {
    // Invalidate query cache since value may have changed
    this.queryInstance.invalidate();
    return this.queryInstance;
  }

  /**
   * Query the value directly if it's an array.
   *
   * Alias for `.query` with better ergonomics for array values.
   */
  get entries(): DeferredQuery<T> {
    return this.query;
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private _getValueAsArray(): T[] {
    const v = this.cachedValue;
    if (v === undefined) return [];
    if (Array.isArray(v)) return v;
    return [v];
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a DeferredValue for multi-pass computation.
 */
export function defer<T, S = string>(
  config: DeferredValueConfig<T, S>
): DeferredValue<T, S> {
  return new DeferredValue(config);
}

/**
 * Create a DeferredValue that collects items over multiple passes.
 *
 * Similar to how ImportsAccumulator works in spire-loom.
 */
export function deferCollection<T>(config: {
  stub: string;
  collect: (existing: T[], pass: number) => { items: T[]; done: boolean };
  maxPasses?: number;
}): DeferredValue<T[], string> {
  return new DeferredValue({
    stub: config.stub,
    maxPasses: config.maxPasses,
    compute: (previous, pass) => {
      const current = previous ?? [];
      const { items, done } = config.collect(current, pass);
      return {
        value: items,
        needsAnotherPass: !done
      };
    }
  });
}

/**
 * Create a DeferredValue that transforms a source value over passes.
 */
export function deferTransform<T, U>(config: {
  source: () => T;
  stub: string;
  transform: (source: T, previous: U | undefined, pass: number) => { value: U; done: boolean };
  maxPasses?: number;
}): DeferredValue<U, string> {
  return new DeferredValue({
    stub: config.stub,
    maxPasses: config.maxPasses,
    compute: (previous, pass) => {
      const source = config.source();
      const { value, done } = config.transform(source, previous, pass);
      return {
        value,
        needsAnotherPass: !done
      };
    }
  });
}

// ============================================================================
// Re-exports
// ============================================================================

export { DeferredQuery };
