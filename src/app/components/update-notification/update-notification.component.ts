import { Component, inject } from '@angular/core';
import { SwUpdateService } from '../../services/sw-update.service';

@Component({
  selector: 'app-update-notification',
  imports: [],
  templateUrl: './update-notification.component.html',
  styleUrl: './update-notification.component.scss'
})
export class UpdateNotificationComponent {
  private swUpdateService = inject(SwUpdateService);

  readonly updateAvailable = this.swUpdateService.updateAvailable;

  async applyUpdate(): Promise<void> {
    try {
      await this.swUpdateService.applyUpdate();
    } catch (error) {
      alert('Failed to update the application. Please refresh the page manually.');
    }
  }
}
