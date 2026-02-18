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
         │   (Rust/Direct)  │  │  (Kotlin/AIDL)   │  │    (Future)      │
         └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
                  │                     │                     │
                  ▼                     ▼                     ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │  o19-foundframe  │  │  o19-android     │  │  (Not yet impl)  │
         │  (Core Rust lib) │  │  (AIDL + JNI)    │  │                  │
         └──────────────────┘  └────────┬─────────┘  └──────────────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │ FoundframeRadicle│
                               │ Service (:foundfr│
                               │ ame process)     │
                               └──────────────────┘
```

---

## Layered Architecture (Onion)

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Svelte     │  │   foundframe │  │   foundframe-tauri   │  │
│  │   Components │  │   -front     │  │   (Tauri glue)       │  │
│  │              │  │   (Domain)   │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
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
│                                    │  │           │ AIDL     │  ││
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
                    │   (SQLite)   │            │   (AIDL→SVC) │  │  (TBD)   │
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
│  (Domain logic)      │  │  (Tauri glue)        │  │                      │
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
│  │  ├─ src/mobile/android.rs ◄── Android platform (AIDL client)        ││
│  │  ├─ src/desktop.rs        ◄── Desktop platform (direct)             ││
│  │  └─ android/              ◄── Android Java/Kotlin (ApiPlugin.kt)    ││
│  └─────┬──────────────────────────────────────────────────────────────┘│
│        │                                                                 │
│  ┌─────┴──────────┐  ┌──────────────────┐  ┌──────────────────────────┐│
│  │ o19-foundframe │  │ o19-foundframe-  │  │ o19-android              ││
│  │ (Core library) │  │ to-sql           │  │ (AIDL + Activities)      ││
│  └────────────────┘  └──────────────────┘  └──────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Android Process Model

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
│  │  └───────────┬───────────┘  │      │  │ • Runs o19-foundframe    │ ││
│  │              │              │      │  │   via JNI                │ ││
│  │  ┌───────────▼───────────┐  │      │  │ • Manages KERI keys      │ ││
│  │  │  WebView              │  │      │  │ • Handles P2P sync       │ ││
│  │  │  (Svelte UI)          │  │      │  │ • Content-addressed      │ ││
│  │  └───────────┬───────────┘  │      │  │   storage                │ ││
│  │              │              │      │  └──────────┬───────────────┘ ││
│  │  ┌───────────▼───────────┐  │      │             │ JNI             ││
│  │  │  Tauri Bridge (JNI)   │  │      │  ┌──────────▼───────────┐    ││
│  │  └───────────┬───────────┘  │      │  │  o19-foundframe      │    ││
│  │              │              │      │  │  (Rust library)      │    ││
│  │  ┌───────────▼───────────┐  │      │  │                      │    ││
│  │  │  ApiPlugin (Kotlin)   │  │      │  │ • TheStream          │    ││
│  │  │  foundframe-tauri     │  │      │  │ • Identity           │    ││
│  │  │                       │  │      │  │ • Content hashes     │    ││
│  │  │ • Routes Tauri cmds   │  │      │  └──────────────────────┘    ││
│  │  │ • Delegates to:       │  │      │                                ││
│  │  │   - CameraPlugin      │  │      └────────────────────────────────┘│
│  │  │   - AIDL Service      │  │                                        ││
│  │  └───────────┬───────────┘  │                                        ││
│  │              │              │                                        ││
│  │  ┌───────────┼───────────┐  │                                        ││
│  │  │           │           │  │                                        ││
│  │  ▼           ▼           ▼  │                                        ││
│  │ ┌────────┐ ┌──────────┐ ┌─┴──────────────┐                          ││
│  │ │Camera  │ │ Receive  │ │ AIDL Client    │◄──── Binder IPC ────────┘││
│  │ │Plugin  │ │ Share    │ │ (IBinder)      │                          ││
│  │ │(CameraX)│ │Activity │ │                │                          ││
│  │ └────────┘ └──────────┘ └────────────────┘                          ││
│  │    (in o19-android crate)                                            ││
│  └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
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

## Naming Conventions

| Layer | Language | Package Name | Example |
|-------|----------|--------------|---------|
| Frontend | TypeScript | `@o19/foundframe-*` | `@o19/foundframe-tauri` |
| Core | Rust | `o19-*` | `o19-foundframe` |
| Tauri Plugin | Rust | `o19-foundframe-tauri` | Main plugin crate |
| Android | Kotlin | `ty.circulari.o19.*` | `ty.circulari.o19.CameraPlugin` |
| Android Plugin | Kotlin | `ty.circulari.o19.ff` | `ty.circulari.o19.ff.ApiPlugin` |
| Service | AIDL | `ty.circulari.o19.IFoundframeRadicle` | AIDL interface |

---

*For implementation details and step-by-step guides, see [o19/DEV.md](o19/DEV.md)*
