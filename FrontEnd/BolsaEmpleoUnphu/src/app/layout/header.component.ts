import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { AuthResponse } from '../core/models/auth.models';
import { NotificationBellComponent } from '../shared/components/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1 routerLink="/">Bolsa de Empleo UNPHU</h1>
        </div>
        
        <nav class="nav" *ngIf="currentUser">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          
          <!-- Opciones para Estudiantes/Egresados -->
          <a *ngIf="currentUser.rol === 'Estudiante' || currentUser.rol === 'Egresado'" routerLink="/vacantes" routerLinkActive="active">Vacantes</a>
          <a *ngIf="currentUser.rol === 'Estudiante' || currentUser.rol === 'Egresado'" routerLink="/postulaciones" routerLinkActive="active">Mis Postulaciones</a>
          <a *ngIf="currentUser.rol === 'Estudiante' || currentUser.rol === 'Egresado'" routerLink="/mensajes" routerLinkActive="active">Mensajes</a>
          
          <!-- Opciones para Empresas -->
          <a *ngIf="currentUser.rol === 'Empresa'" routerLink="/mis-vacantes" routerLinkActive="active">Mis Vacantes</a>
          <a *ngIf="currentUser.rol === 'Empresa'" routerLink="/mensajes" routerLinkActive="active">Mensajes</a>
          
          <!-- Opciones para Admin -->
          <a *ngIf="currentUser.rol === 'Admin'" routerLink="/admin" routerLinkActive="active" class="admin-link">
            🛠️ Administración
          </a>
        </nav>
        
        <div class="user-menu" *ngIf="currentUser">
          <app-notification-bell></app-notification-bell>
          <div class="user-dropdown" [class.open]="dropdownOpen">
            <button class="user-button" (click)="toggleDropdown()">
              <span class="user-display">({{ currentUser.rol }}) {{ currentUser.nombreCompleto }}</span>
              <span class="dropdown-arrow" [class.rotated]="dropdownOpen">▼</span>
            </button>
            <div class="dropdown-menu" *ngIf="dropdownOpen">
              <a class="dropdown-item" (click)="goToProfile(); closeDropdown()">
                <span class="dropdown-icon">👤</span>
                Mi Perfil
              </a>
              <a class="dropdown-item logout" (click)="logout(); closeDropdown()">
                <span class="dropdown-icon">🚪</span>
                Cerrar Sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- MODAL CONFIRMACIÓN LOGOUT -->
    <div *ngIf="mostrarConfirmacionModal" class="modal-overlay" (click)="cerrarConfirmacion()">
      <div class="confirmation-modal" (click)="$event.stopPropagation()">
        <div class="confirmation-header">
          <h3>{{ confirmacionTitulo }}</h3>
        </div>
        <div class="confirmation-body">
          <p>{{ confirmacionMensaje }}</p>
        </div>
        <div class="confirmation-footer">
          <button class="btn-cancel" (click)="cerrarConfirmacion()">Cancelar</button>
          <button class="btn-confirm" (click)="confirmarAccion()">Confirmar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header {
      background: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .logo h1 {
      color: var(--unphu-blue-dark);
      margin: 0;
      font-size: 1.5rem;
      cursor: pointer;
      font-weight: 600;
    }
    .nav {
      display: flex;
      gap: 2rem;
    }
    .nav a {
      text-decoration: none;
      color: #666;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .nav a:hover, .nav a.active {
      background: rgba(15, 56, 90, 0.1);
      color: var(--unphu-blue-dark);
    }
    .admin-link {
      background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
      color: white !important;
      font-weight: 600;
    }
    .admin-link:hover {
      background: linear-gradient(135deg, #c0392b, #a93226) !important;
      color: white !important;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-dropdown {
      position: relative;
    }
    .user-button {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      color: #333;
      font-weight: 500;
    }
    .user-button:hover {
      background: rgba(15, 56, 90, 0.1);
    }
    .user-display {
      font-size: 0.9rem;
    }
    .dropdown-arrow {
      font-size: 0.8rem;
      transition: transform 0.2s;
      color: #666;
    }
    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 180px;
      z-index: 1001;
      margin-top: 0.5rem;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: #333;
      cursor: pointer;
      transition: background 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: 0.9rem;
    }
    .dropdown-item:hover {
      background: #f8f9fa;
    }
    .dropdown-item.logout {
      color: #dc3545;
      border-top: 1px solid #e0e0e0;
    }
    .dropdown-item.logout:hover {
      background: #fff5f5;
    }
    .dropdown-icon {
      font-size: 1rem;
    }
    
    /* Modal de Confirmación */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .confirmation-modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .confirmation-header {
      background: var(--unphu-green-primary);
      color: white;
      padding: 1.5rem;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .confirmation-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .confirmation-body {
      padding: 2rem;
      text-align: center;
    }
    .confirmation-body p {
      margin: 0;
      color: #666;
      line-height: 1.5;
      font-size: 1rem;
    }
    .confirmation-footer {
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-cancel {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .btn-cancel:hover {
      background: #e9ecef;
    }
    .btn-confirm {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .btn-confirm:hover {
      background: #0a2a3f;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: AuthResponse | null = null;
  dropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && !this.notificationService.isConnected()) {
        this.notificationService.startConnection();
      } else if (!user) {
        this.notificationService.stopConnection();
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  goToProfile(): void {
    // Ahora todos van al perfil unificado
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.mostrarConfirmacion(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      () => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    );
  }
  
  mostrarConfirmacionModal = false;
  confirmacionTitulo = '';
  confirmacionMensaje = '';
  confirmacionCallback: (() => void) | null = null;
  
  mostrarConfirmacion(titulo: string, mensaje: string, callback: () => void): void {
    this.confirmacionTitulo = titulo;
    this.confirmacionMensaje = mensaje;
    this.confirmacionCallback = callback;
    this.mostrarConfirmacionModal = true;
  }
  
  confirmarAccion(): void {
    if (this.confirmacionCallback) {
      this.confirmacionCallback();
    }
    this.cerrarConfirmacion();
  }
  
  cerrarConfirmacion(): void {
    this.mostrarConfirmacionModal = false;
    this.confirmacionTitulo = '';
    this.confirmacionMensaje = '';
    this.confirmacionCallback = null;
  }
}