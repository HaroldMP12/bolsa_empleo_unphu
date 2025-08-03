import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Panel de Administración</h1>
        <p>Gestiona usuarios, empresas y configuraciones del sistema</p>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card" routerLink="/admin/empresas">
          <div class="card-icon">🏢</div>
          <h3>Gestión de Empresas</h3>
          <p>Aprobar/rechazar empresas registradas</p>
          <span class="card-action">Gestionar →</span>
        </div>

        <div class="dashboard-card" routerLink="/admin/usuarios">
          <div class="card-icon">👥</div>
          <h3>Gestión de Usuarios</h3>
          <p>Administrar usuarios y roles del sistema</p>
          <span class="card-action">Gestionar →</span>
        </div>

        <div class="dashboard-card" routerLink="/admin/categorias">
          <div class="card-icon">📂</div>
          <h3>Categorías</h3>
          <p>Gestionar categorías de vacantes</p>
          <span class="card-action">Gestionar →</span>
        </div>

        <div class="dashboard-card" routerLink="/admin/carreras">
          <div class="card-icon">🎓</div>
          <h3>Carreras</h3>
          <p>Administrar carreras universitarias</p>
          <span class="card-action">Gestionar →</span>
        </div>

        <div class="dashboard-card" routerLink="/admin/reportes">
          <div class="card-icon">📊</div>
          <h3>Reportes</h3>
          <p>Estadísticas y reportes del sistema</p>
          <span class="card-action">Ver →</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #e1e8ed;
    }

    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .dashboard-card h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .dashboard-card p {
      color: #7f8c8d;
      margin-bottom: 1.5rem;
    }

    .card-action {
      color: #3498db;
      font-weight: 600;
    }
  `]
})
export class AdminDashboardComponent {}