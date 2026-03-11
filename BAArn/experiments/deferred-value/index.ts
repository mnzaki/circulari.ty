/**
 * DeferredValue 🌀
 *
 * A promise-like container for multi-pass computation with lazy query API.
 *
 * "The value that will be, queried as if it already is."
 *
 * @example
 * ```typescript
 * import { defer, deferCollection } from '@baa/deferred-value';
 *
 * // Create a deferred collection
 * const imports = deferCollection<Import>({
 *   stub: '// {{ IMPORTS }}',
 *   collect: (existing, pass) => {
 *     if (pass === 1) {
 *       return { items: collectImports(), done: false };
 *     }
 *     return { items: deduplicate(existing), done: true };
 *   }
 * });
 *
 * // Phase 1: Use stub in templates
 * console.log(imports.value);  // '// {{ IMPORTS }}'
 *
 * // Phase 2: Compute actual value
 * imports.runToCompletion();
 * console.log(imports.query.all);  // Actual imports
 * ```
 */

export {
  // Core classes
  DeferredValue,
  DeferredQuery,
  
  // Factory functions
  defer,
  deferCollection,
  deferTransform,
  
  // Types
  type ComputationResult,
  type DeferredValueConfig,
  type Predicate,
  type Transform
} from './deferred-value.js';
