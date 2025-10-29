import { Component, signal } from '@angular/core';
import { contentCache } from '../../../utils/idb';

@Component({
  selector: 'app-cache',
  imports: [],
  templateUrl: './cache.component.html',
  styleUrl: './cache.component.scss'
})
export class CacheComponent {
  private readonly ASSETS_TO_CACHE = ['/api/test.json'];

  statusMessage = signal<string>('Ready');
  isLoading = signal<boolean>(false);

  async loadAssets(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.statusMessage.set(`Loading ${this.ASSETS_TO_CACHE.length} asset(s)...`);

      let successCount = 0;
      let failCount = 0;

      for (const url of this.ASSETS_TO_CACHE) {
        try {
          const response = await fetch(url, { cache: 'no-cache' });

          if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status}`);
          }

          const blob = await response.blob();
          const type = response.headers.get('Content-Type') || blob.type || 'application/octet-stream';
          const etag = response.headers.get('ETag') || undefined;

          await contentCache.putAsset({
            url: url.startsWith('/') ? url.slice(1) : url,
            blob,
            type,
            size: blob.size,
            etag
          });

          successCount++;
          this.statusMessage.set(`Cached ${successCount}/${this.ASSETS_TO_CACHE.length}...`);
        } catch (error) {
          console.error(`Failed to cache ${url}:`, error);
          failCount++;
        }
      }

      this.statusMessage.set(
        `Done! Cached: ${successCount}, Failed: ${failCount}`
      );
    } catch (error) {
      console.error('Error loading assets:', error);
      this.statusMessage.set(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async clearCache(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.statusMessage.set('Clearing cache...');

      await contentCache.clearAllAssets();

      this.statusMessage.set('All cached assets cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.statusMessage.set(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}

