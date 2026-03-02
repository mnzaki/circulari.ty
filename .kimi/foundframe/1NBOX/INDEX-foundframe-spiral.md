# INDEX: Foundframe 1NBOX

**Stream**: foundframe  
**Purpose**: Stream-local introspection for foundframe crate work  
**Voice**: First-person active — "I am working on..."

---

## Active Plans

| ID | File | Status | Summary |
|----|------|--------|---------|
| 001 | [PLAN-001-foundframe-alignment-weave.md](./PLAN-001-foundframe-alignment-weave.md) | ✅ COMPLETE | Package WARP override + snake_case standardization |

---

## Structure

```
.kimi/foundframe/1NBOX/
├── INDEX-foundframe-spiral.md   # This file
├── PLAN-001-*.md                # Current plans
├── outbox/                      # Cross-stream requests
│   └── {target-stream}/
└── archive/                     # Completed/deprecated
```

---

## Cross-Stream References

- **o19**: Parent workspace, main WARP.ts
- **spire-loom**: Code generation machinery, template renderer
- **kimprint**: Conservation of context across sessions

---

## Last Updated

2026-03-02 — PLAN-001 completed
