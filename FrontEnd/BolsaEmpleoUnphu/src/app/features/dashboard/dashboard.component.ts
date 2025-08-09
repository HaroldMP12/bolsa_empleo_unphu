import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
import { DataSyncService } from '../../core/services/data-sync.service';
import { AuthResponse } from '../../core/models/auth.models';
import { CreatePostulacionDto } from '../../core/models/postulacion.models';
import { ModalPostulacionComponent } from '../postulaciones/modal-postulacion.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalPostulacionComponent],
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
            <!-- Vacantes Recomendadas -->
            <div class="widget large recomendadas" *ngIf="vacantesRecomendadas.length > 0">
              <div class="widget-header">
                <h3>🎯 Recomendadas para ti</h3>
                <a routerLink="/vacantes" class="view-all">Ver todas</a>
              </div>
              <div class="recomendacion-info">
                <p>Basadas en tu carrera: <strong>{{ carreraUsuario }}</strong></p>
              </div>
              <div class="vacantes-list">
                <div class="vacante-item recomendada" *ngFor="let vacante of vacantesRecomendadas">
                  <div class="vacante-info">
                    <h4>{{ vacante.titulo }}</h4>
                    <p>{{ vacante.empresa }}</p>
                    <span class="vacante-location">{{ vacante.ubicacion }}</span>
                    <span class="recomendacion-badge">Recomendada</span>
                  </div>
                  <button class="btn-apply" (click)="postularse(vacante)">Postular</button>
                </div>
              </div>
            </div>

            <!-- Vacantes Recientes -->
            <div class="widget large">
              <div class="widget-header">
                <h3>{{ vacantesRecomendadas.length > 0 ? 'Otras Vacantes' : 'Vacantes Recientes' }}</h3>
                <a routerLink="/vacantes" class="view-all">Ver todas</a>
              </div>
              <div class="vacantes-list">
                <div class="vacante-item" *ngFor="let vacante of recentVacantes">
                  <div class="vacante-info">
                    <h4>{{ vacante.titulo }}</h4>
                    <p>{{ vacante.empresa }}</p>
                    <span class="vacante-location">{{ vacante.ubicacion }}</span>
                  </div>
                  <button class="btn-apply" (click)="postularse(vacante)">Postular</button>
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
                <button class="btn-primary" routerLink="/mis-vacantes">+ Nueva Vacante</button>
              </div>
              <div class="vacantes-empresa">
                <div class="vacante-empresa-item" *ngFor="let vacante of misVacantes">
                  <div class="vacante-info">
                    <h4>{{ vacante.titulo }}</h4>
                    <p>{{ vacante.postulaciones }} postulaciones</p>
                  </div>
                  <div class="vacante-actions">
                    <button class="btn-action" routerLink="/mis-vacantes">Ver Todas</button>
                  </div>
                </div>
                <div *ngIf="misVacantes.length === 0" class="empty-state">
                  <p>No tienes vacantes publicadas</p>
                  <button class="btn-primary" routerLink="/mis-vacantes">Crear Primera Vacante</button>
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
                    <span class="fecha">Registrada: {{ empresa.fechaRegistro | date:'dd/MM/yyyy' }}</span>
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
              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-number">{{ stats.totalUsuarios }}</span>
                  <span class="stat-label">Total Usuarios</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">{{ stats.totalVacantes }}</span>
                  <span class="stat-label">Total Vacantes</span>
                </div>
                <div class="stat-card">
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
                <button class="action-btn" (click)="navegarUsuarios()">Gestionar Usuarios</button>
                <button class="action-btn" (click)="navegarCategorias()">Gestionar Categorías</button>
                <button class="action-btn" (click)="navegarReportes()">Ver Reportes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL POSTULACIÓN -->
    <app-modal-postulacion
      *ngIf="mostrarModalPostulacion"
      [vacante]="vacanteSeleccionada"
      (cerrarModal)="cerrarModalPostulacion()"
      (postulacionEnviada)="procesarPostulacion($event)">
    </app-modal-postulacion>
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
    
    /* Company Dashboard Specific */
    .company-dashboard .dashboard-grid {
      grid-template-columns: 2fr 1fr 1fr;
    }
    
    @media (max-width: 1200px) {
      .company-dashboard .dashboard-grid {
        grid-template-columns: 1fr;
      }
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
    .vacantes-list, .vacantes-empresa {
      padding: 1.5rem;
    }
    .vacante-item, .vacante-empresa-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }
    .vacante-item:last-child, .vacante-empresa-item:last-child {
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
    .vacante-actions {
      display: flex;
      gap: 0.5rem;
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
    .postulaciones-summary, .stats-grid {
      display: flex;
      padding: 1.5rem;
      gap: 2rem;
      justify-content: space-around;
    }
    .status-item, .stat-card {
      text-align: center;
      flex: 1;
    }
    .status-count, .stat-card .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--unphu-blue-dark);
    }
    .status-label, .stat-card .stat-label {
      font-size: 0.875rem;
      color: #666;
    }
    
    /* Postulaciones Recibidas */
    .postulaciones-recibidas {
      padding: 1.5rem;
    }
    .postulacion-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }
    .postulacion-item:last-child {
      border-bottom: none;
    }
    .candidato-info h5 {
      margin: 0 0 0.25rem 0;
      color: var(--unphu-blue-dark);
      font-size: 1rem;
    }
    .candidato-info p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }
    .fecha {
      color: #666;
      font-size: 0.875rem;
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
      gap: 1rem;
      padding: 1.5rem;
    }
    .action-btn {
      padding: 1rem;
      background: white;
      border: 1px solid var(--unphu-blue-dark);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      color: var(--unphu-blue-dark);
      font-weight: 500;
      text-align: center;
    }
    .action-btn:hover {
      background: var(--unphu-blue-dark);
      color: white;
    }
    
    /* Recomendaciones */
    .widget.recomendadas {
      border: 2px solid var(--unphu-green-primary);
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    .recomendacion-info {
      padding: 0 1.5rem;
      color: #666;
      font-size: 0.9rem;
    }
    .recomendacion-info p {
      margin: 0;
    }
    .vacante-item.recomendada {
      position: relative;
    }
    .recomendacion-badge {
      background: var(--unphu-green-primary);
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }
    
    /* Usar el mismo formato de stats para admin */
    .admin-dashboard .stats-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
    }
    
    .admin-dashboard .stat-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: AuthResponse | null = null;
  
  stats = {
    postulaciones: 0,
    vacantes: 0,
    empresasPendientes: 2,
    postulacionesPendientes: 0,
    postulacionesRevisadas: 0,
    totalPostulaciones: 0,
    vacantesActivas: 0,
    totalUsuarios: 150,
    totalVacantes: 0,
    totalEmpresas: 12
  };
  
  perfilCompleto = false;
  perfilProgreso = 0;
  
  recentVacantes: any[] = [];
  vacantesRecomendadas: any[] = [];
  carreraUsuario = '';
  misVacantes: any[] = [];
  postulacionesRecientes: any[] = [];
  mostrarModalPostulacion = false;
  vacanteSeleccionada: any = null;
  
  empresasPendientes = [
    { id: 1, nombre: 'TechStart SRL', correo: 'info@techstart.com', fechaRegistro: '2024-01-15' },
    { id: 2, nombre: 'InnovaCorp', correo: 'contacto@innovacorp.com', fechaRegistro: '2024-01-14' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private perfilService: PerfilService,
    private dataSyncService: DataSyncService,
    private router: Router
  ) {}
  


  ngOnInit(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadDashboardData();
    });
    this.subscriptions.push(userSub);
    
    // Subscribe to data changes
    const vacantesSub = this.dataSyncService.vacantes$.subscribe(() => {
      this.loadDashboardData();
    });
    this.subscriptions.push(vacantesSub);
    
    const postulacionesSub = this.dataSyncService.postulaciones$.subscribe(() => {
      this.loadDashboardData();
    });
    this.subscriptions.push(postulacionesSub);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadDashboardData(): void {
    if (!this.currentUser) return;

    if (this.isStudent()) {
      this.loadStudentData();
      this.loadStudentProfileProgress();
    } else if (this.isCompany()) {
      this.loadCompanyData();
      this.loadCompanyProfileProgress();
    } else if (this.isAdmin()) {
      this.loadAdminData();
    }
  }
  
  private loadStudentData(): void {
    if (!this.currentUser) return;
    
    const studentStats = this.dataSyncService.getStudentStats(this.currentUser.usuarioID);
    this.stats.postulaciones = studentStats.totalPostulaciones;
    this.stats.postulacionesPendientes = studentStats.pendientes;
    this.stats.postulacionesRevisadas = studentStats.enRevision;
    
    // Cargar vacantes recomendadas
    fetch('https://localhost:7236/api/vacantes/recomendadas', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(vacantesData => {
      this.vacantesRecomendadas = vacantesData.slice(0, 3).map((v: any) => ({
        ...v,
        titulo: v.tituloVacante,
        empresa: v.nombreEmpresa,
        fechaVencimiento: v.fechaCierre
      }));
      
      // Obtener carrera del usuario
      this.obtenerCarreraUsuario();
    })
    .catch(() => {
      this.vacantesRecomendadas = [];
    });
    
    // Cargar todas las vacantes
    fetch('https://localhost:7236/api/vacantes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(response => {
      const vacantes = response.data || response || [];
      // Filtrar vacantes que no están en recomendadas
      const vacantesNoRecomendadas = vacantes.filter((v: any) => 
        !this.vacantesRecomendadas.some(r => r.vacanteID === v.vacanteID)
      );
      
      this.recentVacantes = vacantesNoRecomendadas.slice(0, 3).map((v: any) => ({
        ...v,
        titulo: v.tituloVacante,
        empresa: v.nombreEmpresa,
        fechaVencimiento: v.fechaCierre
      }));
    })
    .catch(() => {
      this.recentVacantes = [];
    });
  }

  private obtenerCarreraUsuario(): void {
    if (this.currentUser?.usuarioID) {
      fetch(`https://localhost:7236/api/perfiles/usuario/${this.currentUser.usuarioID}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(perfil => {
        if (perfil && perfil.carrera) {
          this.carreraUsuario = perfil.carrera.nombreCarrera || 'No especificada';
        }
      })
      .catch(() => {
        this.carreraUsuario = 'No especificada';
      });
    }
  }
  
  private loadCompanyData(): void {
    if (!this.currentUser) return;
    
    // Cargar vacantes desde la API
    fetch(`https://localhost:7236/api/empresas/usuario/${this.currentUser.usuarioID}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(empresa => {
      if (empresa?.empresaID) {
        fetch(`https://localhost:7236/api/vacantes/empresa/${empresa.empresaID}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(response => {
          const vacantes = response.data || response || [];
          
          this.stats.vacantes = vacantes.length;
          this.stats.vacantesActivas = vacantes.filter((v: any) => new Date(v.fechaCierre) > new Date()).length;
          
          // Cargar postulaciones desde localStorage
          const todasPostulaciones = JSON.parse(localStorage.getItem('postulaciones') || '[]');
          const postulacionesEmpresa = [];
          
          for (const vacante of vacantes) {
            const postulacionesVacante = todasPostulaciones.filter((p: any) => p.vacanteID == vacante.vacanteID);
            postulacionesEmpresa.push(...postulacionesVacante.map((p: any) => ({ 
              ...p, 
              vacanteTitulo: vacante.tituloVacante 
            })));
          }
          
          this.stats.totalPostulaciones = postulacionesEmpresa.length;
          
          this.misVacantes = vacantes.slice(0, 3).map((v: any) => {
            const postulacionesVacante = todasPostulaciones.filter((p: any) => p.vacanteID == v.vacanteID);
            return {
              titulo: v.tituloVacante,
              postulaciones: postulacionesVacante.length
            };
          });
          
          // Cargar postulaciones recientes
          this.postulacionesRecientes = postulacionesEmpresa
            .sort((a: any, b: any) => new Date(b.fechaPostulacion).getTime() - new Date(a.fechaPostulacion).getTime())
            .slice(0, 5)
            .map((p: any) => {
              const usuario = JSON.parse(localStorage.getItem('usuarios') || '[]')
                .find((u: any) => u.usuarioID === p.usuarioID);
              
              return {
                candidato: usuario?.nombreCompleto || 'Usuario UNPHU',
                vacante: p.vacanteTitulo || 'Vacante',
                fecha: this.getTimeAgo(new Date(p.fechaPostulacion))
              };
            });
        });
      }
    });
  }
  
  private loadAdminData(): void {
    // Cargar usuarios
    fetch('https://localhost:7236/api/usuarios?pageSize=1000', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(response => {
      const usuarios = response.data || [];
      this.stats.totalUsuarios = usuarios.length;
    })
    .catch(() => this.stats.totalUsuarios = 0);
    
    // Cargar vacantes
    fetch('https://localhost:7236/api/vacantes?pageSize=1000', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(response => {
      const vacantes = response.data || [];
      this.stats.totalVacantes = vacantes.length;
    })
    .catch(() => this.stats.totalVacantes = 0);
    
    // Cargar empresas
    fetch('https://localhost:7236/api/empresas?pageSize=1000', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(response => {
      const empresas = response.data || [];
      this.stats.totalEmpresas = empresas.length;
    })
    .catch(() => this.stats.totalEmpresas = 0);
  }
  
  private getTimeAgo(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 60) {
      return `Hace ${minutos} minutos`;
    } else if (horas < 24) {
      return `Hace ${horas} horas`;
    } else {
      return `Hace ${dias} días`;
    }
  }

  private loadStudentProfileProgress(): void {
    this.perfilService.obtenerPerfilEstudiante(this.currentUser!.usuarioID).subscribe({
      next: (perfil) => {
        if (perfil && perfil.perfilID) {
          this.perfilProgreso = this.perfilService.calcularProgresoEstudiante(perfil);
          this.perfilCompleto = this.perfilProgreso >= 80;
        } else {
          // Usuario sin perfil completo, pero con datos básicos
          this.perfilProgreso = 20;
          this.perfilCompleto = false;
        }
      },
      error: () => {
        // Usuario sin perfil completo, pero con datos básicos
        this.perfilProgreso = 20;
        this.perfilCompleto = false;
      }
    });
  }

  private loadCompanyProfileProgress(): void {
    this.perfilService.obtenerPerfilEmpresa(this.currentUser!.usuarioID).subscribe({
      next: (empresa) => {
        if (empresa && empresa.empresaID) {
          this.perfilProgreso = this.perfilService.calcularProgresoEmpresa(empresa);
          this.perfilCompleto = this.perfilProgreso >= 80;
        } else {
          // Empresa sin perfil completo, pero con datos básicos
          this.perfilProgreso = 20;
          this.perfilCompleto = false;
        }
      },
      error: () => {
        // Empresa sin perfil completo, pero con datos básicos
        this.perfilProgreso = 20;
        this.perfilCompleto = false;
      }
    });
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
  
  postularse(vacante: any): void {
    this.vacanteSeleccionada = vacante;
    this.mostrarModalPostulacion = true;
  }
  
  cerrarModalPostulacion(): void {
    this.mostrarModalPostulacion = false;
    this.vacanteSeleccionada = null;
  }
  
  procesarPostulacion(postulacionDto: CreatePostulacionDto): void {
    const usuarioID = this.currentUser?.usuarioID || Date.now();
    const vacanteID = this.vacanteSeleccionada?.vacanteID;
    
    // Validar postulación duplicada
    const postulacionesExistentes = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    const yaPostulado = postulacionesExistentes.some((p: any) => 
      p.vacanteID == vacanteID && p.usuarioID == usuarioID
    );
    
    if (yaPostulado) {
      this.cerrarModalPostulacion();
      return;
    }
    const nuevaPostulacion = {
      postulacionID: Date.now(),
      vacanteID: this.vacanteSeleccionada?.vacanteID || postulacionDto.vacanteID,
      usuarioID: usuarioID,
      fechaPostulacion: new Date(),
      estado: 'Pendiente' as const,
      respuestas: postulacionDto.respuestas.map(r => ({
        postulacionID: Date.now(),
        preguntaID: r.preguntaID,
        pregunta: this.vacanteSeleccionada?.preguntas?.find((p: any) => p.preguntaID === r.preguntaID)?.pregunta || '',
        respuesta: r.respuesta
      })),
      vacante: {
        titulo: this.vacanteSeleccionada?.titulo || this.vacanteSeleccionada?.tituloVacante || '',
        empresa: this.vacanteSeleccionada?.empresa || this.vacanteSeleccionada?.nombreEmpresa || '',
        modalidad: this.vacanteSeleccionada?.modalidad || '',
        ubicacion: this.vacanteSeleccionada?.ubicacion || ''
      }
    };
    
    console.log('Postulación desde dashboard:', nuevaPostulacion);
    
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioExistente = usuariosGuardados.find((u: any) => u.usuarioID === usuarioID);
    
    if (!usuarioExistente && this.currentUser) {
      const datosUsuario = {
        usuarioID: usuarioID,
        nombreCompleto: this.currentUser.nombreCompleto,
        correo: this.currentUser.correo,
        telefono: '809-555-0000',
        carrera: 'Ingeniería en Sistemas'
      };
      usuariosGuardados.push(datosUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));
    }
    
    // Enviar postulación al backend
    const postulacionBackend = {
      VacanteID: this.vacanteSeleccionada?.vacanteID,
      UsuarioID: usuarioID,
      Observaciones: 'Postulación desde dashboard'
    };
    
    fetch('https://localhost:7236/api/postulaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(postulacionBackend)
    })
    .then(() => {
      // También guardar en localStorage para compatibilidad
      const postulacionesExistentes = JSON.parse(localStorage.getItem('postulaciones') || '[]');
      postulacionesExistentes.push(nuevaPostulacion);
      localStorage.setItem('postulaciones', JSON.stringify(postulacionesExistentes));
      
      this.dataSyncService.notifyPostulacionesChanged();
      this.cerrarModalPostulacion();
    })
    .catch((error) => {
      console.error('Error al enviar postulación:', error);
      this.cerrarModalPostulacion();
    });
  }

  aprobarEmpresa(empresaId: number): void {
    console.log('Aprobando empresa:', empresaId);
    this.empresasPendientes = this.empresasPendientes.filter(e => e.id !== empresaId);
    this.stats.empresasPendientes--;
  }
  
  rechazarEmpresa(empresaId: number): void {
    console.log('Rechazando empresa:', empresaId);
    this.empresasPendientes = this.empresasPendientes.filter(e => e.id !== empresaId);
    this.stats.empresasPendientes--;
  }

  navegarUsuarios(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  navegarCategorias(): void {
    this.router.navigate(['/admin/categorias']);
  }

  navegarReportes(): void {
    this.router.navigate(['/admin/reportes']);
  }

}