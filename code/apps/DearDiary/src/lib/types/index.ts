/**
 * Domain Types
 * 
 * Re-exported from @o19/foundframe for convenience.
 * DearDiary uses string IDs (UUIDs), foundframe uses numbers.
 * This file provides type compatibility layer.
 */

// Re-export all domain types from foundframe
export type {
  // Addressing
  UAddress,
  ContentType,
  TextSpan,
  SpatiotemporalPoint,
  XanaduLink,
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
} from '@o19/foundframe';

// Import utilities from foundframe
export {
  createEmptyAccumulation,
  parseUAddress,
  buildUAddress,
} from '@o19/foundframe';

// Re-export with legacy aliases for backwards compatibility
export type { LinkPreview as CachedPreview } from '@o19/foundframe';

// Legacy: string-based Post ID compatibility
// foundframe uses number IDs, DearDiary uses string IDs
// Use type assertions where needed during migration
export interface PostLegacy {
  id: string;
  bits: import('@o19/foundframe').AccumulableBit[];
  links: import('@o19/foundframe').XanaduLink[];
  createdAt: Date;
  modifiedAt?: Date;
}
