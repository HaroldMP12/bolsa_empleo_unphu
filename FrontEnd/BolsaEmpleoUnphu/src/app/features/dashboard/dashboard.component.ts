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
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenido, {{ currentUser?.nombreCompleto }}</p>
      </div>
      
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
      padding: 2rem;
    }
    .dashboard-header {
      margin-bottom: 2rem;
    }
    .dashboard-header h1 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
    }
    .dashboard-header p {
      color: #666;
      margin: 0;
      font-size: 1.1rem;
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
      color: var(--unphu-green-primary);
      margin-top: 0;
      font-weight: 600;
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