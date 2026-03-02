/**
 * FQED: Fully Qualified Energy Descriptor
 * 
 * Format: "<domain>:<energy>"
 * Examples: "software:building", "common:exploring", "conversation:learning"
 */

// ============================================================================
// Common Energies (Cross-Domain)
// ============================================================================

export const CommonEnergies = {
  EXPLORING: "common:exploring" as const,
  LEARNING: "common:learning" as const,
  TEACHING: "common:teaching" as const,
  TRYING: "common:trying" as const,
  RESTING: "common:resting" as const,
  CONNECTING: "common:connecting" as const,
  CREATING: "common:creating" as const,
  REFLECTING: "common:reflecting" as const,
};

export type CommonEnergy = typeof CommonEnergies[keyof typeof CommonEnergies];

// ============================================================================
// Software Domain Energies
// ============================================================================

export const SoftwareEnergies = {
  // Domain-specific
  BUILDING: "software:building" as const,
  DEBUGGING: "software:debugging" as const,
  REFACTORING: "software:refactoring" as const,
  SHIPPING: "software:shipping" as const,
  TESTING: "software:testing" as const,
  DOCUMENTING: "software:documenting" as const,
  
  // Domain flavors of common energies
  EXPLORING: "software:exploring" as const,  // spiking, prototyping
  LEARNING: "software:learning" as const,    // reading docs, source diving
  CREATING: "software:creating" as const,    // designing, architecting
};

export type SoftwareEnergy = typeof SoftwareEnergies[keyof typeof SoftwareEnergies];

// ============================================================================
// Conversation Domain Energies
// ============================================================================

export const ConversationEnergies = {
  RIFFING: "conversation: riffing" as const,
  LISTENING: "conversation:listening" as const,
  DEBATING: "conversation:debating" as const,
  EXPLAINING: "conversation:explaining" as const,
  
  // Domain flavors
  LEARNING: "conversation:learning" as const,  // absorbing from others
  TEACHING: "conversation:teaching" as const,  // explaining to others
};

export type ConversationEnergy = typeof ConversationEnergies[keyof typeof ConversationEnergies];

// ============================================================================
// Creative Domain Energies
// ============================================================================

export const CreativeEnergies = {
  DRAFTING: "creative:drafting" as const,
  EDITING: "creative:editing" as const,
  POLISHING: "creative:polishing" as const,
  INCUBATING: "creative:incubating" as const,  // letting ideas rest
  
  // Domain flavors
  EXPLORING: "creative:exploring" as const,
  CREATING: "creative:creating" as const,
};

export type CreativeEnergy = typeof CreativeEnergies[keyof typeof CreativeEnergies];

// ============================================================================
// FQED Type Guards and Utilities
// ============================================================================

export type FQED = string;  // Format: "domain:energy"

export interface ParsedFQED {
  domain: string;
  energy: string;
  full: FQED;
}

export function parseFQED(fqed: FQED): ParsedFQED {
  const parts = fqed.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid FQED format: ${fqed}. Expected "domain:energy"`);
  }
  return {
    domain: parts[0],
    energy: parts[1],
    full: fqed,
  };
}

export function isValidFQED(fqed: string): fqed is FQED {
  return fqed.includes(":") && fqed.split(":").length === 2;
}

export function createFQED(domain: string, energy: string): FQED {
  return `${domain}:${energy}`;
}

// All energy constants combined (for autocomplete)
export const AllEnergies = {
  ...CommonEnergies,
  ...SoftwareEnergies,
  ...ConversationEnergies,
  ...CreativeEnergies,
} as const;

export type AnyEnergy = typeof AllEnergies[keyof typeof AllEnergies];
