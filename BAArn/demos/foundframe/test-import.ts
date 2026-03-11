/**
 * Test that scrim-loom works as a drop-in replacement for spire-loom.
 * 
 * This file imports from the foundframe WARP.ts which uses:
 *   import loom, { rust } from '@o19/spire-loom';
 * 
 * With pnpm alias resolution, this should actually load @o19/scrim-loom.
 */

// Import the WARP to verify it loads with scrim-loom
import * as warp from './loom/WARP.js';

console.log('✅ WARP.ts loaded successfully!');
console.log('Exports found:', Object.keys(warp));

// Verify the spiral was created
if (warp.foundframe) {
  console.log('✅ foundframe spiral exists');
  console.log('  Type:', typeof warp.foundframe);
  console.log('  Has tieup:', typeof warp.foundframe.tieup === 'function');
} else {
  console.error('❌ foundframe spiral not found');
}

// Verify the struct classes
if (warp.TheStream) {
  console.log('✅ TheStream class exists');
  console.log('  Is constructor:', typeof warp.TheStream === 'function');
}

if (warp.Foundframe) {
  console.log('✅ Foundframe class exists');
  console.log('  Is constructor:', typeof warp.Foundframe === 'function');
  
  // Test instantiation
  try {
    const instance = new warp.Foundframe();
    console.log('✅ Foundframe can be instantiated');
    console.log('  Instance:', instance);
  } catch (e) {
    console.log('ℹ️  Foundframe instantiation:', (e as Error).message);
  }
}

console.log('\n🦡 Scrim-Loom compatibility test complete!');
