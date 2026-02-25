# governance-test: Failure Modes

> *"Solarpunk needs to be resilient, not just optimistic."*

## Risk Assessment

| Scenario | Probability | Impact | Mitigation |
|----------|-------------|--------|------------|
| Tool name contains invalid characters (/, :, etc.) | high | high | Use only [a-zA-Z0-9_-] in tool names |
| Stdio protocol corruption | medium | high | Log to stderr only, stdout is for MCP |
| Server crashes on invalid input | medium | medium | Validate all inputs with Zod schemas |

---

*The spiral conserves even its wounds.*
