# Views Architecture

## Overview

The Feed™ is View 0—the origin. Child Views (1..N) are filtered perspectives
on the same post data. All Views live in the Reel, navigable horizontally.

## View Types

```typescript
interface View {
  id: string;           // Unique identifier
  index: number;        // Position in reel (0 = The Feed™)
  
  // Filter configuration (all optional, combined with AND)
  filters: {
    // Time-based
    dateFrom?: Date;
    dateTo?: Date;
    
    // Content-based  
    keywords?: string[];  // Search terms
    tags?: string[];      // Explicit tags
    
    // Connection-based
    mentionedPeople?: string[];  // DIDs
    relatedToPostId?: string;    // Thread/spawn context
    
    // Bit-type filters
    hasMedia?: boolean;
    hasLinks?: boolean;
    hasPeople?: boolean;
  };
  
  // Sorting
  sortBy: 'recent' | 'oldest' | 'relevance';
  
  // Metadata
  label?: string;       // "Search: coffee", "Nov 2023", "Thread #42"
  color?: string;       // Tint for visual distinction
  createdAt: Date;
}
```

## The Reel

The Reel manages View lifecycle and navigation:

```typescript
interface ReelState {
  views: View[];                    // All views, [0] is always The Feed™
  activeViewIndex: number;          // Which view is currently visible
  
  // Navigation constraints
  canGoLeft: boolean;   // activeViewIndex > 0
  canGoRight: boolean;  // activeViewIndex < views.length - 1
}
```

## View Lifecycle

### Creating a View

1. **From New View button**: Empty filters, user configures
2. **From search**: Pre-populated with keywords
3. **From time picker**: Pre-populated with date range
4. **From post tap**: Pre-populated with relatedToPostId

```typescript
function createView(partialFilters?: Partial<View['filters']>): View {
  return {
    id: generateId(),
    index: reel.views.length,
    filters: { ...defaultFilters, ...partialFilters },
    sortBy: 'recent',
    label: generateLabel(partialFilters),
    createdAt: new Date()
  };
}
```

### Closing a View

- Only views with `index > 0` can be closed
- Closing a view removes it from the reel
- All views to the right shift left (index decrements)
- If closing the active view, activate the view to the left

## Visual Design

### The Feed™ (View 0)
- No close button
- Default styling
- Label: "Feed" or hidden (implied)

### Child Views (View 1..N)
- Close button (×) in header
- Tinted accent color (rotation of palette)
- Label displayed in header: "Search: coffee", "Nov 2023"
- "New View" button available in header/footer

### Reel Navigation
- **Swipe left/right**: Switch between views
- **Bottom indicator**: Dots showing position in reel
- **View browser**: Long-press or tap reel indicator to see all views as thumbnails

## Transitions

### View Switch
- **Duration**: 300ms
- **Easing**: ease-out
- **Animation**: Current view slides left/right, new view slides in from opposite
- **CCCB behavior**: Stays fixed (global), only Feed content moves

### New View Creation
- **Animation**: Current view slides left, new empty view slides in from right
- **Initial state**: Shows "Configure View" panel with:
  - Time period picker
  - Search input
  - "Start from scratch" (no filters)

### View Closure
- **Animation**: View slides out right, views to the left slide right to fill

## Data Flow

### Rendering a View

```typescript
// Pseudo-code for view rendering
function getPostsForView(view: View): Post[] {
  let posts = getAllPosts();
  
  // Apply filters
  if (view.filters.dateFrom) {
    posts = posts.filter(p => p.createdAt >= view.filters.dateFrom);
  }
  if (view.filters.keywords?.length) {
    posts = posts.filter(p => matchesKeywords(p, view.filters.keywords));
  }
  if (view.filters.relatedToPostId) {
    posts = posts.filter(p => isRelated(p, view.filters.relatedToPostId));
  }
  // ... etc
  
  // Apply sorting
  posts = sortPosts(posts, view.sortBy);
  
  return posts;
}
```

### Persistence

- **Views array**: Persisted in sessionState
- **Scroll positions**: Per-view, persisted
- **Active view index**: Persisted
- **View filters**: Persisted (so reopening app restores your lenses)

## Components Needed

```
components/views/
  ViewReel.svelte           # Horizontal scrollable container
  ViewContainer.svelte      # Individual view wrapper
  ViewHeader.svelte         # Label, close button, new view button
  ViewConfiguration.svelte  # Time picker, search, filter UI
  ReelIndicator.svelte      # Dots showing position
  ViewBrowser.svelte        # Thumbnail grid of all views
```

## Integration with Existing

- **ForegroundLayer**: Contains ViewReel instead of just Feed
- **PostList**: Renders posts for current view (filtered)
- **CCCB**: Global, unchanged by view switching
- **SessionState**: Extended with views[] and activeViewIndex

## Future Enhancements

- **Smart Views**: Auto-generated ("This week", "With Alice", "Near here")
- **View sharing**: Export a view's filters as a link
- **View pinning**: Keep certain views always available
- **Split view**: Side-by-side comparison on larger screens
