# Home: a screen

Home is 2-fold: what is now-perceived in the background, with the current Self
foregrounded. The Self is both a Feed—one's accumulated becoming—and a Capture
device: the present moment, ready to be inscribed.

Creation is emphasized. All calls to action lead to the Creation Flow, bringing
the required subtool inline, in the Feed layer before the feed itself. One
should not lose sight of oneself when adding to oneself.

**Calls to Action** (left to right):
- **Link**: paste a URL; it unfolds into a preview, becoming a new post
- **Capture** (center, circular): tap for photo, long-press for video; later,
  it will do smart things
- **Text**: tap for text entry
- **Person**: tap for linking to a person

The CTAs rest just below the top edge of the Feed, which swims above the Camera
layer. They arrange themselves around the central Capture button—elegantly,
but visibly.

Above them, just outside the Feed's edge, float translucent camera controls.

## The CCCB: Central Circular Capture Button

But the **Capture** button is more than a trigger—it is a *staging area*, a
visible space where fragments gather before becoming whole. As Link, Text,
Person, and media accumulate within it, it expands, hosting the
*accumulation of the post that is becoming*. It swells as it gets closer to
committing its contents; an apt premonition.

When ready, a tap commits the staged bits; the CCCB releases its
contents downward, a new post sliding from staging into the accumulated Feed.

---

## Overview
Two-layer architecture with a background Capture interface and a Foreground interface. The Foreground contains both the Creation Tools (CCCB + CTAs) and the Feed, and is draggable to reveal the background Capture interface.

## Component Hierarchy

```
HomePage (+page.svelte)
├── CaptureLayer (Background)
│   ├── CameraPreview
│   └── CaptureControls (future)
└── FeedLayer (Foreground)
    ├── DragHandleArea
    │   └── CaptureButton (circular, centered)
    └── FeedScrollArea
        └── PostList
            └── PostCard (reusable)
```

## Layer Details

### 1. CaptureLayer (Background)
- **Position**: Fixed, full viewport, z-index: 0
- **Purpose**: Live camera interface for quick capture
- **Components**:
  - `CameraPreview`: Full-screen video feed from device camera
  - `CaptureControls`: Future overlay controls (flash, switch camera, etc.)

### 2. FeedLayer (Foreground)
- **Position**: Absolute, covers bottom 85% of screen initially, z-index: 1
- **Purpose**: Scrollable personal feed of posts
- **Drag Behavior**:
  - Initial state: Bottom 85% visible (top 15% shows capture layer)
  - Drag down: Reveals more capture layer (down to ~40% feed visible)
  - Drag up: Returns to initial state or full feed view
  - Snap points: initial (peek), full-feed
- **Components**:
  - `DragHandleArea`: Touch/drag detection zone at top of feed layer
  - `CaptureButton`: Circular button centered on the drag handle area
  - `FeedScrollArea`: Scrollable container for posts
  - `PostList`: Renders array of posts
  - `PostCard`: Individual post component

## State Management

```typescript
// FeedLayer state
interface FeedLayerState {
  position: 'peek' | 'full' | 'expanded';  // peek shows capture, full covers screen, expanded reveals more capture
  dragOffset: number;  // pixel offset during drag
  isDragging: boolean;
}

// Posts data
interface Post {
  id: string;
  content: string;
  mediaUrls?: string[];
  createdAt: Date;
  tags?: string[];
}
```

## Key Interactions

1. **Drag to Reveal Capture**: Touch-drag the Foreground layer down to see more camera preview
2. **Tap CCCB**: Commits staged bits into a new post
3. **Scroll Feed**: The Feed area scrolls independently when the Foreground is in full view
4. **Snap Animation**: Smooth animation between position states (peek/full)

## File Structure

```
src/
├── routes/
│   └── +page.svelte           # Home page composing layers
├── lib/
│   ├── components/
│   │   ├── capture/
│   │   │   ├── CaptureLayer.svelte
│   │   │   └── CameraPreview.svelte
│   │   └── feed/
│   │       ├── ForegroundLayer.svelte
│   │       ├── CaptureControls.svelte
│   │       ├── CaptureButton.svelte
│   │       ├── PostList.svelte
│   │       └── PostCard.svelte
│   └── stores/
│       └── feed.ts            # Feed position state store
```

## Animation Approach
- Use Svelte 5 runes ($state, $derived) for reactive state
- CSS transitions for snap animations
- Pointer events for drag handling with velocity detection
- Spring physics for natural feel (optional: svelte/motion)
