/**
 * Divination Engine v2 🌀
 * 
 * Shape-driven round discovery with mejs re-rendering.
 * 
 * "Define shape, not computation."
 */

// Core shape system
export {
  Shape,
  analyzeShape,
  discoverRounds,
  buildContext,
  resolveShape,
  type Shape,
  type ShapeNode,
  type DeferredValue,
  type ResolutionContext
} from './deferred-shape.js';

// Divination provider with mejs integration
export {
  DivinationProvider,
  createDivinationProvider,
  type DivinationProviderOptions,
  type RenderResult
} from './divination-provider.js';

// Examples
export {
  demoSimpleDeferred,
  demoMultiRound,
  demoImportsDiviner
} from './example-v2.js';

/**
 * Quick start:
 * 
 * ```typescript
 * import { createDivinationProvider } from './index-v2.js';
 * 
 * const provider = createDivinationProvider();
 * 
 * const context = {
 *   value: {
 *     _deferred: true,
 *     path: 'value',
 *     resolved: false,
 *     _binding: async () => 'Hello!',
 *     toString() {
 *       return this.resolved ? this.value : `{{ ${this.path} }}`;
 *     }
 *   }
 * };
 * 
 * const result = await provider.render('{{ value }}', context);
 * console.log(result.output); // "Hello!"
 * console.log(result.passes); // 2 (quote + resolve)
 * ```
 */
