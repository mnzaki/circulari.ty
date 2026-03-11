/**
 * QueryableDivination Example 🌀
 * 
 * Demonstrates BoundQuery integration with Divination Engine.
 */

import {
  createQueryableDivination,
  createDivinationQuery,
  resolveAndFilter,
  type QueryableDivination,
  type ImportEntry
} from './queryable-divination.js';

// Mock language for demo
const mockLang = {
  name: 'typescript',
  extensions: ['.ts'],
  codeGen: {
    rendering: {
      renderImportStatement: (spec: string, path: string) => 
        `import ${spec} from "${path}";`
    }
  }
} as any;

// ============================================================================
// Demo 1: Basic QueryableDivination
// ============================================================================

async function demoBasic() {
  console.log('━'.repeat(60));
  console.log('Demo 1: Basic QueryableDivination');
  console.log('━'.repeat(60));
  
  // Create a divination for computed stats
  const statsDiv = createQueryableDivination(
    {
      deps: [],
      compute: async () => {
        console.log('  [Divination] Computing stats...');
        return {
          userCount: 42,
          postCount: 150,
          avgPostsPerUser: 150 / 42
        };
      }
    },
    {
      lang: mockLang,
      tags: ['stats', 'dashboard']
    }
  );
  
  console.log('\n  Created QueryableDivination:');
  console.log(`    - Tags: ${statsDiv.tags?.join(', ')}`);
  console.log(`    - Resolved: ${statsDiv.isResolved}`);
  
  // Resolve it
  console.log('\n  Resolving...');
  const stats = await statsDiv.resolve();
  
  console.log('  Resolved value:', stats);
  console.log(`  isResolved: ${statsDiv.isResolved}`);
}

// ============================================================================
// Demo 2: BoundQuery Integration
// ============================================================================

async function demoBoundQuery() {
  console.log('\n' + '━'.repeat(60));
  console.log('Demo 2: BoundQuery Integration');
  console.log('━'.repeat(60));
  
  // Create multiple import divinations
  const divinations: QueryableDivination<ImportEntry[]>[] = [
    createQueryableDivination(
      {
        deps: [],
        compute: async () => [
          { name: 'User', path: './entities/User', isEntity: true },
          { name: 'Post', path: './entities/Post', isEntity: true }
        ]
      },
      { lang: mockLang, tags: ['imports', 'user-module'] }
    ),
    
    createQueryableDivination(
      {
        deps: [],
        compute: async () => [
          { name: 'Bookmark', path: './entities/Bookmark', isEntity: true },
          { name: 'string', path: 'builtin', isEntity: false }
        ]
      },
      { lang: mockLang, tags: ['imports', 'bookmark-module'] }
    ),
    
    createQueryableDivination(
      {
        deps: [],
        compute: async () => [
          { name: 'Media', path: './entities/Media', isEntity: true }
        ]
      },
      { lang: mockLang, tags: ['imports', 'media-module'] }
    )
  ];
  
  // Create BoundQuery
  console.log('\n  Creating BoundQuery with 3 divinations...');
  const query = createDivinationQuery(divinations, 'imports');
  query.addLang(mockLang); // Need to add language!
  
  // Synchronous: filter by tag (no resolution needed)
  console.log('\n  Synchronous tag filtering:');
  const userModuleDivs = query.tag('user-module').all;
  console.log(`    Found ${userModuleDivs.length} with 'user-module' tag`);
  
  // Asynchronous: resolve then filter by value
  console.log('\n  Asynchronous value filtering:');
  const withMultipleImports = await resolveAndFilter(
    query,
    entries => entries.length > 1
  );
  console.log(`    Found ${withMultipleImports.length} with >1 imports:`);
  withMultipleImports.forEach((entries, i) => {
    console.log(`      [${i}] ${entries.map(e => e.name).join(', ')}`);
  });
}

// ============================================================================
// Demo 3: The Full Pattern (like spire-loom's imports)
// ============================================================================

async function demoFullPattern() {
  console.log('\n' + '━'.repeat(60));
  console.log('Demo 3: Full Pattern (spire-loom style)');
  console.log('━'.repeat(60));
  
  // Mock methods from a WARP.ts
  const methods = [
    { name: 'createUser', returnType: { name: 'User', isEntity: true } },
    { name: 'getUser', returnType: { name: 'User', isEntity: true } },
    { name: 'createPost', returnType: { name: 'Post', isEntity: true } },
    { name: 'getString', returnType: { name: 'string', isEntity: false } }
  ];
  
  console.log('\n  Input methods:');
  methods.forEach(m => {
    console.log(`    - ${m.name}(): ${m.returnType.name}`);
  });
  
  // Create a single divination for ALL imports
  // (In spire-loom this would be attached to the methods query)
  const importsDiv = createQueryableDivination<ImportEntry[]>(
    {
      deps: [],
      compute: async () => {
        console.log('  [Divination] Scanning method return types...');
        
        const entries = methods
          .filter(m => m.returnType.isEntity)
          .map(m => ({
            name: m.returnType.name,
            path: `./entities/${m.returnType.name}`,
            isEntity: true
          }));
        
        // Deduplicate
        const seen = new Set<string>();
        return entries.filter(e => {
          if (seen.has(e.name)) return false;
          seen.add(e.name);
          return true;
        });
      }
    },
    {
      lang: mockLang,
      tags: ['imports', 'all-methods']
    }
  );
  
  // Use in BoundQuery context
  console.log('\n  Creating query...');
  const query = createDivinationQuery([importsDiv], 'methods');
  query.addLang(mockLang);
  
  // The divination is the "imports" property of the query
  console.log('\n  Resolving imports divination...');
  const imports = await importsDiv.resolve();
  
  console.log('\n  Resolved imports:');
  imports.forEach(imp => {
    console.log(`    - ${imp.name} from "${imp.path}"`);
  });
  
  // Render import statements (using language's renderImportStatement)
  console.log('\n  Rendered:');
  const renderImport = mockLang.codeGen.rendering.renderImportStatement;
  const byPath = imports.reduce((groups, imp) => {
    groups[imp.path] = groups[imp.path] || [];
    groups[imp.path].push(imp.name);
    return groups;
  }, {} as Record<string, string[]>);
  
  Object.entries(byPath).forEach(([path, names]) => {
    console.log(`    ${renderImport(`{ ${names.join(', ')} }`, path)}`);
  });
}

// ============================================================================
// Demo 4: Multi-Language Support (cloneWithLang)
// ============================================================================

async function demoMultiLanguage() {
  console.log('\n' + '━'.repeat(60));
  console.log('Demo 4: Multi-Language Support');
  console.log('━'.repeat(60));
  
  const tsLang = { name: 'typescript', extensions: ['.ts'] } as any;
  const rsLang = { name: 'rust', extensions: ['.rs'] } as any;
  
  // Create in TypeScript
  const tsDiv = createQueryableDivination(
    {
      deps: [],
      compute: async () => ({ count: 42 })
    },
    { lang: tsLang, tags: ['stats'] }
  );
  
  console.log('\n  Original divination:');
  console.log(`    Language: ${tsDiv.lang.name}`);
  
  // Clone to Rust
  const rsDiv = tsDiv.cloneWithLang(rsLang);
  
  console.log('\n  Cloned divination:');
  console.log(`    Language: ${rsDiv.lang.name}`);
  console.log(`    Same shape: ${rsDiv.divination.shape === tsDiv.divination.shape}`);
  
  // Both can be in the same BoundQuery
  const query = createDivinationQuery([tsDiv, rsDiv], 'multi-lang');
  query.addLang(tsLang);
  
  // Filter by language (note: this filters on the item's lang property, synchronous)
  const tsDivs = query.filter(d => d.lang.name === 'typescript').all;
  console.log(`\n  BoundQuery filter by language:`);
  console.log(`    TypeScript divinations: ${tsDivs.length}`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🌀 QueryableDivination - BoundQuery Integration 🌀        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  await demoBasic();
  await demoBoundQuery();
  await demoFullPattern();
  await demoMultiLanguage();
  
  console.log('\n' + '═'.repeat(60));
  console.log('                    Demo Complete! 🎉');
  console.log('═'.repeat(60));
  console.log('\nKey insights:');
  console.log('  • QueryableDivination implements Queryable interface');
  console.log('  • Can be used as source in BoundQuery');
  console.log('  • Tags work synchronously (no resolution needed)');
  console.log('  • Value filtering requires resolve() first');
  console.log('  • cloneWithLang enables multi-language queries');
  console.log('');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
