/**
 * ResonancePattern - Semantic Condensation Data Type
 * 
 * Core exports for the ResonancePattern system.
 */

// FQED (Fully Qualified Energy Descriptor)
export {
  CommonEnergies,
  SoftwareEnergies,
  ConversationEnergies,
  CreativeEnergies,
  AllEnergies,
  parseFQED,
  isValidFQED,
  createFQED,
  type FQED,
  type ParsedFQED,
  type CommonEnergy,
  type SoftwareEnergy,
  type ConversationEnergy,
  type CreativeEnergy,
  type AnyEnergy,
} from "./fqed.js";

// Core Types
export type {
  ResonancePattern,
  SemanticSignature,
  SemanticToken,
  PatternStructure,
  ConceptGraph,
  ConceptNode,
  ConceptEdge,
  ArcStructure,
  NestingLevel,
  EnergySignature,
  Provenance,
  PatternRelationships,
  PatternReference,
  Operator,
  WeaveOptions,
  EchoOptions,
  RefocusLens,
} from "./types.js";

// Phase 1 Operators
export {
  crystallize,
  weave,
  echo,
  calculateResonance,
  condense,
  refocus,
  type CrystallizeInput,
} from "./operators.js";

// Phase 3: Translation Layer
export {
  translate,
  detectAudience,
  type Audience,
  type TranslationOptions,
} from "./translate.js";

// ResonancePattern Storage
export {
  savePattern,
  loadPattern,
  latestPattern,
  listPatterns,
  searchPatterns,
  findResonantPatterns,
  packetToPattern,
  type StoredPattern,
  type PatternSearchOptions,
} from "./storage.js";

// Energy Registry
export {
  discoverEnergies,
  getEnergy,
  getEnergiesByDomain,
  getEnergySignatures,
  findEnergiesBySignature,
  generateTypeScriptConstants,
  saveRegistryIndex,
  type EnergyDefinition,
  type EnergyEntry,
  type EnergyRegistry,
} from "./energy-registry.js";
