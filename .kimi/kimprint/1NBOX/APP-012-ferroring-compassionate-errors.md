# APP-012: Ferroring - Weaving Error Explanations 🦀

> *"The loom that weaves code can also weave understanding."*  
> *— Ferris the Wise*

**Status**: 📋 Design Phase  
**Package**: `o19/packages/ferroring`  
**Dependencies**: `spire-loom` (reuses pattern matching & pipeline machinery)  
**Priority**: HIGH - Elevates entire developer experience

---

## Philosophy

Ferroring treats **errors as patterns to be matched and explanations as code to be woven**. Just as spire-loom generates code from WARP definitions, ferroring generates helpful error messages from error signatures.

### The Core Insight

The loom already has everything needed for compassionate errors:

| Loom Component | Purpose | Ferroring Equivalent |
|----------------|---------|---------------------|
| **Heddles** | Pattern match spiral nodes | Error pattern matching |
| **Sley** | Pipeline method transformations | Suggestion pipelines |
| **Warp** | Static configuration | Error taxonomy |
| **Context** | Flows through weaving phases | Context stack capture |
| **Treadles** | Generate code | Generate explanations |

### Principles (The Ferris Doctrine)

1. **Weave Understanding** - Don't report errors; weave explanations
2. **Pattern Match Intent** - Like heddles match spirals, match error signatures
3. **Pipeline Suggestions** - Like sley transforms methods, transform context into fixes
4. **Teach Through Context** - Rich async context tells the story
5. **Render Anywhere** - UI-agnostic; render to terminal, MUD, LSP, web

---

## Architecture

```
o19/packages/ferroring/
├── src/
│   ├── core/
│   │   ├── ContextWeave.ts        # Async context capture (like weaving context)
│   │   ├── ErrorPattern.ts        # Pattern matching for errors (like heddles)
│   │   ├── SuggestionPipeline.ts  # Transform errors → suggestions (like sley)
│   │   └── ExplanationTreadle.ts  # Generate explanations (like treadles)
│   ├── taxonomy/                  # Error definitions (like WARP)
│   │   ├── SpireLoomErrors.ts     # All spire-loom error patterns
│   │   └── UserErrors.ts          # User-defined error patterns
│   ├── renderers/
│   │   ├── TerminalRenderer.ts    # Beautiful CLI output
│   │   ├── MUDRenderer.ts         # Narrative mode
│   │   ├── LSPRenderer.ts         # Editor integration
│   │   └── JSONRenderer.ts        # Machine-readable
│   └── index.ts
└── tests/
```

### Core Abstractions

```typescript
// ============================================================================
// 1. Error Pattern (like SpiralPattern in heddles)
// ============================================================================

/**
 * A pattern that matches error signatures.
 * Like heddles match (current: Spiraler, previous: Layer),
 * error patterns match (error: Error, context: ContextStack).
 */
interface ErrorPattern<ErrorType extends Error = Error> {
  /** Unique pattern identifier */
  readonly id: string;
  
  /** Match this error? */
  match(error: unknown, context: ContextFrame[]): boolean;
  
  /** Extract relevant data from the error */
  extract(error: ErrorType, context: ContextFrame[]): ErrorData;
}

/**
 * Concrete error data after pattern matching.
 */
interface ErrorData {
  /** Machine-readable code */
  code: string;
  
  /** Human-readable title */
  title: string;
  
  /** The error message */
  message: string;
  
  /** Where it happened */
  location: ErrorLocation;
  
  /** What the user was trying to do (inferred) */
  inferredIntent?: Intent;
  
  /** Relevant context values */
  context: Record<string, unknown>;
}

// ============================================================================
// 2. Context Weave (flows through phases like GeneratorContext)
// ============================================================================

/**
 * Captures semantic context using AsyncLocalStorage.
 * Like GeneratorContext flows through heddles → weave → shuttle,
 * ContextFrame flows through user code.
 */
interface ContextFrame {
  /** Phase of operation */
  phase: 'definition' | 'collection' | 'matching' | 'generation' | 'hookup';
  
  /** What operation is happening */
  operation: string;
  
  /** Entity name (treadle name, file path, etc.) */
  name?: string;
  
  /** Relevant data at this frame */
  data: Record<string, unknown>;
  
  /** Timestamp for debugging */
  timestamp: number;
}

/**
 * Async context stack - the magic sauce.
 */
class ContextWeave {
  private storage = new AsyncLocalStorage<ContextFrame[]>();
  
  /** Run function with context frame */
  withFrame<T>(frame: Omit<ContextFrame, 'timestamp'>, fn: () => T): T {
    const current = this.storage.getStore() || [];
    const fullFrame: ContextFrame = { ...frame, timestamp: Date.now() };
    return this.storage.run([...current, fullFrame], fn);
  }
  
  /** Get current context stack */
  getStack(): ContextFrame[] {
    return this.storage.getStore() || [];
  }
  
  /** Format for display */
  formatStack(): string {
    return this.getStack()
      .map((f, i) => `${'  '.repeat(i)}→ ${f.phase}: ${f.name || f.operation}`)
      .join('\n');
  }
}

// ============================================================================
// 3. Suggestion Pipeline (like MethodPipeline in sley)
// ============================================================================

/**
 * Transforms error data into ranked suggestions.
 * Like MethodPipeline transforms methods through stages.
 */
interface SuggestionStage {
  name: string;
  transform: (error: ErrorData, context: ContextFrame[]) => Suggestion[];
}

/**
 * A suggestion with confidence and actionability.
 */
interface Suggestion {
  /** Short title */
  title: string;
  
  /** Detailed explanation */
  description: string;
  
  /** Code fix if applicable */
  codeFix?: CodeFix;
  
  /** Quick action for interactive mode */
  action?: QuickAction;
  
  /** How confident? 0-1 */
  confidence: number;
  
  /** Reasoning for this suggestion */
  reasoning: string;
}

/**
 * Pipeline of suggestion stages.
 */
class SuggestionPipeline {
  private stages: SuggestionStage[] = [];
  
  addStage(stage: SuggestionStage): this {
    this.stages.push(stage);
    return this;
  }
  
  process(error: ErrorData, context: ContextFrame[]): Suggestion[] {
    const allSuggestions: Suggestion[] = [];
    
    for (const stage of this.stages) {
      const stageSuggestions = stage.transform(error, context);
      allSuggestions.push(...stageSuggestions);
    }
    
    // Rank by confidence
    return allSuggestions
      .filter(s => s.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence);
  }
}

// ============================================================================
// 4. Explanation Treadle (like GeneratorFunction)
// ============================================================================

/**
 * Generates an explanation from error data.
 * Like a treadle generates code from context.
 */
type ExplanationTreadle = (
  error: ErrorData,
  suggestions: Suggestion[],
  context: ContextFrame[]
) => Explanation;

/**
 * The final explanation.
 */
interface Explanation {
  /** Error code */
  code: string;
  
  /** Display title */
  title: string;
  
  /** Primary message */
  message: string;
  
  /** Full context stack */
  context: ContextFrame[];
  
  /** Ranked suggestions */
  suggestions: Suggestion[];
  
  /** Related documentation */
  docs?: DocLink;
}

// ============================================================================
// 5. Renderers (UI-agnostic output)
// ============================================================================

interface Renderer {
  render(explanation: Explanation): string | Buffer | HTMLElement;
}
```

---

## Error Taxonomy (The Warp)

Errors are defined like WARP configurations:

```typescript
// ferroring/taxonomy/SpireLoomErrors.ts

export const TreadleNoPurposePattern: ErrorPattern = {
  id: 'treadle/no-purpose',
  
  match(error, context) {
    // Check if we're in defineTreadle context
    const inTreadleDef = context.some(f => 
      f.phase === 'definition' && f.operation === 'defineTreadle'
    );
    
    // Check if error is about missing required fields
    const isMissingFields = error instanceof Error && 
      error.message.includes('must have methods') ||
      error.message.includes('must have at least one output');
    
    return inTreadleDef && isMissingFields;
  },
  
  extract(error, context) {
    const treadleFrame = context.find(f => f.phase === 'definition');
    const definition = treadleFrame?.data?.definition as TreadleDefinition;
    
    // Infer intent from what WAS provided
    const intent = inferTreadleIntent(definition);
    
    return {
      code: 'TREADLE_NO_PURPOSE',
      title: 'Treadle Has No Purpose',
      message: `Your treadle '${definition?.name}' has nothing to do!`,
      location: {
        phase: 'definition',
        treadleName: definition?.name,
        file: treadleFrame?.data?.file
      },
      inferredIntent: intent,
      context: { definition }
    };
  }
};

// More patterns...
export const HookupFileNotFoundPattern: ErrorPattern = {
  id: 'hookup/file-not-found',
  
  match(error, context) {
    return context.some(f => f.phase === 'hookup') &&
      error instanceof Error &&
      error.message.includes('File not found');
  },
  
  extract(error, context) {
    const hookupFrame = context.find(f => f.phase === 'hookup');
    return {
      code: 'HOOKUP_FILE_NOT_FOUND',
      title: 'Hookup Target Missing',
      message: `The file "${hookupFrame?.data?.path}" doesn't exist yet.`,
      location: {
        phase: 'hookup',
        file: hookupFrame?.data?.path
      },
      inferredIntent: { type: 'wiring', description: 'Wire into existing file' },
      context: { hookupPath: hookupFrame?.data?.path }
    };
  }
};
```

---

## Suggestion Stages (The Sley)

```typescript
// ferroring/suggestions/TreadleSuggestions.ts

export const IntentInferenceStage: SuggestionStage = {
  name: 'infer-intent',
  
  transform(error, context) {
    const suggestions: Suggestion[] = [];
    
    switch (error.inferredIntent?.type) {
      case 'wiring':
        suggestions.push({
          title: 'Wire existing code',
          description: 'Your treadle only has hookups. This is valid for wiring!',
          confidence: 0.9,
          reasoning: 'User provided hookups without methods/outputs'
        });
        break;
        
      case 'generation':
        suggestions.push({
          title: 'Add outputs to generate files',
          description: 'You have methods but no outputs. Add outputs to generate code.',
          codeFix: {
            snippet: `outputs: [
  { 
    template: 'gen.ejs',
    path: 'src/generated.rs',
    language: 'rust'
  }
]`,
            target: 'treadle'
          },
          confidence: 0.95,
          reasoning: 'Methods present but no outputs defined'
        });
        break;
        
      case 'unknown':
        suggestions.push({
          title: 'What are you building?',
          description: 'Your treadle seems empty. What do you want it to do?',
          confidence: 0.5,
          reasoning: 'No clear pattern detected'
        });
        break;
    }
    
    return suggestions;
  }
};

export const CommonFixStage: SuggestionStage = {
  name: 'common-fixes',
  
  transform(error, context) {
    const suggestions: Suggestion[] = [];
    
    // Pattern-specific fixes
    if (error.code === 'TREADLE_NO_PURPOSE') {
      const hasMatches = context.some(f => 
        f.data?.definition?.matches?.length > 0
      );
      
      if (!hasMatches) {
        suggestions.push({
          title: 'Make it a tieup treadle',
          description: 'Add matches to connect this to spiral patterns',
          codeFix: {
            snippet: `matches: [{ current: 'MySpiraler', previous: 'Core' }]`,
            target: 'treadle'
          },
          confidence: 0.7,
          reasoning: 'No matches defined, likely needs tieup'
        });
      }
    }
    
    return suggestions;
  }
};
```

---

## Integration with spire-loom

### 1. Context Capture in Key Points

```typescript
// In machinery/treadle-kit/declarative.ts
import { contextWeave } from '@o19/ferroring';

export function defineTreadle(definition: TreadleDefinition): TreadleDefinition {
  return contextWeave.withFrame({
    phase: 'definition',
    operation: 'defineTreadle',
    name: definition.name,
    data: { definition, file: getCurrentFile() }
  }, () => {
    // Validate...
    if (!hasPurpose(definition)) {
      throw new Ferror('TREADLE_NO_PURPOSE', { definition });
    }
    return definition;
  });
}

// In machinery/shuttle/hookups/index.ts
export async function runHookups(
  hookups: HookupSpec[],
  context: GeneratorContext
): Promise<HookupResult[]> {
  return contextWeave.withFrame({
    phase: 'hookup',
    operation: 'runHookups',
    data: { hookupCount: hookups.length }
  }, async () => {
    // Run hookups...
  });
}
```

### 2. Global Error Handler

```typescript
// In machinery/index.ts
import { ferroring, TerminalRenderer } from '@o19/ferroring';

// Set up error handler
ferroring.onError((error) => {
  // Match patterns
  const pattern = ferroring.findMatchingPattern(error);
  
  if (pattern) {
    // Extract data
    const context = contextWeave.getStack();
    const data = pattern.extract(error, context);
    
    // Run suggestion pipeline
    const suggestions = ferroring.pipeline.process(data, context);
    
    // Generate explanation
    const explanation = ferroring.explain(data, suggestions, context);
    
    // Render
    const output = new TerminalRenderer().render(explanation);
    console.error(output);
    
    // Don't throw raw error - we've handled it compassionately
    return;
  }
  
  // Unknown error - wrap it
  console.error('Unexpected error:', error);
});
```

---

## Renderers

### TerminalRenderer

```typescript
class TerminalRenderer implements Renderer {
  render(exp: Explanation): string {
    const boxWidth = 60;
    const title = exp.title;
    const padding = ' '.repeat(Math.max(0, (boxWidth - title.length - 2) / 2));
    
    return [
      '',
      chalk.red('╔' + '═'.repeat(boxWidth) + '╗'),
      chalk.red('║') + padding + chalk.bold(title) + padding + chalk.red('║'),
      chalk.red('╚' + '═'.repeat(boxWidth) + '╝'),
      '',
      `  ${chalk.red('✗')} ${exp.message}`,
      '',
      this.renderContext(exp.context),
      this.renderSuggestions(exp.suggestions),
      exp.docs ? this.renderDocs(exp.docs) : '',
      ''
    ].filter(Boolean).join('\n');
  }
  
  private renderSuggestions(suggestions: Suggestion[]): string {
    if (!suggestions.length) return '';
    
    return [
      '',
      chalk.yellow('  💡 Suggestions:'),
      '',
      ...suggestions.map((s, i) => [
        `  ${i + 1}. ${chalk.bold(s.title)} ${chalk.dim(`(${Math.round(s.confidence * 100)}%)`)}`,
        `     ${s.description}`,
        s.codeFix ? this.renderCodeFix(s.codeFix) : '',
        s.reasoning ? chalk.dim(`     Why: ${s.reasoning}`) : '',
        ''
      ].join('\n'))
    ].join('\n');
  }
}
```

### MUDRenderer

```typescript
class MUDRenderer implements Renderer {
  render(exp: Explanation): string {
    const narratives: Record<string, string> = {
      'TREADLE_NO_PURPOSE': 
        'The treadle hangs limp, disconnected from the warp.\n' +
        'It yearns for purpose—be it generation, wiring, or patching.',
      'HOOKUP_FILE_NOT_FOUND':
        'You reach for the anchoring point, but your hand passes through empty air.\n' +
        `The scroll "${exp.context.hookupPath}" exists only in imagination.`
    };
    
    return [
      '',
      chalk.red('The Loom Grows Restless...'),
      '',
      narratives[exp.code] || exp.message,
      '',
      ...exp.suggestions.map((s, i) => 
        `${i + 1}. ${s.title} - ${s.description}`
      ),
      '',
      chalk.dim('Type LOOK to examine, FIX to attempt repair.'),
      ''
    ].join('\n');
  }
}
```

---

## Success Criteria

- [ ] `ContextWeave` with AsyncLocalStorage
- [ ] `ErrorPattern` matching system
- [ ] `SuggestionPipeline` with stages
- [ ] `ExplanationTreadle` for final output
- [ ] `TerminalRenderer` for CLI
- [ ] `MUDRenderer` for narrative mode
- [ ] Complete error taxonomy for spire-loom
- [ ] Integration at all error points
- [ ] Tests for all error scenarios
- [ ] Documentation with examples

---

## Key Design Decisions

### 1. Depends on spire-loom (not the other way around)

Ferroring **imports** loom machinery for pattern matching and pipelines. The loom doesn't know about ferroring until we wire it in.

### 2. ContextWeave is the single source of truth

All context flows through one AsyncLocalStorage. No scattered context passing.

### 3. Patterns are composable

Like spiral patterns, error patterns can be combined: `PatternA.and(PatternB).or(PatternC)`

### 4. Suggestions are ranked, not single

Multiple suggestions with confidence. User chooses or we pick highest.

### 5. Renderers are pluggable

Output is completely separate from error logic. Easy to add new UIs.

---

## The ErrorChart — WARP for Errors 🗺️

Just as **WARP.ts** defines how code weaves through spiral patterns, **ERRORCHART.ts** defines how errors flow through explanation paths.

### Why an ErrorChart?

| WARP.ts | ERRORCHART.ts |
|---------|---------------|
| Defines code generation patterns | Defines error explanation patterns |
| Spiral rings as contexts | Error phases as contexts |
| Treadles generate code | ExplanationTreadles generate messages |
| Matrix matches (current, previous) | Pattern matches (error, context) |
| Composable via imports | Composable via imports |

### ErrorChart Structure

```typescript
// ERRORCHART.ts — like WARP.ts but for the error space
import { defineErrorChart } from '@o19/ferroring';

export default defineErrorChart({
  name: 'spire-loom-errors',
  
  // ==========================================================================
  // 1. Error Patterns (like SpiralRings)
  // ==========================================================================
  // Define what errors can occur and how they're recognized
  
  patterns: {
    // Phase: definition
    treadle: {
      NoPurpose: {
        code: 'TREADLE_NO_PURPOSE',
        match: (error, ctx) => /* ... */,
        extract: (error, ctx) => ({
          title: 'Treadle Has No Purpose',
          message: 'Your treadle has nothing to do!',
          severity: 'error',
        }),
      },
      MethodsWithoutOutputs: {
        code: 'TREADLE_METHODS_NO_OUTPUTS',
        match: (error, ctx) => /* ... */,
        extract: (error, ctx) => ({
          title: 'Methods Without Outputs',
          message: 'You defined methods but no outputs to generate from them.',
          severity: 'warning',
        }),
      },
      NoMatches: {
        code: 'TREADLE_NO_MATCHES',
        match: (error, ctx) => /* ... */,
      },
    },
    
    // Phase: hookup
    hookup: {
      FileNotFound: {
        code: 'HOOKUP_FILE_NOT_FOUND',
        match: (error, ctx) => error.message.includes('File not found'),
      },
      TypeMismatch: {
        code: 'HOOKUP_TYPE_MISMATCH',
        match: (error, ctx) => /* ... */,
      },
      AlreadyExists: {
        code: 'HOOKUP_ALREADY_EXISTS',
        match: (error, ctx) => /* ... */,
        severity: 'info', // Not an error, just info
      },
    },
    
    // Phase: weave
    weave: {
      CycleDetected: {
        code: 'WEAVE_CYCLE_DETECTED',
        match: (error, ctx) => /* ... */,
      },
      TemplateError: {
        code: 'WEAVE_TEMPLATE_ERROR',
        match: (error, ctx) => error instanceof EJSError,
      },
    },
  },
  
  // ==========================================================================
  // 2. Suggestion Pipelines (like Treadles)
  // ==========================================================================
  // Define how to transform errors into suggestions
  
  pipelines: {
    // Intent inference - always runs first
    intent: [
      inferFromContext,
      inferFromPartialDefinition,
    ],
    
    // Pattern-specific suggestions
    treadle: [
      suggestAddOutputs,
      suggestAddMethods,
      suggestAddHookups,
      suggestMakeTieup,
    ],
    
    hookup: [
      suggestCreateFile,
      suggestCheckPath,
      suggestUseAbsolutePath,
    ],
    
    weave: [
      suggestCheckDependencies,
      suggestBreakCycle,
    ],
    
    // Generic suggestions - always run last
    common: [
      suggestReadDocs,
      suggestReportBug,
    ],
  },
  
  // ==========================================================================
  // 3. Error Relations (like Spiral Dependencies)
  // ==========================================================================
  // When error A occurs, also check for related errors B, C
  // This creates "explanation clusters"
  
  relations: {
    // If TREADLE_NO_PURPOSE, also check for:
    'TREADLE_NO_PURPOSE': ['TREADLE_NO_MATCHES', 'TREADLE_EMPTY_HOOKUPS'],
    
    // If HOOKUP_FILE_NOT_FOUND, also check for:
    'HOOKUP_FILE_NOT_FOUND': ['HOOKUP_PATH_TYPOS', 'HOOKUP_WRONG_CWD'],
    
    // If WEAVE_CYCLE_DETECTED, the whole cycle is related:
    'WEAVE_CYCLE_DETECTED': {
      expand: 'cycle', // Special: expand to show full cycle
    },
  },
  
  // ==========================================================================
  // 4. Explanation Flows (like Generation Phases)
  // ==========================================================================
  // Define how errors flow through explanation stages
  
  flows: {
    // Default flow for all errors
    default: {
      stages: ['detect', 'contextualize', 'suggest', 'explain'],
      render: 'terminal',
    },
    
    // Interactive flow - asks user questions
    interactive: {
      stages: ['detect', 'contextualize', 'suggest', 'prompt', 'explain'],
      render: 'interactive',
    },
    
    // MUD flow - narrative mode
    mud: {
      stages: ['detect', 'narrate', 'suggest', 'explain'],
      render: 'mud',
    },
  },
  
  // ==========================================================================
  // 5. Render Configuration
  // ==========================================================================
  
  render: {
    terminal: {
      width: 60,
      colors: true,
      icons: true,
    },
    mud: {
      narrativeStyle: 'loom',
      promptStyle: 'mystical',
    },
    lsp: {
      severityMapping: {
        error: 1,    // Error
        warning: 2,  // Warning
        info: 3,     // Info
        hint: 4,     // Hint
      },
    },
  },
  
  // ==========================================================================
  // 6. Import/Extend Other ErrorCharts
  // ==========================================================================
  // Like WARP can import other WARPs, ErrorCharts compose
  
  imports: [
    // Import base ferroring patterns
    '@o19/ferroring/charts/base',
    
    // Import language-specific patterns
    '@o19/ferroring/charts/rust',
    '@o19/ferroring/charts/typescript',
    
    // Import project-specific overrides
    './custom-errors.ts',
  ],
});
```

### ErrorChart in Action

```typescript
// Using the ErrorChart
import errorChart from './ERRORCHART.js';
import { createErrorWeaver } from '@o19/ferroring';

const errorWeaver = createErrorWeaver(errorChart);

// When an error occurs:
try {
  defineTreadle({ /* empty */ });
} catch (error) {
  // The weaver:
  // 1. Matches error against patterns in ERRORCHART
  // 2. Runs suggestion pipelines
  // 3. Checks related errors
  // 4. Generates explanation via the configured flow
  // 5. Renders to terminal
  
  const explanation = errorWeaver.weave(error);
  console.log(explanation.render('terminal'));
}
```

### Visualizing the Error Space

With an ErrorChart, we can visualize the "error graph":

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SPACE GRAPH                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      relates to      ┌──────────────┐    │
│  │ TREADLE_NO_  │─────────────────────▶│ TREADLE_NO_  │    │
│  │ PURPOSE      │                      │ MATCHES      │    │
│  └──────┬───────┘                      └──────────────┘    │
│         │                                                   │
│         │ suggests                                          │
│         ▼                                                   │
│  ┌──────────────┐      relates to      ┌──────────────┐    │
│  │ Add outputs  │─────────────────────▶│ Add hookups  │    │
│  └──────────────┘                      └──────────────┘    │
│                                                             │
│  ┌──────────────┐      relates to      ┌──────────────┐    │
│  │ HOOKUP_FILE_ │─────────────────────▶│ Check path   │    │
│  │ NOT_FOUND    │                      └──────────────┘    │
│  └──────────────┘                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Composing ErrorCharts

```typescript
// custom-errors.ts - project-specific errors
import { defineErrorChart } from '@o19/ferroring';

export default defineErrorChart({
  // Extend base patterns
  extends: '@o19/ferroring/charts/spire-loom',
  
  // Add project-specific patterns
  patterns: {
    myProject: {
      CustomValidationError: {
        code: 'MYPROJECT_VALIDATION',
        match: (error, ctx) => /* ... */,
      },
    },
  },
  
  // Override base suggestions
  pipelines: {
    // Add to existing 'treadle' pipeline
    treadle: [
      // Base suggestions run first, then:
      suggestMyProjectPattern,
    ],
  },
});
```

### ErrorChart vs WARP.ts — The Parallels

| Aspect | WARP.ts | ERRORCHART.ts |
|--------|---------|---------------|
| **Defines** | Code generation space | Error explanation space |
| **Units** | Spirals, Layers | Error patterns, phases |
| **Transforms** | Treadles (code gen) | Pipelines (suggestion gen) |
| **Matches** | Matrix (current, previous) | Patterns (error, context) |
| **Flows** | Weaving phases | Explanation stages |
| **Composes** | Imports other WARPs | Imports other charts |
| **Visualizes** | Dependency graph | Error relation graph |

### Benefits

1. **Declarative** — Error handling as configuration, not code
2. **Composable** — Import and extend charts
3. **Visualizable** — Generate error space diagrams
4. **Testable** — Test error patterns like testing treadles
5. **Localizable** — Swap charts for different languages
6. **Evolvable** — Version and migrate error patterns

---

> *"The warp holds the threads. The error-chart holds the explanations. Both guide the weaver."*  
> *— Ferris the Cartographer 🦀🗺️*

---

**Next Actions**:
1. Create `o19/packages/ferroring` with core types
2. Implement `defineErrorChart()` and `createErrorWeaver()`
3. Create `ERRORCHART.ts` for spire-loom
4. Generate first error space visualization
