import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataSyncService } from '../../core/services/data-sync.service';
import { AuthResponse } from '../../core/models/auth.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="perfil-empresa-page">
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Perfil de Empresa</h1>
            <p>Información y estadísticas de tu empresa</p>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" (click)="navegarDashboard()">← Volver al Dashboard</button>
          </div>
        </div>
      </div>

      <!-- ESTADÍSTICAS PRINCIPALES -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <span class="stat-number">{{ companyStats.totalVacantes }}</span>
              <span class="stat-label">Total Vacantes</span>
            </div>
          </div>
          
          <div class="stat-card active">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <span class="stat-number">{{ companyStats.vacantesActivas }}</span>
              <span class="stat-label">Vacantes Activas</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <span class="stat-number">{{ companyStats.totalPostulaciones }}</span>
              <span class="stat-label">Total Postulaciones</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <span class="stat-number">{{ promedioPostulaciones }}</span>
              <span class="stat-label">Promedio por Vacante</span>
            </div>
          </div>
        </div>
      </div>

      <!-- VACANTES DETALLADAS -->
      <div class="vacantes-section">
        <div class="section-header">
          <h2>Mis Vacantes</h2>
          <button class="btn-primary" routerLink="/mis-vacantes">Gestionar Vacantes</button>
        </div>
        
        <div class="vacantes-list">
          <div *ngFor="let vacante of misVacantes" class="vacante-item">
            <div class="vacante-info">
              <h3>{{ vacante.titulo }}</h3>
              <div class="vacante-meta">
                <span class="categoria">{{ vacante.categoria }}</span>
                <span class="modalidad modalidad-{{ vacante.modalidad.toLowerCase() }}">
                  {{ vacante.modalidad }}
                </span>
              </div>
              <p class="ubicacion">📍 {{ vacante.ubicacion }}</p>
            </div>
            
            <div class="vacante-stats">
              <div class="stat-item">
                <span class="stat-value">{{ vacante.postulaciones }}</span>
                <span class="stat-name">Postulaciones</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getVacanteStatus(vacante) }}</span>
                <span class="stat-name">Estado</span>
              </div>
            </div>
            
            <div class="vacante-actions">
              <button class="btn-outline" (click)="verCandidatos(vacante)">
                Ver Candidatos
              </button>
              <button 
                *ngIf="vacante.createdBy !== 'system'" 
                class="btn-secondary"
                routerLink="/mis-vacantes">
                Editar
              </button>
            </div>
          </div>
          
          <div *ngIf="misVacantes.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No tienes vacantes publicadas</h3>
            <p>Crea tu primera vacante para comenzar a recibir postulaciones de estudiantes y egresados de UNPHU.</p>
            <button class="btn-primary" routerLink="/mis-vacantes">Crear Primera Vacante</button>
          </div>
        </div>
      </div>

      <!-- POSTULACIONES RECIENTES -->
      <div class="postulaciones-section">
        <div class="section-header">
          <h2>Postulaciones Recientes</h2>
        </div>
        
        <div class="postulaciones-list">
          <div *ngFor="let postulacion of postulacionesRecientes" class="postulacion-item">
            <div class="candidato-avatar">
              <span>{{ getInitials(postulacion.candidato) }}</span>
            </div>
            
            <div class="postulacion-info">
              <h4>{{ postulacion.candidato }}</h4>
              <p>Se postuló para: <strong>{{ postulacion.vacante }}</strong></p>
              <span class="fecha">{{ postulacion.fecha }}</span>
            </div>
            
            <div class="postulacion-estado">
              <span class="estado-badge estado-{{ postulacion.estado.toLowerCase().replace(' ', '-') }}">
                {{ postulacion.estado }}
              </span>
            </div>
          </div>
          
          <div *ngIf="postulacionesRecientes.length === 0" class="empty-state-small">
            <p>No hay postulaciones recientes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CANDIDATOS -->
    <div *ngIf="mostrarModalCandidatos" class="modal-overlay" (click)="cerrarModalCandidatos()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Candidatos - {{ vacanteSeleccionada?.tituloVacante || vacanteSeleccionada?.titulo }}</h2>
          <button class="btn-close" (click)="cerrarModalCandidatos()">×</button>
        </div>
        
        <div class="modal-body">
          <div *ngIf="candidatos.length > 0" class="candidatos-list">
            <div *ngFor="let candidato of candidatos" class="candidato-item">
              <div class="candidato-avatar">
                <span>{{ getInitials(candidato.nombreCompleto) }}</span>
              </div>
              
              <div class="candidato-info">
                <h4>{{ candidato.nombreCompleto }}</h4>
                <p>{{ candidato.correo }}</p>
                <span class="fecha-postulacion">Postulado: {{ candidato.fechaPostulacion | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              
              <div class="candidato-estado">
                <span class="estado-badge estado-{{ (candidato.estado || 'pendiente').toLowerCase().replace(' ', '-') }}">
                  {{ candidato.estado || 'Pendiente' }}
                </span>
              </div>
            </div>
          </div>
          
          <div *ngIf="candidatos.length === 0" class="empty-candidatos">
            <div class="empty-icon">💼</div>
            <h3>No hay candidatos por el momento</h3>
            <p>Aún no se han recibido postulaciones para esta vacante. Los candidatos aparecerán aquí cuando se postulen.</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="cerrarModalCandidatos()">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .perfil-empresa-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-text {
      text-align: left;
    }
    
    .page-header h1 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 600;
    }
    
    .page-header p {
      color: #666;
      margin: 0;
      font-size: 1.1rem;
    }
    
    /* Stats Section */
    .stats-section {
      margin-bottom: 2rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    
    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: transform 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
    }
    
    .stat-card.active {
      border-left: 4px solid var(--unphu-green-primary);
    }
    
    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--unphu-blue-dark);
      line-height: 1;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    /* Sections */
    .vacantes-section, .postulaciones-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      overflow: hidden;
    }
    
    .section-header {
      background: var(--unphu-blue-dark);
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .section-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    /* Vacantes List */
    .vacantes-list {
      padding: 2rem;
    }
    
    .vacante-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 2rem;
      align-items: center;
      padding: 1.5rem;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 1rem;
      transition: border-color 0.3s;
    }
    
    .vacante-item:hover {
      border-color: var(--unphu-blue-dark);
    }
    
    .vacante-info h3 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .vacante-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    
    .categoria {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .modalidad {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .modalidad-presencial { background: #e3f2fd; color: #1976d2; }
    .modalidad-remoto { background: #e8f5e8; color: #388e3c; }
    .modalidad-híbrido { background: #fff3e0; color: #f57c00; }
    
    .ubicacion {
      color: #666;
      margin: 0;
      font-size: 0.875rem;
    }
    
    .vacante-stats {
      display: flex;
      gap: 2rem;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--unphu-blue-dark);
    }
    
    .stat-name {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
    }
    
    .vacante-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    /* Postulaciones List */
    .postulaciones-list {
      padding: 2rem;
    }
    
    .postulacion-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .postulacion-item:last-child {
      border-bottom: none;
    }
    
    .candidato-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--unphu-blue-dark);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .postulacion-info {
      flex: 1;
    }
    
    .postulacion-info h4 {
      margin: 0 0 0.25rem 0;
      color: var(--unphu-blue-dark);
      font-size: 1rem;
    }
    
    .postulacion-info p {
      margin: 0 0 0.25rem 0;
      color: #666;
      font-size: 0.875rem;
    }
    
    .fecha {
      color: #999;
      font-size: 0.75rem;
    }
    
    .estado-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .estado-pendiente { background: #fff3cd; color: #856404; }
    .estado-en-revisión { background: #d1ecf1; color: #0c5460; }
    .estado-aceptado { background: #d4edda; color: #155724; }
    .estado-rechazado { background: #f8d7da; color: #721c24; }
    
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
      text-decoration: none;
      display: inline-block;
    }
    
    .btn-primary:hover {
      background: #0a2a3f;
    }
    
    .btn-outline {
      background: transparent;
      color: var(--unphu-blue-dark);
      border: 1px solid var(--unphu-blue-dark);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      font-size: 0.875rem;
    }
    
    .btn-outline:hover {
      background: var(--unphu-blue-dark);
      color: white;
    }
    
    .btn-secondary {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      font-size: 0.875rem;
    }
    
    /* Empty States */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    .empty-state h3 {
      color: var(--unphu-blue-dark);
      margin-bottom: 1rem;
    }
    
    .empty-state-small {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 52, 96, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 700px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, var(--unphu-blue-dark) 0%, #1e40af 100%);
      color: white;
      border-radius: 12px 12px 0 0;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    
    .btn-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-body {
      padding: 2rem;
    }
    
    .candidatos-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .candidato-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      transition: border-color 0.3s;
    }
    
    .candidato-item:hover {
      border-color: var(--unphu-blue-dark);
    }
    
    .candidato-info {
      flex: 1;
    }
    
    .candidato-info h4 {
      margin: 0 0 0.25rem 0;
      color: var(--unphu-blue-dark);
      font-size: 1rem;
    }
    
    .candidato-info p {
      margin: 0 0 0.25rem 0;
      color: #666;
      font-size: 0.875rem;
    }
    
    .fecha-postulacion {
      color: #999;
      font-size: 0.75rem;
    }
    
    .empty-candidatos {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }
    
    .empty-candidatos .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    .empty-candidatos h3 {
      color: var(--unphu-blue-dark);
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }
    
    .empty-candidatos p {
      margin: 0;
      line-height: 1.5;
    }
    
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .vacante-item {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .vacante-stats {
        justify-content: center;
      }
      
      .vacante-actions {
        justify-content: center;
      }
      
      .modal-content {
        width: 95%;
        max-height: 90vh;
      }
      
      .candidato-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class PerfilEmpresaComponent implements OnInit, OnDestroy {
  currentUser: AuthResponse | null = null;
  companyStats = {
    totalVacantes: 0,
    vacantesActivas: 0,
    totalPostulaciones: 0
  };
  misVacantes: any[] = [];
  postulacionesRecientes: any[] = [];
  promedioPostulaciones = 0;
  mostrarModalCandidatos = false;
  vacanteSeleccionada: any = null;
  candidatos: any[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private dataSyncService: DataSyncService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadCompanyData();
    });
    this.subscriptions.push(userSub);
    
    // Subscribe to data changes
    const vacantesSub = this.dataSyncService.vacantes$.subscribe(() => {
      this.loadCompanyData();
    });
    this.subscriptions.push(vacantesSub);
    
    const postulacionesSub = this.dataSyncService.postulaciones$.subscribe(() => {
      this.loadCompanyData();
    });
    this.subscriptions.push(postulacionesSub);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCompanyData(): void {
    if (!this.currentUser) return;
    
    // Cargar vacantes desde la API
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Obtener empresa del usuario
        fetch(`https://localhost:7236/api/empresas/usuario/${user.usuarioID}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(empresa => {
          if (empresa?.empresaID) {
            // Obtener vacantes de la empresa
            fetch(`https://localhost:7236/api/vacantes/empresa/${empresa.empresaID}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => res.json())
            .then(response => {
              const vacantes = response.data || response || [];
              this.misVacantes = vacantes.map((v: any) => ({
                ...v,
                titulo: v.tituloVacante,
                empresa: v.nombreEmpresa,
                fechaVencimiento: v.fechaCierre
              }));
              
              this.companyStats = {
                totalVacantes: vacantes.length,
                vacantesActivas: vacantes.filter((v: any) => new Date(v.fechaCierre) > new Date()).length,
                totalPostulaciones: vacantes.reduce((sum: number, v: any) => sum + (v.totalPostulaciones || 0), 0)
              };
              
              this.promedioPostulaciones = this.companyStats.totalVacantes > 0 
                ? Math.round(this.companyStats.totalPostulaciones / this.companyStats.totalVacantes)
                : 0;
            });
          }
        });
      }
    });
  }

  private loadRecentApplications(): void {
    const todasPostulaciones = [];
    
    for (const vacante of this.misVacantes) {
      const aplicaciones = this.dataSyncService.getVacanteApplications(vacante.vacanteID);
      todasPostulaciones.push(...aplicaciones.map((p: any) => ({ 
        ...p, 
        vacanteTitulo: vacante.titulo 
      })));
    }
    
    this.postulacionesRecientes = todasPostulaciones
      .sort((a: any, b: any) => new Date(b.fechaPostulacion).getTime() - new Date(a.fechaPostulacion).getTime())
      .slice(0, 5)
      .map((p: any) => {
        const usuario = JSON.parse(localStorage.getItem('usuarios') || '[]')
          .find((u: any) => u.usuarioID === p.usuarioID);
        
        return {
          candidato: usuario?.nombreCompleto || 'Usuario UNPHU',
          vacante: p.vacanteTitulo || 'Vacante',
          fecha: this.getTimeAgo(new Date(p.fechaPostulacion)),
          estado: p.estado
        };
      });
  }

  getVacanteStatus(vacante: any): string {
    const hoy = new Date();
    const fechaVencimiento = new Date(vacante.fechaVencimiento || vacante.fechaCierre);
    
    if (fechaVencimiento <= hoy) {
      return 'Vencida';
    } else {
      return 'Activa';
    }
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

  verCandidatos(vacante: any): void {
    this.vacanteSeleccionada = vacante;
    console.log('Vacante seleccionada:', vacante);
    
    // Cargar postulaciones desde localStorage (datos mock)
    const todasPostulaciones = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    console.log('Todas las postulaciones:', todasPostulaciones);
    
    const postulaciones = todasPostulaciones.filter((p: any) => p.vacanteID === vacante.vacanteID);
    console.log('Postulaciones filtradas:', postulaciones);
    
    this.candidatos = postulaciones.map((postulacion: any) => {
      const usuario = JSON.parse(localStorage.getItem('usuarios') || '[]')
        .find((u: any) => u.usuarioID === postulacion.usuarioID);
      
      return {
        nombreCompleto: usuario?.nombreCompleto || postulacion.candidato || 'Usuario UNPHU',
        correo: usuario?.correo || 'correo@unphu.edu.do',
        fechaPostulacion: postulacion.fechaPostulacion,
        estado: postulacion.estado || 'Pendiente'
      };
    });
    
    console.log('Candidatos procesados:', this.candidatos);
    this.mostrarModalCandidatos = true;
  }

  cerrarModalCandidatos(): void {
    this.mostrarModalCandidatos = false;
    this.vacanteSeleccionada = null;
    this.candidatos = [];
  }

  navegarDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}