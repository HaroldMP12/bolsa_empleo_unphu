import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notificacion } from '../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-bell" (click)="toggleDropdown()">
      <div class="bell-icon">
        🔔
        <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </div>
      
      <div *ngIf="showDropdown" class="notification-dropdown" (click)="$event.stopPropagation()">
        <div class="dropdown-header">
          <h4>Notificaciones</h4>
          <button *ngIf="unreadCount > 0" (click)="markAllAsRead()" class="mark-all-btn">
            Marcar todas como leídas
          </button>
        </div>
        
        <div class="notifications-list">
          <div *ngIf="notifications.length === 0" class="no-notifications">
            No tienes notificaciones
          </div>
          
          <div *ngFor="let notification of notifications" 
               class="notification-item" 
               [class.unread]="!notification.estado">
            <div class="notification-content" (click)="markAsRead(notification)">
              <p class="notification-message">{{ notification.mensaje }}</p>
              <span class="notification-time">{{ formatTime(notification.fechaEnvio) }}</span>
            </div>
            <div class="notification-actions">
              <div *ngIf="!notification.estado" class="unread-dot"></div>
              <button class="delete-btn" (click)="deleteNotification(notification)" title="Eliminar notificación">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Overlay para cerrar dropdown -->
    <div *ngIf="showDropdown" class="dropdown-overlay" (click)="closeDropdown()"></div>
  `,
  styles: [`
    .notification-bell {
      position: relative;
      cursor: pointer;
    }
    
    .bell-icon {
      position: relative;
      font-size: 1.5rem;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    
    .bell-icon:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #dc3545;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 350px;
      max-height: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      border: 1px solid #e0e0e0;
    }
    
    .dropdown-header {
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .dropdown-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }
    
    .mark-all-btn {
      background: none;
      border: none;
      color: var(--unphu-blue-dark);
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: underline;
    }
    
    .mark-all-btn:hover {
      color: #0a2a3f;
    }
    
    .notifications-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .no-notifications {
      padding: 2rem;
      text-align: center;
      color: #666;
      font-style: italic;
    }
    
    .notification-item {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      transition: background-color 0.2s;
    }
    
    .notification-item:hover {
      background-color: #f8f9fa;
    }
    
    .notification-item.unread {
      background-color: #f0f8ff;
    }
    
    .notification-content {
      flex: 1;
      cursor: pointer;
    }
    
    .notification-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .delete-btn {
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.25rem;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: all 0.2s;
    }
    
    .delete-btn:hover {
      background: rgba(220, 53, 69, 0.1);
      opacity: 1;
    }
    
    .notification-message {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    
    .notification-time {
      color: #666;
      font-size: 0.8rem;
    }
    
    .unread-dot {
      width: 8px;
      height: 8px;
      background: var(--unphu-blue-dark);
      border-radius: 50%;
      margin-top: 0.25rem;
    }
    
    .dropdown-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notificacion[] = [];
  unreadCount = 0;
  showDropdown = false;
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Suscribirse a las notificaciones
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications; // Mostrar todas las notificaciones
      })
    );

    // Suscribirse al contador de no leídas
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );

    // Cargar contador inicial
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  markAsRead(notification: Notificacion): void {
    if (!notification.estado) {
      this.notificationService.markAsRead(notification.notificacionID).subscribe(() => {
        notification.estado = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.estado = true);
      this.unreadCount = 0;
    });
  }

  formatTime(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  }

  deleteNotification(notification: Notificacion): void {
    this.notificationService.deleteNotification(notification.notificacionID).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.notificacionID !== notification.notificacionID);
      if (!notification.estado) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe(response => {
      this.unreadCount = response.noLeidas;
    });
  }
}