import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {
  private swUpdate = inject(SwUpdate);

  readonly updateAvailable = signal(false);

  initialize(): void {
    if (this.swUpdate.isEnabled) {
      // Check for updates immediately
      this.checkForUpdate();

      // Check for updates every 5 seconds
      setInterval(() => {
        this.checkForUpdate();
      }, 5000);

      // Listen for available updates
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable.set(true);
        }
      });
    }
  }

  private async checkForUpdate(): Promise<void> {
    try {
      const updateAvailable = await this.swUpdate.checkForUpdate();
      if (updateAvailable) {
        console.log('Update available');
        this.updateAvailable.set(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  async applyUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
      // Reload the page to apply the update
      window.location.reload();
    } catch (error) {
      console.error('Error activating update:', error);
      throw error;
    }
  }
}
