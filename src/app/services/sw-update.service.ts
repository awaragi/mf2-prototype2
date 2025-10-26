import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {
  private swUpdate = inject(SwUpdate);

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
          this.promptUserToUpdate();
        }
      });
    }
  }

  private async checkForUpdate(): Promise<void> {
    try {
      const updateAvailable = await this.swUpdate.checkForUpdate();
      if (updateAvailable) {
        console.log('Update available');
        this.promptUserToUpdate();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  private promptUserToUpdate(): void {
    const updateConfirmed = confirm(
      'A new version of the application is available. Would you like to update now? The page will be refreshed.'
    );

    if (updateConfirmed) {
      this.activateUpdate();
    }
  }

  private async activateUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
      // Reload the page to apply the update
      window.location.reload();
    } catch (error) {
      console.error('Error activating update:', error);
      alert('Failed to update the application. Please refresh the page manually.');
    }
  }
}
