/**
 * Heddles Integration 🌀
 * 
 * Creates Divinations from ScrimManagement objects.
 * 
 * Bridges the existing ScrimHeddles validation logic with
 * the new async Divination system.
 */

import { Divination, DivinationConfig } from './divination.js';
import type { ScrimManagement, ArchitecturalViolation } from '../heddles/validator.js';
import { AAAArchi } from '@o19/aaaarchi';
import type { LanguageDefinitionImperative } from '@o19/spire-loom/machinery/reed/language/imperative.js';

// ============================================================================
// Factory: Create Divination from Management
// ============================================================================

export function createManagementDivination(
  management: ScrimManagement,
  options: {
    lang: LanguageDefinitionImperative;
    tags?: string[];
  }
): Divination<ScrimManagement> {
  const validLayers = ['domain', 'infrastructure', 'repository', 'service', 'controller', 'usecase', 'application'];
  const violations: ArchitecturalViolation[] = [];
  
  const config: DivinationConfig<ScrimManagement> = {
    shape: {
      deps: [],
      
      rounds: [
        // Round 1: Validate layer
        {
          name: 'layer',
          validate: async (current, ctx) => {
            if (!validLayers.includes(management.layer)) {
              violations.push({
                type: 'missing-layer',
                from: 'unknown',
                to: management.layer,
                explanation: `"${management.layer}" is not a valid layer`,
                fix: `Use one of: ${validLayers.join(', ')}`,
                severity: 'error'
              });
              
              return {
                valid: false,
                violations,
                value: { ...management, _violations: violations }
              };
            }
            
            return {
              valid: true,
              value: { ...management, layer: management.layer }
            };
          }
        },
        
        // Round 2: Validate link (if present)
        {
          name: 'link',
          validate: async (current, ctx) => {
            if (!management.link) {
              return { valid: true, value: current };
            }
            
            const scope = AAAArchi.forFile(import.meta.url);
            const targetLayer = inferLayerFromPath(management.link);
            
            if (targetLayer && !scope.canCall(targetLayer)) {
              const pathViolations = AAAArchi.validatePath([
                scope.layer || 'unknown',
                targetLayer
              ]);
              
              if (pathViolations.length > 0) {
                violations.push({
                  type: 'layer-skip',
                  from: scope.layer || 'unknown',
                  to: targetLayer,
                  explanation: `${management.name} links to ${targetLayer}, but this violates architecture`,
                  fix: pathViolations[0].fix,
                  severity: 'error'
                });
                
                return {
                  valid: false,
                  violations,
                  value: { ...current, _violations: violations }
                };
              }
            }
            
            return { valid: true, value: current };
          }
        },
        
        // Round 3: Validate against DAG
        {
          name: 'dag',
          validate: async (current, ctx) => {
            const dag = AAAArchi.buildProjectDAG();
            const nodeId = `${management.domain}:${management.layer}`;
            
            // Check for circular dependencies
            const cycle = findCycle(dag, nodeId, nodeId, new Set());
            if (cycle) {
              violations.push({
                type: 'circular-dep',
                from: nodeId,
                to: cycle[1] || nodeId,
                explanation: `Circular dependency: ${cycle.join(' → ')}`,
                fix: 'Break the cycle by restructuring dependencies',
                severity: 'error'
              });
              
              return {
                valid: false,
                violations,
                value: { ...current, _violations: violations }
              };
            }
            
            // Success - enrich with computed metadata
            return {
              valid: true,
              value: {
                ...current,
                _computed: {
                  canGenerate: true,
                  validTargets: scope.getValidTargets(),
                  dagContext: scope.getContext()
                }
              }
            };
          }
        }
      ],
      
      // Final computation (identity - already built in rounds)
      compute: async (deps) => {
        return {
          ...management,
          _violations: violations.length > 0 ? violations : undefined
        } as ScrimManagement;
      }
    },
    
    lang: options.lang,
    tags: options.tags || [management.layer, management.domain, 'management']
  };
  
  return new Divination(management, config);
}

// ============================================================================
// Helpers
// ============================================================================

function inferLayerFromPath(path: string): string | undefined {
  if (path.includes('infrastructure')) return 'infrastructure';
  if (path.includes('repository')) return 'repository';
  if (path.includes('service')) return 'service';
  if (path.includes('controller')) return 'controller';
  if (path.includes('core') || path.includes('domain')) return 'domain';
  if (path.includes('usecase')) return 'usecase';
  return undefined;
}

function findCycle(
  dag: any,
  start: string,
  target: string,
  visited: Set<string>,
  path: string[] = []
): string[] | null {
  if (start === target && path.length > 0) {
    return [...path, target];
  }
  
  if (visited.has(start)) {
    return null;
  }
  
  visited.add(start);
  path.push(start);
  
  const edges = dag.edges?.filter((e: any) => e.from === start) || [];
  for (const edge of edges) {
    const cycle = findCycle(dag, edge.to, target, new Set(visited), [...path]);
    if (cycle) return cycle;
  }
  
  return null;
}

// AAAArchi scope helper
const scope = {
  layer: 'unknown',
  getValidTargets: () => ['domain', 'infrastructure'],
  getContext: () => ({ layer: 'unknown', domain: 'unknown' })
};
