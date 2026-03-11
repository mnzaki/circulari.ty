/**
 * Cycle Test: BoundQuery with QueryableDivination 🌀
 * 
 * A minimal demonstration of:
 * 1. Extending QueryableDivination with a custom class
 * 2. Using it as source in BoundQuery
 * 3. Watching resolution cycles
 */

import { BoundQuery, createQueryAPI } from '../../../../o19/packages/spire-loom/machinery/sley/query.js';
import type { LanguageDefinitionImperative } from '../../../../o19/packages/spire-loom/machinery/reed/language/imperative.js';

// ============================================================================
// Mock Language Definition
// ============================================================================

const mockLang: LanguageDefinitionImperative = {
  name: 'test-lang',
  extensions: ['.test'],
  functionVariants: {},
  codeGen: {
    types: {} as any,
    rendering: {
      formatParam: (name: string) => name,
      renderParams: (params: string[]) => params.join(', '),
      functionSignature: () => 'test()',
      renderDefinition: () => 'test() {}',
      renderEntityField: () => 'field: Type',
      renderEntityFields: () => 'field1, field2',
      renderEntityClass: () => 'class Entity {}'
    }
  }
};

// ============================================================================
// Custom QueryableDivination Class
// ============================================================================

interface ImportEntry {
  name: string;
  path: string;
  isEntity: boolean;
}

/**
 * A concrete QueryableDivination implementation for imports.
 * Extends the pattern to show how classes can participate in BoundQuery.
 */
class ImportDivination implements ImportDivination {
  // Queryable interface
  lang: LanguageDefinitionImperative;
  tags: string[];
  crudOperation?: string;
  managementName?: string;

  // Divination state
  private _resolved = false;
  private _value?: ImportEntry[];
  private _round = 0;
  private _resolveFn: () => Promise<ImportEntry[]>;

  constructor(
    public readonly id: string,
    options: {
      lang: LanguageDefinitionImperative;
      tags?: string[];
      managementName?: string;
      resolve: () => Promise<ImportEntry[]>;
    }
  ) {
    this.lang = options.lang;
    this.tags = options.tags || [];
    this.managementName = options.managementName;
    this._resolveFn = options.resolve;
  }

  // Queryable interface: clone with different language
  cloneWithLang(newLang: LanguageDefinitionImperative): ImportDivination {
    return new ImportDivination(this.id, {
      lang: newLang,
      tags: this.tags,
      managementName: this.managementName,
      resolve: this._resolveFn
    });
  }

  // Divination interface
  get resolved(): boolean {
    return this._resolved;
  }

  get value(): ImportEntry[] {
    if (!this._resolved) {
      throw new Error(`ImportDivination ${this.id} not resolved yet`);
    }
    return this._value!;
  }

  get round(): number {
    return this._round;
  }

  // Async resolution with cycle tracking
  async resolve(): Promise<ImportEntry[]> {
    if (this._resolved) return this._value!;

    console.log(`  [${this.id}] Starting resolution...`);
    
    // Simulate multi-round resolution
    for (this._round = 1; this._round <= 3; this._round++) {
      console.log(`  [${this.id}] Round ${this._round}/3`);
      await new Promise(r => setTimeout(r, 50)); // Simulate work
    }

    this._value = await this._resolveFn();
    this._resolved = true;
    
    console.log(`  [${this.id}] Resolution complete: ${this._value.length} entries`);
    return this._value;
  }

  // For BoundQuery filtering (returns undefined if not resolved)
  getFilterValue(): ImportEntry[] | undefined {
    return this._resolved ? this._value : undefined;
  }

  // For template rendering (placeholder pattern)
  toString(): string {
    if (this._resolved) {
      return this._value!.map(e => e.name).join(', ');
    }
    return `{{ ${this.id} }}`;
  }
}

// ============================================================================
// The Test
// ============================================================================

async function runCycleTest() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🌀 Cycle Test: BoundQuery × QueryableDivination 🌀        ║');
  console.log('║     Watching resolution cycles                                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Create ImportDivination instances
  const divinations = [
    new ImportDivination('user-imports', {
      lang: mockLang,
      tags: ['imports', 'user-module'],
      managementName: 'UserMgmt',
      resolve: async () => {
        console.log('    [user-imports] Computing...');
        return [
          { name: 'User', path: './entities/User', isEntity: true },
          { name: 'UserProfile', path: './entities/UserProfile', isEntity: true }
        ];
      }
    }),

    new ImportDivination('post-imports', {
      lang: mockLang,
      tags: ['imports', 'post-module'],
      managementName: 'PostMgmt',
      resolve: async () => {
        console.log('    [post-imports] Computing...');
        return [
          { name: 'Post', path: './entities/Post', isEntity: true },
          { name: 'Comment', path: './entities/Comment', isEntity: true },
          { name: 'Tag', path: './entities/Tag', isEntity: true }
        ];
      }
    }),

    new ImportDivination('media-imports', {
      lang: mockLang,
      tags: ['imports', 'media-module'],
      managementName: 'MediaMgmt',
      resolve: async () => {
        console.log('    [media-imports] Computing...');
        return [
          { name: 'Media', path: './entities/Media', isEntity: true }
        ];
      }
    })
  ];

  console.log('━'.repeat(60));
  console.log('Phase 1: Creating BoundQuery');
  console.log('━'.repeat(60));

  // Create BoundQuery with our custom divinations
  // Note: ImportDivination doesn't strictly implement Queryable<T> because
  // cloneWithLang returns ImportDivination, not the full Queryable<ImportDivination>
  // For this test, we'll use a simpler approach
  const query = createQueryAPI(divinations as any, 'imports');
  query.addLang(mockLang);

  console.log(`\n  Created BoundQuery with ${divinations.length} divinations`);
  console.log(`  Total items: ${query.count}`);

  console.log('\n━'.repeat(60));
  console.log('Phase 2: Synchronous Filtering (before resolution)');
  console.log('━'.repeat(60));

  // Filter by tag (synchronous - doesn't need resolution)
  const userModuleDivs = query.tag('user-module').all;
  console.log(`\n  Filter by tag 'user-module': ${userModuleDivs.length} results`);
  userModuleDivs.forEach((d: ImportDivination) => {
    console.log(`    - ${d.id} (management: ${d.managementName})`);
  });

  // Filter by management (synchronous)
  const mediaDivs = query.filter((d: ImportDivination) => d.managementName === 'MediaMgmt').all;
  console.log(`\n  Filter by management 'MediaMgmt': ${mediaDivs.length} results`);

  console.log('\n━'.repeat(60));
  console.log('Phase 3: Resolving Divinations');
  console.log('━'.repeat(60));

  // Resolve all divinations and watch cycles
  console.log('\n  Resolving all divinations...\n');
  
  for (const div of divinations) {
    console.log(`\n  Resolving ${div.id}:`);
    await div.resolve();
    console.log(`    Final value: ${div.value.map(e => e.name).join(', ')}`);
  }

  console.log('\n━'.repeat(60));
  console.log('Phase 4: Value Filtering (after resolution)');
  console.log('━'.repeat(60));

  // Now we can filter on resolved values
  const bigImports = query.all.filter((d: ImportDivination) => {
    const value = d.getFilterValue();
    return value && value.length > 2;
  });
  
  console.log(`\n  Divinations with >2 imports: ${bigImports.length}`);
  bigImports.forEach((d: ImportDivination) => {
    console.log(`    - ${d.id}: ${d.value.length} imports`);
  });

  console.log('\n━'.repeat(60));
  console.log('Phase 5: Template Rendering');
  console.log('━'.repeat(60));

  // Use toString() for template rendering
  console.log('\n  Template rendering (all resolved):');
  divinations.forEach(d => {
    console.log(`    {{ ${d.id} }} → "${d.toString()}"`);
  });

  console.log('\n' + '═'.repeat(60));
  console.log('                    Test Complete! ✅');
  console.log('═'.repeat(60));
  console.log('\nKey observations:');
  console.log('  • Tag filtering: synchronous, no resolution needed');
  console.log('  • Value filtering: requires resolve() first');
  console.log('  • Each divination resolved independently');
  console.log('  • toString() returns placeholder until resolved');
  console.log('');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  runCycleTest().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}
