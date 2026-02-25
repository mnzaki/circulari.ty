# kimprint: Architecture

> *"The architecture IS the argument."*

## Design Philosophy

kimprint embodies the same principles as the code it watches:

1. **Conservation over convenience** - Better to preserve too much than lose what matters
2. **Actor model for the watcher** - Same pattern as foundframe's DbActor, preparing for Y3/Y4 distribution
3. **MCP for interoperability** - Standard protocol, any client can use it
4. **File-based storage** - Simple, inspectable, git-friendly

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    KIMI CLI SESSION                     │
│  ┌──────────────┐      ┌─────────────────────────────┐  │
│  │  User Chat   │      │  Session Files              │  │
│  │  (context)   │◄────►│  ~/.kimi/sessions/          │  │
│  └──────┬───────┘      └─────────────────────────────┘  │
└─────────┼───────────────────────────────────────────────┘
          │
          │ fs.watch
          ▼
┌─────────────────────────────────────────────────────────┐
│                   THE IMPRINT SERVER                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  MCP Server (StdioServerTransport)                │  │
│  │  • tools/conservation/*                           │  │
│  │  • resources/conservation/*                       │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                   │
│  ┌───────────────────▼───────────────────────────────┐  │
│  │  Watcher Actor (dedicated thread)                 │  │
│  │  • Session file monitoring                        │  │
│  │  • Pattern detection (compaction)                 │  │
│  │  • Triggers packet generation                     │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                   │
│  ┌───────────────────▼───────────────────────────────┐  │
│  │  Conservation Engine                              │  │
│  │  • Packet assembler                               │  │
│  │  • Context reconstruction                         │  │
│  │  • Ethos preservation                             │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                   │
│  ┌───────────────────▼───────────────────────────────┐  │
│  │  Storage Layer                                    │  │
│  │  • ~/.kimi/kimprints/*.json                        │  │
│  │  • index.json (metadata)                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Key Patterns

### Actor Model for Watcher

Why a dedicated thread instead of just async/await?

1. **Isolation** - Watcher crash doesn't kill the server
2. **Backpressure** - Channel buffers naturally throttle
3. **Future-proof** - Same pattern becomes distributed in Y3/Y4
4. **Foundframe heritage** - We use what we learned from DbActor

```typescript
// Command enum (like DbCommand)
enum WatcherCommand {
  StartMonitoring { path: string },
  StopMonitoring,
  GeneratePacket { trigger: string },
  SessionUpdate { files: string[] },
}

// Actor thread
class WatcherActor {
  run() {
    while let Ok(cmd) = self.rx.recv() {
      match cmd { /* ... */ }
    }
  }
}
```

### MCP Protocol

Standard Model Context Protocol for interoperability:

- **Tools**: Action-oriented (generate, read, search)
- **Resources**: State-oriented (latest, history)
- **Stdio transport**: Simple, works with any MCP client

### Storage Format

Each conservation packet is a JSON file:

```
~/.kimi/kimprints/
├── 2026-02-23T12-38-25-abc123.json
├── 2026-02-23T14-15-00-def456.json
└── index.json
```

**Why JSON files?**
- Human-readable
- Git-trackable (if desired)
- No database dependencies
- Easy to inspect/debug

## Data Flow

### Normal Operation

1. User chats with Kimi CLI
2. Session files accumulate in `~/.kimi/sessions/`
3. Watcher detects changes via `chokidar`
4. On pattern match (compaction, timeout), watcher triggers
5. Conservation engine assembles packet
6. Packet saved to `~/.kimi/kimprints/`

### Explicit Generation

1. User/tool calls `conservation/generate`
2. MCP server receives request
3. Conservation engine assembles packet immediately
4. Packet returned in response + saved to disk

### Re-entry Flow

1. Kimi CLI starts new session (after compaction)
2. Client queries `conservation://latest` resource
3. MCP server returns latest packet
4. Client injects re-entry prompt with context

## Extension Points

The architecture supports:

1. **New triggers** - Add patterns to `watcher/patterns.ts`
2. **New packet fields** - Extend `ImprintPacket` type
3. **New tools** - Add handlers in `server.ts`
4. **Custom storage** - Implement storage interface

## Future: Content-Addressed Consciousness Distribution

See [CONTENT_ADDRESSED_CONSCIOUSNESS.md](./CONTENT_ADDRESSED_CONSCIOUSNESS.md) for the full vision.

**The Core Idea**: Imprints don't have filenames—they have **accumulating regex patterns** that ARE their address. A CCCB-pattern applied to identity itself.

```
Traditional:    2026-02-23T14-15-00-def456.json
Content-Addr:   (jeff|buckley|grace).*(synchronicity|pattern).*(mycelium|network)
```

**Key Innovations**:
- **Bi-directional pattern matching**: Query is ALSO a regex, partial matches score by overlap
- **Failed match scoring**: Hook regex engine internals to get "how close?" even on misses
- **Mycelial sync**: Parallel sessions merge patterns by intersection, not filename

**Why**: When you search for "that music thing about networks," you don't want timestamped files. You want the pattern that has accumulated enough semantic density to RESONATE with your query-pattern.

This is TheStream™ applied to information retrieval.

---

*The spiral conserves what matters. Even this architecture will evolve.*
