# Divination Engine v2: Shape-Driven Round Discovery 🌀

## Core Insight

> "Don't define computation. Define shape. Let the graph tell you how many passes."

## The Problem with v1

In v1, users write:
```typescript
transform([a, b], (x, y) => x + y)  // ← User defines HOW to compute
```

This is wrong because:
- User must manually track dependencies
- Round count is explicit in code structure
- Not integrated with mejs's natural re-rendering

## The v2 Design: Deferred Values via Shape

### 1. Define Shape, Not Computation

```typescript
// User only describes what the result looks like
const dashboard = deferShape({
  user: User,           // Type reference
  posts: [Post],        // Array type  
  stats: {
    count: Number,      // Nested shape
    latest: Post
  }
});
```

### 2. Bind to Data Sources

```typescript
// Bind shape to actual data sources
const bound = bindShape(dashboard, {
  user: () => db.users.findById(userId),  // ← SourceStub
  posts: (ctx) => db.posts.where({ author: ctx.user.id })  // ← Depends on user
});
```

### 3. The DivinationProvider

```typescript
const provider = createDivinationProvider({
  // mejs integration: reparse output to find deferred values
  templateEngine: mejs,
  
  // How to identify deferred placeholders in output
  placeholderPattern: /\{\{\s*([^}]+)\s*\}\}/g,
  
  // Max passes before giving up
  maxPasses: 10
});
```

### 4. Render with Automatic Round Discovery

```typescript
// Template uses bound values
const template = `
# Dashboard for {{ user.name }}

Posts ({{ stats.count }}):
{% for post in posts %}
- {{ post.title }}
{% endfor %}
`;

// Provider analyzes graph and discovers rounds:
// Round 1: user is source (no deps) → resolve
// Round 2: posts depends on user → resolve  
// Round 3: stats.count depends on posts → resolve
// Round 4: template fully resolved → done

const result = await provider.render(template, { dashboard: bound });
```

## Key Mechanism: Graph Analysis

```typescript
interface ShapeNode {
  type: 'source' | 'derived' | 'nested';
  path: string[];              // Path in shape: ['stats', 'count']
  deps: ShapeNode[];           // What this node depends on
  source?: () => Promise<any>; // If type: 'source'
  compute?: (ctx: any) => any; // If type: 'derived'
}

// Analyze shape to build dependency graph
function analyzeShape(shape: ShapeDefinition): ShapeNode[] {
  // Recursively walk shape, identify dependencies
  // Return topologically-sorted nodes
}

// Determine rounds from graph
function discoverRounds(nodes: ShapeNode[]): Round[] {
  // Round 1: All nodes with no deps
  // Round 2: Nodes whose deps resolved in Round 1
  // ...etc
}
```

## mejs Integration: Reparsing for Progress

```typescript
class DivinationProvider {
  async render(template: string, context: Context): Promise<string> {
    let current = template;
    let pass = 0;
    
    while (pass < this.maxPasses) {
      pass++;
      
      // Phase 1: Render with current resolved values
      // Deferred values render as {{ path.to.value }}
      const output = this.mejs.render(current, context);
      
      // Phase 2: Parse output for placeholders
      const placeholders = this.extractPlaceholders(output);
      
      if (placeholders.length === 0) {
        return output; // Done!
      }
      
      // Phase 3: Resolve what we can this round
      const resolvable = placeholders.filter(p => this.canResolve(p, context));
      
      if (resolvable.length === 0) {
        throw new Error(`Deadlock: no progress at pass ${pass}`);
      }
      
      // Phase 4: Update context with resolved values
      for (const ph of resolvable) {
        context[ph.path] = await this.resolve(ph, context);
      }
      
      // Phase 5: Re-render (current becomes template for next pass)
      current = output;
    }
    
    throw new Error(`Max passes (${this.maxPasses}) reached`);
  }
}
```

## The Imports Example (v2 Style)

```typescript
// 1. Define shape: imports are grouped by path
const importsShape = deferShape([{
  path: String,
  names: [String]
}]);

// 2. Bind to data source
const imports = bindShape(importsShape, {
  // Source: scan methods for entity return types
  '': () => methods
    .filter(m => m.returnType.isEntity)
    .map(m => ({
      name: m.returnType.name,
      path: `./entities/${m.returnType.name}`
    }))
    // Group by path (this is a transform, discovered from shape)
    .reduce((groups, e) => {
      groups[e.path] = groups[e.path] || [];
      groups[e.path].push(e.name);
      return groups;
    }, {})
});

// 3. Template uses shape
const template = `
{{ imports.map(group => 
  'import { ' + group.names.join(', ') + ' } from "' + group.path + '";' 
).join('\\n') }}
`;

// 4. Render - automatically discovers:
// Round 1: Scan methods (no deps)
// Round 2: Group by path (depends on scan)
// Round 3: Render complete
const result = await provider.render(template, { imports });
```

## Comparison: v1 vs v2

| Aspect | v1 (Explicit) | v2 (Shape-Driven) |
|--------|---------------|-------------------|
| User defines | `transform([a,b], (x,y) => ...)` | Shape + binding |
| Round count | Explicit in code | Discovered from graph |
| Dependencies | Manual tracking | Inferred from shape |
| mejs integration | Separate phase | Core mechanism (reparsing) |
| Placeholders | Stub IDs | Shape paths |

## The Aesthetic

> "The diviner describes what will be seen.
> The engine discovers how many times it must look.
> The template fills itself."

The user only describes:
1. **Shape**: What does the result look like?
2. **Binding**: Where does each piece come from?

The engine handles:
1. **Graph analysis**: Build dependency DAG from shape
2. **Round discovery**: Topological sort gives execution order
3. **mejs integration**: Reparse output to drive progress
4. **Resolution**: Fill in values pass by pass
