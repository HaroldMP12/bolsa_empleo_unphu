import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { AuthResponse } from '../core/models/auth.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1 routerLink="/">Bolsa de Empleo UNPHU</h1>
        </div>
        
        <nav class="nav" *ngIf="currentUser">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          
          <a *ngIf="currentUser.rol !== 'Empresa'" routerLink="/vacantes" routerLinkActive="active">Vacantes</a>
          
          <a *ngIf="currentUser.rol !== 'Empresa'" routerLink="/postulaciones" routerLinkActive="active">
            Mis Postulaciones
          </a>
          
          <a *ngIf="currentUser.rol === 'Empresa'" routerLink="/mis-vacantes" routerLinkActive="active">
            Mis Vacantes
          </a>
          
          <a routerLink="/perfil" routerLinkActive="active">Mi Perfil</a>
        </nav>
        
        <div class="user-menu" *ngIf="currentUser">
          <span class="user-name">{{ currentUser.nombreCompleto }}</span>
          <span class="user-role">{{ currentUser.rol }}</span>
          <button (click)="logout()" class="logout-btn">Salir</button>
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
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-name {
      font-weight: 500;
      color: #333;
    }
    .user-role {
      background: var(--unphu-blue-dark);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.3s;
    }
    .logout-btn:hover {
      background: #c82333;
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
export class HeaderComponent implements OnInit {
  currentUser: AuthResponse | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
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