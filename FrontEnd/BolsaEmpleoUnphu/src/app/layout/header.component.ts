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
          <a routerLink="/vacantes" routerLinkActive="active">Vacantes</a>
          
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
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.3s;
    }
    .logout-btn:hover {
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
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}