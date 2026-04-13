# O19 Code Architecture

> High-level system architecture and dependency diagrams.

For implementation details, see [o19/DEV.md](o19/DEV.md).

---

## System Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEAR_DIARY APP                                  │
│                         (Tauri + Svelte + Mobile)                           │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐ │
│  │  TheStream™ UI  │    │  Creation Tools     │    │  Device Pairing     │ │
│  │  (Feed/Views)   │    │  (CCCB/Capture)     │    │  (QR/QR Scan)       │ │
│  └────────┬────────┘    └──────────┬──────────┘    └──────────┬──────────┘ │
│           │                        │                          │            │
│           └────────────────────────┼──────────────────────────┘            │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    @o19/foundframe-tauri                            │  │
│  │              (Tauri Plugin + foundframe-front config)               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────┬───────────────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │     Desktop      │  │     Android      │  │       iOS        │
         │   (Rust/Direct)  │  │  (Kotlin/JNI)    │  │    (Future)      │
         └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
                  │                     │                     │
                  ▼                     ▼                     ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │  o19-foundframe  │  │  o19-android     │  │  (Not yet impl)  │
         │  (Core Rust lib) │  │  (JNI Bridge)    │  │                  │
         └──────────────────┘  └────────┬─────────┘  └──────────────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │ FoundframeRadicle│
                               │ Service (:foundfr│
                               │ ame process)     │
                               └──────────────────┘
```

**Key Change:** Android now uses **JNI** (not AIDL) for direct Rust interop. See [Android JNI Architecture](#android-jni-architecture) below.

---

## Layered Architecture (Onion)

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                             │
│  ┌──────────────┐  ┌────────────────────┐  ┌──────────────────┐ │
│  │   Svelte     │  │   foundframe       │  │  foundframe-     │ │
│  │   Components │  │   -front           │  │  tauri           │ │
│  │              │  │   (DDD Services)   │  │  (Tauri glue)    │ │
│  └──────────────┘  └────────────────────┘  └──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                         APPLICATION                              │
│              Tauri Commands + Platform Abstraction               │
│  ┌────────────────────────────────────────────────────────────┐│
│  │              o19-foundframe-tauri (Rust)                   ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ││
│  │  │   Commands   │  │   Platform   │  │  Event Forwarding│  ││
│  │  │   (HTTP API) │  │   (Desktop/  │  │  (To Frontend)   │  ││
│  │  │              │  │   Mobile)    │  │                  │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  ││
│  └────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                         PLATFORM                                 │
│  ┌────────────────────┐          ┌────────────────────────────┐│
│  │     Desktop        │          │          Mobile            ││
│  │  ┌──────────────┐  │          │  ┌──────────────────────┐  ││
│  │  │Direct foundfr│  │          │  │   o19-android        │  ││
│  │  │ame calls     │  │          │  │  ┌────────────────┐  │  ││
│  │  └──────────────┘  │          │  │  │ ApiPlugin.kt   │  │  ││
│  └────────────────────┘          │  │  │ (Tauri Plugin) │  │  ││
│                                    │  │  └────────┬───────┘  │  ││
│                                    │  │           │ uses     │  ││
│                                    │  │  ┌────────┴───────┐  │  ││
│                                    │  │  │ CameraPlugin   │  │  ││
│                                    │  │  │ (Reusable util)│  │  ││
│                                    │  │  └────────┬───────┘  │  ││
│                                    │  │           │ JNI      │  ││
│                                    │  │  ┌────────┴───────┐  │  ││
│                                    │  │  │FoundframeRadicl│  │  ││
│                                    │  │  │eService        │  │  ││
│                                    │  │  └────────┬───────┘  │  ││
│                                    │  └───────────┼──────────┘  ││
│                                    │              │             ││
│                                    └──────────────┼─────────────┘│
├───────────────────────────────────────────────────┼─────────────┤
│                         CORE                       │             │
│  ┌────────────────────────────────────────────────┼───────────┐│
│  │              o19-foundframe                     │           ││
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌───────┴──────┐    ││
│  │  │TheStream │ │  KERI    │ │  CWTCH │ │  Content     │    ││
│  │  │(PKB/Log) │ │(Identity)│ │(P2P)   │ │  Addressing  │    ││
│  │  └──────────┘ └──────────┘ └────────┘ └──────────────┘    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Foundframe-Front: DDD Architecture

`foundframe-front` is **not** the domain model. It implements the **Ports & Adapters** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    foundframe-front                          │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      PORTS                             │  │
│  │  (Interfaces - what the domain CAN do)                │  │
│  │                                                        │  │
│  │  interface TheStreamPort {                            │  │
│  │    addPost(content, title): Promise<EntryId>          │  │
│  │    getBookmark(pkbUrl): Promise<Bookmark>             │  │
│  │    listBookmarks(directory): Promise<Bookmark[]>      │  │
│  │  }                                                    │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                   SERVICES                             │  │
│  │  (Business logic - orchestrates ports)                │  │
│  │                                                        │  │
│  │  class TheStreamService extends TheStreamPort {       │  │
│  │    constructor(adaptor: TheStreamPort) {              │  │
│  │      this.adaptor = adaptor;  // Injected            │  │
│  │    }                                                  │  │
│  │    addPost(...) { return this.adaptor.addPost(...); } │  │
│  │  }                                                    │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌────────────────┐  ┌────────────────┐
│   Desktop    │  │     Tauri      │  │    Android     │
│   Adaptor    │  │    Adaptor     │  │   Adaptor      │
│   (SQLite)   │  │ (Tauri cmds)   │  │  (JNI→Service) │
└──────────────┘  └────────────────┘  └────────────────┘
```

**Key insight:** The domain logic lives in `o19-foundframe` (Rust). The TypeScript layer (`foundframe-front`) provides:
- **Ports**: Interface contracts
- **Services**: Thin orchestration layer
- **Adaptors**: Platform-specific implementations (Tauri, future React Native, etc.)

---

## Android JNI Architecture

**We moved from AIDL to JNI** for simpler, more direct Rust integration.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ANDROID SYSTEM                                    │
│                                                                          │
│  ┌─────────────────────────────┐      ┌────────────────────────────────┐│
│  │   APP PROCESS               │      │   :FOUNDFrame PROCESS          ││
│  │   ty.circulari.DearDiary    │      │   ty.circulari.o19:foundframe  ││
│  │                             │      │                                ││
│  │  ┌───────────────────────┐  │      │  ┌──────────────────────────┐ ││
│  │  │  TauriActivity        │  │      │  │ FoundframeRadicleService │ ││
│  │  │  (WryActivity)        │  │      │  │                          │ ││
│  │  └───────────┬───────────┘  │      │  │ • Kotlin service class   │ ││
│  │              │              │      │  │ • Loads native library   │ ││
│  │  ┌───────────▼───────────┐  │      │  │ • Manages service handle │ ││
│  │  │  WebView              │  │      │  └──────────┬───────────────┘ ││
│  │  │  (Svelte UI)          │  │      │             │ JNI calls       ││
│  │  └───────────┬───────────┘  │      │  ┌──────────▼───────────┐    ││
│  │              │              │      │  │  libandroid.so       │    ││
│  │  ┌───────────▼───────────┐  │      │  │                      │    ││
│  │  │  Tauri Bridge (JNI)   │  │      │  │ • JNI_OnLoad         │    ││
│  │  └───────────┬───────────┘  │      │  │ • nativeStartService │    ││
│  │              │              │      │  │ • nativeAddBookmark  │    ││
│  │  ┌───────────▼───────────┐  │      │  │ • ... (per method)   │    ││
│  │  │  ApiPlugin (Kotlin)   │  │      │  └──────────┬───────────┘    ││
│  │  │  foundframe-tauri     │  │      │             │                ││
│  │  │                       │  │      │  ┌──────────▼───────────┐    ││
│  │  │ • Routes Tauri cmds   │  │      │  │  o19-foundframe      │    ││
│  │  │ • Delegates to:       │  │      │  │  (Rust library)      │    ││
│  │  │   - CameraPlugin      │  │      │  │                      │    ││
│  │  │   - JNI Service       │  │      │  │ • TheStream          │    ││
│  │  └───────────┬───────────┘  │      │  │ • Identity           │    ││
│  │              │              │      │  │ • Content hashes     │    ││
│  │  ┌───────────┼───────────┐  │      │  └──────────────────────┘    ││
│  │  │           │           │  │      │                                ││
│  │  ▼           ▼           ▼  │      └────────────────────────────────┘│
│  │ ┌────────┐ ┌──────────┐ ┌─┴──────────────┐                          ││
│  │ │Camera  │ │ Receive  │ │ JNI Call       │◄──── JNI boundary ──────┘││
│  │ │Plugin  │ │ Share    │ │ (native method)│                          ││
│  │ │(CameraX)│ │Activity │ │                │                          ││
│  │ └────────┘ └──────────┘ └────────────────┘                          ││
│  │    (in o19-android crate)                                            ││
│  └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### JNI Handle Pattern

Kotlin holds an **opaque handle** to the Rust service. Every call locks, executes, unlocks:

```rust
// Rust side (generated by spire-loom)
static SERVICE_HANDLE: OnceLock<Arc<Mutex<Foundframe>>> = OnceLock::new();

#[no_mangle]
pub extern "C" fn Java_..._nativeAddBookmark(
    mut env: JNIEnv,
    _class: JClass,
    _handle: jlong,  // Kotlin passes handle, we use global for now
    url: JString,
) -> JString {
    // Convert JNI → Rust
    let url: String = env.get_string(&url).unwrap().into();
    
    // Lock → execute → unlock
    let handle = SERVICE_HANDLE.get().unwrap();
    let mut guard = handle.lock().unwrap();
    let result = guard.add_bookmark(url);
    
    // Convert Rust → JNI
    env.new_string(result).unwrap().into_raw()
}
```

**Why JNI over AIDL?**
- Simpler: No interface definition language
- Direct: Rust ↔ Kotlin without intermediate binder
- Works: AIDL's Rust client support is problematic

---

## Data Flow: Add to TheStream™

```
┌──────────┐     ┌────────────────────┐     ┌─────────────────────────┐
│  User    │────►│  CaptureButton     │────►│  CCCB (staging area)    │
│ Action   │     │  (Svelte)          │     │  foundframe-front       │
└──────────┘     └────────────────────┘     └───────────┬─────────────┘
                                                        │
                                                        ▼
┌──────────┐     ┌────────────────────┐     ┌─────────────────────────┐
│  Stream  │◄────│  TheStreamService  │◄────│  Tauri Commands         │
│  Updated │     │  (foundframe-front)│     │  (foundframe-tauri)     │
└──────────┘     └────────────────────┘     └───────────┬─────────────┘
                                                        │
                            ┌───────────────────────────┼───────────┐
                            ▼                           ▼           ▼
                    ┌──────────────┐            ┌──────────────┐  ┌──────────┐
                    │   Desktop    │            │    Android   │  │   iOS    │
                    │   (SQLite)   │            │   (JNI→SVC)  │  │  (TBD)   │
                    └──────────────┘            └──────┬───────┘  └──────────┘
                                                       │
                                                       ▼
                                              ┌────────────────┐
                                              │ foundframe svc │
                                              │ (Rust :foundfr │
                                              │ ame process)   │
                                              └────────────────┘
```

---

## Dependency Graph (Packages)

```
                         ┌─────────────────────┐
                         │    DearDiary        │
                         │    (Main App)       │
                         └──────────┬──────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
           ▼                        ▼                        ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  @o19/foundframe-    │  │  @o19/foundframe-    │  │  tauri-plugin-os     │
│  front               │  │  tauri               │  │  (platform info)     │
│  (DDD Services/Ports)│  │  (Tauri glue)        │  │                      │
└──────────┬───────────┘  └──────────┬───────────┘  └──────────────────────┘
           │                         │
           │    ┌────────────────────┘
           │    │
           ▼    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Cargo Dependencies                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  o19-foundframe-tauri                                               ││
│  │  ├─ src/commands.rs       ◄── Tauri command handlers                ││
│  │  ├─ src/platform.rs       ◄── Platform trait (Desktop/Android)      ││
│  │  ├─ src/mobile/android.rs ◄── Android platform (JNI client)         ││
│  │  ├─ src/desktop.rs        ◄── Desktop platform (direct)             ││
│  │  └─ android/              ◄── Android Java/Kotlin (ApiPlugin.kt)    ││
│  └─────┬──────────────────────────────────────────────────────────────┘│
│        │                                                                 │
│  ┌─────┴──────────┐  ┌──────────────────┐  ┌──────────────────────────┐│
│  │ o19-foundframe │  │ o19-foundframe-  │  │ o19-android              ││
│  │ (Core library) │  │ to-sql           │  │ (JNI Bridge)             ││
│  └────────────────┘  └──────────────────┘  └──────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## TheStream™ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            THESTREAM™                                    │
│                                                                          │
│  "Accumulated Becoming" — your chronological experience of self          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Polymorphic Stream Entries                                         ││
│  │                                                                     ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ ││
│  │  │    Post     │ │  Bookmark   │ │   Person    │ │  Conversation │ ││
│  │  │  (created)  │ │  (shared)   │ │  (encounter)│ │   (joined)    ││
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └───────┬───────┘ ││
│  │         │               │               │                │         ││
│  │         └───────────────┴───────────────┴────────────────┘         ││
│  │                         │                                          ││
│  │                         ▼                                          ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │                    thestream table                            │ ││
│  │  │  ┌──────────┬──────────┬─────────┬───────────────────────────┐│ ││
│  │  │  │ seen_at  │ post_id  │person_id│  ... (foreign keys)       ││ ││
│  │  │  │ (experie)│(nullable)│(nullabl)│  exactly ONE is non-null  ││ ││
│  │  │  └──────────┴──────────┴─────────┴───────────────────────────┘│ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  Temporal Philosophy:                                                    │
│  • `seen_at` = when YOU first encountered (not when created)            │
│  • This is subjective memory, not objective database time                 │
│  • TheStream™ is "what you've lived", not "what exists"                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Foundframe Domain Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     O19-FOUNDFrame DOMAIN                                │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │    Identity      │  KERI-based self-sovereign identity               │
│  │  ├─ Key Events   │  ┌─────┐    ┌─────┐    ┌─────┐                   │
│  │  ├─ DIDs         │  │ K1  │───►│ K2  │───►│ K3  │  (Key rotation)   │
│  │  └─ AIDs         │  └─────┘    └─────┘    └─────┘                   │
│  └────────┬─────────┘                                                    │
│           │                                                              │
│  ┌────────┴─────────┐     ┌──────────────────┐     ┌─────────────────┐  │
│  │    TheStream     │◄────│   Accumulable    │◄────│     Media       │  │
│  │   (Chronology)   │     │    Content       │     │ (Hash-addressed)│  │
│  │  ├─ Posts        │     │  ├─ Blobs        │     │                 │  │
│  │  ├─ Bookmarks     │     │  ├─ Trees        │     │  content-hash   │  │
│  │  ├─ People       │     │  └─ refs         │     │       ▼         │  │
│  │  └─ Media        │     └──────────────────┘     │  ┌─────────┐    │  │
│  └──────────────────┘                              │  │ IPFS/   │    │  │
│                                                    │  │ Storage │    │  │
│  ┌──────────────────┐                              │  └─────────┘    │  │
│  │    Squares       │  (Y3: P2P social spaces)    │                 │  │
│  │  ├─ Location     │                              └─────────────────┘  │
│  │  ├─ Members      │                                                   │
│  │  └─ Content      │                                                   │
│  └──────────────────┘                                                   │
│                                                                          │
│  ┌──────────────────┐                                                   │
│  │     Sync         │  CWTCH-based anonymous sync                       │
│  │  ├─ Followers    │                                                   │
│  │  ├─ Following    │                                                   │
│  │  └─ Gossip        │                                                   │
│  └──────────────────┘                                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Spire-Loom: Code Generation

We generate cross-platform code from Management definitions:

```
loom/WARP.ts
    │
    ├──► spiral() ──► RustCore
    │
    ├──► .android.foregroundService() ──► AndroidSpiraler
    │
    └──► Management classes (@reach, @crud)
              │
              ├──► @reach('Private')  → Core only
              ├──► @reach('Local')   → Core + Platform
              └──► @reach('Global')  → Core + Platform + Front

spire-loom (generator)
    │
    ├──► heddles: Match patterns → generators
    │
    ├──► bobbin: Transform + Templates
    │     ├──► type-mappings.ts     (TS → Kotlin/Rust)
    │     ├──► code-generator.ts    (High-level API)
    │     └──► templates/*.ejs      (Platform templates)
    │
    └──► treadles: Generate
          ├──► Android: Kotlin service + JNI bridge
          ├──► Desktop: Direct Rust (future)
          └──► Tauri: Commands (future)
```

See [o19/packages/spire-loom/README.md](o19/packages/spire-loom/README.md) for details.

---

## Naming Conventions

| Layer | Language | Package Name | Example |
|-------|----------|--------------|---------|
| Frontend | TypeScript | `@o19/foundframe-*` | `@o19/foundframe-tauri` |
| Core | Rust | `o19-*` | `o19-foundframe` |
| Tauri Plugin | Rust | `o19-foundframe-tauri` | Main plugin crate |
| Android | Kotlin | `ty.circulari.o19.*` | `ty.circulari.o19.CameraPlugin` |
| Android Plugin | Kotlin | `ty.circulari.o19.ff` | `ty.circulari.o19.ff.ApiPlugin` |
| JNI Service | Kotlin | `ty.circulari.o19.service` | `FoundframeRadicleService` |

---

## Architectural Decisions

### ADR-001: JNI over AIDL for Android

**Status:** Accepted

**Context:** We need Rust-Kotlin interop on Android. Options:
1. **AIDL**: Binder IPC, complex, Rust client support problematic
2. **JNI**: Direct calls, simpler, well-supported

**Decision:** Use JNI. AIDL added complexity without benefit for our use case.

**Consequences:**
- (+) Simpler architecture
- (+) Direct Rust ↔ Kotlin calls
- (-) Must manage native library loading
- (-) JNI boilerplate (mitigated by spire-loom generation)

### ADR-002: DDD Ports/Services in foundframe-front

**Status:** Accepted

**Context:** `foundframe-front` was initially conceived as "domain model" but actually implements Ports & Adapters.

**Decision:** Formalize as DDD layer:
- **Ports**: Interface contracts (what domain CAN do)
- **Services**: Thin orchestration (extends Ports)
- **Adaptors**: Platform implementations (Tauri, future RN)

**Consequences:**
- (+) Clear separation of concerns
- (+) Testability (mock ports)
- (+) Swappable adaptors per platform
- (-) More files/indirection

---

*For implementation details and step-by-step guides, see [o19/DEV.md](o19/DEV.md)*
*For code generation details, see [o19/packages/spire-loom/DEV.md](o19/packages/spire-loom/DEV.md)*
