# Input Components: Architecture & Design

## Philosophy

Input components are **inline, contextual, and ephemeral**. They appear where the user is (below the CCCB), capture the specific bit type, then disappear—adding their contribution to the accumulating post.

Unlike modal dialogs, inline inputs preserve context: the user never loses sight of the CCCB and their staged bits.

## Component Tree

```
ForegroundLayer
├── CreationTools
│   ├── DragIndicator
│   ├── CaptureControls (CTAs)
│   │   └── CTA buttons trigger input visibility
│   ├── CCCB (CaptureButton)
│   └── InputContainer (inline, conditional)
│       ├── TextInput
│       ├── LinkInput
│       ├── PersonInput
│       └── MediaCapture (future)
└── FeedContainer
```

## State Management

### Input Visibility
Managed in `ForegroundLayer` via simple state:
```typescript
type ActiveInput = 'text' | 'link' | 'person' | 'media' | null;
let activeInput = $state<ActiveInput>(null);
```

Opening an input closes any other (mutually exclusive).

### Input → Accumulation Flow
1. CTA clicked → `activeInput = 'type'`
2. Input component mounts → autofocus → trap focus
3. User enters data → validates → enables submit
4. Submit → `addBit()` → `activeInput = null`
5. CCCB updates showing new staged bit

## Individual Component Specs

### TextInput
**Purpose**: Freeform text entry with optional character count.

**Features**:
- Autofocus on mount
- Auto-expanding textarea (grows with content)
- Character count (soft limit, not enforced)
- Submit: Cmd/Ctrl+Enter or tap button
- Cancel: Escape or tap outside

**Accessibility**:
- `aria-label="Text entry"`
- `aria-describedby` linking to character count
- Focus trap while open
- Return focus to triggering CTA on close

**Props**:
```typescript
interface TextInputProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  initialValue?: string;
}
```

---

### LinkInput
**Purpose**: URL entry with live preview fetching.

**Features**:
- URL validation (basic regex + fetch HEAD for existence)
- Auto-paste from clipboard (if clipboard contains URL)
- Live preview: fetch OpenGraph metadata
  - Title, description, image
  - Loading state while fetching
  - Error state if fetch fails
- Suggestions: recently used links (future)

**Accessibility**:
- `aria-label="Link URL"`
- `aria-describedby` for validation errors
- Loading state: `aria-busy="true"`
- Preview announced via `aria-live="polite"`

**Props**:
```typescript
interface LinkInputProps {
  onSubmit: (url: string, preview: LinkPreview) => void;
  onCancel: () => void;
  initialUrl?: string;
}
```

---

### PersonInput
**Purpose**: Search and select people from contacts/network.

**Features**:
- Search-as-you-type (debounced 200ms)
- Dropdown results with avatar + name
- Keyboard navigation (↓↑ to select, Enter to confirm)
- Selected person shown as chip (removable)
- Support for tagging multiple people (one at a time)

**Accessibility**:
- `role="combobox"` on input
- `aria-expanded` on dropdown
- `aria-selected` on options
- `aria-activedescendant` for keyboard selection
- Clear focus indicators

**Props**:
```typescript
interface PersonInputProps {
  onSubmit: (person: { did: string; displayName: string; avatarUri?: string }) => void;
  onCancel: () => void;
  // Future: availablePersons list for autocomplete
}
```

---

## Shared Patterns

### Animation
- **Enter**: Slide down + fade in (150ms ease-out)
- **Exit**: Slide up + fade out (100ms ease-in)
- **Height**: Auto-animate height changes

### Focus Management
```typescript
// On mount: autofocus input
$effect(() => {
  inputRef?.focus();
});

// Focus trap: cycle within component
function handleTab(e: KeyboardEvent) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  // Trap logic...
}

// On close: return focus to trigger
onCancel?.();
triggerElement?.focus();
```

### Validation & Error States
- Inline validation (not blocking)
- Error messages below input, `role="alert"`
- Submit disabled until valid
- Shake animation on invalid submit attempt

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Escape | Cancel, close input |
| Enter | Submit (if valid) |
| Cmd/Ctrl+Enter | Submit (alternative) |
| Tab | Navigate between controls |
| ↓↑ (PersonInput) | Navigate results |

## Accessibility Checklist

- [ ] **Focus visible**: Clear 2px outline or ring
- [ ] **Focus order**: Logical, predictable
- [ ] **Focus trap**: While input is open
- [ ] **Focus return**: To triggering element on close
- [ ] **ARIA labels**: All inputs labeled
- [ ] **ARIA live regions**: For dynamic content (previews, errors)
- [ ] **Keyboard operable**: All features via keyboard
- [ ] **Screen reader tested**: NVDA/VoiceOver
- [ ] **Reduced motion**: Respect `prefers-reduced-motion`

## Future Enhancements

- **Voice input**: Tap microphone, dictation
- **Smart suggestions**: AI-powered text completion
- **Rich text**: Bold, italic, links within text
- **Mentions**: @ autocomplete within TextInput
- **Hashtags**: # autocomplete

## Integration Notes

The `InputContainer` in `ForegroundLayer`:
- Manages which input is visible
- Handles the slide animation wrapper
- Provides `onCancel` that clears `activeInput`
- Provides `onSubmit` that calls `addBit()` and clears `activeInput`

CTAs disable themselves while their input is open (visual feedback).
