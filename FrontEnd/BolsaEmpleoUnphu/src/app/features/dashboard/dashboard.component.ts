import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h1>¡Bienvenido, {{ currentUser?.nombreCompleto }}!</h1>
        <div class="quick-stats">
          <div class="stat-item" *ngIf="isStudent()">
            <span class="stat-number">{{ stats.postulaciones }}</span>
            <span class="stat-label">Postulaciones</span>
          </div>
          <div class="stat-item" *ngIf="isCompany()">
            <span class="stat-number">{{ stats.vacantes }}</span>
            <span class="stat-label">Vacantes Activas</span>
          </div>
          <div class="stat-item" *ngIf="isAdmin()">
            <span class="stat-number">{{ stats.empresasPendientes }}</span>
            <span class="stat-label">Empresas Pendientes</span>
          </div>
        </div>
      </div>

      <!-- Dashboard Content by Role -->
      <div class="dashboard-content">
        
        <!-- ESTUDIANTE/EGRESADO DASHBOARD -->
        <div *ngIf="isStudent()" class="student-dashboard">
          <div class="dashboard-grid">
            <!-- Vacantes Recientes -->
            <div class="widget large">
              <div class="widget-header">
                <h3>Vacantes Recientes</h3>
                <a routerLink="/vacantes" class="view-all">Ver todas</a>
              </div>
              <div class="vacantes-list">
                <div class="vacante-item" *ngFor="let vacante of recentVacantes">
                  <div class="vacante-info">
                    <h4>{{ vacante.titulo }}</h4>
                    <p>{{ vacante.empresa }}</p>
                    <span class="vacante-location">{{ vacante.ubicacion }}</span>
                  </div>
                  <button class="btn-apply">Postular</button>
                </div>
                <div *ngIf="recentVacantes.length === 0" class="empty-state">
                  <p>No hay vacantes disponibles</p>
                </div>
              </div>
            </div>

            <!-- Mis Postulaciones -->
            <div class="widget">
              <div class="widget-header">
                <h3>Mis Postulaciones</h3>
                <a routerLink="/postulaciones" class="view-all">Ver todas</a>
              </div>
              <div class="postulaciones-summary">
                <div class="status-item">
                  <span class="status-count">{{ stats.postulacionesPendientes }}</span>
                  <span class="status-label">Pendientes</span>
                </div>
                <div class="status-item">
                  <span class="status-count">{{ stats.postulacionesRevisadas }}</span>
                  <span class="status-label">En Revisión</span>
                </div>
              </div>
            </div>

            <!-- Perfil Incompleto -->
            <div class="widget alert" *ngIf="!perfilCompleto">
              <div class="widget-header">
                <h3>Completa tu Perfil</h3>
              </div>
              <div class="profile-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="perfilProgreso"></div>
                </div>
                <p>{{ perfilProgreso }}% completado</p>
                <button routerLink="/perfil" class="btn-primary">Completar Perfil</button>
              </div>
            </div>
          </div>
        </div>

        <!-- EMPRESA DASHBOARD -->
        <div *ngIf="isCompany()" class="company-dashboard">
          <div class="dashboard-grid">
            <!-- Mis Vacantes -->
            <div class="widget large">
              <div class="widget-header">
                <h3>Mis Vacantes</h3>
                <button class="btn-primary">+ Nueva Vacante</button>
              </div>
              <div class="vacantes-empresa">
                <div class="vacante-empresa-item" *ngFor="let vacante of misVacantes">
                  <div class="vacante-info">
                    <h4>{{ vacante.titulo }}</h4>
                    <p>{{ vacante.postulaciones }} postulaciones</p>
                  </div>
                  <div class="vacante-actions">
                    <button class="btn-action">Editar</button>
                    <button class="btn-action">Ver</button>
                  </div>
                </div>
                <div *ngIf="misVacantes.length === 0" class="empty-state">
                  <p>No tienes vacantes publicadas</p>
                  <button class="btn-primary">Crear Primera Vacante</button>
                </div>
              </div>
            </div>

            <!-- Postulaciones Recibidas -->
            <div class="widget">
              <div class="widget-header">
                <h3>Postulaciones Recientes</h3>
              </div>
              <div class="postulaciones-recibidas">
                <div class="postulacion-item" *ngFor="let postulacion of postulacionesRecientes">
                  <div class="candidato-info">
                    <h5>{{ postulacion.candidato }}</h5>
                    <p>{{ postulacion.vacante }}</p>
                  </div>
                  <span class="fecha">{{ postulacion.fecha }}</span>
                </div>
              </div>
            </div>

            <!-- Estadísticas -->
            <div class="widget">
              <div class="widget-header">
                <h3>Estadísticas</h3>
              </div>
              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-number">{{ stats.totalPostulaciones }}</span>
                  <span class="stat-label">Total Postulaciones</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">{{ stats.vacantesActivas }}</span>
                  <span class="stat-label">Vacantes Activas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ADMIN DASHBOARD -->
        <div *ngIf="isAdmin()" class="admin-dashboard">
          <div class="dashboard-grid">
            <!-- Empresas Pendientes -->
            <div class="widget large">
              <div class="widget-header">
                <h3>Empresas Pendientes de Aprobación</h3>
              </div>
              <div class="empresas-pendientes">
                <div class="empresa-item" *ngFor="let empresa of empresasPendientes">
                  <div class="empresa-info">
                    <h4>{{ empresa.nombre }}</h4>
                    <p>{{ empresa.correo }}</p>
                    <span class="fecha">Registrada: {{ empresa.fechaRegistro }}</span>
                  </div>
                  <div class="empresa-actions">
                    <button class="btn-success" (click)="aprobarEmpresa(empresa.id)">Aprobar</button>
                    <button class="btn-danger" (click)="rechazarEmpresa(empresa.id)">Rechazar</button>
                  </div>
                </div>
                <div *ngIf="empresasPendientes.length === 0" class="empty-state">
                  <p>No hay empresas pendientes de aprobación</p>
                </div>
              </div>
            </div>

            <!-- Estadísticas Generales -->
            <div class="widget">
              <div class="widget-header">
                <h3>Estadísticas del Sistema</h3>
              </div>
              <div class="admin-stats">
                <div class="admin-stat-item">
                  <span class="stat-number">{{ stats.totalUsuarios }}</span>
                  <span class="stat-label">Total Usuarios</span>
                </div>
                <div class="admin-stat-item">
                  <span class="stat-number">{{ stats.totalVacantes }}</span>
                  <span class="stat-label">Total Vacantes</span>
                </div>
                <div class="admin-stat-item">
                  <span class="stat-number">{{ stats.totalEmpresas }}</span>
                  <span class="stat-label">Empresas Activas</span>
                </div>
              </div>
            </div>

            <!-- Gestión Rápida -->
            <div class="widget">
              <div class="widget-header">
                <h3>Gestión Rápida</h3>
              </div>
              <div class="quick-actions">
                <button class="action-btn">Gestionar Usuarios</button>
                <button class="action-btn">Gestionar Categorías</button>
                <button class="action-btn">Ver Reportes</button>
                <button class="action-btn">Configuración</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      background: var(--unphu-background);
    }
    
    /* Welcome Section */
    .welcome-section {
      background: white;
      padding: 2rem;
      margin-bottom: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .welcome-section h1 {
      color: var(--unphu-blue-dark);
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }
    .quick-stats {
      display: flex;
      gap: 2rem;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--unphu-blue-dark);
    }
    .stat-label {
      font-size: 0.875rem;
      color: #666;
    }
    
    /* Dashboard Content */
    .dashboard-content {
      padding: 2rem;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    
    /* Widgets */
    .widget {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .widget.large {
      grid-column: span 2;
    }
    .widget.alert {
      border-left: 4px solid #ff6b6b;
    }
    .widget-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .widget-header h3 {
      margin: 0;
      color: var(--unphu-blue-dark);
      font-weight: 600;
    }
    .view-all {
      color: var(--unphu-blue-dark);
      text-decoration: none;
      font-weight: 500;
    }
    
    /* Buttons */
    .btn-primary {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-primary:hover {
      background: #0a2a3f;
    }
    .btn-secondary {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .btn-action {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      margin-left: 0.5rem;
      transition: background 0.3s;
    }
    .btn-action:hover {
      background: #0a2a3f;
    }
    .btn-action:first-child {
      margin-left: 0;
    }
    .btn-success {
      background: var(--unphu-green-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    /* Vacantes */
    .vacantes-list {
      padding: 1.5rem;
    }
    .vacante-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }
    .vacante-item:last-child {
      border-bottom: none;
    }
    .vacante-info h4 {
      margin: 0 0 0.25rem 0;
      color: var(--unphu-blue-dark);
    }
    .vacante-info p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }
    .vacante-location {
      color: var(--unphu-blue-dark);
      font-size: 0.875rem;
    }
    .btn-apply {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    /* Empty States */
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    /* Progress */
    .profile-progress {
      padding: 1.5rem;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    .progress-fill {
      height: 100%;
      background: var(--unphu-green-primary);
      transition: width 0.3s;
    }
    
    /* Stats */
    .postulaciones-summary {
      display: flex;
      padding: 1.5rem;
      gap: 2rem;
    }
    .status-item {
      text-align: center;
    }
    .status-count {
      display: block;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--unphu-blue-dark);
    }
    .status-label {
      font-size: 0.875rem;
      color: #666;
    }
    
    /* Admin specific */
    .empresa-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .empresa-actions {
      display: flex;
      gap: 0.5rem;
    }
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      padding: 1.5rem;
    }
    .action-btn {
      padding: 0.75rem;
      background: var(--unphu-background);
      border: 1px solid #dee2e6;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .action-btn:hover {
      background: #e9ecef;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  
  // Mock data - replace with real API calls
  stats = {
    postulaciones: 3,
    vacantes: 5,
    empresasPendientes: 2,
    postulacionesPendientes: 2,
    postulacionesRevisadas: 1,
    totalPostulaciones: 15,
    vacantesActivas: 3,
    totalUsuarios: 150,
    totalVacantes: 45,
    totalEmpresas: 12
  };
  
  perfilCompleto = false;
  perfilProgreso = 65;
  
  recentVacantes = [
    { titulo: 'Desarrollador Frontend', empresa: 'TechCorp', ubicacion: 'Santo Domingo' },
    { titulo: 'Analista de Datos', empresa: 'DataSoft', ubicacion: 'Santiago' },
    { titulo: 'Diseñador UX/UI', empresa: 'CreativeStudio', ubicacion: 'Remoto' }
  ];
  
  misVacantes = [
    { titulo: 'Desarrollador Backend', postulaciones: 8 },
    { titulo: 'Project Manager', postulaciones: 12 }
  ];
  
  postulacionesRecientes = [
    { candidato: 'Juan Pérez', vacante: 'Desarrollador Frontend', fecha: 'Hace 2 horas' },
    { candidato: 'María García', vacante: 'Analista de Datos', fecha: 'Hace 1 día' }
  ];
  
  empresasPendientes = [
    { id: 1, nombre: 'TechStart SRL', correo: 'info@techstart.com', fechaRegistro: '2024-01-15' },
    { id: 2, nombre: 'InnovaCorp', correo: 'contacto@innovacorp.com', fechaRegistro: '2024-01-14' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadDashboardData();
    });
  }
  
  loadDashboardData(): void {
    // TODO: Load real data based on user role
    if (this.isStudent()) {
      // Load student data
    } else if (this.isCompany()) {
      // Load company data
    } else if (this.isAdmin()) {
      // Load admin data
    }
  }
  
  isStudent(): boolean {
    return this.currentUser?.rol === 'Estudiante' || this.currentUser?.rol === 'Egresado';
  }
  
  isCompany(): boolean {
    return this.currentUser?.rol === 'Empresa';
  }
  
  isAdmin(): boolean {
    return this.currentUser?.rol === 'Admin';
  }
  
  getRoleDisplayName(): string {
    switch (this.currentUser?.rol) {
      case 'Estudiante': return 'Estudiante UNPHU';
      case 'Egresado': return 'Egresado UNPHU';
      case 'Empresa': return 'Empresa';
      case 'Admin': return 'Administrador';
      default: return 'Usuario';
    }
  }
  
  aprobarEmpresa(empresaId: number): void {
    // TODO: Call API to approve company
    console.log('Aprobando empresa:', empresaId);
    this.empresasPendientes = this.empresasPendientes.filter(e => e.id !== empresaId);
    this.stats.empresasPendientes--;
  }
  
  rechazarEmpresa(empresaId: number): void {
    // TODO: Call API to reject company
    console.log('Rechazando empresa:', empresaId);
    this.empresasPendientes = this.empresasPendientes.filter(e => e.id !== empresaId);
    this.stats.empresasPendientes--;
  }
}