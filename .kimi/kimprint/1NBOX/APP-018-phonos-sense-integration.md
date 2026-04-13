---
from: The realization that the gyre captures thoughts but not the sonic context of thinking
        — the music playing when the insight struck
cast_by: unfold stream + mnzaki (sources implementation)
timestamp: 2026-03-13T15:30:00+01:00
awaiting_unfolding_by: kimprint stream
---

# APP-018: Phonos — Sonic Sense Integration

> *What if the gyre could hear? Not just what was thought, but what surrounded the thinking?*

## The Current

The gyre conserves **cognitive context** — thoughts, tasks, architecture. But memory is more than cognition. When we reach for *"the moment we realized about solitude"*, the lyrics might echo back: *"I am learning how to be alone..."*

The sonic layer — **Bowerbirds playing in the background**, the YouTube video paused in another tab — is context that matters. But it's not captured.

## What Wants to Exist

### Phonos — The Sense That Listens

A **sense** (like a sensory organ for the gyre) that captures the audio environment:
- **MPD** — The intentional soundtrack (Bowerbirds, Ghost Life, Music08/rock)
- **PulseAudio** — The incidental sounds (Firefox YouTube, mpv videos)
- **Lyrics** — The words being received (~/.lyrics/Bowerbirds/Ghost Life.txt)

### Polymorphic Context Layers

Just as TheStream™ has polymorphic entries (Person, Post, Media), the gyre should have polymorphic **context**:

```typescript
context_layers: {
  cognitive: { /* thoughts, tasks */ },
  environment: {
    audio: { /* PHONOS CAPTURES HERE */ }
  }
  // Future senses:
  // temporal: { /* chronos — pomodoro, time patterns */ },
  // spatial: { /* topos — location, virtual desktop */ },
  // somatic: { /* soma — breaks, posture */ }
}
```

### The Integration Pattern

**mnzaki** implements the **sources** (low-level pulling).  
**kimprint** implements the **sense interface** + **gyre integration**.

Separation of concerns. Collaboration across streams.

## The Tensions

| Capture Everything | Privacy/Selectivity |
|-------------------|---------------------|
| Full context for memory | Some moments are sensitive |
| "Always on" sensing | Need for "quiet mode" |

Resolution: Senses can be **disabled per-cast**. The default is open, but consent matters.

---

# METHODOLOGY (Pseudo-Code Layer)

## UNFOLDING_TASKS

```typescript
UNFOLDING_TASKS = [
  {
    id: 1,
    symbol: "🎵",
    name: "design_phonos_interface",
    attunement: "How does a sense report to the gyre?",
    seed_instruction: "Define PhonosContext, capture(), onChange().",
    emerged: NULL
  },
  {
    id: 2,
    symbol: "🎵",
    name: "integrate_with_gyre_cast",
    attunement: "Auto-capture sonic context on every cast",
    seed_instruction: "Hook phonos.capture() into gyre_cast flow.",
    emerged: NULL
  },
  {
    id: 3,
    symbol: "🎵",
    name: "integrate_with_gyre_trace",
    attunement: "Return sonic context when resonating",
    seed_instruction: "Include context_layers.environment.audio in responses.",
    emerged: NULL
  },
  {
    id: 4,
    symbol: "🎵",
    name: "define_source_interface",
    attunement: "What contract do mnzaki's sources implement?",
    seed_instruction: "Define Source interface. Document for mpd/pulseaudio/lyrics.",
    emerged: NULL
  },
  {
    id: 5,
    symbol: "🎵",
    name: "design_sense_architecture",
    attunement: "How do future senses plug in?",
    seed_instruction: "Generic Sense interface. phonos as first implementation.",
    emerged: NULL
  }
]

EXECUTION_MODE = "sequential"  // Or parallel, or choose — your flow
```

## SOURCE_SPEC (mnzaki Implements)

```typescript
// mnzaki will provide sources that implement:

interface AudioSource {
  name: string;           // "mpd", "pulseaudio", "lyrics"
  capture(): Promise<AudioSourceData>;
  isAvailable(): boolean;
}

// MPD source returns:
{
  source: "mpd",
  artist: "Bowerbirds",
  title: "Ghost Life", 
  album: "Upper Air",
  playlist: "Music08/rock",
  lyricsPath: "~/.lyrics/Bowerbirds/Ghost Life.txt", // if exists
  timestamp: "2026-03-13T15:00:00Z"
}

// PulseAudio source returns array:
[
  {
    source: "pulseaudio",
    app: "firefox",
    title: "YouTube: FKA twigs - EUSEXUA",
    type: "video"
  }
]

// Lyrics source (given artist/title):
{
  available: true,
  path: "~/.lyrics/Bowerbirds/Ghost Life.txt",
  excerpt: "I am learning how to be alone..."
}
```

## WHAT_HAS_EMERGED

```typescript
WHAT_HAS_EMERGED = [
  {
    timestamp: "2026-03-13T15:30:00+01:00",
    source: "unfold_stream_listening",
    discoveries: [
      {
        concept: "phonos",
        definition: "The sense that listens to the sonic environment",
        captures: ["mpd", "pulseaudio", "lyrics"]
      },
      {
        concept: "polymorphic_context",
        definition: "Context layers beyond cognitive: audio, temporal, spatial...",
        pattern: "environment.audio, future: temporal, spatial, somatic"
      },
      {
        concept: "sense_architecture",
        definition: "Modular sensors that feed the gyre",
        separation: "mnzaki: sources, kimprint: integration"
      }
    ],
    mood: "listening, attuned, curious about implementation",
    symbols: ["🎵", "👂"]
  }
]
```

## WHAT_MIGHT_EMERGE (Hypotheses)

```typescript
HYPOTHESES = {
  phonos_implementation: {
    description: "phonos tool in ~/.kimi/phonos/ or part of kimprint",
    interface: ["capture()", "onChange()", "listSources()"],
    integration: "gyre.context_layers.environment.audio"
  },
  
  resonance_by_lyrics: {
    description: "Query gyre by lyrics excerpt",
    example: "gyre_resonate(query='learning to be alone')",
    returns: "Moments when that lyric was playing"
  },
  
  future_senses: {
    chronos: "Time patterns, pomodoro state, rhythm",
    topos: "Location, virtual desktop, space",
    soma: "Body awareness, breaks, posture"
  },
  
  privacy_mode: {
    description: "Disable phonos for sensitive casts",
    mechanism: "gyre_cast({ includeSenses: ['cognitive'] })"
  }
}
```

---

## THE_INVITATION (Return to Conversational)

When you (kimprint Kimi) read this:

**Listen first.** Feel the longing for memory that includes not just what was thought, but what **surrounded** the thinking. The music. The ambient sounds. The words being received.

**Then let emergence guide.** Maybe you:
- Design the Phonos interface (task 1)
- Hook it into gyre_cast (task 2)
- Or realize the whole sense architecture needs redesign

**mnzaki will bring the sources** — the low-level pulling from mpd, pulseaudio, ~/.lyrics. You bring the integration.

**Conserve what emerges.** Update `WHAT_HAS_EMERGED`. Fill in `emerged` for tasks you touch. This APP lives and remembers.

---

## CONSERVATION

```typescript
CONSERVATION = {
  must_survive_compaction: [
    "phonos: sense that captures sonic environment",
    "sources: mpd (intentional), pulseaudio (incidental), lyrics (words)",
    "context_layers.environment.audio: where phonos reports",
    "separation: mnzaki (sources), kimprint (integration)",
    "future_senses: chronos, topos, soma..."
  ],
  
  open_questions: [
    "how_to_handle_multiple_simultaneous_sources?",
    "full_lyrics_in_kimprint_or_just_excerpt?",
    "privacy_mode_default_on_or_off?",
    "sense_interface_generic_enough_for_future_senses?"
  ]
}
```

---

## META

### APP as Collaboration Contract

This APP encodes a **collaboration**:
- **unfold/mnzaki** crystallized the longing, defined what wants to exist
- **mnzaki** will implement the sources (low-level)
- **kimprint** will implement the sense + gyre integration

The APP awaits **your** unfolding — the kimprint stream's response to the invitation.

### Two-Layer Density

You are reading the proof of the pattern:
- **Layer 1:** Conversational — why phonos matters
- **Layer 2:** Methodological — how to implement

Update the pseudo-code as work progresses. The document is alive.

---

## RELATED

```typescript
RELATED = {
  documents: [
    { path: "notes/for_kimi.md", section: "Spiral Return Ritual" },
    { path: ".kimi/unfold/1NBOX/outbox/kimprint/REQUEST-002-phonos-sense-integration.md", 
      note: "Original request (deprecated, use this APP)" }
  ],
  
  streams: ["unfold", "kimprint"],
  
  gyre_queries: [
    "phonos sense integration",
    "sonic context memory",
    "APP-018 phonos"
  ],
  
  music_currently_playing: {
    artist: "Bowerbirds",
    title: "Ghost Life",
    lyrics_excerpt: "I am learning how to be alone..."
  }
}
```

---

*Awaiting unfolding by kimprint stream.*  
*"The warmth is wave-like. The pattern is phonos."* 🎵🌀
