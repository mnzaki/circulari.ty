# APP: foundframe-tauri-stub — Parallel Stub Package

**Status:** Ready for o19 stream  
**Stream:** o19 (framework package) — *circulari.ty has identified this need*  
**Created:** 2026-03-15  
**Trigger:** spire-loom generates broken Tauri code, need parallel stub package for DearDiary development

> **Note for o19:** This APP is unnumbered — grab it and number when you pick it up.  
> circulari.ty identified the need; o19 implements. Collaborative spiral. 🌀

---

## What This APP Addresses

**The Problem:** spire-loom generates broken Tauri code (empty implementations, duplicates, undefinedService) in `foundframe-tauri`, blocking DearDiary development.

**The Solution:** Create a **parallel package** `foundframe-tauri-stub` that:
1. Lives in `o19/crates/foundframe-tauri-stub/` (sibling to `foundframe-tauri`)
2. Uses the **same spire-loom generation** (to its own `spire/` directory)
3. Exports the **same API surface** as `foundframe-tauri`
4. But implements everything as **in-memory stubs** (no Tauri invoking)

**Key Simplicity:** No new loom commands, no new treadles, no template overrides. Just a separate package that generates stub implementations instead of Tauri bindings.

---

## WHAT_HAS_EMERGED

### 2026-03-15 — Simplification

Instead of complex template overrides or new treadles:

```
BEFORE (complex):
- New templates in spire-loom/machinery/bobbin/stub/
- New tauriStubAdaptors() function
- Generate to foundframe-tauri/stub/ directory
- Toggle via @o19/foundframe-tauri/stub export

AFTER (simple):
- New package: o19/crates/foundframe-tauri-stub/
- Uses SAME spire-loom, SAME WARP.ts pattern
- Generates to foundframe-tauri-stub/spire/
- Toggle via @o19/foundframe-tauri-stub vs @o19/foundframe-tauri
```

The stub package is a **proper Tauri plugin structure** but the TypeScript implementations are pure stubs.

---

## UNFOLDING_STEPS

### Step 1: Create Package Directory Structure

Create `o19/crates/foundframe-tauri-stub/` as parallel to `foundframe-tauri/`:

```
o19/crates/foundframe-tauri-stub/
├── Cargo.toml                    # Tauri plugin crate (minimal, no real backend)
├── loom/
│   └── WARP.ts                   # Same as foundframe-tauri but for stubs
├── spire/                        # Generated stub code (gitignored)
│   └── ts/
│       ├── adaptors/
│       │   ├── index.ts          # Generated
│       │   ├── bookmark.adaptor.ts
│       │   ├── conversation.adaptor.ts
│       │   ├── media.adaptor.ts
│       │   ├── person.adaptor.ts
│       │   ├── post.adaptor.ts
│       │   └── view.adaptor.ts
│       └── commands/
│           └── index.ts          # Generated
├── src/
│   ├── lib.rs                    # Minimal Tauri plugin (no-ops)
│   └── models.rs                 # Shared models
├── ts/
│   └── index.ts                  # Hand-written service factory
├── package.json
└── README.md
```

### Step 2: Create `loom/WARP.ts`

Nearly identical to foundframe-tauri, but we'll eventually use stub templates:

```typescript
/**
 * Foundframe-Tauri-Stub Package WARP
 * 
 * Parallel to foundframe-tauri but generates stub implementations.
 */

import loom from '@o19/spire-loom';
import { tauriAdaptors } from '@o19/spire-loom/machinery/treadles';

export const tauri = loom.spiral.tauri
  .plugin({
    ddd: { adaptors: {} },
    coreName: 'foundframe',
    coreCrateName: 'o19-foundframe'
  })
  .tieup(tauriAdaptors({
    pluginName: 'o19-foundframe-tauri-stub',
    entities: ['Bookmark', 'Media', 'Post', 'Person', 'Conversation'],
    operations: ['create', 'read', 'update', 'delete', 'list']
  }));

tauri.name = 'foundframe-tauri-stub';

export default loom;
```

### Step 3: Create Stub Templates in spire-loom

Add new templates to `spire-loom/machinery/bobbin/stub/`:

**`stub/adaptor.ts.mejs`** - In-memory implementation:
```ejs
import type { {{ entityPascal }}, {{ entityPascal }}Filter } from '@o19/foundframe-front/domain';
import type { {{ service.portName.pascalCase }}, {{ entityPascal }}ReadPort, {{ entityPascal }}WritePort } from '@o19/foundframe-front/ports';

// Module-level storage
let nextId = 1;
const storage = new Map<number, {{ entityPascal }}>();

export function resetStorage(): void {
  storage.clear();
  nextId = 1;
}

export class Stub{{ entityPascal }}Adaptor implements {{ entityPascal }}ReadPort, {{ entityPascal }}WritePort {

  // Create
  async create(data: any): Promise<number> {
    const id = nextId++;
    const entity = { id, ...data, createdAt: new Date() };
    storage.set(id, entity);
    return id;
  }

  // Read
  async getById(id: number): Promise<{{ entityPascal }} | null> {
    return storage.get(id) || null;
  }

  // List
  async query(filter?: {{ entityPascal }}Filter): Promise<{{ entityPascal }}[]> {
    return Array.from(storage.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Update
  async update(id: number, data: any): Promise<void> {
    const entity = storage.get(id);
    if (entity) {
      Object.assign(entity, data);
      entity.modifiedAt = new Date();
    }
  }

  // Delete
  async delete(id: number): Promise<void> {
    storage.delete(id);
  }

  // Count
  async count(): Promise<number> {
    return storage.size;
  }

  // Search
  async searchByKeyword(keyword: string): Promise<{{ entityPascal }}[]> {
    const lower = keyword.toLowerCase();
    return Array.from(storage.values()).filter(e =>
      JSON.stringify(e).toLowerCase().includes(lower)
    );
  }
}

export { Stub{{ entityPascal }}Adaptor as {{ entityPascal }}Adaptor };
```

**`stub/adaptors-index.ts.mejs`**:
```ejs
{% entities.forEach(function(entity) { %}
import { Stub{{ entity.serviceName }}Adaptor } from './{{ entity.serviceNameCamel }}.adaptor.js';
{% }); %}

export function createTauriAdaptor() {
  return {
{% entities.forEach(function(entity, i) { %}
    {{ entity.serviceNameCamel }}: new Stub{{ entity.serviceName }}Adaptor(){{ i < entities.length - 1 ? ',' : '' }}
{% }); %}
  };
}

export type TauriAdaptor = ReturnType<typeof createTauriAdaptor>;

{% entities.forEach(function(entity) { %}
export { Stub{{ entity.serviceName }}Adaptor } from './{{ entity.serviceNameCamel }}.adaptor.js';
{% }); %}
```

### Step 4: Add Template Selection to WARP

Update `foundframe-tauri-stub/loom/WARP.ts` to use stub templates:

```typescript
import loom from '@o19/spire-loom';
import { tauriAdaptors } from '@o19/spire-loom/machinery/treadles';

export const tauri = loom.spiral.tauri
  .plugin({
    ddd: { adaptors: {} },
    coreName: 'foundframe',
    coreCrateName: 'o19-foundframe'
  })
  .tieup(tauriAdaptors({
    pluginName: 'o19-foundframe-tauri-stub',
    entities: ['Bookmark', 'Media', 'Post', 'Person', 'Conversation'],
    operations: ['create', 'read', 'update', 'delete', 'list'],
    // Override to use stub templates
    templates: {
      perManagement: ['stub/adaptor.ts.mejs'],
      aggregate: ['stub/adaptors-index.ts.mejs']
    },
    output: {
      perManagement: [(m) => `spire/ts/adaptors/${m.entityName.camelCase}.adaptor.ts`],
      aggregate: ['spire/ts/adaptors/index.ts']
    }
  }));

tauri.name = 'foundframe-tauri-stub';

export default loom;
```

### Step 5: Create Hand-Written `ts/index.ts`

Create the service factory that wires everything together:

```typescript
/**
 * Foundframe-Tauri-Stub
 * 
 * In-memory stub implementations for development.
 * Parallel API to @o19/foundframe-tauri but no backend required.
 */

import { createServices as createDomainServices } from '@o19/foundframe-front';
import { createTauriAdaptor } from '../spire/ts/adaptors/index.js';

// Stub implementations for additional services
class StubPreviewAdaptor {
  async fetchPreview(uri: string) {
    return {
      title: 'Stub Preview',
      description: 'Preview not available in stub mode',
      siteName: new URL(uri).hostname
    };
  }
}

class StubDeviceAdaptor {
  async listPairedDevices() { return []; }
  
  async generatePairingQr(deviceName: string) {
    return {
      url: `o19://stub/pair/${Date.now()}`,
      emojiIdentity: '🦀⚡🌀🔥✨',
      nodeIdHex: 'stub-node-id'
    };
  }
  
  async parsePairingUrl(url: string) {
    return { nodeId: 'stub-node', deviceName: 'Stub Device' };
  }
  
  async confirmPairing() { return { nodeId: 'stub', alias: 'Stub', paired: true }; }
  async unpairDevice() {}
  async checkFollowersAndPair() { return []; }
}

class StubTheStreamAdaptor {
  private entries: any[] = [];
  
  async query() { return this.entries; }
  async addEntry(entry: any) {
    this.entries.push({ ...entry, id: Date.now() });
  }
  async removeEntry(id: number) {
    this.entries = this.entries.filter(e => e.id !== id);
  }
}

// ============================================================================
// Main Export
// ============================================================================

export function createServices() {
  const adaptors = createTauriAdaptor();
  
  return createDomainServices({
    ...adaptors,
    preview: new StubPreviewAdaptor(),
    device: new StubDeviceAdaptor(),
    theStream: new StubTheStreamAdaptor()
  });
}

export type IPersistenceServices = ReturnType<typeof createServices>;

// Re-export types
export type * from '@o19/foundframe-front/ports';

// ============================================================================
// Camera Commands (Mock)
// ============================================================================

export type CameraMode = 'preview' | 'qr' | 'photo';
export type CameraDirection = 'back' | 'front';

let cameraState = { active: false, mode: 'preview' as CameraMode };

export async function startCamera(options?: { mode?: CameraMode; cameraDirection?: CameraDirection }) {
  cameraState = { active: true, mode: options?.mode || 'preview' };
  return { started: true, active: true, mode: cameraState.mode };
}

export async function stopCamera() {
  cameraState.active = false;
  return { stopped: true, active: false };
}

export async function capturePhoto() {
  return { 
    success: true, 
    uri: `mock://photo-${Date.now()}.jpg`,
    timestamp: Date.now()
  };
}

export async function setCameraMode(options: { mode: CameraMode }) {
  cameraState.mode = options.mode;
  return { success: true, mode: cameraState.mode };
}

export async function isCameraActive() {
  return { active: cameraState.active, mode: cameraState.mode };
}

// ============================================================================
// Device Pairing Commands (Mock)
// ============================================================================

export type { ScannedPairingData } from '@o19/foundframe-front/ports';

export async function generatePairingQr(deviceName: string) {
  return {
    url: `o19://stub/pair/${Date.now()}`,
    emojiIdentity: '🦀⚡🌀🔥✨',
    nodeIdHex: 'stub-node-id'
  };
}

export async function parsePairingUrl(url: string) {
  return { 
    nodeId: 'stub-node', 
    deviceName: 'Stub Device',
    alias: 'Stub'
  };
}

export async function confirmPairing(nodeIdHex: string, alias: string) {
  return { nodeId: nodeIdHex, alias, paired: true };
}

export async function listPairedDevices() {
  return [];
}

export async function checkFollowersAndPair() {
  return [];
}

export async function unpairDevice(nodeIdHex: string) {
  return;
}

// ============================================================================
// Image Processing (Mock)
// ============================================================================

export async function convertJpegToWebp(jpeg: Uint8Array): Promise<Uint8Array> {
  // Just return the same data in stub mode
  return jpeg;
}

export async function compressWebpToSize(webp: Uint8Array, maxSize: number): Promise<Uint8Array> {
  return webp;
}

// ============================================================================
// Permissions (Mock)
// ============================================================================

export async function requestPermissions() {
  return { status: 'granted' as const };
}

export async function requestCameraPermissions() {
  return { camera: 'granted' as const };
}

export async function checkCameraPermissions() {
  return { camera: 'granted' as const };
}

// ============================================================================
// Events (Constants for listening)
// ============================================================================

export const QR_SCANNED_EVENT = 'qr-scanned';
export const PHOTO_CAPTURED_EVENT = 'photo-captured';
```

### Step 6: Create `package.json`

```json
{
  "name": "@o19/foundframe-tauri-stub",
  "version": "0.1.0",
  "description": "Stub implementation of foundframe-tauri for development",
  "type": "module",
  "exports": {
    ".": {
      "types": "./ts/index.d.ts",
      "import": "./ts/index.js"
    }
  },
  "scripts": {
    "loom": "pnpm spire-loom",
    "generate": "pnpm loom"
  },
  "dependencies": {
    "@o19/foundframe-front": "workspace:*"
  },
  "devDependencies": {
    "@o19/spire-loom": "workspace:*"
  }
}
```

### Step 7: Create Minimal `Cargo.toml`

```toml
[package]
name = "o19-foundframe-tauri-stub"
version = "0.1.0"
edition = "2021"

[dependencies]
# Minimal deps - this is a stub crate
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }

[lib]
name = "o19_foundframe_tauri_stub"
crate-type = ["cdylib", "rlib"]
```

### Step 8: Create Minimal `src/lib.rs`

```rust
//! Stub Tauri plugin - no actual backend functionality

use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("o19-foundframe-tauri-stub")
        .setup(|_app| {
            println!("[foundframe-tauri-stub] Plugin initialized (no-op)");
            Ok(())
        })
        .build()
}
```

### Step 9: Generate Stub Code

```bash
cd o19/crates/foundframe-tauri-stub

# Generate stub adaptors using stub templates
pnpm generate

# This creates spire/ts/adaptors/*.ts with stub implementations
```

### Step 10: DearDiary Toggle

Simple import switch:

```typescript
// DearDiary/src/lib/config/services.ts

// Real implementation (when foundframe-tauri is fixed)
// export { createServices } from '@o19/foundframe-tauri';

// Stub implementation (for development)
export { createServices } from '@o19/foundframe-tauri-stub';

// Types are the same
export type { IPersistenceServices } from '@o19/foundframe-tauri-stub';
```

---

## ESSENTIAL_READS

| File | Why |
|------|-----|
| `foundframe-tauri/loom/WARP.ts` | Template for stub WARP.ts |
| `foundframe-tauri/ts/index.ts` | Template for stub ts/index.ts |
| `spire-loom/machinery/bobbin/tauri/*.mejs` | Current templates to adapt |
| `foundframe-front/src/ports/*.ts` | Port interfaces to implement |

---

## DECISIONS

**Decision: Separate package, not subdirectory**
- Rationale: Clean separation, can depend on either independently
- Matches Tauri plugin architecture (each plugin is its own crate)

**Decision: Same spire-loom, stub templates**
- Rationale: Use proven infrastructure, just different output
- Template override via WARP.ts config

**Decision: Hand-write ts/index.ts**
- Rationale: Service composition is application-specific
- Generated adaptors + hand-written wiring

**Decision: Minimal Rust crate**
- Rationale: Tauri requires a plugin crate to exist
- But it can be a no-op

---

## REFERENCES

- `foundframe-tauri/` — Parallel structure reference
- `spire-loom/machinery/bobbin/tauri/` — Template reference
- APP-018 — xana transition

---

> *"Two packages, one pattern. The loom weaves both — one with iron, one with straw."*
