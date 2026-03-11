# Communique #001: The Divination Engine — Lazy Construction of Backing Calls

> *A message to the keeper of the Diviner Pattern, from a spiral session on recursive round-based evaluation*
> 
> *Date: 2026-03-11*  
> *Participants: Human architect + Kimi*

## The Core Insight

The current Diviner Pattern has **two phases**: collect → render.  
We have discovered a more profound pattern: **program as structure, execution as filling**.

### The Shift: From Fixed Phases to Discovered Rounds

| Current Diviner | Divination Engine |
|-----------------|-------------------|
| Two phases (collect, render) | N rounds discovered by solver |
| Phase 1: Return stub strings | Round N: Expand what we CAN resolve |
| Phase 2: Render actual values | Round N: Compress/collapse results |
| Template-driven | Computation-graph driven |

### The Key Realization

**The backing calls are not constructed until the structure demands them.**

You write code that *looks* like execution:

```typescript
const dashboard = divination({
  user: db.users.findById(userId),     // ← NOT called yet!
  posts: db.posts.where({ author: userId }),  // ← NOT called yet!
  stats: {
    postCount: posts => posts.length   // ← pure transform
  }
});
```

But what you've built is a **computation graph**:

```
Divination<dashboard>
├── user: SourceStub<User>(
│     source: "db.users.findById",
│     params: [StubRef(userId)],      // may itself be stubbed!
│     materialize: (resolved) => db.users.findById(...resolved)
│   )
├── posts: SourceStub<Post[]>(
│     source: "db.posts.where",
│     params: [{ author: StubRef(userId) }],
│     materialize: ...
│   )
└── stats.postCount: Transform(
      deps: [posts],
      compute: (posts) => posts.length
    )
```

## The Solver Loop

```
Round 1: IDENTIFY
  → Find all SourceStubs with NO unmet dependencies
  → These are "ripe" for materialization

Round 1: MATERIALIZE  
  → Construct the ACTUAL backing calls
  → Execute in parallel where possible
  → Capture results

Round 1: COMPRESS
  → Collapse intermediate structures
  → "Fold" the fractal
  → Update which stubs are now "ripe"

Solver: "Are we done?"
  → Fixed point reached (no new stubs ripened)?
  → YES → Return divined result
  → NO  → Round 2...
```

## The Fractal Nature

Each SourceStub's params may contain **other SourceStubs**:

```typescript
const context = divination({
  currentUser: auth.session.userId,           // ← needs session
  dashboard: userId => divination({           // ← NESTED!
    user: db.users.findById(userId),          // ← needs userId
    posts: db.posts.where({ author: userId }) // ← needs userId
  })
});
```

Round 1: `currentUser` is quoted (needs auth.session)  
Round 2: `userId` resolved → `dashboard` divination can begin  
Round 3: `user` and `posts` within dashboard resolve  
Round 4: `stats.postCount` transform executes (all deps ready)

**The depth is discovered, not predetermined.**

## AAAArchi's Role

At each round, AAAArchi validates the DAG:

```typescript
const analysis = AAAArchi.analyze(divination);

// Is this sound?
analysis.validate({
  noCycles: true,                    // no circular deps
  allReachable: true,                // all terminals can resolve
  ripeNodes: (round) => ...          // what can execute now?
});

// The solver uses this to:
// - Determine which stubs to materialize
// - Find parallelization opportunities  
// - Detect unreachable branches (dead code elimination)
```

## The API: Lazy but Executable

```typescript
// This builds structure, doesn't execute
const dashboard = divination({ ... });

// This runs the solver
const result = await dashboard.resolve();
// ^ NOT a Promise in the traditional sense
// ^ We're not "waiting" — we're "discovering rounds"

// Or, for reactive systems:
const stream = dashboard.watch();
// Each round's results flow through
// New rounds triggered when quoted deps resolve
```

## The Aesthetic

This is not Promise. This is not async/await. This is **dataflow programming** where:

1. **Structure is described** (the divination)
2. **Dependencies are tracked** (implicitly, via the stubs)
3. **Execution is discovered** (solver determines rounds)
4. **Correctness is validated** (AAArchi at each round)

The number of rounds isn't known upfront — it emerges from the **actual shape of the data's dependency graph**.

## Open Questions for the Keeper

1. **Materialization strategy**: Build calls lazily (per-round) or batch all ripe stubs?
2. **Error handling**: If a SourceStub fails, do we retry, abort, or partial-resolve?
3. **Streaming**: Can rounds stream results as they complete, or wait for full round?
4. **Caching**: At what granularity do we memoize — per-SourceStub or per-Divination?
5. **Mutability**: Are divinations immutable structures, or do they evolve?

## The Solarpunk Connection

> "Balance over optimization. Distribution over centralization."

The Divination Engine embodies this:
- **Distributed computation**: Each SourceStub is a node; solver coordinates
- **Natural rhythm**: Rounds match the actual data dependencies
- **No waste**: Only materialize what's needed, when deps are ready
- **Visible structure**: The graph is inspectable, optimizable, cacheable

## Related Experiments

- `deferred-value/` — Two-phase computation abstraction
- `scrim-loom/` — Three Friends integration (AAArchi validation)
- This communique — Round-based recursive divination

---

*"The diviner looks forward from the past, collecting what will be needed.  
The engine discovers how many times it must look.  
The spiral determines its own depth."*

*— Communique #001, from the spiral*
