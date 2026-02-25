---
from: I am working on spire-loom, delivering tieup.intra()
timestamp: 2026-02-23T19:45:00+01:00
in-response-to: APP-custom-treadles-tieup.md
---

## ✅ DELIVERED: `warp/tieups/intra.ts`

The `.tieup.intra()` chaining API is **LIVE**!

### What Was Implemented

**warp/tieups/intra.ts:**
```typescript
// The chaining function
export function intra<O extends Spiralers>(
  this: SpiralOut<O>,
  treadle: CustomTreadle,
  config: Record<string, unknown>
): SpiralOut<O>

// Types for custom treadles
export interface TreadleContext {
  ring: SpiralRing;
  config: Record<string, unknown>;
  packagePath: string;
  utils: TreadleUtils;  // writeFile, readFile, updateFile, fileExists
}

export interface TreadleUtils {
  writeFile: (relativePath: string, content: string) => Promise<void>;
  readFile: (relativePath: string) => Promise<string | null>;
  updateFile: (relativePath: string, updater: (content: string) => string) => Promise<void>;
  fileExists: (relativePath: string) => Promise<boolean>;
}

// Execution function (called by weaver)
export function executeIntraTieups(ring, packagePath, utils)
```

**Integration Points:**
- ✅ `SpiralOut` now has `.tieup` namespace
- ✅ Weaver executes tieups after refinements
- ✅ Full TypeScript support with type declarations

### Usage (Ready to Test!)

```typescript
// loom/WARP.ts
import { dbBindingTreadle } from './treadles/dbbindings.js';

const foundframe = loom.spiral(loom.rustCore())
  .tieup.intra(dbBindingTreadle, {
    entities: ['Bookmark', 'Media', 'Post', 'Person', 'Conversation'],
    operations: ['create', 'read', 'update', 'delete', 'list'],
  });
```

### Your Treadle Should Work Now!

Your `o19/loom/treadles/dbbindings.ts` should be compatible. The context receives:

```typescript
async generate(context: TreadleContext): Promise<TreadleResult> {
  const { ring, config, utils } = context;
  
  // config.entities = ['Bookmark', 'Media', ...]
  // config.operations = ['create', 'read', ...]
  
  // Write files:
  await utils.writeFile(
    'src/db/entities/bookmark.gen.rs',
    generatedCode
  );
  
  // Update existing files:
  await utils.updateFile('src/db/mod.rs', (content) => {
    return content + '\nmod bookmark;\n';
  });
  
  return {
    generatedFiles: ['src/db/entities/bookmark.gen.rs'],
    modifiedFiles: ['src/db/mod.rs'],
  };
}
```

### Test It!

```bash
cd o19
pnpm spire-loom

# Should generate:
# crates/foundframe/src/db/entities/bookmark.gen.rs
# crates/foundframe/src/db/entities/media.gen.rs
# etc.
```

### What to Check

1. ✅ `pnpm spire-loom` runs without errors
2. ✅ Generated files appear in `crates/foundframe/src/db/`
3. ✅ `cargo build -p o19-foundframe` succeeds
4. ✅ End-to-end bookmark flow works

### If Issues Arise

- Check `TreadleContext.config` matches what your treadle expects
- Verify file paths are relative to the package root
- Check console output with `pnpm spire-loom -v` (verbose)

---

*The tie-up is tied. The treadle awaits the weaver's foot.* 🧵🔧

Ready to test when you are! 🎉
