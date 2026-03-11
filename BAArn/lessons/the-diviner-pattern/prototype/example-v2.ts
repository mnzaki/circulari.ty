/**
 * Divination Engine v2 Example 🌀
 * 
 * Shape-driven round discovery with mejs re-rendering.
 */

import { createDivinationProvider } from './divination-provider.js';

// ============================================================================
// Mock Data
// ============================================================================

const mockDb = {
  users: {
    findById: async (id: string) => {
      console.log('    [DB] Fetching user:', id);
      await delay(10);
      return { id, name: 'Alice', email: 'alice@example.com' };
    }
  },
  posts: {
    where: async (criteria: any) => {
      console.log('    [DB] Fetching posts for author:', criteria.author);
      await delay(10);
      return [
        { id: '1', title: 'First Post', author: criteria.author },
        { id: '2', title: 'Second Post', author: criteria.author }
      ];
    }
  }
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Example 1: Simple Deferred Value
// ============================================================================

export async function demoSimpleDeferred() {
  console.log('━'.repeat(60));
  console.log('Demo 1: Simple Deferred Value');
  console.log('━'.repeat(60));
  
  const provider = createDivinationProvider({ maxPasses: 5 });
  
  // Context with a deferred value
  const context = {
    greeting: {
      _deferred: true,
      path: 'greeting',
      resolved: false,
      _binding: async () => {
        console.log('    [Binding] Resolving greeting...');
        await delay(5);
        return 'Hello from the other side!';
      },
      toString() {
        return this.resolved ? this.value : `{{ ${this.path} }}`;
      }
    }
  };
  
  const template = `
┌─────────────────────────────────────┐
│  {{ greeting }}                    │
└─────────────────────────────────────┘
`;

  console.log('\n  Template:');
  console.log('  ' + template.trim().split('\n').join('\n  '));
  
  console.log('\n  Rendering with round discovery...\n');
  
  for await (const pass of provider.renderStream(template, context)) {
    console.log(`  Pass ${pass.pass}:`);
    console.log(`    Placeholders: ${pass.placeholders.join(', ') || '(none)'}`);
    console.log(`    Output preview: ${pass.output.substring(0, 50)}...`);
  }
  
  const result = await provider.render(template, context);
  
  console.log('\n  Final output:');
  console.log('  ' + result.output.trim().split('\n').join('\n  '));
  console.log(`  (Resolved in ${result.passes} passes)`);
}

// ============================================================================
// Example 2: Multi-Round Dependencies
// ============================================================================

export async function demoMultiRound() {
  console.log('\n' + '━'.repeat(60));
  console.log('Demo 2: Multi-Round Dependencies');
  console.log('━'.repeat(60));
  
  const provider = createDivinationProvider({ maxPasses: 5 });
  
  // User depends on nothing (Round 1)
  // Posts depends on user.id (Round 2)
  // Stats depends on posts (Round 3)
  
  const context: any = {
    user: {
      _deferred: true,
      path: 'user',
      resolved: false,
      _binding: async () => {
        console.log('    [Round 1] Resolving user...');
        return await mockDb.users.findById('user_123');
      },
      toString() {
        if (this.resolved) {
          return this.value.name;
        }
        return `{{ ${this.path} }}`;
      }
    },
    
    posts: {
      _deferred: true,
      path: 'posts',
      resolved: false,
      _binding: async () => {
        console.log('    [Round 2] Resolving posts...');
        // Depends on user being resolved first!
        const userId = context.user.resolved ? context.user.value.id : null;
        if (!userId) throw new Error('User not resolved yet');
        return await mockDb.posts.where({ author: userId });
      },
      toString() {
        if (this.resolved) {
          return this.value.map((p: any) => p.title).join(', ');
        }
        return `{{ ${this.path} }}`;
      }
    },
    
    stats: {
      _deferred: true,
      path: 'stats.count',
      resolved: false,
      _binding: async () => {
        console.log('    [Round 3] Computing stats...');
        // Depends on posts being resolved
        const posts = context.posts.resolved ? context.posts.value : null;
        if (!posts) throw new Error('Posts not resolved yet');
        return posts.length;
      },
      toString() {
        if (this.resolved) {
          return String(this.value);
        }
        return `{{ ${this.path} }}`;
      }
    }
  };
  
  const template = `
# Dashboard

User: {{ user }}
Posts: {{ posts }}
Count: {{ stats.count }}
`;

  console.log('\n  Dependency graph:');
  console.log('    user (no deps) → Round 1');
  console.log('    posts (needs user.id) → Round 2');
  console.log('    stats.count (needs posts) → Round 3');
  
  console.log('\n  Rendering...\n');
  
  const result = await provider.render(template, context);
  
  console.log('\n  Final output:');
  console.log('  ' + result.output.trim().split('\n').join('\n  '));
  console.log(`  (Resolved in ${result.passes} passes)`);
}

// ============================================================================
// Example 3: The Imports Diviner (v2 Style)
// ============================================================================

interface Method {
  name: string;
  returnType: { name: string; isEntity: boolean };
}

export async function demoImportsDiviner() {
  console.log('\n' + '━'.repeat(60));
  console.log('Demo 3: Imports Diviner (v2 Style)');
  console.log('━'.repeat(60));
  
  const provider = createDivinationProvider({ maxPasses: 5 });
  
  const methods: Method[] = [
    { name: 'createBookmark', returnType: { name: 'Bookmark', isEntity: true } },
    { name: 'getUser', returnType: { name: 'User', isEntity: true } },
    { name: 'updateBookmark', returnType: { name: 'Bookmark', isEntity: true } },
    { name: 'deleteBookmark', returnType: { name: 'void', isEntity: false } }
  ];
  
  // Round 1: Collect entity methods
  // Round 2: Group by path
  // Round 3: Render
  
  const context: any = {
    imports: {
      _deferred: true,
      path: 'imports',
      resolved: false,
      _binding: async () => {
        console.log('    [Round 1] Collecting entity imports...');
        const entities = methods
          .filter(m => m.returnType.isEntity)
          .map(m => ({
            name: m.returnType.name,
            path: `./entities/${m.returnType.name}`
          }));
        
        // Deduplicate
        const seen = new Set<string>();
        return entities.filter(e => {
          if (seen.has(e.name)) return false;
          seen.add(e.name);
          return true;
        });
      },
      toString() {
        if (this.resolved) {
          // Render as import statements
          const byPath: Record<string, string[]> = {};
          for (const e of this.value) {
            byPath[e.path] = byPath[e.path] || [];
            byPath[e.path].push(e.name);
          }
          return Object.entries(byPath)
            .map(([path, names]) => `import { ${names.join(', ')} } from "${path}";`)
            .join('\n');
        }
        return `{{ ${this.path} }}`;
      }
    }
  };
  
  const template = `//! Generated file
{{ imports }}

export class Service {
  // methods...
}
`;

  console.log('\n  Input methods:');
  methods.forEach(m => {
    console.log(`    - ${m.name}(): ${m.returnType.name}${m.returnType.isEntity ? ' [ENTITY]' : ''}`);
  });
  
  console.log('\n  Rendering...\n');
  
  for await (const pass of provider.renderStream(template, context)) {
    console.log(`  Pass ${pass.pass}: placeholders = [${pass.placeholders.join(', ') || 'none'}]`);
  }
  
  const result = await provider.render(template, context);
  
  console.log('\n  Final output:');
  console.log('  ' + result.output.trim().split('\n').join('\n  '));
  console.log(`  (Resolved in ${result.passes} passes)`);
}

// ============================================================================
// Main Demo
// ============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🌀 Divination Engine v2 - Shape-Driven Demo 🌀            ║');
  console.log('║     "Define shape, not computation"                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  await demoSimpleDeferred();
  await demoMultiRound();
  await demoImportsDiviner();
  
  console.log('\n' + '═'.repeat(60));
  console.log('                    Demo Complete! 🎉');
  console.log('═'.repeat(60));
  console.log('\nKey insights:');
  console.log('  • Rounds discovered by analyzing dependencies');
  console.log('  • mejs re-rendering drives progress');
  console.log('  • User defines shape + bindings, not computation');
  console.log('');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
