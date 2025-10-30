import { Component, signal } from '@angular/core';
import { cacheResource, clearAllCache } from '../../../utils/cache';

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
          await cacheResource(url);
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

      await clearAllCache();

      this.statusMessage.set('All cached assets cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.statusMessage.set(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}

