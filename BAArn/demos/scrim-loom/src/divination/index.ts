/**
 * Divination Module 🌀
 * 
 * Async, multi-round computation for architectural validation.
 * 
 * Export everything needed for divination-based validation.
 */

// Core divination
export {
  Divination,
  createDivination,
  type DivinationRound,
  type DivinationConfig,
  type DivinationShape,
  type ValidationContext,
  type ValidationResult
} from './divination.js';

// Provider for batch resolution
export {
  DivinationProvider,
  createDivinationProvider,
  type ResolutionBatch,
  type ProviderConfig
} from './provider.js';

// Helper for integration with heddles
export { createManagementDivination } from './heddles-integration.js';
