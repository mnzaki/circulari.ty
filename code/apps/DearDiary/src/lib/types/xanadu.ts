/**
 * Xanadu-inspired addressing system for fine-grained linking
 * Everything is addressable; everything is a reference.
 */

// Universal address for any content within the system
export type UAddress = string; // Format: "type://id#fragment"

// Content types that can be addressed
export type ContentType = 
  | 'post'      // A complete post
  | 'text'      // Text snippet/span
  | 'media'     // Image or video file
  | 'person'    // Referenced person
  | 'link'      // External URL with metadata
  | 'spatiotemporal'; // Time-space coordinates in media

// A span of text with character-level addressing
export interface TextSpan {
  id: string;
  text: string;
  // For linking to sub-spans: "text://id#start,end"
  // e.g., "text://abc123#10,25" = characters 10-25
}

// Spatiotemporal coordinates (for video/images)
export interface SpatiotemporalPoint {
  t?: number;      // Time in seconds (for video/audio)
  x?: number;      // X coordinate (0-1 normalized)
  y?: number;      // Y coordinate (0-1 normalized)
  w?: number;      // Width of region (optional)
  h?: number;      // Height of region (optional)
}

// A link to any addressable content
export interface XanaduLink {
  id: string;
  source: UAddress;      // What we're linking from
  target: UAddress;      // What we're linking to
  type: 'reference' | 'transclusion' | 'annotation' | 'response';
  createdAt: Date;
  // Transclusion: embeds the target content inline
  // Annotation: overlays commentary
  // Response: threaded reply
}

// A bit of content that can be accumulated
export type AccumulableBit =
  | { type: 'text'; content: string; spans?: TextSpan[] }
  | { type: 'media'; uri: string; mimeType: string; thumbnailUri?: string }
  | { type: 'link'; url: string; preview?: LinkPreview }
  | { type: 'person'; did: string; displayName: string; avatarUri?: string }
  | { type: 'spatiotemporal'; mediaUri: string; region: SpatiotemporalPoint };

export interface LinkPreview {
  title: string;
  description?: string;
  imageUri?: string;
  siteName?: string;
}

// Active input type in creation tools
export type InputType = 'text' | 'link' | 'person' | null;
