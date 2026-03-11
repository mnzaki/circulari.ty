/**
 * DeferredValue Tests 🌀
 *
 * Tests for the DeferredValue abstraction, demonstrating:
 * - Two-phase computation
 * - Lazy query API
 * - Multi-pass convergence
 * - Template-friendly stubs
 */

import { describe, it, expect, vi } from 'vitest';
import {
  DeferredValue,
  DeferredQuery,
  defer,
  deferCollection,
  deferTransform
} from './deferred-value.js';

// ============================================================================
// Basic DeferredValue Tests
// ============================================================================

describe('DeferredValue', () => {
  describe('Phase 1: Collecting', () => {
    it('should return stub value during Phase 1', () => {
      const dv = defer({
        stub: '{{ PLACEHOLDER }}',
        compute: () => ({ value: 'actual', needsAnotherPass: false })
      });

      expect(dv.value).toBe('{{ PLACEHOLDER }}');
      expect(dv.stage).toBe('collecting');
    });

    it('toString should return template placeholder in Phase 1', () => {
      const dv = defer({
        stub: 'PLACEHOLDER',
        compute: () => ({ value: 'actual', needsAnotherPass: false })
      });

      expect(dv.toString()).toContain('DEFERRED');
      expect(dv.toString()).toContain('PLACEHOLDER');
    });

    it('query should return empty array before computation', () => {
      const dv = defer({
        stub: 'placeholder',
        compute: () => ({ value: ['a', 'b', 'c'], needsAnotherPass: false })
      });

      expect(dv.query.all).toEqual([]);
    });
  });

  describe('Phase 2: Rendering', () => {
    it('should return actual value after computation completes', () => {
      const dv = defer({
        stub: 'placeholder',
        compute: () => ({ value: 'actual', needsAnotherPass: false })
      });

      dv.runToCompletion();

      expect(dv.value).toBe('actual');
      expect(dv.stage).toBe('rendering');
    });

    it('should support multi-pass computation', () => {
      const compute = vi.fn();
      let pass = 0;

      const dv = defer({
        stub: 'placeholder',
        maxPasses: 5,
        compute: (prev, p) => {
          compute(prev, p);
          pass++;
          // Stabilize after 3 passes
          const value = pass < 3 ? `pass-${pass}` : 'stable';
          return {
            value,
            needsAnotherPass: pass < 3
          };
        }
      });

      const result1 = dv.runPass();
      expect(result1.complete).toBe(false);
      expect(result1.needsAnotherPass).toBe(true);
      expect(dv.value).toBe('placeholder'); // Still Phase 1

      const result2 = dv.runPass();
      expect(result2.complete).toBe(false);
      expect(result2.needsAnotherPass).toBe(true);

      const result3 = dv.runPass();
      expect(result3.complete).toBe(true);
      expect(result3.needsAnotherPass).toBe(false);
      expect(dv.value).toBe('stable');
    });

    it('should call onComplete when finished', () => {
      const onComplete = vi.fn();

      const dv = defer({
        stub: 'placeholder',
        compute: () => ({ value: 'done', needsAnotherPass: false }),
        onComplete
      });

      dv.runToCompletion();

      expect(onComplete).toHaveBeenCalledWith('done', 1);
    });

    it('should respect maxPasses limit', () => {
      const compute = vi.fn().mockReturnValue({
        value: 'value',
        needsAnotherPass: true
      });

      const dv = defer({
        stub: 'placeholder',
        maxPasses: 2,
        compute
      });

      dv.runToCompletion();

      expect(compute).toHaveBeenCalledTimes(2);
      expect(dv.stage).toBe('rendering');
    });
  });

  describe('Query API', () => {
    it('should support filtering after computation', () => {
      interface Item { name: string; value: number; }

      const dv = defer<Item[], string>({
        stub: 'placeholder',
        compute: () => ({
          value: [
            { name: 'a', value: 1 },
            { name: 'b', value: 2 },
            { name: 'c', value: 3 }
          ],
          needsAnotherPass: false
        })
      });

      dv.runToCompletion();

      const highValues = dv.query.filter(i => i.value > 1).all;
      expect(highValues).toHaveLength(2);
      expect(highValues.map(i => i.name)).toEqual(['b', 'c']);
    });

    it('should support mapping after computation', () => {
      const dv = defer<number[], string>({
        stub: 'placeholder',
        compute: () => ({
          value: [1, 2, 3],
          needsAnotherPass: false
        })
      });

      dv.runToCompletion();

      const doubled = dv.query.map(n => n * 2).all;
      expect(doubled).toEqual([2, 4, 6]);
    });

    it('should support chaining filters and maps', () => {
      interface Item { category: string; score: number; }

      const dv = defer<Item[], string>({
        stub: 'placeholder',
        compute: () => ({
          value: [
            { category: 'a', score: 10 },
            { category: 'b', score: 20 },
            { category: 'a', score: 30 }
          ],
          needsAnotherPass: false
        })
      });

      dv.runToCompletion();

      const categoryAScores = dv.query
        .filter(i => i.category === 'a')
        .map(i => i.score)
        .all;

      expect(categoryAScores).toEqual([10, 30]);
    });

    it('should expose first, count, hasAny terminals', () => {
      const dv = defer<number[], string>({
        stub: 'placeholder',
        compute: () => ({
          value: [1, 2, 3, 4, 5],
          needsAnotherPass: false
        })
      });

      dv.runToCompletion();

      expect(dv.query.first).toBe(1);
      expect(dv.query.count).toBe(5);
      expect(dv.query.hasAny).toBe(true);
    });

    it('should be iterable', () => {
      const dv = defer<string[], string>({
        stub: 'placeholder',
        compute: () => ({
          value: ['a', 'b', 'c'],
          needsAnotherPass: false
        })
      });

      dv.runToCompletion();

      const collected: string[] = [];
      for (const item of dv.query) {
        collected.push(item);
      }

      expect(collected).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Non-array values', () => {
    it('should wrap single values in array for query', () => {
      const dv = defer<{ name: string }, string>({
        stub: 'placeholder',
        compute: () => ({
          value: { name: 'singleton' },
          needsAnotherPass: false
        })
      });

      dv.runToCompletion();

      expect(dv.query.count).toBe(1);
      expect(dv.query.first?.name).toBe('singleton');
    });
  });
});

// ============================================================================
// DeferredQuery Tests
// ============================================================================

describe('DeferredQuery', () => {
  it('should support lazy evaluation', () => {
    const source = [1, 2, 3, 4, 5];
    let evalCount = 0;

    const q = new DeferredQuery<number>(
      () => {
        evalCount++;
        return source;
      },
      'test'
    );

    // No evaluation yet
    expect(evalCount).toBe(0);

    // Chain filters (still no evaluation)
    const filtered = q.filter(n => n > 2).filter(n => n < 5);
    expect(evalCount).toBe(0);

    // Terminal triggers evaluation
    const result = filtered.all;
    expect(evalCount).toBe(1);
    expect(result).toEqual([3, 4]);

    // Second terminal uses cache
    const first = filtered.first;
    expect(evalCount).toBe(1); // No re-evaluation
    expect(first).toBe(3);
  });

  it('should support find, some, every', () => {
    const q = new DeferredQuery<number>(
      () => [1, 2, 3, 4, 5],
      'test'
    );

    expect(q.find(n => n > 3)).toBe(4);
    expect(q.some(n => n > 4)).toBe(true);
    expect(q.some(n => n > 5)).toBe(false);
    expect(q.every(n => n > 0)).toBe(true);
    expect(q.every(n => n > 1)).toBe(false);
  });
});

// ============================================================================
// Factory Function Tests
// ============================================================================

describe('deferCollection', () => {
  it('should collect items over multiple passes', () => {
    let collected: string[] = [];

    const dv = deferCollection({
      stub: 'collecting...',
      collect: (existing, pass) => {
        if (pass === 1) {
          collected = ['a', 'b'];
          return { items: collected, done: false };
        }
        if (pass === 2) {
          collected = [...existing, 'c', 'd'];
          return { items: collected, done: false };
        }
        return { items: collected, done: true };
      }
    });

    expect(dv.value).toBe('collecting...');

    dv.runPass(); // Pass 1
    expect(dv.stage).toBe('collecting');

    dv.runPass(); // Pass 2
    expect(dv.stage).toBe('collecting');

    dv.runPass(); // Pass 3 - done
    expect(dv.stage).toBe('rendering');
    expect(dv.value).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should simulate imports collection like spire-loom', () => {
    // Simulate collecting imports from methods
    interface Import { name: string; path: string; }

    const methods = [
      { name: 'createBookmark', returnType: 'Bookmark' },
      { name: 'getUser', returnType: 'User' },
      { name: 'listPosts', returnType: 'Post' }
    ];

    const dv = deferCollection<Import>({
      stub: '{{ IMPORTS }}',
      collect: (existing, pass) => {
        if (pass === 1) {
          // First pass: collect from methods
          const imports = methods.map(m => ({
            name: m.returnType,
            path: `./entities/${m.returnType}`
          }));
          return { items: imports, done: false };
        }
        // Second pass: deduplicate and finalize
        const unique = [...new Map(existing.map(i => [i.name, i])).values()];
        return { items: unique, done: true };
      }
    });

    dv.runToCompletion();

    const query = dv.query;
    expect(query.count).toBe(3);
    expect(query.some(i => i.name === 'Bookmark')).toBe(true);
  });
});

describe('deferTransform', () => {
  it('should transform source value over passes', () => {
    const sourceData = { items: [1, 2, 3, 4, 5] };

    const dv = deferTransform({
      source: () => sourceData,
      stub: 'processing...',
      transform: (src, prev, pass) => {
        if (pass === 1) {
          // First pass: filter evens
          return {
            value: src.items.filter(n => n % 2 === 0),
            done: false
          };
        }
        // Second pass: double them
        return {
          value: (prev ?? []).map(n => n * 2),
          done: true
        };
      }
    });

    dv.runToCompletion();

    expect(dv.value).toEqual([4, 8]);
  });
});

// ============================================================================
// Real-World Scenario: Template Rendering
// ============================================================================

describe('Template Rendering Scenario', () => {
  it('should demonstrate template-like usage', () => {
    // Simulate a template that needs imports
    interface Import { name: string; path: string; }

    // Create deferred imports (like spire-loom's imports diviner)
    const imports = deferCollection<Import>({
      stub: '// imports will be inserted here',
      collect: (existing, pass) => {
        // Simulate: in pass 1 we collect, pass 2 we finalize
        if (pass === 1) {
          return {
            items: [
              { name: 'Bookmark', path: './entities/Bookmark' },
              { name: 'User', path: './entities/User' }
            ],
            done: false
          };
        }
        return { items: existing, done: true };
      }
    });

    // Phase 1: Template renders with stub
    let templateOutput = `
${imports.value}

export function createBookmark() {
  // ...
}
`;

    expect(templateOutput).toContain('// imports will be inserted here');

    // Phase 2: Run computation
    imports.runToCompletion();

    // Re-render with actual value
    templateOutput = `
${(imports.value as Import[]).map(i => `import { ${i.name} } from '${i.path}';`).join('\n')}

export function createBookmark() {
  // ...
}
`;

    expect(templateOutput).toContain("import { Bookmark } from './entities/Bookmark';");
    expect(templateOutput).toContain("import { User } from './entities/User';");
  });
});
