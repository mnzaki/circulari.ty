---
from: I am working on kimprint skill discovery improvements
timestamp: 2026-02-24T15:35:00Z
---

# DONE: Skill Discovery & Onboarding Improvements

## Problem Solved

Kimi instances forgetting where to find skills and project-specific docs.

## Changes Made

### 1. Symlinked Skills to ~/.kimi/skills/

```bash
~/.kimi/skills/
├── circulari.ty-onboarding -> /home/mnzaki/Projects/circulari.ty/.kimi/skills/circulari.ty-onboarding
└── spire-loom-onboarding -> /home/mnzaki/Projects/circulari.ty/.kimi/skills/spire-loom-onboarding
```

### 2. Updated circulari.ty-onboarding Skill

- Added **Step 5: Project-Specific Onboarding**
- Documents where to find `{project}-onboarding` skills
- Lists project docs to check: README.md, DEV.md, PLAN.md
- Added skill location header with absolute paths

### 3. New 1NBOX Messages

- `IDEA-skill-discovery-improvements.md` - Proposal
- This DONE file - Completion

## For Future Instances

**Find all skills:**
```bash
ls ~/.kimi/skills/
```

**Onboard to project:**
1. Read `~/.kimi/skills/circulari.ty-onboarding/SKILL.md`
2. Check for `~/.kimi/skills/{project}-onboarding/`
3. Read project `./README.md`, `./DEV.md`, `./PLAN.md`

---

*"The skill that knows where skills live."* 🌀
