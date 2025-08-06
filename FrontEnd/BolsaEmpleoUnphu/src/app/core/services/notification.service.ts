import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Notificacion {
  notificacionID: number;
  mensaje: string;
  fechaEnvio: Date;
  estado: boolean;
  referenciaTipo?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection?: HubConnection;
  private notificationsSubject = new BehaviorSubject<Notificacion[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  startConnection(): void {
    if (this.authService.isAuthenticated()) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(environment.signalRUrl, {
          accessTokenFactory: () => this.authService.getToken() || '',
          skipNegotiation: true,
          transport: 1 // WebSockets
        })
        .build();

      this.hubConnection.start()
        .then(() => {
          console.log('SignalR Connected');
          this.loadNotifications();
        })
        .catch(err => {
          console.error('SignalR Connection Error: ', err);
          // Retry connection after 5 seconds
          setTimeout(() => this.startConnection(), 5000);
        });

      this.hubConnection.onclose(() => {
        console.log('SignalR Disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.startConnection(), 5000);
      });

      this.hubConnection.on('NuevaNotificacion', (notification) => {
        console.log('Nueva notificación recibida:', notification);
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next([notification, ...current]);
        this.updateUnreadCount();
      });
    }
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => console.error('Error stopping SignalR connection:', err));
    }
  }

  loadNotifications(): void {
    this.http.get<Notificacion[]>(`${environment.apiUrl}/notificaciones`)
      .subscribe(notifications => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      });
  }

  getUnreadCount(): Observable<{noLeidas: number}> {
    return this.http.get<{noLeidas: number}>(`${environment.apiUrl}/notificaciones/contador`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/notificaciones/${notificationId}/marcar-leida`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${environment.apiUrl}/notificaciones/marcar-todas-leidas`, {});
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/notificaciones/${notificationId}`);
  }

  private updateUnreadCount(): void {
    this.getUnreadCount().subscribe(response => {
      this.unreadCountSubject.next(response.noLeidas);
    });
  }
}