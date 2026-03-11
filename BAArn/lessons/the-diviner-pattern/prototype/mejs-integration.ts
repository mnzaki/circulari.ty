/**
 * mejs Integration for Divination Engine 🧵
 * 
 * Bridges the round-based solver with template rendering.
 * 
 * The key trick: Templates render with quotable stubs, producing
 * output that may contain {{ __diviner_resolve_* }} placeholders.
 * These placeholders trigger additional solver rounds.
 */

import { mejs } from '../../../../spire-loom/machinery/bobbin/mejs.js';
import { DivinationSolver, Stub, QuotableStub, createDivination } from './divination-engine.js';

export interface TemplateDivinationContext {
  [key: string]: any;
}

export interface RenderWithDivinationOptions {
  template: string;
  context: TemplateDivinationContext;
  maxPasses?: number;
}

export interface RenderPassResult {
  pass: number;
  output: string;
  resolvedPlaceholders: Map<string, any>;
  hasUnresolved: boolean;
}

/**
 * Render a template with divination-based quoting.
 * 
 * Phase 1: Template renders with quotable stubs → contains {{...}} placeholders
 * Phase 2: Solver resolves stubs → placeholders replaced with actual values
 * Phase N: Repeat until no placeholders remain or maxPasses reached
 */
export async function renderWithDivination(
  options: RenderWithDivinationOptions
): Promise<string> {
  const { template, context, maxPasses = 5 } = options;
  
  let currentTemplate = template;
  let passResults: RenderPassResult[] = [];

  for (let pass = 1; pass <= maxPasses; pass++) {
    // Collect all quotable stubs from context
    const quotables = collectQuotables(context);
    
    // Render template
    let output: string;
    try {
      output = mejs.renderTemplate(currentTemplate, {
        ...context,
        // Expose quotable stubs which render as {{...}} placeholders
        ...Object.fromEntries(
          quotables.map(q => [extractKey(context, q), q])
        )
      });
    } catch (err) {
      throw new Error(`Template render failed at pass ${pass}: ${err}`);
    }

    // Find unresolved placeholders
    const placeholderPattern = /\{\{\s*__diviner_resolve_(\w+)\s*\}\}/g;
    const matches = [...output.matchAll(placeholderPattern)];
    
    if (matches.length === 0) {
      // No placeholders - we're done!
      passResults.push({
        pass,
        output,
        resolvedPlaceholders: new Map(),
        hasUnresolved: false
      });
      return output;
    }

    // Create stubs map for solver
    const quotableIds = matches.map(m => m[1]);
    const stubsToResolve = new Map<string, Stub<any>>();
    const quotableToInner = new Map<string, string>(); // quotableId -> innerId
    
    for (const quotable of quotables) {
      if (quotableIds.includes(quotable.id)) {
        // Map quotable ID to inner stub ID for lookup later
        quotableToInner.set(quotable.id, quotable.inner.id);
        // Store inner stub under its own ID
        stubsToResolve.set(quotable.inner.id, quotable.inner);
        // Also collect nested stubs
        collectAllStubs(quotable.inner, stubsToResolve);
      }
    }

    // Run solver to resolve stubs
    const solver = new DivinationSolver(stubsToResolve);
    const innerIdToValue = new Map<string, any>();
    
    for await (const result of solver.solve()) {
      // Collect resolved values by inner stub ID
      for (const [id, value] of result.materialized) {
        innerIdToValue.set(id, value);
      }
    }
    
    // Map quotable IDs to resolved values
    const resolvedPlaceholders = new Map<string, any>();
    for (const [quotableId, innerId] of quotableToInner) {
      if (innerIdToValue.has(innerId)) {
        resolvedPlaceholders.set(quotableId, innerIdToValue.get(innerId));
      }
    }

    // Replace placeholders in template for next pass
    let nextTemplate = output;
    for (const [quotableId, value] of resolvedPlaceholders) {
      const regex = new RegExp(`\\{\\{\\s*__diviner_resolve_${quotableId}\\s*\\}\\}`, 'g');
      nextTemplate = nextTemplate.replace(regex, String(value));
    }

    passResults.push({
      pass,
      output,
      resolvedPlaceholders,
      hasUnresolved: matches.length > resolvedPlaceholders.size
    });

    currentTemplate = nextTemplate;

    // Check if we made progress
    if (resolvedPlaceholders.size === 0) {
      throw new Error(
        `No progress at pass ${pass}. ` +
        `Unresolved placeholders: ${matches.map(m => m[0]).join(', ')}`
      );
    }
  }

  // Max passes reached
  throw new Error(
    `Max passes (${maxPasses}) reached. ` +
    `Last output: ${passResults[passResults.length - 1]?.output}`
  );
}

/**
 * Create a divination context where values are automatically quotable.
 */
export function createQuotableContext<T extends Record<string, any>>(
  values: T
): { [K in keyof T]: T[K] | QuotableStub<T[K]> } {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (value && typeof value === 'object' && value._tag === 'quotable') {
        // Already a quotable stub - use as-is
        return [key, value];
      }
      if (isStub(value)) {
        // A stub but not quotable - wrap it
        return [key, wrapQuotable(value)];
      }
      // Plain value - pass through
      return [key, value];
    })
  ) as any;
}

// ============================================================================
// Helpers
// ============================================================================

function collectQuotables(context: any): QuotableStub<any>[] {
  const quotables: QuotableStub<any>[] = [];
  
  function scan(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj._tag === 'quotable') {
      quotables.push(obj);
      return;
    }
    
    if (Array.isArray(obj)) {
      obj.forEach(scan);
    } else {
      Object.values(obj).forEach(scan);
    }
  }
  
  scan(context);
  return quotables;
}

function extractKey(context: any, quotable: QuotableStub<any>): string {
  // Find the key in context that references this quotable
  for (const [key, value] of Object.entries(context)) {
    if (value === quotable) return key;
    if (typeof value === 'object' && value !== null) {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (nestedValue === quotable) return `${key}.${nestedKey}`;
      }
    }
  }
  return quotable.id;
}

function isStub(value: any): boolean {
  return value && typeof value === 'object' && '_tag' in value;
}

function wrapQuotable<T>(stub: Stub<T>): QuotableStub<T> {
  return {
    _tag: 'quotable',
    id: `context_${stub.id}`,
    inner: stub,
    quoteDepth: 1,
    toString() {
      if (this.quoteDepth > 0) {
        return `{{ __diviner_resolve_${this.inner.id} }}`;
      }
      // Would need access to resolved value
      return `[${this.inner.id}]`;
    },
    expand() {
      throw new Error('Cannot expand without solver');
    }
  };
}

function collectAllStubs(stub: Stub<any>, into: Map<string, Stub<any>>) {
  if (into.has(stub.id)) return;
  into.set(stub.id, stub);

  switch (stub._tag) {
    case 'source':
      stub.params.forEach(p => collectAllStubs(p, into));
      break;
    case 'transform':
      stub.deps.forEach((d: Stub<any>) => collectAllStubs(d, into));
      break;
    case 'quotable':
      collectAllStubs(stub.inner, into);
      break;
  }
}
