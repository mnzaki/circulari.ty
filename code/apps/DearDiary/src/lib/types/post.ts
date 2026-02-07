import type { AccumulableBit, XanaduLink, UAddress } from './xanadu';

/**
 * A Post is a signed, content-addressed composition of bits.
 * 
 * Future: PKI-signed, hash-addressed, fully transcludable.
 * Present: A composition of accumulated bits with basic metadata.
 */

export interface Post {
  // Identity
  id: string;              // Local UUID (future: content hash / CID)
  
  // Content: a sequenced composition of bits
  // Order matters—bits compose the post's narrative flow
  bits: AccumulableBit[];
  
  // Xanadu-style links emanating from this post
  // These create the web of association between posts
  links: XanaduLink[];
  
  // Metadata
  createdAt: Date;
  modifiedAt?: Date;
  
  // Future PKI fields (stubbed for now)
  // authorDid: string;      // Decentralized identifier
  // signature: string;      // Cryptographic signature of content
  // contentHash: string;    // Hash of canonical serialized form
}

/**
 * The accumulating post (staging area / CCCB contents)
 * 
 * This is what the CCCB hosts—an ephemeral composition that hasn't
 * been committed to the Feed yet. It can be modified, reordered,
 * discarded. Once committed, it becomes a Post.
 */
export interface AccumulatingPost {
  bits: AccumulableBit[];
  // The bits accumulate here; user can reorder, edit, remove
  // CCCB visualizes this as its expanding content
  
  // Draft links being composed
  draftLinks: Omit<XanaduLink, 'id' | 'createdAt'>[];
}

// Helper to create an empty accumulating post
export function createEmptyAccumulation(): AccumulatingPost {
  return {
    bits: [],
    draftLinks: []
  };
}

// Helper to commit an accumulation to a real post
export function commitAccumulation(
  accumulation: AccumulatingPost,
  id: string
): Post {
  return {
    id,
    bits: [...accumulation.bits],
    links: accumulation.draftLinks.map((dl, i) => ({
      ...dl,
      id: `link-${id}-${i}`,
      createdAt: new Date()
    })),
    createdAt: new Date()
  };
}
