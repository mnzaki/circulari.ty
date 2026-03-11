/**
 * Tests for Divination Engine Prototype 🧪
 */

import { describe, it, expect } from 'vitest';
import {
  createDivination,
  source,
  transform,
  quotable,
  DivinationSolver
} from './divination-engine.js';
import { renderWithDivination } from './mejs-integration.js';
import { createImportsDivination, demoImportsDivination } from './example-imports-diviner.js';

describe('Divination Engine', () => {
  describe('Basic Stub Operations', () => {
    it('should create source stubs', () => {
      const stub = source('test.source', [], () => 'value');
      expect(stub._tag).toBe('source');
      expect(stub.source).toBe('test.source');
      expect(stub.params).toHaveLength(0);
    });

    it('should create transform stubs', () => {
      const src = source('test', [], () => 5);
      const xform = transform([src], (n) => n * 2);
      expect(xform._tag).toBe('transform');
      expect(xform.deps).toHaveLength(1);
    });

    it('should create quotable stubs', () => {
      const src = source('test', [], () => 'hello');
      const q = quotable(src, 1);
      expect(q._tag).toBe('quotable');
      expect(q.quoteDepth).toBe(1);
      expect(q.toString()).toContain('__diviner_resolve_');
    });
  });

  describe('Solver', () => {
    it('should resolve simple source stubs', async () => {
      const div = createDivination(() => 
        source('simple', [], () => 'resolved!')
      );

      const result = await div.resolve();
      expect(result).toBe('resolved!');
    });

    it('should resolve transforms', async () => {
      const div = createDivination(({ source, transform }) => {
        const a = source('a', [], () => 5);
        const b = source('b', [], () => 10);
        return transform([a, b], (x, y) => x + y);
      });

      const result = await div.resolve();
      expect(result).toBe(15);
    });

    it('should resolve multi-round dependencies', async () => {
      const div = createDivination(({ source, transform }) => {
        // Round 1
        const base = source('base', [], () => 2);
        
        // Round 2: depends on base
        const doubled = transform([base], (n) => n * 2);
        
        // Round 3: depends on doubled
        const quadrupled = transform([doubled], (n) => n * 2);
        
        return quadrupled;
      });

      const rounds: number[] = [];
      for await (const round of div.watch()) {
        rounds.push(round.round);
      }

      expect(rounds).toContain(1);
      expect(rounds).toContain(2);
      expect(rounds).toContain(3);
      
      const result = await div.resolve();
      expect(result).toBe(8); // 2 -> 4 -> 8
    });

    it('should track resolution progress', async () => {
      const div = createDivination(({ source, transform }) => {
        const a = source('a', [], () => 'A');
        const b = source('b', [], () => 'B');
        return transform([a, b], (x, y) => `${x}${y}`);
      });

      const progress: number[] = [];
      for await (const round of div.watch()) {
        progress.push(round.materialized.size);
      }

      // Round 1: 2 sources resolved
      // Round 2: 1 transform resolved (total 3)
      expect(progress[0]).toBe(2); // Sources
      expect(progress[1]).toBe(3); // Sources + transform
    });
  });

  describe('mejs Integration', () => {
    it('should render simple template without stubs', async () => {
      const result = await renderWithDivination({
        template: 'Hello {{ name }}!',
        context: { name: 'World' }
      });
      expect(result).toBe('Hello World!');
    });

    it('should resolve quotable stubs in templates', async () => {
      const div = createDivination(({ source, quotable }) => {
        const val = source('test', [], () => 'divined value');
        return quotable(val, 1);
      });

      const result = await renderWithDivination({
        template: 'Value: {{ value }}',
        context: { value: div.root }
      });

      expect(result).toBe('Value: divined value');
    });

    it('should handle multiple passes', async () => {
      const div = createDivination(({ source, transform, quotable }) => {
        const a = source('a', [], () => 'Hello');
        const b = source('b', [], () => 'World');
        const combined = transform([a, b], (x, y) => `${x} ${y}`);
        return quotable(combined, 1);
      });

      const result = await renderWithDivination({
        template: '{{ greeting }}!',
        context: { greeting: div.root }
      });

      expect(result).toBe('Hello World!');
    });
  });

  describe('Imports Diviner Example', () => {
    it('should collect entity imports', async () => {
      const methods = [
        { name: 'getUser', returnType: { name: 'User', isEntity: true }, parameters: [] },
        { name: 'createPost', returnType: { name: 'Post', isEntity: true }, parameters: [] },
        { name: 'getString', returnType: { name: 'string', isEntity: false }, parameters: [] }
      ];

      const div = createImportsDivination(methods);
      const result = await div.resolve();

      // Should have imports for User and Post (not string)
      expect(result).toContain('User');
      expect(result).toContain('Post');
      expect(result).not.toContain('string');
    });

    it('should deduplicate imports', async () => {
      const methods = [
        { name: 'getUser', returnType: { name: 'User', isEntity: true }, parameters: [] },
        { name: 'updateUser', returnType: { name: 'User', isEntity: true }, parameters: [] }
      ];

      const div = createImportsDivination(methods);
      const result = await div.resolve();

      // User should appear only once
      const matches = result.match(/User/g);
      expect(matches?.length).toBe(1);
    });

    it('should group imports by path', async () => {
      const methods = [
        { name: 'getUser', returnType: { name: 'User', isEntity: true }, parameters: [] },
        { name: 'getPost', returnType: { name: 'Post', isEntity: true }, parameters: [] }
      ];

      const div = createImportsDivination(methods);
      const result = await div.resolve();

      // Both should be in one import statement (same path pattern)
      expect(result).toContain('{ User, Post }');
    });

    it('should render through template', async () => {
      const methods = [
        { name: 'getUser', returnType: { name: 'User', isEntity: true }, parameters: [] }
      ];

      const div = createImportsDivination(methods);

      const result = await renderWithDivination({
        template: '{{ imports }}\n\nexport class Service {}',
        context: { imports: div.root }
      });

      expect(result).toContain('import { User } from "./entities/User"');
      expect(result).toContain('export class Service {}');
    });
  });

  describe('Round Discovery', () => {
    it('should discover minimum rounds needed', async () => {
      const div = createDivination(({ source, transform }) => {
        // Chain: a -> b -> c -> d
        const a = source('a', [], () => 1);
        const b = transform([a], n => n + 1);
        const c = transform([b], n => n + 1);
        const d = transform([c], n => n + 1);
        return d;
      });

      let roundCount = 0;
      for await (const _ of div.watch()) {
        roundCount++;
      }

      // 4 rounds: 1 for source, 3 for transforms
      expect(roundCount).toBe(4);
    });

    it('should parallelize independent stubs', async () => {
      const div = createDivination(({ source, transform }) => {
        // Independent sources
        const a = source('a', [], () => 'A');
        const b = source('b', [], () => 'B');
        const c = source('c', [], () => 'C');
        
        // All resolve in round 1
        return transform([a, b, c], (x, y, z) => `${x}${y}${z}`);
      });

      const rounds: number[][] = [];
      for await (const round of div.watch()) {
        rounds.push(Array.from(round.materialized.keys()));
      }

      // Round 1: a, b, c (all independent)
      expect(rounds[0].length).toBe(3);
      
      // Round 2: transform
      expect(rounds[1].length).toBe(1);
    });
  });
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Running Divination Engine tests...');
  console.log('(Use `vitest run` for proper test execution)');
}
