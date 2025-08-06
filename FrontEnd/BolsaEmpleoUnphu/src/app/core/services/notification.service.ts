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
      // Cargar notificaciones primero
      this.loadNotifications();
      
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(environment.signalRUrl, {
          accessTokenFactory: () => this.authService.getToken() || ''
        })
        .build();

      this.hubConnection.start()
        .then(() => {
          console.log('SignalR Connected');
        })
        .catch(err => {
          console.error('SignalR Connection Error: ', err);
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

  public loadNotifications(): void {
    this.http.get<Notificacion[]>(`${environment.apiUrl}/notificaciones`)
      .subscribe({
        next: (notifications) => {
          console.log('Notificaciones cargadas:', notifications);
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount();
        },
        error: (err) => {
          console.error('Error cargando notificaciones:', err);
        }
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

  isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  private updateUnreadCount(): void {
    this.getUnreadCount().subscribe(response => {
      this.unreadCountSubject.next(response.noLeidas);
    });
  }
}