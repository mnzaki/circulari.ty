/**
 * Divination Provider 🌀
 * 
 * mejs-integrated round-based rendering.
 * 
 * "The template fills itself."
 */

import { mejs } from '../../../../o19/packages/spire-loom/machinery/bobbin/mejs.js';

// ============================================================================
// Deferred Value Interface
// ============================================================================

export interface DeferredValue {
  readonly _deferred: true;
  readonly path: string;
  value?: any;
  resolved: boolean;
  toString(): string;
}

// ============================================================================
// Divination Provider
// ============================================================================

export interface DivinationProviderOptions {
  maxPasses?: number;
  placeholderPattern?: RegExp;
}

export interface RenderResult {
  output: string;
  passes: number;
  resolved: Map<string, any>;
}

export class DivinationProvider {
  private maxPasses: number;
  private placeholderPattern: RegExp;
  
  constructor(options: DivinationProviderOptions = {}) {
    this.maxPasses = options.maxPasses ?? 10;
    this.placeholderPattern = options.placeholderPattern ?? /\{\{\s*([^}]+)\s*\}\}/g;
  }
  
  /**
   * Render a template with deferred values.
   * 
   * Uses mejs re-rendering to progressively resolve placeholders.
   */
  async render(
    template: string,
    context: Record<string, any>
  ): Promise<RenderResult> {
    let currentTemplate = template;
    const resolved = new Map<string, any>();
    let pass = 0;
    
    // Deep clone context to avoid mutations
    let currentContext = this.deepClone(context);
    
    while (pass < this.maxPasses) {
      pass++;
      
      // Phase 1: Render template with current context
      // Deferred values render as {{ path }} placeholders
      const output = this.renderTemplate(currentTemplate, currentContext);
      
      // Phase 2: Extract placeholders from output
      const placeholders = this.extractPlaceholders(output);
      
      if (placeholders.length === 0) {
        // No placeholders - we're done!
        return {
          output,
          passes: pass,
          resolved
        };
      }
      
      // Phase 3: Identify which placeholders can be resolved this round
      const resolvable = placeholders.filter(ph => this.canResolve(ph, currentContext));
      
      if (resolvable.length === 0) {
        throw new Error(
          `No progress at pass ${pass}. ` +
          `Unresolved: ${placeholders.map(p => p.path).join(', ')}`
        );
      }
      
      // Phase 4: Resolve placeholders
      for (const ph of resolvable) {
        const value = await this.resolvePlaceholder(ph, currentContext);
        resolved.set(ph.path, value);
        this.setPath(currentContext, ph.path, value);
      }
      
      // Phase 5: Replace placeholders in output for next pass
      // This is the key: output becomes template for next round
      currentTemplate = this.replacePlaceholders(output, resolved);
    }
    
    throw new Error(`Max passes (${this.maxPasses}) reached`);
  }
  
  /**
   * Render with round-by-round visibility.
   */
  async *renderStream(
    template: string,
    context: Record<string, any>
  ): AsyncGenerator<{
    pass: number;
    output: string;
    placeholders: string[];
    resolvedThisRound: string[];
  }> {
    let currentTemplate = template;
    const resolved = new Map<string, any>();
    let pass = 0;
    let currentContext = this.deepClone(context);
    
    while (pass < this.maxPasses) {
      pass++;
      
      const output = this.renderTemplate(currentTemplate, currentContext);
      const placeholders = this.extractPlaceholders(output);
      
      yield {
        pass,
        output,
        placeholders: placeholders.map(p => p.path),
        resolvedThisRound: Array.from(resolved.keys())
      };
      
      if (placeholders.length === 0) break;
      
      const resolvable = placeholders.filter(ph => this.canResolve(ph, currentContext));
      
      if (resolvable.length === 0) {
        throw new Error(`No progress at pass ${pass}`);
      }
      
      for (const ph of resolvable) {
        const value = await this.resolvePlaceholder(ph, currentContext);
        resolved.set(ph.path, value);
        this.setPath(currentContext, ph.path, value);
      }
      
      currentTemplate = this.replacePlaceholders(output, resolved);
    }
  }
  
  // ========================================================================
  // Private Helpers
  // ========================================================================
  
  private renderTemplate(template: string, context: any): string {
    try {
      return mejs.renderTemplate(template, context);
    } catch (err) {
      // If rendering fails, it might be because we tried to access
      // an unresolved deferred value. Return template as-is.
      if (err instanceof Error && err.message.includes('undefined')) {
        return template;
      }
      throw err;
    }
  }
  
  private extractPlaceholders(output: string): Array<{ path: string; full: string }> {
    const matches = [...output.matchAll(this.placeholderPattern)];
    return matches.map(m => ({
      path: m[1].trim(),
      full: m[0]
    }));
  }
  
  private canResolve(
    ph: { path: string },
    context: any
  ): boolean {
    // Check if this path has a _binding function or is already resolved
    const value = this.getPath(context, ph.path);
    
    if (value === undefined) return false;
    
    // Already resolved
    if (value && value._deferred && value.resolved) return true;
    if (!value || !value._deferred) return true; // Plain value
    
    // Has binding that can be called
    if (value._binding) return true;
    
    // Check if deps are resolved (for complex deferred)
    return false;
  }
  
  private async resolvePlaceholder(
    ph: { path: string },
    context: any
  ): Promise<any> {
    const value = this.getPath(context, ph.path);
    
    if (!value || !value._deferred) {
      return value;
    }
    
    if (value.resolved) {
      return value.value;
    }
    
    if (value._binding) {
      const resolved = await value._binding();
      value.value = resolved;
      value.resolved = true;
      return resolved;
    }
    
    throw new Error(`Cannot resolve ${ph.path}: no binding`);
  }
  
  private replacePlaceholders(
    output: string,
    resolved: Map<string, any>
  ): string {
    let result = output;
    
    for (const [path, value] of resolved) {
      const regex = new RegExp(
        `\\{\\{\\s*${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`,
        'g'
      );
      result = result.replace(regex, this.formatForTemplate(value));
    }
    
    return result;
  }
  
  private formatForTemplate(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
      return value.map(v => this.formatForTemplate(v)).join(', ');
    }
    if (typeof value === 'object') {
      // For objects in templates, just return as-is for mejs to handle
      return JSON.stringify(value);
    }
    return String(value);
  }
  
  private getPath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }
  
  private setPath(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj._deferred) return obj; // Keep deferred references
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
    
    const cloned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cloned[key] = this.deepClone(value);
    }
    return cloned;
  }
}

// ============================================================================
// Factory
// ============================================================================

export function createDivinationProvider(
  options?: DivinationProviderOptions
): DivinationProvider {
  return new DivinationProvider(options);
}
