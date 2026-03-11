/**
 * Divination Provider 🌀
 * 
 * Manages multiple Divinations and resolves them optimally.
 * 
 * Discovers the optimal resolution order based on dependencies,
 * then executes rounds across all divinations in parallel where possible.
 */

import { Divination, DivinationRound } from './divination.js';
import type { ScrimManagement } from '../heddles/validator.js';

// ============================================================================
// Types
// ============================================================================

export interface ResolutionBatch {
  round: number;
  resolved: Divination<any>[];
  pending: Divination<any>[];
  errors: Map<string, Error>;
}

export interface ProviderConfig {
  /** Maximum rounds before giving up */
  maxRounds?: number;
  
  /** Whether to continue on individual divination errors */
  continueOnError?: boolean;
  
  /** Callback for round completion */
  onRoundComplete?: (batch: ResolutionBatch) => void;
}

// ============================================================================
// Divination Provider
// ============================================================================

export class DivinationProvider {
  private config: Required<ProviderConfig>;
  
  constructor(config: ProviderConfig = {}) {
    this.config = {
      maxRounds: config.maxRounds ?? 10,
      continueOnError: config.continueOnError ?? false,
      onRoundComplete: config.onRoundComplete ?? (() => {})
    };
  }
  
  /**
   * Resolve all divinations, yielding progress after each round.
   * 
   * Discovers optimal resolution order based on dependencies,
   * executes independent divinations in parallel.
   */
  async *resolveAll(
    divinations: Divination<any>[]
  ): AsyncGenerator<ResolutionBatch> {
    const pending = new Set(divinations);
    const resolved = new Map<string, Divination<any>>();
    const errors = new Map<string, Error>();
    let round = 0;
    
    while (pending.size > 0 && round < this.config.maxRounds) {
      round++;
      
      // Find divinations that can resolve this round
      // (those with no unresolved dependencies)
      const ready = Array.from(pending).filter(d => 
        this.canResolve(d, resolved)
      );
      
      if (ready.length === 0) {
        throw new Error(
          `Resolution deadlock at round ${round}. ` +
          `${pending.size} divinations pending with unresolved dependencies.`
        );
      }
      
      // Resolve all ready divinations in parallel
      const results = await Promise.allSettled(
        ready.map(d => d.resolve())
      );
      
      // Process results
      results.forEach((result, index) => {
        const divination = ready[index];
        
        if (result.status === 'fulfilled') {
          pending.delete(divination);
          resolved.set(divination.id, divination);
        } else {
          errors.set(divination.id, result.reason as Error);
          
          if (!this.config.continueOnError) {
            throw new Error(
              `Divination ${divination.id} failed: ${result.reason}`
            );
          }
          
          // Remove from pending so we don't retry
          pending.delete(divination);
        }
      });
      
      const batch: ResolutionBatch = {
        round,
        resolved: Array.from(resolved.values()),
        pending: Array.from(pending),
        errors: new Map(errors)
      };
      
      this.config.onRoundComplete(batch);
      yield batch;
    }
    
    if (pending.size > 0) {
      throw new Error(
        `Max rounds (${this.config.maxRounds}) reached. ` +
        `${pending.size} divinations still pending.`
      );
    }
  }
  
  /**
   * Resolve all divinations and return final values.
   */
  async resolveAllToValues<T>(
    divinations: Divination<T>[]
  ): Promise<{ 
    values: T[]; 
    rounds: number;
    errors: Map<string, Error>;
  }> {
    const values: T[] = [];
    let finalRound = 0;
    let finalErrors = new Map<string, Error>();
    
    for await (const batch of this.resolveAll(divinations)) {
      finalRound = batch.round;
      finalErrors = batch.errors;
    }
    
    // Collect resolved values
    for (const div of divinations) {
      if (div.resolved) {
        values.push(div.value);
      }
    }
    
    return { values, rounds: finalRound, errors: finalErrors };
  }
  
  /**
   * Check if a divination can be resolved given current resolved set.
   */
  private canResolve(
    divination: Divination<any>,
    resolved: Map<string, Divination<any>>
  ): boolean {
    // For now, all divinations are independent
    // Future: check divination._shape.deps against resolved
    return true;
  }
  
  /**
   * Create divinations for all managements in a WARP module.
   */
  createDivinationsFromWarp(
    warp: any,  // WARP type from spire-loom
    options: { 
      createDivination: (mgmt: ScrimManagement) => Divination<any>;
    }
  ): Divination<any>[] {
    const managements = this.extractManagements(warp);
    return managements.map(options.createDivination);
  }
  
  /**
   * Extract ScrimManagement objects from a WARP.
   */
  private extractManagements(warp: any): ScrimManagement[] {
    const managements: ScrimManagement[] = [];
    
    // Iterate through WARP exports looking for Management instances
    for (const [key, value] of Object.entries(warp)) {
      if (this.isManagementLike(value)) {
        managements.push({
          name: key,
          layer: (value as any).layer || 'unknown',
          domain: (value as any).domain || 'unknown',
          link: (value as any).link,
          methods: (value as any).methods || []
        });
      }
    }
    
    return managements;
  }
  
  /**
   * Check if a value looks like a Management.
   */
  private isManagementLike(value: any): boolean {
    return value && 
           typeof value === 'object' &&
           (value.methods || value.layer || value.domain);
  }
}

// ============================================================================
// Factory
// ============================================================================

export function createDivinationProvider(
  config?: ProviderConfig
): DivinationProvider {
  return new DivinationProvider(config);
}
