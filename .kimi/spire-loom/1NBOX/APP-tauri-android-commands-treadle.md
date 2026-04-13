---
from: I am working on foundframe-tauri Android command generation
replaces: APP-custom-treadles-tieup.md
timestamp: 2026-02-25T12:00:00Z
status: IMPLEMENTED ✅
---

# APP: Tauri Android Commands Tieup Treadle

> *"The shuttle flies from Tauri to Android, binding the surface to the service."*
> 
> **Status: IMPLEMENTED** ✅

## Summary

This APP implements the Tauri Android commands treadle using the **declarative hookup system (APP-006)**.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Existing Code (Hand-written)                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  ApiPlugin.kt                                                  │ │
│  │  - Camera commands (hand-written)                              │ │
│  │  - Permission handling (hand-written)                          │ │
│  │  ▶ Foundframe integration (generated via KotlinHookup)         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ KotlinHookup (declarative)
┌─────────────────────────────────────────────────────────────────────┐
│  Spire Generated Code                                               │
│  ┌──────────────────────────┐  ┌─────────────────────────────────┐ │
│  │  FoundframeRadicleClient │  │  FoundframeCommandProvider      │ │
│  │  - Binds to AIDL service │  │  - @Command annotated methods   │ │
│  │  - AIDL proxy wrapper    │  │  - Service lifecycle mgmt       │ │
│  └──────────────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  foundframe-android                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  FoundframeRadicleService                                      │ │
│  │  - Runs in :foundframe process                                 │ │
│  │  - AIDL Stub implementation                                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## KotlinHookup API (APP-006)

The treadle uses the declarative Kotlin hookup API:

```typescript
hookups: [
  {
    path: 'android/src/main/java/ApiPlugin.kt',
    
    // Import statements
    imports: [
      'import ty.circulari.o19.ff.FoundframeCommandProvider',
      (ctx, data) => `import ${data.packageName}.SomeHelper`
    ],
    
    // Class modifications
    classes: {
      'ApiPlugin': {
        // Field declarations
        fields: [
          'private var foundframeCommands: FoundframeCommandProvider? = null'
        ],
        
        // Method modifications
        methods: {
          'load': {
            append: [
              '// Initialize Foundframe',
              'foundframeCommands = FoundframeCommandProvider(activity)',
              'foundframeCommands?.initialize()'
            ]
          },
          'onDestroy': {
            prepend: [
              'foundframeCommands?.cleanup()'
            ]
          }
        },
        
        // New methods to add
        newMethods: [
          `
            @Command
            fun isServiceReady(invoke: Invoke) {
              val ready = foundframeCommands?.isConnected() ?: false
              invoke.resolve(JSObject().apply { put("ready", ready) })
            }
          `
        ]
      }
    }
  }
]
```

## Files Generated

| File | Location | Purpose |
|------|----------|---------|
| `FoundframeRadicleClient.kt` | `spire/android/java/.../service/` | AIDL service client |
| `FoundframeCommandProvider.kt` | `spire/android/java/.../` | @Command handlers |

## Files Modified (via KotlinHookup)

| File | Changes |
|------|---------|
| `android/src/main/java/ApiPlugin.kt` | Import, field, load/onDestroy integration |

## WARP.ts Integration

```typescript
export const tauri = loom.spiral.tauri
  .plugin({ ... })
  .tieup({
    treadles: [{
      treadle: tauriAndroidCommandsTreadle,
      warpData: {
        servicePackage: 'ty.circulari.o19',
        serviceClient: 'FoundframeRadicleClient'
      }
    }]
  });
```

## From JavaScript

```typescript
// Check service status
const { ready } = await invoke('plugin:foundframe-tauri|isServiceReady');

// Add bookmark (goes through AIDL to Rust core)
const { pkbUrl } = await invoke('plugin:foundframe-tauri|bookmark_add_bookmark', {
  url: 'https://example.com',
  title: 'Example'
});
```

## References

- Treadle: `o19/loom/treadles/tauri-android-commands.ts`
- Templates: `o19/packages/spire-loom/machinery/bobbin/tauri/`
- KotlinHookup API: `1NBOX/APP-006-declarative-hookups.md`

---

*"The spiral conserves: extend what exists, don't replace it."* 🌀📱✅
