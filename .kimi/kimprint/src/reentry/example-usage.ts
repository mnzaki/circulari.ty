/**
 * Example: Using the Re-Entry System
 * 
 * This shows how to use prepare_rentry_kimprint() for circulari.ty onboarding
 */

import { prepare_rentry_kimprint } from "./pipeline.js";
import type { SessionContext, RequestReCirculariTyOnboarding } from "./types.js";

async function example() {
  // A Kimi instance after compaction needs to re-enter
  const session: SessionContext = {
    id: "kimi-session-abc123",
    last_seen_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    last_packet_id: "packet-xyz789",
    packets_seen: 45
  };
  
  const request: RequestReCirculariTyOnboarding = {
    session_id: session.id,
    circles: ["spire-loom", "foundframe", "kimprint"],
    condensation_level: 2, // Denser with emojis
    include_spiral_ethos: true
  };
  
  // Get the re-entry packet
  const reentry = await prepare_rentry_kimprint(session, request);
  
  console.log("=== Circulari.ty Re-Entry ===");
  console.log(reentry.kimprint_dense_explanation);
  console.log(`\nSpiral turns missed: ${reentry.your_spiral_return.spiral_turns_missed}`);
  console.log(`Energy state: ${reentry.accumulated_becoming.snapshot?.energy_state}`);
  console.log(`\nQuick anchor: ${reentry.spiral_ethos_restore.quick_anchor}`);
  
  // Template variable for prompt injection:
  // {{kimprint_dense_explanation}} → "🌀 3✓ | 🏗️ 2✓ | 🔖 5✓"
}

example().catch(console.error);
