/**
 * Deferred Shape v2 🌀
 * 
 * Shape-driven round discovery with mejs re-rendering.
 * 
 * "Define shape, not computation."
 */

// ============================================================================
// Shape Definition
// ============================================================================

export type Shape<T = any> = 
  | PrimitiveShape<T>
  | ArrayShape<T>
  | ObjectShape<T>
  | DeferredShape<T>;

export interface PrimitiveShape<T> {
  readonly _shape: 'primitive';
  readonly type: 'string' | 'number' | 'boolean';
  default?: T;
}

export interface ArrayShape<T> {
  readonly _shape: 'array';
  item: Shape<T>;
}

export interface ObjectShape<T> {
  readonly _shape: 'object';
  properties: { [K in keyof T]: Shape<T[K]> };
}

export interface DeferredShape<T> {
  readonly _shape: 'deferred';
  name: string;
  resolve: (context: ResolutionContext) => Promise<T> | T;
  deps: string[]; // Paths this depends on
}

export interface ResolutionContext {
  root: any;
  path: string[];
  get(path: string): any;
}

// ============================================================================
// Shape Constructors
// ============================================================================

export const Shape = {
  string(defaultValue?: string): PrimitiveShape<string> {
    return { _shape: 'primitive', type: 'string', default: defaultValue };
  },
  
  number(defaultValue?: number): PrimitiveShape<number> {
    return { _shape: 'primitive', type: 'number', default: defaultValue };
  },
  
  boolean(defaultValue?: boolean): PrimitiveShape<boolean> {
    return { _shape: 'primitive', type: 'boolean', default: defaultValue };
  },
  
  array<T>(item: Shape<T>): ArrayShape<T> {
    return { _shape: 'array', item };
  },
  
  object<T>(properties: { [K in keyof T]: Shape<T[K]> }): ObjectShape<T> {
    return { _shape: 'object', properties };
  },
  
  deferred<T>(
    name: string,
    deps: string[],
    resolve: (ctx: ResolutionContext) => Promise<T> | T
  ): DeferredShape<T> {
    return { _shape: 'deferred', name, deps, resolve };
  }
};

// ============================================================================
// Graph Analysis
// ============================================================================

export interface ShapeNode {
  id: string;
  path: string;
  shape: Shape;
  deps: string[]; // Paths of dependencies
  round: number;  // Discovered round
}

/**
 * Analyze a shape definition to build dependency graph.
 */
export function analyzeShape(
  shape: Shape,
  path: string = 'root'
): ShapeNode[] {
  const nodes: ShapeNode[] = [];
  
  function walk(current: Shape, currentPath: string, depth: number = 0) {
    switch (current._shape) {
      case 'primitive':
        // Primitives have no deps
        break;
        
      case 'array':
        // Walk item shape
        walk(current.item, `${currentPath}[]`, depth + 1);
        break;
        
      case 'object':
        // Walk each property
        for (const [key, prop] of Object.entries(current.properties)) {
          walk(prop as Shape, `${currentPath}.${key}`, depth + 1);
        }
        break;
        
      case 'deferred':
        // Deferred has explicit deps
        nodes.push({
          id: `node_${nodes.length}`,
          path: currentPath,
          shape: current,
          deps: current.deps.map(d => `${path}.${d}`),
          round: -1 // Will be assigned
        });
        break;
    }
  }
  
  walk(shape, path);
  return nodes;
}

/**
 * Discover rounds from dependency graph.
 * Returns rounds: round 0 = no deps, round N = depends on round N-1
 */
export function discoverRounds(nodes: ShapeNode[]): ShapeNode[][] {
  const rounds: ShapeNode[][] = [];
  const resolved = new Set<string>();
  
  // Assign rounds
  let roundNum = 0;
  while (nodes.some(n => n.round === -1)) {
    const roundNodes = nodes.filter(n => 
      n.round === -1 && 
      n.deps.every(d => resolved.has(d))
    );
    
    if (roundNodes.length === 0 && nodes.some(n => n.round === -1)) {
      throw new Error('Circular dependency detected in shape');
    }
    
    for (const node of roundNodes) {
      node.round = roundNum;
      resolved.add(node.path);
    }
    
    rounds.push(roundNodes);
    roundNum++;
  }
  
  return rounds;
}

// ============================================================================
// Resolution
// ============================================================================

export interface DeferredValue {
  readonly _deferred: true;
  readonly path: string;
  readonly shape: Shape;
  value?: any;
  resolved: boolean;
  
  // For template integration
  toString(): string;
}

export function createDeferredValue(
  path: string,
  shape: Shape
): DeferredValue {
  return {
    _deferred: true,
    path,
    shape,
    resolved: false,
    
    toString() {
      // If resolved, return value
      if (this.resolved) {
        return formatValue(this.value, this.shape);
      }
      // Otherwise return placeholder for re-rendering
      return `{{ ${this.path} }}`;
    }
  };
}

function formatValue(value: any, shape: Shape): string {
  if (value === null || value === undefined) return '';
  
  switch (shape._shape) {
    case 'primitive':
      return String(value);
    case 'array':
      return JSON.stringify(value); // Or custom formatting
    case 'object':
      return JSON.stringify(value);
    case 'deferred':
      return String(value);
  }
}

// ============================================================================
// Context Builder
// ============================================================================

export function buildContext(
  shape: Shape,
  bindings: Record<string, () => any>,
  path: string = 'root'
): any {
  const context: any = {};
  
  switch (shape._shape) {
    case 'primitive':
      return createDeferredValue(path, shape);
      
    case 'array':
      // Arrays are deferred values that resolve to arrays
      return createDeferredValue(path, shape);
      
    case 'object':
      for (const [key, prop] of Object.entries(shape.properties)) {
        const binding = bindings[key];
        if (binding) {
          // Has binding - create deferred that calls it
          context[key] = {
            ...createDeferredValue(`${path}.${key}`, prop as Shape),
            _binding: binding
          };
        } else {
          // No binding - recurse
          context[key] = buildContext(prop as Shape, {}, `${path}.${key}`);
        }
      }
      return context;
      
    case 'deferred':
      return createDeferredValue(path, shape);
  }
  
  return context;
}

// ============================================================================
// Resolution Engine
// ============================================================================

export interface ResolutionResult {
  round: number;
  resolved: Map<string, any>;
  context: any;
}

export async function* resolveShape(
  shape: Shape,
  bindings: Record<string, () => any>,
  initialContext: any = {}
): AsyncGenerator<ResolutionResult> {
  // Analyze shape
  const nodes = analyzeShape(shape);
  const rounds = discoverRounds(nodes);
  
  // Build context with deferred values
  const context = buildContext(shape, bindings);
  Object.assign(context, initialContext);
  
  const resolved = new Map<string, any>();
  
  for (let roundNum = 0; roundNum < rounds.length; roundNum++) {
    const roundNodes = rounds[roundNum];
    
    // Resolve all nodes in this round
    await Promise.all(
      roundNodes.map(async (node) => {
        if (node.shape._shape !== 'deferred') return;
        
        const deferred = node.shape;
        const ctx: ResolutionContext = {
          root: context,
          path: node.path.split('.'),
          get: (p: string) => resolved.get(p) ?? getPath(context, p)
        };
        
        try {
          const value = await deferred.resolve(ctx);
          resolved.set(node.path, value);
          setPath(context, node.path, value);
        } catch (err) {
          console.error(`Failed to resolve ${node.path}:`, err);
        }
      })
    );
    
    yield {
      round: roundNum,
      resolved: new Map(resolved),
      context
    };
  }
}

// ============================================================================
// Path Utilities
// ============================================================================

function getPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function setPath(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}
