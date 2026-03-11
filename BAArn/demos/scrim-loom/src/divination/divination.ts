/**
 * Divination 🌀
 * 
 * Async, multi-round computation for architectural validation.
 * 
 * A Divination wraps a computation that resolves over multiple rounds,
 * with each round potentially depending on previous rounds.
 * 
 * Implements Queryable for BoundQuery compatibility.
 */

import type { LanguageDefinitionImperative } from '@o19/spire-loom/machinery/reed/language/imperative.js';
import type { ScrimManagement, ArchitecturalViolation } from '../heddles/validator.js';

// ============================================================================
// Core Types
// ============================================================================

export interface DivinationRound<T> {
  round: number;
  resolved: Map<string, any>;
  complete: boolean;
  value?: T;
}

export interface DivinationConfig<T> {
  /** The shape/structure of the result */
  shape: DivinationShape<T>;
  
  /** Language for code generation context */
  lang: LanguageDefinitionImperative;
  
  /** Optional tags for BoundQuery filtering */
  tags?: string[];
}

export interface DivinationShape<T> {
  /** Dependencies this divination has (paths to other values) */
  deps: string[];
  
  /** How to compute the value given resolved deps */
  compute: (deps: Record<string, any>) => Promise<T> | T;
  
  /** Validation rounds - each round is a step in resolution */
  rounds: Array<{
    name: string;
    validate: (current: Partial<T>, ctx: ValidationContext) => Promise<ValidationResult>;
  }>;
}

export interface ValidationContext {
  /** Access resolved values from previous rounds */
  get(path: string): any;
  
  /** Current management being validated */
  management: ScrimManagement;
  
  /** AAAArchi scope for the current file */
  scope: any;
}

export interface ValidationResult {
  valid: boolean;
  violations?: ArchitecturalViolation[];
  value?: any;
}

// ============================================================================
// Divination Class
// ============================================================================

let divinationIdCounter = 0;

export class Divination<T = any> {
  readonly id: string;
  readonly lang: LanguageDefinitionImperative;
  readonly tags: string[];
  
  private _shape: DivinationShape<T>;
  private _resolved = false;
  private _value?: T;
  private _currentRound = 0;
  private _resolvedDeps = new Map<string, any>();
  private _violations: ArchitecturalViolation[] = [];
  
  constructor(
    public readonly management: ScrimManagement,
    config: DivinationConfig<T>
  ) {
    this.id = `divination_${++divinationIdCounter}`;
    this.lang = config.lang;
    this.tags = config.tags || [management.layer, management.domain];
    this._shape = config.shape;
  }
  
  // ===== Queryable Interface =====
  
  cloneWithLang(newLang: LanguageDefinitionImperative): Divination<T> {
    return new Divination(this.management, {
      shape: this._shape,
      lang: newLang,
      tags: this.tags
    });
  }
  
  // ===== Divination Interface =====
  
  get resolved(): boolean {
    return this._resolved;
  }
  
  get value(): T {
    if (!this._resolved) {
      throw new Error(`Divination ${this.id} not resolved yet. Call resolve() first.`);
    }
    return this._value!;
  }
  
  get currentRound(): number {
    return this._currentRound;
  }
  
  get violations(): ArchitecturalViolation[] {
    return this._violations;
  }
  
  /**
   * Resolve the divination over multiple rounds.
   * Each round may depend on values from previous rounds.
   */
  async resolve(): Promise<T> {
    if (this._resolved) return this._value!;
    
    for await (const round of this.watch()) {
      if (round.complete) break;
    }
    
    return this._value!;
  }
  
  /**
   * Watch the resolution progress round by round.
   */
  async *watch(): AsyncGenerator<DivinationRound<T>> {
    // Yield initial state
    yield {
      round: 0,
      resolved: new Map(this._resolvedDeps),
      complete: false
    };
    
    // Execute each validation round
    for (let i = 0; i < this._shape.rounds.length; i++) {
      this._currentRound = i + 1;
      const roundDef = this._shape.rounds[i];
      
      // Perform validation for this round
      const ctx: ValidationContext = {
        get: (path: string) => this._resolvedDeps.get(path),
        management: this.management,
        scope: { /* AAAArchi scope would go here */ }
      };
      
      const result = await roundDef.validate(
        this._value || {},
        ctx
      );
      
      // Store violations
      if (result.violations) {
        this._violations.push(...result.violations);
      }
      
      // Store resolved value
      if (result.value !== undefined) {
        this._resolvedDeps.set(roundDef.name, result.value);
        this._value = result.value as T;
      }
      
      yield {
        round: this._currentRound,
        resolved: new Map(this._resolvedDeps),
        complete: false,
        value: this._value
      };
    }
    
    // Final computation if needed
    if (this._shape.compute && !this._value) {
      const depValues: Record<string, any> = {};
      for (const [key, value] of this._resolvedDeps) {
        depValues[key] = value;
      }
      this._value = await this._shape.compute(depValues);
    }
    
    this._resolved = true;
    
    // Yield final state
    yield {
      round: this._currentRound,
      resolved: new Map(this._resolvedDeps),
      complete: true,
      value: this._value
    };
  }
  
  /**
   * For BoundQuery filtering - returns value if resolved, undefined otherwise.
   */
  getFilterValue(): T | undefined {
    return this._resolved ? this._value : undefined;
  }
  
  /**
   * For template rendering - placeholder pattern.
   */
  toString(): string {
    if (this._resolved) {
      return JSON.stringify(this._value);
    }
    return `{{ ${this.management.name} }}`;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createDivination<T>(
  management: ScrimManagement,
  config: DivinationConfig<T>
): Divination<T> {
  return new Divination(management, config);
}
