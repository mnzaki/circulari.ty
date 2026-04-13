/**
 * Domain Types
 * 
 * Re-exported from @o19/foundframe-front for convenience.
 * Addressing is now handled by @o19/xana.
 */

// Re-export domain types from foundframe-front
export type {
  // Content
  LinkPreview,
  AccumulableBit,
  InputType,
  AccumulatingPost,
  // Entities
  Person,
  Media,
  Post,
  Bookmark,
  Conversation,
  ConversationParticipant,
  ConversationMedia,
  StreamChunkType,
  StreamChunk,
  StreamEntry,
  View,
  ViewFilters,
  SortBy,
} from '@o19/foundframe-front';

// Re-export xana types for addressing
export type {
  XanaAnchorInfo,
  AnchorType,
  UriResolutionResult,
  RadUriParts,
  RadUri,
  XanaUri,
  ParsedUri,
  ParseOptions,
  UriParseError,
  UriHelper,
} from '@o19/xana/uri';

// Import utilities from foundframe
export {
  createEmptyAccumulation,
} from '@o19/foundframe-front';
