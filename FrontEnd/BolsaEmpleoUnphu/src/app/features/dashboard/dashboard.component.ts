import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>Bolsa de Empleo UNPHU</h1>
        <div class="user-info">
          <span>Bienvenido, {{ currentUser?.nombreCompleto }}</span>
          <span class="role">{{ currentUser?.rol }}</span>
          <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
        </div>
      </header>
      
      <main class="main-content">
        <div class="dashboard-cards">
          <div class="card">
            <h3>Vacantes Disponibles</h3>
            <p>Explora las oportunidades laborales</p>
          </div>
          
          <div class="card" *ngIf="currentUser?.rol !== 'Empresa'">
            <h3>Mis Postulaciones</h3>
            <p>Revisa el estado de tus aplicaciones</p>
          </div>
          
          <div class="card" *ngIf="currentUser?.rol === 'Empresa'">
            <h3>Mis Vacantes</h3>
            <p>Gestiona tus ofertas de empleo</p>
          </div>
          
          <div class="card">
            <h3>Mi Perfil</h3>
            <p>Actualiza tu información personal</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    .header {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .role {
      background: #007bff;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    .btn-logout {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .main-content {
      padding: 2rem;
    }
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
    }
    h1 {
      color: #333;
      margin: 0;
    }
    h3 {
      color: #007bff;
      margin-top: 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
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