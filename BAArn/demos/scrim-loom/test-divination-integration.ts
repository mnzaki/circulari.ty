/**
 * Divination Integration Test 🌀
 * 
 * Demonstrates the new async divination system integrated with scrim-loom.
 */

import {
  Divination,
  DivinationProvider,
  createManagementDivination,
  resolveWithTracking,
  scrimHeddles
} from './src/index.js';
import type { ScrimManagement } from './src/heddles/validator.js';

// Mock language for testing
const mockLang = {
  name: 'typescript',
  extensions: ['.ts'],
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
} as any;

// ============================================================================
// Test 1: Create Divination from Management
// ============================================================================

async function testCreateDivination() {
  console.log('━'.repeat(60));
  console.log('Test 1: Create Divination from Management');
  console.log('━'.repeat(60));
  
  const management: ScrimManagement = {
    name: 'UserMgmt',
    layer: 'service',
    domain: 'foundframe',
    link: 'foundframe.inner.core.user',
    methods: [
      { name: 'createUser', operation: 'create', returnType: 'User', parameters: [] }
    ]
  };
  
  console.log('\n  Creating divination for management:');
  console.log(`    Name: ${management.name}`);
  console.log(`    Layer: ${management.layer}`);
  console.log(`    Link: ${management.link}`);
  
  // Create divination using heddles
  const divination = scrimHeddles.createDivination(management, {
    lang: mockLang,
    tags: ['service', 'user']
  });
  
  console.log(`\n  Created Divination:`);
  console.log(`    ID: ${divination.id}`);
  console.log(`    Tags: ${divination.tags.join(', ')}`);
  console.log(`    Resolved: ${divination.resolved}`);
  
  return divination;
}

// ============================================================================
// Test 2: Watch Resolution Rounds
// ============================================================================

async function testWatchRounds(divination: Divination<ScrimManagement>) {
  console.log('\n' + '━'.repeat(60));
  console.log('Test 2: Watch Resolution Rounds');
  console.log('━'.repeat(60));
  
  console.log('\n  Resolving with round tracking...\n');
  
  for await (const round of divination.watch()) {
    console.log(`  Round ${round.round}:`);
    console.log(`    Complete: ${round.complete}`);
    console.log(`    Resolved deps: ${round.resolved.size}`);
    if (round.value) {
      console.log(`    Has _computed: ${!!round.value._computed}`);
      console.log(`    Violations: ${round.value._violations?.length || 0}`);
    }
  }
  
  console.log(`\n  Final state:`);
  console.log(`    Resolved: ${divination.resolved}`);
  console.log(`    Value name: ${divination.value.name}`);
}

// ============================================================================
// Test 3: Batch Resolution with Provider
// ============================================================================

async function testBatchResolution() {
  console.log('\n' + '━'.repeat(60));
  console.log('Test 3: Batch Resolution with Provider');
  console.log('━'.repeat(60));
  
  const managements: ScrimManagement[] = [
    {
      name: 'UserMgmt',
      layer: 'service',
      domain: 'foundframe',
      methods: []
    },
    {
      name: 'PostMgmt', 
      layer: 'service',
      domain: 'foundframe',
      methods: []
    },
    {
      name: 'BookmarkMgmt',
      layer: 'repository',
      domain: 'foundframe',
      methods: []
    }
  ];
  
  console.log('\n  Creating divinations:');
  const divinations = managements.map(m => {
    const div = scrimHeddles.createDivination(m, { lang: mockLang });
    console.log(`    - ${m.name} (${m.layer}) → ${div.id}`);
    return div;
  });
  
  console.log('\n  Resolving with provider...\n');
  
  const provider = new DivinationProvider({
    onRoundComplete: (batch) => {
      console.log(`    Batch round ${batch.round}:`);
      console.log(`      Resolved: ${batch.resolved.length}`);
      console.log(`      Pending: ${batch.pending.length}`);
      console.log(`      Errors: ${batch.errors.size}`);
    }
  });
  
  const { values, rounds, errors } = await provider.resolveAllToValues(divinations);
  
  console.log(`\n  Final result:`);
  console.log(`    Total rounds: ${rounds}`);
  console.log(`    Resolved values: ${values.length}`);
  console.log(`    Errors: ${errors.size}`);
  
  values.forEach(v => {
    console.log(`      - ${v.name}: canGenerate=${v._computed?.canGenerate}`);
  });
}

// ============================================================================
// Test 4: resolveWithTracking Helper
// ============================================================================

async function testResolveWithTracking() {
  console.log('\n' + '━'.repeat(60));
  console.log('Test 4: resolveWithTracking Helper');
  console.log('━'.repeat(60));
  
  const management: ScrimManagement = {
    name: 'MediaMgmt',
    layer: 'controller',
    domain: 'foundframe',
    methods: []
  };
  
  const divination = scrimHeddles.createDivination(management, { lang: mockLang });
  
  console.log('\n  Using resolveWithTracking()...');
  const { value, rounds } = await resolveWithTracking(divination);
  
  console.log(`\n  Result:`);
  console.log(`    Value: ${value.name}`);
  console.log(`    Rounds: ${rounds}`);
}

// ============================================================================
// Test 5: Template Rendering (Placeholder Pattern)
// ============================================================================

async function testTemplateRendering() {
  console.log('\n' + '━'.repeat(60));
  console.log('Test 5: Template Rendering');
  console.log('━'.repeat(60));
  
  const management: ScrimManagement = {
    name: 'StreamMgmt',
    layer: 'service',
    domain: 'foundframe',
    methods: []
  };
  
  const divination = scrimHeddles.createDivination(management, { lang: mockLang });
  
  console.log('\n  Template rendering:');
  console.log(`    Before resolve: ${divination.toString()}`);
  
  await divination.resolve();
  
  console.log(`    After resolve: ${divination.toString().substring(0, 50)}...`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🦡 Divination Integration Test - Scrim-Loom 🌀            ║');
  console.log('║     Async, multi-round architectural validation                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  try {
    const divination = await testCreateDivination();
    await testWatchRounds(divination);
    await testBatchResolution();
    await testResolveWithTracking();
    await testTemplateRendering();
    
    console.log('\n' + '═'.repeat(60));
    console.log('                    All Tests Passed! ✅');
    console.log('═'.repeat(60));
    console.log('\nKey features demonstrated:');
    console.log('  • heddles.createDivination() - async validation');
    console.log('  • divination.watch() - round-by-round progress');
    console.log('  • DivinationProvider - batch resolution');
    console.log('  • resolveWithTracking() - convenient helper');
    console.log('  • toString() - template placeholder pattern');
    console.log('');
  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
