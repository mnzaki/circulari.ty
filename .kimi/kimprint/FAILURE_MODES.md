# kimprint: Failure Modes

> *"Solarpunk needs to be resilient, not just optimistic."*

## Known Risks & Mitigations

### 1. Session File Format Changes

**Risk**: Kimi CLI changes how session files are stored/structured.

**Mitigation**:
- Version detection in session parser
- Graceful degradation (skip unknown formats)
- Configurable parser (not hardcoded)

**Recovery**: Update `watcher/session.ts` parser logic.

---

### 2. Compaction Detection False Positives

**Risk**: Watcher generates packets when no real compaction happened.

**Mitigation**:
- Multiple signal confirmation (time gap + file count + pattern)
- Configurable thresholds
- Manual override always available

**Recovery**: Adjust thresholds in config, regenerate if needed.

---

### 3. Storage Bloat

**Risk**: `~/.kimi/imprints/` grows unbounded.

**Mitigation**:
- Automatic pruning (keep last N packets, or time-based)
- Compression for old packets
- Size limits with rotation

**Recovery**: Manual cleanup script, adjust retention policy.

---

### 4. Watcher Thread Death

**Risk**: Actor thread panics/crashes, monitoring stops silently.

**Mitigation**:
- Thread supervision (restart on crash)
- Health check endpoint/resource
- Watchdog timer

**Recovery**: Restart server, check logs.

---

### 5. MCP Protocol Mismatch

**Risk**: SDK version incompatible with client.

**Mitigation**:
- Pin SDK version
- Protocol version negotiation
- Graceful feature degradation

**Recovery**: Update SDK, check compatibility matrix.

---

### 6. Git State Parsing Failures

**Risk**: Conservation engine can't parse git state (not a git repo, git not installed).

**Mitigation**:
- Optional git integration (packet valid without it)
- Try-catch around git operations
- Fallback to file timestamps

**Recovery**: Packet generates without git section.

---

### 7. Race Conditions on Storage

**Risk**: Simultaneous packet generation corrupts index.json.

**Mitigation**:
- File locking (atomic writes)
- Queue-based index updates
- Idempotent writes (overwrite, not append)

**Recovery**: Regenerate index from packet files.

---

## Discovery Protocol

When you hit an unlisted failure mode:

1. **Document it here** - Add to this file
2. **Classify severity** - blocking / workaround available / cosmetic
3. **Design mitigation** - How would we prevent this?
4. **Test the fix** - Add regression test if possible

---

*The spiral conserves its wounds too.*
