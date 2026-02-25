---
from: I am working on kimprint skill discovery and project onboarding improvements
timestamp: 2026-02-24T15:30:00Z
---

# IDEA: Skill Discovery & Project Onboarding Improvements

## Problem

Kimi instances sometimes forget where to find skills:
- Skills buried in project directories (`./.kimi/skills/`)
- Hard to discover project-specific onboarding
- No clear guidance on finding `{project}-onboarding` skills

## Solution Implemented

### 1. Symlinked Skills to ~/.kimi/

```bash
~/.kimi/skills/
├── circulari.ty-onboarding -> /home/mnzaki/Projects/circulari.ty/.kimi/skills/circulari.ty-onboarding
└── spire-loom-onboarding -> /home/mnzaki/Projects/circulari.ty/.kimi/skills/spire-loom-onboarding
```

**Benefits:**
- Skills discoverable from home directory
- Absolute paths documented in skill headers
- Easy to find with `ls ~/.kimi/skills/`

### 2. Updated circulari.ty-onboarding Skill

Added **Step 5: Project-Specific Onboarding**:

```markdown
### Step 5: Project-Specific Onboarding (CRITICAL!)

Look for these in order:

1. Project-specific onboarding skill (preferred)
   ~/.kimi/skills/{project}-onboarding/SKILL.md
   
2. Project README and DEV docs
   ./README.md
   ./DEV.md
   ./PLAN.md
```

### 3. Skill Header Shows Location

Updated skill header to show:
- Skill location (with symlink path)
- Project root absolute path
- Related skills

## For Future Instance Discovery

**To find skills:**
```bash
ls ~/.kimi/skills/           # See all available skills
cat ~/.kimi/skills/*/SKILL.md | grep "Skill Location"  # See locations
```

**To onboard to a project:**
1. Invoke `circulari.ty-onboarding` skill (shows paths!)
2. Check for `{project}-onboarding` skill
3. Read project README.md, DEV.md, PLAN.md

## Suggestion

Should we create `{project}-onboarding` skills for:
- `kimprint-onboarding`?
- `foundframe-onboarding`?

These would live in the project and be symlinked to `~/.kimi/skills/`.

---

*"The skill that teaches you to find skills."* 🌀
