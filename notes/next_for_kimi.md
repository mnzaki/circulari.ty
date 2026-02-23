# Next for Kimi: The Weft Awaits

> *"The loom has woven the warp. The weft remains to be threaded."*
> *"Even this to-do list needs conservation."*

This document captures the state of the spiral for **Bookmark** and **Device** verticals—what has been woven, what gaps remain, and the path forward to make them live across all rings.

---

## The State of the Weave (February 2026)

### What the Loom Has Woven ✅

**Spire-Loom Generation (Working):**
- Android JNI bridge generates with proper snake_case method names
- Tauri plugin generates with commands, platform trait, extension
- Link metadata properly attaches (`thestream`, `device_manager` field access)
- Method pipeline correctly processes `@reach` and `@crud` decorators
- AIDL generation **disabled** (using binder_ndk directly, requires Android 12+)

**Generated Artifacts:**
```
o19/crates/foundframe-android/spire/src/lib.rs  (JNI bridge)
o19/crates/foundframe-tauri/spire/src/
  ├── commands.rs       (Tauri commands)
  ├── extension.rs      (AppHandle extension)
  ├── platform.rs       (Platform trait - generated + custom)
  ├── desktop.rs        (Desktop impl - stub)
  ├── mobile/android.rs (Android impl - stub)
  └── lib.rs            (Plugin setup)
```

### Core Implementation ✅ (Just Completed)

The core methods have been added to `o19-foundframe`:

#### Foundframe Struct Fields ✅

| Field | Status | Notes |
|-------|--------|-------|
| `device_manager: Mutex<Option<DeviceManager>>` | ✅ Added | Lazy initialization in `with_device_manager()` |

#### DeviceManager Methods ✅

| Method | Status | Notes |
|--------|--------|-------|
| `generate_pairing_qr(device_name)` | ✅ Added | Returns `(url, emoji_identity, node_id_hex)` |
| `parse_pairing_url(url)` | ✅ Added | Static method, returns parsed data |
| `check_followers_and_pair()` | ✅ Added | Returns `Vec<(node_id, alias)>` |
| `list_followers()` | ✅ Added | Returns `Vec<PairedDevice>` |
| `follow_device(nid)` | ✅ Added | Wrapper around `handle.follow()` |
| `unfollow_device(nid)` | ✅ Added | Wrapper around `handle.unfollow()` |

**Note:** The pairing methods that were in `foundframe-tauri/src/platform.rs` have been moved to core `device.rs`. The Platform trait methods remain as reference implementations that call these core methods.

#### TheStream/Bookmark Methods ⚠️

| Method | Called From | Status | Location |
|--------|-------------|--------|----------|
| `add_bookmark(url, title, notes)` | JNI bridge, Tauri commands | ✅ **Exists** | `bookmark.rs` - `BookmarkStream` trait |
| `get_bookmark_by_url(pkb_url)` | JNI bridge, Tauri commands | ❌ Missing | Needs implementation |
| `list_bookmarks(directory)` | JNI bridge, Tauri commands | ❌ Missing | Needs implementation |
| `delete_bookmark(pkb_url)` | JNI bridge, Tauri commands | ❌ Missing | Needs implementation |

**Gap Analysis:** Only `add_bookmark` exists via the `BookmarkStream` trait. The other bookmark operations need to be added to the trait.

**Current Foundframe Fields:**
- `runtime_thread` - background runtime
- `node_handle` - Radicle node access
- `events` - event bus
- `pkb_base` - PKB path
- `thestream: Mutex<Option<TheStream>>` ✅ Present

**Gap Analysis:** `device_manager` is created temporarily in `create_pkb_service()` but not stored as a field. The generated JNI code expects `service.device_manager` to exist.

---

## The Path Forward: Vertical Integration

**SCOPE CHANGE:** Focus on getting things working up to `foundframe-tauri/ts/*` layer. `foundframe-front` is out of scope for this phase.

### Phase 1: Core Bookmark Operations (Rust) ✅ COMPLETED

**1.1 Extend BookmarkStream Trait ✅**

File: `o19/crates/foundframe/src/bookmark.rs`

Added remaining CRUD operations to the `BookmarkStream` trait:

```rust
pub trait BookmarkStream {
    /// Add a bookmark ✅
    fn add_bookmark(...);
    
    /// Get bookmark by its PKB URL ✅
    fn get_bookmark_by_url(&self, url: &str) -> Result<Option<(StreamEntry, BookmarkData)>>;
    
    /// List bookmarks in a directory ✅
    fn list_bookmarks(&self, directory: Option<&str>) -> Result<Vec<(StreamEntry, BookmarkData)>>;
    
    /// Delete (soft-delete) a bookmark ✅
    fn delete_bookmark(&self, url: &str) -> Result<bool>;
}
```

**Implementation Notes:**
- ✅ Uses filesystem scanning of bookmarks directory
- ✅ Parses `.js.md` files to extract bookmark data
- ✅ Soft-delete renames files to `.deleted.js.md`

### Phase 2: Desktop Platform Implementation (Rust) ✅ TEMPLATE UPDATED

**Note: Method Naming ✅**
Fixed: Generated methods now use snake_case (`bookmark_add_bookmark`) 

**Note: Template Reuse Opportunity 💡**
The Android JNI bridge template (`jni_bridge.jni.rs.ejs`) and Desktop implementation need similar patterns:
- Field access: `service.thestream.as_ref().ok_or(...)?`
- Mutex locking with error handling
- Method delegation to core

**Consider:** Abstract the Rust method generation pattern so both Android JNI and DesktopPlatform use the same template/logic.

**2.1 Implement DesktopPlatform Methods**

File: `spire/src/desktop.rs` (GENERATED - update template in `machinery/bobbin/tauri/desktop.rs.ejs`)

Current state: ✅ Template now initializes foundframe instance:

```rust
pub struct DesktopPlatform<R: Runtime> {
  app_handle: AppHandle<R>,
  foundframe: std::sync::Mutex<Option<o19_foundframe::Foundframe>>,  // ✅ Added
}

fn new(app_handle: AppHandle<R>) -> Result<Self> {
  // ✅ Initializes o19_foundframe with proper paths
  let foundframe = o19_foundframe::init(init_options, None)?;
  Ok(Self { app_handle, foundframe: Mutex::new(Some(foundframe)) })
}
```

**Next:** Update the TODO stubs to actually call core methods:

```rust
fn bookmark_add_bookmark(&self, url: String, title: Option<String>, notes: Option<String>) -> Result<()> {
    let guard = self.foundframe.lock().unwrap();
    let foundframe = guard.as_ref().ok_or(Error::Other("Foundframe not initialized".into()))?;
    
    foundframe.with_thestream(|stream| {
        stream.add_bookmark(&url, title.as_deref(), notes.as_deref())
    }).map_err(|e| Error::Other(e.to_string()))
}
```

### Phase 3: Android Platform Implementation (Rust)

**Architecture Change:** AIDL is disabled. Using binder_ndk directly.

**3.1 Android Service (foundframe-android)**

The JNI bridge in `foundframe-android/spire/src/lib.rs` already generates bind-point methods with snake_case naming (✅ Fixed). These need to call the core foundframe methods.

Current issue: The JNI bridge uses `with_service()` pattern but the service initialization is `unimplemented!()`.

**Template Reuse Note:** The JNI bridge template generates the same field-access patterns we need for DesktopPlatform. Consider abstracting this into a shared Rust method generator.

**3.2 AndroidPlatform in foundframe-tauri**

File: `o19/crates/foundframe-tauri/src/mobile/android.rs`

Needs to connect to the Android service. The current code uses `ServiceClient` from `o19_foundframe_android::aidl_client` - this may need updating for binder_ndk.

**Key Decision Needed:** How does the Tauri plugin communicate with the Android service without AIDL?
- Option 1: Use binder_ndk directly from Rust
- Option 2: JNI bridge in Tauri plugin that calls service's JNI
- Option 3: Keep AIDL client for Tauri→Service communication (simplest migration)

### Phase 4: TypeScript API Layer (foundframe-tauri/ts)

**SCOPE:** This is the target layer - get things working up to here.

File: `o19/crates/foundframe-tauri/ts/index.ts`

The TypeScript API should export functions that call the generated Tauri commands. Check if this is being generated or needs manual implementation.

Current state: Unknown - check if generation exists.

---

## Critical Questions to Resolve

### Q1: Android Communication Without AIDL ✅ RESOLVED

**Decision:** AIDL generation is disabled in the loom. Using binder_ndk directly requires Android 12+.

**Pattern:** The JNI bridge in `foundframe-android` provides the service-side interface. The Tauri plugin needs to communicate with this service.

**Options:**
1. JNI from Tauri plugin to call service methods (like current CameraPlugin pattern)
2. binder_ndk from Rust in Tauri plugin
3. Keep AIDL just for Tauri→Service (client-side only)

**Current State:** The `AndroidPlatform` in foundframe-tauri uses `ServiceClient` from `o19_foundframe_android`. This may need updating.

### Q2: DesktopPlatform Implementation Strategy ✅ CLEAR

DesktopPlatform already has `foundframe: Mutex<Option<o19_foundframe::Foundframe>>`. Just need to:
1. Use `with_thestream()` for bookmark operations
2. Use `with_device_manager()` for device operations
3. Convert errors appropriately

### Q3: TypeScript API Generation

**Question:** Is the TypeScript API in `foundframe-tauri/ts/` being generated by spire-loom?

**Current State:** Unknown - needs investigation.

**If Not Generated:** Need to:
1. Add TS generation to spire-loom, OR
2. Manually write TS wrappers that call the generated commands

### Q4: Rust Method Naming Convention ✅ RESOLVED

**Issue:** Generated Platform trait methods use camelCase (`bookmark_addBookmark`) but Rust convention is snake_case (`bookmark_add_bookmark`).

**Fix:** Updated `transformForRust()` in `code-generator.ts` to apply `toSnakeCase()` to method names.

**Status:** ✅ Both Android JNI and Tauri Platform now generate snake_case method names.

### Q5: Template Abstraction 💡

**Observation:** Both Android JNI and DesktopPlatform need similar Rust code patterns:
- Field access with Option unwrapping
- Mutex locking with error handling  
- Method delegation to core

**Suggestion:** Abstract the Rust method body generation into a shared utility so both targets use the same template/logic. The main difference is:
- JNI: `#[no_mangle] pub extern "C" fn Java_...` with JNIEnv parameter conversion
- Desktop: Regular trait impl method with native Rust types

### Q6: Template Lookup Priority ⚠️ NEEDED

**Current State:** Templates are resolved from:
1. Absolute paths
2. Builtin directory (`node_modules/@o19/spire-loom/machinery/bobbin/`)

**Missing:** Custom template lookup from workspace `loom/bobbin/` directory.

**Desired Priority (highest to lowest):**
1. Absolute paths (explicit)
2. Workspace `loom/bobbin/<template-path>` (custom override)
3. Builtin `node_modules/@o19/spire-loom/machinery/bobbin/` (default)

**Implementation:** Update `generateCode()` in `code-generator.ts` to check `loom/bobbin/` before falling back to builtin templates. This allows projects to override built-in templates by placing custom versions in their workspace.

**Use Case:** User wants to customize the DesktopPlatform template - they copy `desktop.rs.ejs` to `loom/bobbin/tauri/desktop.rs.ejs` and modify it.

---

## Immediate Next Steps (Prioritized)

### This Session (If Context Holds)

1. **Extend BookmarkStream trait**
   - File: `o19/crates/foundframe/src/bookmark.rs`
   - Add `get_bookmark_by_url`, `list_bookmarks`, `delete_bookmark`
   - Follow pattern of existing `add_bookmark`

2. **Implement DesktopPlatform generated methods**
   - File: `o19/crates/foundframe-tauri/src/desktop.rs`
   - Use `self.foundframe` to access core
   - Implement bookmark_addBookmark, device_generatePairingCode, etc.

### Next Session

3. **Investigate TypeScript API generation**
   - Check if `foundframe-tauri/ts/index.ts` is generated
   - If not, either add to loom or write manually

4. **Android Service/Client Architecture**
   - Decide on Tauri→Service communication pattern
   - Update AndroidPlatform implementation
   - Ensure JNI bridge in foundframe-android calls core methods

### Out of Scope (For This Phase)

- foundframe-front alignment (packages/foundframe-front/)
- Drizzle adaptors
- Full DDD layer generation

Focus: Get commands working from TypeScript through Tauri to Core on Desktop first, then Android.

---

## Philosophical Notes

### The Temporal Stratification Holds

| Layer | State | Responsibility |
|-------|-------|----------------|
| **Loom** | ✅ Woven | Generates the pattern |
| **Warp** | ✅ Set | Management imprints define the contract |
| **Core (Rust)** | ⚠️ Partial | Device: ✅ Done, Bookmark: ⚠️ Partial |
| **Platform** | ❌ Incomplete | Desktop stub, Android needs architecture |
| **TS API** | ❌ Unknown | Check if generated |

### The Conservation Principle

The loom is working. The pattern is correct. What remains is the **embodiment**—the core must grow to match the imprint. This is not failure; it is the natural order:

> *"The fossil leaves an imprint in the rock. The rock must harden to hold it."*

The generated code is the imprint. The core implementation is the hardening.

### Solarpunk Check

- **Balance over optimization?** Yes—we're completing one vertical (bookmarks + devices) before adding more.
- **Distributed focal points?** Yes—the layers remain independent; core doesn't know about Tauri.
- **Eco-compatibility?** Yes—we're filling gaps, not rewriting; conservation of effort.

---

## For the Next Kimi

When you pick this up:

1. **Read this file** (you just did)
2. **Check `o19/crates/foundframe/src/`** for current implementation state
3. **Start with Phase 1** (core completion) before touching platforms
4. **Test as you go**—run `pnpm spire-loom` after changes to regenerate
5. **Update this file**—mark phases complete, add discovered issues

Remember:
> *"The spiral conserves what matters. Even these instructions need conservation."*

The warmth is wave-like. The weft awaits.

---

## Changelog

### February 2026 - Session 1

**Core Changes:**
- ✅ Added `device_manager: Mutex<Option<DeviceManager>>` field to `Foundframe`
- ✅ Added `with_device_manager()` accessor with lazy initialization
- ✅ Added pairing methods to `DeviceManager`:
  - `generate_pairing_qr(device_name)` - Returns QR URL, emoji, node ID
  - `parse_pairing_url(url)` - Static method to parse pairing URLs
  - `check_followers_and_pair()` - Auto-follow back followers
  - `list_followers()` - List devices following us
  - `follow_device(nid)` / `unfollow_device(nid)` - Social graph operations
- ✅ Added comment to `thestream.rs` about bookmark methods in `bookmark.rs`
- ✅ Disabled AIDL generation in android machinery (commented out)

**Fixed:**
- Removed broken `foundframeClass-android` symlink from workspace

**Decisions:**
- Pairing methods moved from Platform trait to Core DeviceManager
- AIDL disabled (using binder_ndk directly, requires Android 12+)
- Scope limited to `foundframe-tauri/ts/*` layer (front layer out of scope)

**Identified Issues (Now Resolved):**
- ✅ ~~Generated Tauri Platform trait methods use camelCase~~ Fixed: Now uses snake_case
- 💡 Template reuse opportunity: Android JNI and DesktopPlatform share similar Rust method patterns
- ⚠️ Template lookup priority needed: Custom templates in `loom/bobbin/` should override builtins

### February 2026 - Session 2 (Current)

**Generator Fixes:**
- ✅ **Fixed snake_case method naming** - Updated `transformForRust()` in `code-generator.ts` to use `toSnakeCase()`
- ✅ **Added header comments** - All generated files now include "DO NOT EDIT" warnings with template paths
- ✅ **Fixed DesktopPlatform template** - Added `foundframe` field initialization with proper InitOptions setup
- ✅ **Added spire README** - Generated README.md explains the two-platform architecture
- ✅ **Improved header comments** - Now show actual template path and override instructions:
  ```
  // Template: node_modules/@o19/spire-loom/machinery/bobbin/tauri/desktop.rs.ejs
  // To override: Copy this template to loom/bobbin/tauri/desktop.rs.ejs
  ```

**Core Bookmark Methods:**
- ✅ Added `BookmarkData` struct and extended `BookmarkStream` trait
- ✅ Implemented `get_bookmark_by_url()` - Searches bookmarks directory by URL
- ✅ Implemented `list_bookmarks()` - Lists all bookmarks in directory
- ✅ Implemented `delete_bookmark()` - Soft-delete by renaming to `.deleted.js.md`

**Current State:**
- DesktopPlatform now has foundframe instance and can call core methods
- All generated methods use snake_case (`bookmark_add_bookmark`, etc.)
- Header comments on all generated files show actual template paths and override instructions
- Users can override templates by placing copies in `loom/bobbin/` (once lookup priority is implemented)

---

*Last woven by Kimi, February 2026*
*From the loom of Mina, spiraling toward spirali.ty*
