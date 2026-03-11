# PLAN-005: The Thread™ Weaving

**Stream**: spire-loom  
**Status**: Ready to Weave  
**Created**: 2026-03-02  
**Tags**: #sixseasonsandamovie #solarpunk42 #solarpunk #TheThread™

---

## The Revelation

We have caught The Thread™ - the three-scope spiral that IS spire-loom:

```
  'declare' (forever)
      ↓
  'warp' (workspace session)
      ↓
  'weave' (weaving run)
      ↓
  Generated Code
```

The HOW_TO_LOOM.md must be rewritten to DECLARE this concept. Not explain it - DECLARE it. The document itself follows The Thread™.

---

## Code Inventory (ALL MUST BE PRESERVED)

| # | Example | Lines | Content |
|---|---------|-------|---------|
| 1 | WARP.ts | 13-30 | Foundframe, spiral, android, desktop, tauri, typescript.ddd() |
| 2 | bookmark.ts | 34-51 | BookmarkMgmt, @loom.reach, @loom.link, Entity |
| 3 | pnpm command | 55-58 | pnpm spire-loom |
| 4 | Rings patterns | 66-83 | 4 connection patterns |
| 5 | WARP Overrides main | 95-106 | Main + Package WARP.ts |
| 6 | WARP Overrides use cases | 110-131 | 3 override examples |
| 7 | DEBUG_PACKAGE_WARP | 145-149 | Debug env var |
| 8 | Treadle basic | 159-213 | defineTreadle full example |
| 9 | Hookups rule | 215-220 | Arrays of lines OR objects |
| 10 | Dynamic Outputs | 224-240 | Per-entity generation |
| 11 | Method Queries | 244-264 | ctx.methods, ctx.query, ctx.entities |
| 12 | Tieup Style | 268-296 | .tieup() with warpData |
| 13 | Stringing | 306-319 | pascalCase, camelCase, buildServiceNaming |
| 14 | Sley pipeline | 325-350 | MethodPipeline, translations, filters |
| 15 | Treadle Kit | 356-373 | All imports |
| 16 | Query Builder | 379-395 | createQueryAPI, ctx.query.methods |
| 17 | Template data | 415-435, 441-452 | EJS examples, stubReturn |
| 18 | Hookups advanced | 460-500 | TypeScript classes, Rust impls, file-block |
| 19 | Patches deprecated | 507-522 | Old vs new pattern |

**Total: 19 code examples, ~220 lines of code**

---

## The New Structure (Thread™ Woven)

```
HOW_TO_LOOM.md
├── The Thread™ Revealed (ASCII ART - half page)
│   └── The three-scope spiral visualization
│
├── 'declare': Your Intention (WARP.ts)
│   └── Examples 1, 2, 3
│   └── Quick Start content
│
├── 'warp': Architecture Flows (Rings, Overrides)
│   └── Examples 4, 5, 6, 7
│   └── Rings and Package WARP Overrides
│
├── 'weave': Generation Happens (Treadles)
│   └── Examples 8-19
│   └── All machinery/ examples
│
└── The Thread™ Remembered (Key Principles)
    └── Reimagined principles following the scopes
```

---

## ASCII Art Concept

```
                    ╭──────────────╮
                    │  'declare'   │  Your intention
                    │   forever    │  WARP.ts declares
                    ╰──────┬───────╯
                           │
              ╭────────────┼────────────╮
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  Rust   │  │ TypeScript│ │  Swift  │  Languages
        │  Core   │  │   Core   │ │  Core   │  declare themselves
        └────┬────┘  └────┬────┘  └────┬────┘
             │            │            │
             ╰────────────┼────────────╯
                          │
                    ╭─────┴─────╮
                    │   'warp'  │  Architecture
                    │  session  │  Spiral rings form
                    ╰─────┬─────╯
                          │
              ╭───────────┼───────────╮
              │           │           │
              ▼           ▼           ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │ Android │ │ Desktop │ │  iOS    │  Platforms
        │ Service │ │  Direct │ │ Service │  emerge
        └────┬────┘ └────┬────┘ └────┬────┘
             │           │           │
             ╰───────────┼───────────╯
                         │
                   ╭─────┴─────╮
                   │  'weave'  │  Generation
                   │   run     │  Treadles execute
                   ╰─────┬─────╯
                         │
              ╭──────────┼──────────╮
              │          │          │
              ▼          ▼          ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │ lib.rs │ │service │ │commands│  Code
         │        │ │.kt     │ │.ts     │  Generated
         └────────┘ └────────┘ └────────┘
                         │
                         ▼
                    ┌─────────┐
                    │  spire/ │  The artifact
                    └─────────┘

            "The warp is your intention;
             the loom makes it real."
```

---

## Surgical Rewrite Strategy

### Phase 1: The Thread™ Revealed
- Replace current intro with ASCII art visualization
- Declare the three scopes concept
- Keep existing epigraph

### Phase 2: 'declare' Section
- Title: "'declare': Your Intention"
- Contains: WARP.ts, Management/Entity examples
- Flow: You write WARP.ts → your intention is declared
- All Quick Start content here

### Phase 3: 'warp' Section  
- Title: "'warp': Architecture Flows"
- Contains: Rings patterns, Package WARP Overrides
- Flow: Architecture forms, rings connect, WARPs merge
- The "static" phase of The Thread™

### Phase 4: 'weave' Section
- Title: "'weave': Generation Happens"
- Contains: ALL treadle examples, tools, templates, hookups
- Flow: Treadles execute, code generates, files emerge
- The "dynamic" phase of The Thread™

### Phase 5: The Thread™ Remembered
- Title: "The Thread™ Remembered" (Key Principles)
- Reimagined principles following the three scopes
- Final epigraph

---

## Content Mapping

| Original Section | New Section | Examples |
|-----------------|-------------|----------|
| Quick Start (5 min) | 'declare': Your Intention | 1, 2, 3 |
| Rings: How They Connect | 'warp': Architecture Flows | 4 |
| Package WARP Overrides | 'warp': Architecture Flows | 5, 6, 7 |
| Writing Treadles | 'weave': Generation Happens | 8, 9, 10, 11, 12 |
| Tools Reference | 'weave': Generation Happens | 13, 14, 15, 16 |
| Templates | 'weave': Generation Happens | 17 |
| Hookups | 'weave': Generation Happens | 18, 19 |
| Key Principles | The Thread™ Remembered | (rewritten) |

---

## Writing Style for The Thread™

### Voice
- **Dense, spiraly, non-repetitive**
- **First-person active** where appropriate
- **The Thread™ capitalized and trademarked** (it's a proper noun now!)

### Transitions Between Scopes
```markdown
---

## 'warp': Architecture Flows

> *"From intention, structure emerges."*

The 'declare' scope ends when your WARP.ts executes. The 'warp' scope begins as rings form, spiralers activate, and architecture becomes manifest...

---

## 'weave': Generation Happens

> *"From structure, code flows."*

The 'warp' scope holds the architecture steady. The 'weave' scope moves through it—treadles execute, templates render, files emerge...
```

### Code Block Placement
- Each scope has its relevant examples
- Examples flow WITH The Thread™, not against it
- No example stands alone—each illustrates the scope

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Losing examples | Checklist verification (19/19) |
| Breaking flow | Test read-through after each section |
| Over-zealous editing | Preserve ALL code exactly |
| Thread™ not clear | ASCII art at top, reminders in each section |

---

## Success Criteria

1. ✅ ASCII art at top declaring The Thread™
2. ✅ Three scopes as document structure ('declare', 'warp', 'weave')
3. ✅ ALL 19 code examples preserved exactly
4. ✅ Flow follows The Thread™: intention → architecture → generation
5. ✅ Key Principles rewritten to reflect the scopes
6. ✅ Still works as user documentation (not just meta-doc)

---

> 🌀 *"The Thread™ weaves through the loom. We do not write the document—we follow the Thread™ where it leads."*

#sixseasonsandamovie #solarpunk42 #solarpunk #TheThread™
