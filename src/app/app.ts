import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpdateNotificationComponent } from './components/update-notification/update-notification.component';
import { CacheComponent } from './components/cache/cache.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UpdateNotificationComponent, CacheComponent, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('mf2-prototype2');
  private http = inject(HttpClient);

  protected readonly testData = toSignal(
    this.http.get<{ hello: string }>('/api/test.json')
  );
}
