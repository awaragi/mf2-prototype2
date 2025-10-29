// Shared Dexie wrapper for client and Service Worker
// Loads UMD Dexie bundle and exposes a small API for the simplified POC

// Initialize database and schema
import Dexie from 'dexie';

export interface AssetRecord {
  url: string;
  blob: Blob;
  type?: string;
  size?: number;
  etag?: string;
  expiresAt?: number;
}

/**
 * Content cache database manager
 */
class ContentCacheDB {
  private db: Dexie;

  constructor() {
    this.db = new Dexie('content-assets-db');
    this.db.version(1).stores({
      // Primary key url, simple indexes for timestamp
      assets: 'url, ts'
    });
  }


  /**
   * Put an asset into the DB
   * @param {Object} rec
   * @param {string} rec.url
   * @param {Blob} rec.blob
   * @param {string} [rec.type]
   * @param {number} [rec.size]
   * @param {string} [rec.etag]
   * @param {number} [rec.expiresAt]
   * @returns {Promise<void>}
   */
  public async putAsset(rec: AssetRecord): Promise<void> {
    const { url, blob } = rec || {};
    if (!url || !blob) throw new Error('putAsset requires {url, blob}');
    const type = rec.type || (blob && blob.type) || 'application/octet-stream';
    const size = rec.size ?? (blob && blob.size) ?? undefined;
    const ts = Date.now();
    await this.db.table('assets').put({
      url,
      blob,
      type,
      size,
      etag: rec.etag,
      expiresAt: rec.expiresAt,
      ts
    });
  }

  /**
   * Get an asset by URL
   * @param {string} url
   * @returns {Promise<null|{url:string, blob:Blob, type:string, size?:number, etag?:string, expiresAt?:number, ts:number}>}
   */
  public async getAsset(url: string): Promise<AssetRecord | null> {
    if (!url) {
      return null;
    }
    return this.db.table('assets').get(url);
  }

  /**
   * Clear all assets (POC convenience)
   * @returns {Promise<void>}
   */
  public async clearAllAssets(): Promise<void> {
    await this.db.table('assets').clear();
  }
}

// Export singleton instance
export const contentCache = new ContentCacheDB();
