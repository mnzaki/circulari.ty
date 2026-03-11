/**
 * Divination Engine Prototype 🌀
 * 
 * A working demonstration of round-based lazy computation
 * integrated with mejs templates.
 * 
 * Export all modules for use within BAArn.
 */

// Core engine
export {
  createDivination,
  source,
  transform,
  quotable,
  DivinationSolver,
  type Stub,
  type SourceStub,
  type Transform,
  type QuotableStub,
  type Divination,
  type RoundResult
} from './divination-engine.js';

// mejs integration
export {
  renderWithDivination,
  createQuotableContext,
  type TemplateDivinationContext,
  type RenderWithDivinationOptions,
  type RenderPassResult
} from './mejs-integration.js';

// Examples
export {
  createImportsDivination,
  createNestedDivination,
  demoImportsDivination,
  type Method,
  type Type,
  type Parameter,
  type ImportEntry
} from './example-imports-diviner.js';

/**
 * Quick start example:
 * 
 * ```typescript
 * import { createDivination, source, transform, quotable } from './index.js';
 * 
 * const divination = createDivination(({ source, transform, quotable }) => {
 *   // Round 1: Collect data
 *   const user = source('user', [], () => fetchUser());
 *   
 *   // Round 2: Transform
 *   const greeting = transform([user], u => `Hello ${u.name}`);
 *   
 *   // Make quotable for templates
 *   return quotable(greeting, 1);
 * });
 * 
 * // Resolve
 * const result = await divination.resolve();
 * 
 * // Or use in template
 * const output = await renderWithDivination({
 *   template: '{{ message }}',
 *   context: { message: divination.root }
 * });
 * ```
 */
