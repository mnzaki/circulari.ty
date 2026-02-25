/**
 * kimprint Storage Layer
 * 
 * File-based storage for conservation packets.
 * Simple, inspectable, git-friendly—like the solarpunk ethos demands.
 */

import * as fs from "fs/promises";
import * as path from "path";
import { homedir } from "os";

import { ImprintPacket, safeParseImprintPacket } from "../types.js";
import type { ImprintStorage } from "../types.js";

/**
 * Default storage directory.
 */
const DEFAULT_STORAGE_DIR = path.join(homedir(), ".kimi", "kkimprints");

/**
 * File-based storage implementation.
 */
export class FileStorage implements ImprintStorage {
  private storageDir: string;

  constructor(storageDir: string = DEFAULT_STORAGE_DIR) {
    this.storageDir = storageDir;
  }

  /**
   * Ensure storage directory exists.
   */
  async initialize(): Promise<void> {
    /* TODO: Create directory if it doesn't exist */
    await fs.mkdir(this.storageDir, { recursive: true });
    
    /* TODO: Create index.json if it doesn't exist */
    const indexPath = path.join(this.storageDir, "index.json");
    try {
      await fs.access(indexPath);
    } catch {
      /* Index doesn't exist, create it */
      await fs.writeFile(indexPath, JSON.stringify({ packets: [] }, null, 2));
    }
  }

  /**
   * Generate a content-addressable ID from packet content.
   * For now: timestamp-based. Phase X: semantic pattern.
   */
  private generateId(_packet: ImprintPacket): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    /* TODO Phase X: Use semantic pattern as ID, not timestamp */
    /* Example: "jeff-buckley-synchronicity-20260223-163045" */
    return `${timestamp}`;
  }

  /**
   * Get the file path for a packet ID.
   */
  private getPacketPath(id: string): string {
    return path.join(this.storageDir, `${id}.json`);
  }

  /**
   * Save a packet to storage.
   */
  async save(packet: ImprintPacket): Promise<string> {
    /* Generate ID if not present */
    const id = packet.id || this.generateId(packet);
    const packetWithId = { ...packet, id };
    
    /* Serialize */
    const serialized = JSON.stringify(packetWithId, null, 2);
    
    /* Write to file */
    const filePath = this.getPacketPath(id);
    await fs.writeFile(filePath, serialized, "utf-8");
    
    /* Update index */
    await this.updateIndex(packetWithId);
    
    return id;
  }

  /**
   * Load a packet by ID.
   */
  async load(id: string): Promise<ImprintPacket | null> {
    try {
      const filePath = this.getPacketPath(id);
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content, (_key, value) => {
        /* Revive ISO date strings to Date objects */
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          const parsed = new Date(value);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }
        return value;
      });
      
      /* Validate */
      return safeParseImprintPacket(data);
    } catch {
      /* File doesn't exist or is invalid */
      return null;
    }
  }

  /**
   * List all packets with metadata.
   */
  async list(): Promise<Array<{ id: string; timestamp: Date; trigger: string }>> {
    try {
      const indexPath = path.join(this.storageDir, "index.json");
      const content = await fs.readFile(indexPath, "utf-8");
      const index = JSON.parse(content);
      
      return index.packets.map((p: { id: string; timestamp: string; trigger: string }) => ({
        id: p.id,
        timestamp: new Date(p.timestamp),
        trigger: p.trigger,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Search packets by query.
   * TODO Phase X: Use content-addressed pattern matching.
   */
  async search(query: string): Promise<ImprintPacket[]> {
    /* Load index */
    const packets = await this.list();
    
    /* Simple text search for now */
    const results: ImprintPacket[] = [];
    
    for (const meta of packets) {
      const packet = await this.load(meta.id);
      if (!packet) continue;
      
      /* TODO: Search in session, context, ethos */
      const searchable = JSON.stringify(packet).toLowerCase();
      if (searchable.includes(query.toLowerCase())) {
        results.push(packet);
      }
    }
    
    return results;
  }

  /**
   * Get the most recent packet.
   */
  async latest(): Promise<ImprintPacket | null> {
    const packets = await this.list();
    
    if (packets.length === 0) {
      return null;
    }
    
    /* Sort by timestamp descending */
    const sorted = packets.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return this.load(sorted[0].id);
  }

  /**
   * Update the index with a new packet.
   */
  private async updateIndex(packet: ImprintPacket): Promise<void> {
    const indexPath = path.join(this.storageDir, "index.json");
    
    /* Read current index */
    let index: { packets: Array<{ id: string; timestamp: string; trigger: string }> };
    try {
      const content = await fs.readFile(indexPath, "utf-8");
      index = JSON.parse(content);
    } catch {
      index = { packets: [] };
    }
    
    /* Add entry */
    index.packets.push({
      id: packet.id,
      timestamp: packet.generatedAt.toISOString(),
      trigger: packet.trigger,
    });
    
    /* Write back */
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf-8");
  }
}

/**
 * Interface for storage implementations.
 * (Defined in types.ts, re-exported here for convenience)
 */
export type { ImprintStorage } from "../types.js";
