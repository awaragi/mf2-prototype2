import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpdateNotificationComponent } from './components/update-notification/update-notification.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UpdateNotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('mf2-prototype2');
}
