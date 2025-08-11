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
        <div class="logo-section">
          <div class="logo" routerLink="/">
            <div class="logo-icon">🎓</div>
            <div class="logo-text">
              <h1>Bolsa de Empleo</h1>
              <span class="university">UNPHU</span>
            </div>
          </div>
        </div>
        
        <nav class="nav" *ngIf="currentUser">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          
          <!-- Opciones para Estudiantes/Egresados -->
          <a *ngIf="currentUser.rol === 'Estudiante' || currentUser.rol === 'Egresado'" 
             routerLink="/vacantes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💼</span>
            <span>Vacantes</span>
          </a>
          <a *ngIf="currentUser.rol === 'Estudiante' || currentUser.rol === 'Egresado'" 
             routerLink="/postulaciones" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span>
            <span>Postulaciones</span>
          </a>
          <a *ngIf="currentUser.rol === 'Estudiante' || currentUser.rol === 'Egresado'" 
             routerLink="/mensajes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💬</span>
            <span>Mensajes</span>
          </a>
          
          <!-- Opciones para Empresas -->
          <a *ngIf="currentUser.rol === 'Empresa'" 
             routerLink="/mis-vacantes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📝</span>
            <span>Mis Vacantes</span>
          </a>
          <a *ngIf="currentUser.rol === 'Empresa'" 
             routerLink="/mensajes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💬</span>
            <span>Mensajes</span>
          </a>
          
          <!-- Opciones para Admin -->
          <a *ngIf="currentUser.rol === 'Admin'" 
             routerLink="/admin" routerLinkActive="active" class="nav-item admin-link">
            <span class="nav-icon">⚙️</span>
            <span>Administración</span>
          </a>
        </nav>
        
        <div class="user-section" *ngIf="currentUser">
          <app-notification-bell></app-notification-bell>
          <div class="user-dropdown" [class.open]="dropdownOpen">
            <button class="user-button" (click)="toggleDropdown()">
              <div class="user-avatar">{{ getUserInitials() }}</div>
              <div class="user-info">
                <span class="user-name">{{ currentUser.nombreCompleto }}</span>
                <span class="user-role">{{ currentUser.rol }}</span>
              </div>
              <span class="dropdown-arrow" [class.rotated]="dropdownOpen">▼</span>
            </button>
            <div class="dropdown-menu" *ngIf="dropdownOpen">
              <a class="dropdown-item" (click)="goToProfile(); closeDropdown()">
                <span class="dropdown-icon">👤</span>
                <span>Mi Perfil</span>
              </a>
              <a class="dropdown-item logout" (click)="logout(); closeDropdown()">
                <span class="dropdown-icon">🚪</span>
                <span>Cerrar Sesión</span>
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
      background: linear-gradient(135deg, #2E8B57, #228B22);
      box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }
    
    /* Logo Section */
    .logo-section {
      flex-shrink: 0;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .logo:hover {
      transform: scale(1.02);
    }
    .logo-icon {
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    .logo-text h1 {
      color: white;
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1.2;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .university {
      color: rgba(255,255,255,0.9);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    /* Navigation */
    .nav {
      display: flex;
      gap: 0.5rem;
      flex: 1;
      justify-content: center;
      max-width: 600px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: rgba(255,255,255,0.9);
      font-weight: 500;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-size: 1rem;
      position: relative;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.15);
      color: white;
      transform: translateY(-1px);
    }
    .nav-item.active {
      background: rgba(255,255,255,0.2);
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .nav-icon {
      font-size: 1.1rem;
    }
    .admin-link {
      background: rgba(220, 53, 69, 0.9) !important;
      color: white !important;
    }
    .admin-link:hover {
      background: rgba(220, 53, 69, 1) !important;
      transform: translateY(-1px);
    }
    
    /* User Section */
    .user-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }
    .user-dropdown {
      position: relative;
    }
    .user-button {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: white;
    }
    .user-button:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fff, #f0f0f0);
      color: #2E8B57;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.2;
    }
    .user-role {
      font-size: 0.75rem;
      opacity: 0.8;
      font-weight: 400;
    }
    .dropdown-arrow {
      font-size: 0.7rem;
      transition: transform 0.3s ease;
      opacity: 0.8;
    }
    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: white;
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      min-width: 200px;
      z-index: 1001;
      overflow: hidden;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      text-decoration: none;
      color: #333;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .dropdown-item:hover {
      background: #f8f9fa;
      color: #2E8B57;
    }
    .dropdown-item.logout {
      color: #dc3545;
      border-top: 1px solid #f0f0f0;
    }
    .dropdown-item.logout:hover {
      background: #fff5f5;
      color: #c82333;
    }
    .dropdown-icon {
      font-size: 1.1rem;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .header-content {
        padding: 0 1rem;
        height: 60px;
      }
      .logo-text h1 {
        font-size: 1.2rem;
      }
      .university {
        font-size: 0.7rem;
      }
      .nav {
        display: none;
      }
      .user-info {
        display: none;
      }
      .user-button {
        padding: 0.4rem 0.8rem;
      }
    }
    
    @media (max-width: 480px) {
      .header-content {
        padding: 0 0.5rem;
      }
      .logo-text h1 {
        font-size: 1rem;
      }
      .logo-icon {
        font-size: 1.5rem;
      }
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

  getUserInitials(): string {
    if (!this.currentUser?.nombreCompleto) return 'U';
    const names = this.currentUser.nombreCompleto.split(' ');
    return names.length >= 2 
      ? (names[0][0] + names[1][0]).toUpperCase()
      : names[0][0].toUpperCase();
  }
}