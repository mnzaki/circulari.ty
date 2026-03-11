/**
 * Divination Engine 🌀
 * 
 * Round-based lazy computation with mejs template integration.
 * 
 * "Program as structure, execution as filling."
 */

// ============================================================================
// Core Types: The Computation Graph
// ============================================================================

export type Stub<T> = 
  | SourceStub<T>
  | Transform<T, any>
  | QuotableStub<T>;

export interface SourceStub<T> {
  readonly _tag: 'source';
  readonly id: string;
  source: string;
  params: Stub<any>[];
  materialize: (resolved: any[]) => T | Promise<T>;
  isRipe: (resolvedDeps: Map<string, any>) => boolean;
  _cached?: T;
  _status: 'pending' | 'materializing' | 'resolved' | 'error';
}

export interface Transform<T, Deps extends Stub<any>[]> {
  readonly _tag: 'transform';
  readonly id: string;
  deps: { [K in keyof Deps]: Deps[K] };
  compute: (...values: any[]) => T;
  _cached?: T;
}

export interface QuotableStub<T> {
  readonly _tag: 'quotable';
  readonly id: string;
  inner: Stub<T>;
  quoteDepth: number;
  toString(): string;
  expand(): T | string;
}

// ============================================================================
// Stub Constructors
// ============================================================================

let stubIdCounter = 0;

export function source<T>(
  sourceName: string,
  params: Stub<any>[],
  materialize: (resolved: any[]) => T | Promise<T>
): SourceStub<T> {
  return {
    _tag: 'source',
    id: `source_${++stubIdCounter}`,
    source: sourceName,
    params,
    materialize,
    isRipe: (resolved) => params.every(p => resolved.has(p.id)),
    _status: 'pending'
  };
}

export function transform<T, Deps extends Stub<any>[]>(
  deps: Deps,
  compute: (...values: any[]) => T
): Transform<T, Deps> {
  return {
    _tag: 'transform',
    id: `transform_${++stubIdCounter}`,
    deps: deps as any,
    compute
  };
}

export function quotable<T>(inner: Stub<T>, depth: number = 1): QuotableStub<T> {
  const self: QuotableStub<T> = {
    _tag: 'quotable',
    id: `quotable_${++stubIdCounter}`,
    inner,
    quoteDepth: depth,
    toString() {
      // BRANCH 1: Quoted - return mejs-compatible stub
      if (this.quoteDepth > 0) {
        return `{{ __diviner_resolve_${this.id} }}`;
      }
      // BRANCH 2: Rendered - expand inner
      const expanded = expandStub(this.inner);
      return String(expanded);
    },
    expand() {
      return expandStub(this.inner);
    }
  };
  return self;
}

// ============================================================================
// The Solver: Round-Based Resolution
// ============================================================================

export interface RoundResult {
  round: number;
  materialized: Map<string, any>;
  errors: Map<string, Error>;
  complete: boolean;
}

export class DivinationSolver {
  private resolved = new Map<string, any>();
  private errors = new Map<string, Error>();
  private round = 0;

  constructor(private stubs: Map<string, Stub<any>>) {}

  async *solve(): AsyncGenerator<RoundResult> {
    while (true) {
      this.round++;
      
      // IDENTIFY: Find ripe SourceStubs
      const ripeStubs: SourceStub<any>[] = [];
      for (const stub of this.stubs.values()) {
        if (stub._tag === 'source' && stub._status === 'pending') {
          if (stub.isRipe(this.resolved)) {
            ripeStubs.push(stub);
          }
        }
      }

      // MATERIALIZE: Execute ripe stubs
      if (ripeStubs.length > 0) {
        await Promise.all(
          ripeStubs.map(async (stub) => {
            try {
              stub._status = 'materializing';
              const depValues = stub.params.map(p => this.resolved.get(p.id));
              const result = await stub.materialize(depValues);
              this.resolved.set(stub.id, result);
              stub._cached = result;
              stub._status = 'resolved';
            } catch (err) {
              stub._status = 'error';
              this.errors.set(stub.id, err as Error);
            }
          })
        );
      }

      // EVALUATE: Compute transforms that can now resolve
      let progress = ripeStubs.length > 0;
      for (const stub of this.stubs.values()) {
        if (stub._tag === 'transform' && !this.resolved.has(stub.id)) {
          const depIds = stub.deps.map((d: Stub<any>) => d.id);
          const allDepsReady = depIds.every((id: string) => this.resolved.has(id));
          
          if (allDepsReady) {
            const depValues = stub.deps.map((d: Stub<any>) => this.resolved.get(d.id));
            const result = stub.compute(...depValues);
            this.resolved.set(stub.id, result);
            stub._cached = result;
            progress = true;
          }
        }
      }

      yield {
        round: this.round,
        materialized: new Map(this.resolved),
        errors: new Map(this.errors),
        complete: !progress && this.errors.size === 0
      };

      if (!progress) break;
    }
  }

  getResult<T>(stubId: string): T | undefined {
    return this.resolved.get(stubId);
  }
}

// ============================================================================
// Stub Expansion
// ============================================================================

function expandStub<T>(stub: Stub<T>): T {
  switch (stub._tag) {
    case 'source':
    case 'transform':
      if (stub._cached === undefined) {
        throw new Error(`Stub ${stub.id} not resolved yet`);
      }
      return stub._cached;
    case 'quotable':
      return expandStub(stub.inner);
  }
}

// ============================================================================
// Divination Builder
// ============================================================================

export interface Divination<T> {
  readonly root: Stub<T>;
  readonly stubs: Map<string, Stub<any>>;
  resolve(): Promise<T>;
  watch(): AsyncIterable<RoundResult & { value?: T }>;
}

export function createDivination<T>(
  builder: (utils: {
    source: typeof source;
    transform: typeof transform;
    quotable: typeof quotable;
  }) => Stub<T>
): Divination<T> {
  // Reset counter for determinism
  stubIdCounter = 0;
  
  const root = builder({ source, transform, quotable });
  const stubs = collectStubs(root);

  return {
    root,
    stubs,
    
    async resolve(): Promise<T> {
      const solver = new DivinationSolver(stubs);
      let lastResult: RoundResult | undefined;
      
      for await (const result of solver.solve()) {
        lastResult = result;
      }

      if (lastResult && lastResult.errors.size > 0) {
        const firstError = lastResult.errors.values().next().value;
        throw new Error(`Divination failed: ${firstError.message}`);
      }

      // Handle quotable root - resolve the inner stub
      const targetId = root._tag === 'quotable' ? root.inner.id : root.id;
      const finalValue = solver.getResult<T>(targetId);
      if (finalValue === undefined) {
        throw new Error('Divination completed but root stub not resolved');
      }
      return finalValue;
    },

    async *watch(): AsyncGenerator<RoundResult & { value?: T }> {
      const solver = new DivinationSolver(stubs);
      const targetId = root._tag === 'quotable' ? root.inner.id : root.id;
      
      for await (const result of solver.solve()) {
        const value = solver.getResult<T>(targetId);
        yield { ...result, value };
      }
    }
  };
}

function collectStubs(root: Stub<any>): Map<string, Stub<any>> {
  const stubs = new Map<string, Stub<any>>();
  const visited = new Set<string>();

  function visit(stub: Stub<any>) {
    if (visited.has(stub.id)) return;
    visited.add(stub.id);
    stubs.set(stub.id, stub);

    switch (stub._tag) {
      case 'source':
        stub.params.forEach(visit);
        break;
      case 'transform':
        stub.deps.forEach(visit);
        break;
      case 'quotable':
        visit(stub.inner);
        break;
    }
  }

  visit(root);
  return stubs;
}
