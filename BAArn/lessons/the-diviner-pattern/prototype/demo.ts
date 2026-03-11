#!/usr/bin/env node
/**
 * Divination Engine Demo 🎭
 * 
 * Run this to see the prototype in action!
 */

import { demoImportsDivination, createNestedDivination } from './example-imports-diviner.js';
import { createDivination, source, transform, quotable } from './divination-engine.js';
import { renderWithDivination } from './mejs-integration.js';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     🌀 Divination Engine Prototype - Live Demo 🌀             ║');
console.log('║     Barn Architecture Academy                                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// ============================================================================
// Demo 1: Basic Round Discovery
// ============================================================================
console.log('━'.repeat(60));
console.log('Demo 1: Basic Round Discovery');
console.log('━'.repeat(60));

const basicDiv = createDivination(({ source, transform }) => {
  console.log('  Building computation graph...');
  
  const a = source('value.a', [], () => {
    console.log('    [Round 1] Materializing value A');
    return 10;
  });
  
  const b = source('value.b', [], () => {
    console.log('    [Round 1] Materializing value B');
    return 20;
  });
  
  const sum = transform([a, b], (x, y) => {
    console.log(`    [Round 2] Computing sum: ${x} + ${y}`);
    return x + y;
  });
  
  const doubled = transform([sum], (n) => {
    console.log(`    [Round 3] Computing doubled: ${n} * 2`);
    return n * 2;
  });
  
  return doubled;
});

console.log(`\n  Discovered ${basicDiv.stubs.size} stubs:\n`);
for (const [id, stub] of basicDiv.stubs) {
  const type = stub._tag;
  const deps = stub._tag === 'source' 
    ? stub.params.length 
    : stub._tag === 'transform' 
      ? stub.deps.length 
      : 'inner';
  console.log(`    • ${id} (${type}, deps: ${deps})`);
}

console.log('\n  Running solver...\n');
const basicResult = await basicDiv.resolve();
console.log(`\n  ✅ Final result: ${basicResult}`);

// ============================================================================
// Demo 2: Quoting & Templates
// ============================================================================
console.log('\n' + '━'.repeat(60));
console.log('Demo 2: Quoting & Template Integration');
console.log('━'.repeat(60));

const quoteDiv = createDivination(({ source, quotable }) => {
  const message = source('message', [], () => {
    console.log('    [Materializing] The secret message...');
    return 'Hello from the other side!';
  });
  
  return quotable(message, 1);
});

const template1 = `
┌─────────────────────────────────────┐
│  {{ greeting }}                    │
└─────────────────────────────────────┘
`;

console.log('\n  Template before resolution:');
console.log('  ' + template1.trim().split('\n').join('\n  '));

console.log('\n  Phase 1: Rendering with quotable stub...');
console.log(`  Stub toString(): "${quoteDiv.root.toString().trim()}"`);

console.log('\n  Phase 2: Running solver & re-rendering...\n');
const rendered1 = await renderWithDivination({
  template: template1,
  context: { greeting: quoteDiv.root }
});

console.log('  Final output:');
console.log('  ' + rendered1.trim().split('\n').join('\n  '));

// ============================================================================
// Demo 3: The Imports Diviner
// ============================================================================
console.log('\n' + '━'.repeat(60));
console.log('Demo 3: Imports Diviner (like spire-loom!)');
console.log('━'.repeat(60));

await demoImportsDivination();

// ============================================================================
// Demo 4: Nested Divinations (The Fractal)
// ============================================================================
console.log('\n' + '━'.repeat(60));
console.log('Demo 4: Nested Divinations (Fractal Structure)');
console.log('━'.repeat(60));

const nestedDiv = createNestedDivination();

console.log('\n  Structure: context.currentUser → dashboard.user/posts');
console.log(`  Total stubs discovered: ${nestedDiv.stubs.size}`);

console.log('\n  Resolution rounds:\n');
for await (const round of nestedDiv.watch()) {
  const stubsThisRound = Array.from(round.materialized.keys());
  console.log(`    Round ${round.round}: resolved ${stubsThisRound.length} stub(s)`);
  if (round.value) {
    console.log(`    -> Dashboard ready:`, JSON.stringify(round.value, null, 2).split('\n').join('\n       '));
  }
}

// ============================================================================
// Demo 5: Multi-Pass Template
// ============================================================================
console.log('\n' + '━'.repeat(60));
console.log('Demo 5: Multi-Pass Template Resolution');
console.log('━'.repeat(60));

const multiDiv = createDivination(({ source, transform, quotable }) => {
  // Simulating: config -> apiUrl -> fetchData -> processed
  const config = source('config', [], () => {
    console.log('    [Pass 1] Loading config...');
    return { apiEndpoint: '/api/v1' };
  });
  
  const apiUrl = transform([config], (cfg) => {
    console.log('    [Pass 2] Building API URL...');
    return `https://api.example.com${cfg.apiEndpoint}`;
  });
  
  const data = transform([apiUrl], (url) => {
    console.log('    [Pass 3] Fetching from ' + url + '...');
    return { users: 42, posts: 100 };
  });
  
  const summary = transform([data], (d) => {
    console.log('    [Pass 4] Creating summary...');
    return `Total items: ${d.users + d.posts}`;
  });
  
  return quotable(summary, 1);
});

const template2 = `
📊 Dashboard Summary
────────────────────
{{ summary }}
────────────────────
Generated by Divination Engine
`;

console.log('\n  Template:');
console.log('  ' + template2.trim().split('\n').join('\n  '));

console.log('\n  Resolving (4 passes expected)...\n');
const rendered2 = await renderWithDivination({
  template: template2,
  context: { summary: multiDiv.root },
  maxPasses: 5
});

console.log('  Final output:');
console.log('  ' + rendered2.trim().split('\n').join('\n  '));

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '═'.repeat(60));
console.log('                    Demo Complete! 🎉');
console.log('═'.repeat(60));
console.log('\nKey takeaways:');
console.log('  • Rounds are discovered, not predetermined');
console.log('  • Quoting enables multi-phase template rendering');
console.log('  • Structure is separate from execution');
console.log('  • Parallel resolution of independent stubs');
console.log('\nFor more: see README.md and test.ts');
console.log('');
