import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection?: HubConnection;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private authService: AuthService) {}

  startConnection(): void {
    if (this.authService.isAuthenticated()) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(environment.signalRUrl, {
          accessTokenFactory: () => this.authService.getToken() || ''
        })
        .build();

      this.hubConnection.start()
        .then(() => console.log('SignalR Connected'))
        .catch(err => console.error('SignalR Connection Error: ', err));

      this.hubConnection.on('ReceiveNotification', (notification) => {
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next([notification, ...current]);
      });
    }
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}