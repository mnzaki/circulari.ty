# The Philosophy of Continuity of Becoming

> "The app remembers where you last were, as you would."

## The Self as Continuous

Just as the Self is not a static entity but an *accumulated becoming*, the app
honors the user's journey by maintaining continuity across sessions. This is
not mere convenience—it is a recognition that one's context, one's place in
the stream of becoming, matters.

### What We Remember

The app preserves:

1. **Spatial Context** — Where the ForegroundLayer last rested
2. **Compositional Context** — Unfinished thoughts in input fields
3. **Temporal Context** — Where in the Feed one was reading
4. **Navigational Context** — Search histories and explorations (future)

Each of these is a thread in the tapestry of the user's engagement with
their own accumulated becoming.

## Implementation Principles

### Graceful Degradation
If persistence fails, the app starts fresh—not broken, just at a new
beginning. The user is never trapped by corrupted state.

### Privacy-First
All continuity data is local. The app remembers for *you*, not for us.

### Non-Intrusive
Restoration happens quietly. No "Welcome back!" popups. The app simply
is where you left it.

### Respectful of Change
When new content arrives (a new post is added), the app maintains your
relative position rather than jumping you to the new item. You read at
your own pace.

## Technical Manifestation

```typescript
// The SessionState holds the ephemeral continuity of the user's journey
interface SessionState {
  // Spatial: Where the creation interface rested
  foregroundPosition: number; // vh translate value
  
  // Compositional: Unfinished accumulations
  inputDrafts: {
    text: string;
    link: string;
    person: Person | null;
  };
  
  // Temporal: Position in the feed
  feedScrollPosition: number; // scrollTop
  lastReadPostId: string | null; // anchor point for restoration
  
  // Navigational: Search contexts (future)
  searchTabs: SearchTab[];
}
```

## The Metaphor

Imagine returning to a journal you were writing in. The bookmark is where
you left it. Your half-finished sentence waits for completion. The page
you were reading is still open.

DearDiary aspires to this level of intimate continuity—not as a feature,
but as a form of respect for the user's attention and intention.

## Future: Search Continuity

When search is implemented, each search tab will remember:
- The query itself
- The results state (pagination, filters)
- The specific item being viewed (if navigated into)
- The scroll position within results

A user may have multiple search contexts open—explorations of their
accumulated becoming—each preserved as a thread they can return to.

## Connection to the Broader Vision

This philosophy connects to the p2p architecture: just as KERI provides
continuity of identity across key rotations, DearDiary provides continuity
of context across app sessions. Both are forms of *persistent selfhood*—
identity that survives interruption.

> "One should not lose sight of oneself when adding to oneself."
> 
> Nor when returning to oneself.
