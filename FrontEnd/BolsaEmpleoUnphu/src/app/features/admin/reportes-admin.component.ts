import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AdminSyncService } from '../../core/services/admin-sync.service';
import { Subscription } from 'rxjs';

interface EstadisticasGenerales {
  totalUsuarios: number;
  totalEmpresas: number;
  totalVacantes: number;
  totalPostulaciones: number;
  empresasPendientes: number;
  empresasAprobadas: number;
  empresasRechazadas: number;
  vacantesActivas: number;
  postulacionesPendientes: number;
  categorias: number;
  carreras: number;
}

@Component({
  selector: 'app-reportes-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reportes-admin">
      <div class="header">
        <h2>Reportes y Estadísticas</h2>
        <button class="btn-actualizar" (click)="cargarEstadisticas()">🔄 Actualizar</button>
      </div>

      <div class="estadisticas-grid" *ngIf="estadisticas">
        <!-- Estadísticas Generales -->
        <div class="stats-section">
          <h3>Estadísticas Generales</h3>
          <div class="stats-cards">
            <div class="stat-card usuarios">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <h4>{{estadisticas.totalUsuarios}}</h4>
                <p>Total Usuarios</p>
              </div>
            </div>
            
            <div class="stat-card empresas">
              <div class="stat-icon">🏢</div>
              <div class="stat-info">
                <h4>{{estadisticas.totalEmpresas}}</h4>
                <p>Total Empresas</p>
              </div>
            </div>
            
            <div class="stat-card vacantes">
              <div class="stat-icon">💼</div>
              <div class="stat-info">
                <h4>{{estadisticas.totalVacantes}}</h4>
                <p>Total Vacantes</p>
              </div>
            </div>
            
            <div class="stat-card postulaciones">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <h4>{{estadisticas.totalPostulaciones}}</h4>
                <p>Total Postulaciones</p>
              </div>
            </div>
            
            <div class="stat-card vacantes-activas">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <h4>{{estadisticas.vacantesActivas}}</h4>
                <p>Vacantes Activas</p>
              </div>
            </div>
            
            <div class="stat-card pendientes">
              <div class="stat-icon">⏳</div>
              <div class="stat-info">
                <h4>{{estadisticas.postulacionesPendientes}}</h4>
                <p>Postulaciones Pendientes</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de Empresas -->
        <div class="stats-section">
          <h3>Estado de Empresas</h3>
          <div class="empresa-stats">
            <div class="empresa-stat pendientes">
              <div class="stat-bar">
                <div class="stat-fill" [style.width.%]="getPorcentajeEmpresas('pendientes')"></div>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{estadisticas.empresasPendientes}}</span>
                <span class="stat-label">Pendientes</span>
                <span class="stat-percent">{{getPorcentajeEmpresas('pendientes')}}%</span>
              </div>
            </div>
            
            <div class="empresa-stat aprobadas">
              <div class="stat-bar">
                <div class="stat-fill" [style.width.%]="getPorcentajeEmpresas('aprobadas')"></div>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{estadisticas.empresasAprobadas}}</span>
                <span class="stat-label">Aprobadas</span>
                <span class="stat-percent">{{getPorcentajeEmpresas('aprobadas')}}%</span>
              </div>
            </div>
            
            <div class="empresa-stat rechazadas">
              <div class="stat-bar">
                <div class="stat-fill" [style.width.%]="getPorcentajeEmpresas('rechazadas')"></div>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{estadisticas.empresasRechazadas}}</span>
                <span class="stat-label">Rechazadas</span>
                <span class="stat-percent">{{getPorcentajeEmpresas('rechazadas')}}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="stats-section">
          <h3>Acciones Rápidas</h3>
          <div class="quick-actions">
            <a class="action-card" routerLink="/admin/empresas" 
               *ngIf="estadisticas.empresasPendientes > 0">
              <div class="action-icon">⚠️</div>
              <div class="action-info">
                <h4>{{estadisticas.empresasPendientes}} empresas pendientes</h4>
                <p>Requieren aprobación</p>
              </div>
              <div class="action-arrow">→</div>
            </a>
            
            <a class="action-card" routerLink="/admin/usuarios">
              <div class="action-icon">👤</div>
              <div class="action-info">
                <h4>Gestionar usuarios</h4>
                <p>Administrar roles y permisos</p>
              </div>
              <div class="action-arrow">→</div>
            </a>
            
            <a class="action-card" routerLink="/admin/categorias">
              <div class="action-icon">📂</div>
              <div class="action-info">
                <h4>Configurar categorías</h4>
                <p>Organizar vacantes por tipo</p>
              </div>
              <div class="action-arrow">→</div>
            </a>
          </div>
        </div>

        <!-- Gráfico de Estadísticas -->
        <div class="stats-section">
          <h3>Gráfico de Estadísticas</h3>
          <div class="chart-container">
            <div class="chart-bars">
              <div class="chart-bar">
                <div class="bar-fill usuarios-bar" [style.height.%]="getBarHeight('usuarios')"></div>
                <div class="bar-label">Usuarios<br>{{estadisticas.totalUsuarios}}</div>
              </div>
              <div class="chart-bar">
                <div class="bar-fill empresas-bar" [style.height.%]="getBarHeight('empresas')"></div>
                <div class="bar-label">Empresas<br>{{estadisticas.totalEmpresas}}</div>
              </div>
              <div class="chart-bar">
                <div class="bar-fill vacantes-bar" [style.height.%]="getBarHeight('vacantes')"></div>
                <div class="bar-label">Vacantes<br>{{estadisticas.totalVacantes}}</div>
              </div>
              <div class="chart-bar">
                <div class="bar-fill postulaciones-bar" [style.height.%]="getBarHeight('postulaciones')"></div>
                <div class="bar-label">Postulaciones<br>{{estadisticas.totalPostulaciones}}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de Actividad -->
        <div class="stats-section">
          <h3>Resumen de Actividad</h3>
          <div class="activity-summary">
            <div class="activity-item">
              <span class="activity-label">Tasa de aprobación de empresas:</span>
              <span class="activity-value">{{getTasaAprobacion()}}%</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Promedio de postulaciones por vacante:</span>
              <span class="activity-value">{{getPromedioPostulaciones()}}</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Vacantes activas vs total:</span>
              <span class="activity-value">{{estadisticas.vacantesActivas}}/{{estadisticas.totalVacantes}}</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Total de categorías:</span>
              <span class="activity-value">{{estadisticas.categorias}}</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Total de carreras:</span>
              <span class="activity-value">{{estadisticas.carreras}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="cargando">
        <p>Cargando estadísticas...</p>
      </div>
    </div>
  `,
  styles: [`
    .reportes-admin {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .btn-actualizar {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }

    .estadisticas-grid {
      display: grid;
      gap: 2rem;
    }

    .stats-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stats-section h3 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      border-radius: 8px;
      gap: 1rem;
    }

    .stat-card.usuarios { background: #e8f4fd; }
    .stat-card.empresas { background: #fef9e7; }
    .stat-card.vacantes { background: #eafaf1; }
    .stat-card.postulaciones { background: #fdedec; }
    .stat-card.vacantes-activas { background: #e8f5e8; }
    .stat-card.pendientes { background: #fff3cd; }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-info h4 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-info p {
      margin: 0;
      color: #7f8c8d;
      font-weight: 600;
    }

    .empresa-stats {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .empresa-stat {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-bar {
      flex: 1;
      height: 20px;
      background: #ecf0f1;
      border-radius: 10px;
      overflow: hidden;
    }

    .stat-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .empresa-stat.pendientes .stat-fill { background: #f39c12; }
    .empresa-stat.aprobadas .stat-fill { background: #27ae60; }
    .empresa-stat.rechazadas .stat-fill { background: #e74c3c; }

    .stat-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 200px;
    }

    .stat-number {
      font-weight: 700;
      font-size: 1.2rem;
      color: #2c3e50;
    }

    .stat-label {
      color: #7f8c8d;
    }

    .stat-percent {
      font-weight: 600;
      color: #2c3e50;
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
    }

    .action-card:hover {
      background: #f8f9fa;
      border-color: #3498db;
    }

    .action-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
    }

    .action-info {
      flex: 1;
    }

    .action-info h4 {
      margin: 0;
      color: #2c3e50;
    }

    .action-info p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .action-arrow {
      color: #3498db;
      font-weight: 600;
    }

    .activity-summary {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .activity-label {
      color: #2c3e50;
    }

    .activity-value {
      font-weight: 600;
      color: #3498db;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }

    /* Gráfico de barras */
    .chart-container {
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .chart-bars {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 300px;
      gap: 1rem;
    }

    .chart-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 80px;
    }

    .bar-fill {
      width: 100%;
      min-height: 20px;
      border-radius: 4px 4px 0 0;
      transition: height 0.8s ease;
      margin-bottom: 0.5rem;
    }

    .usuarios-bar { background: linear-gradient(to top, #3498db, #5dade2); }
    .empresas-bar { background: linear-gradient(to top, #f39c12, #f7dc6f); }
    .vacantes-bar { background: linear-gradient(to top, #27ae60, #58d68d); }
    .postulaciones-bar { background: linear-gradient(to top, #e74c3c, #ec7063); }

    .bar-label {
      text-align: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.2;
    }
  `]
})
export class ReportesAdminComponent implements OnInit, OnDestroy {
  estadisticas: EstadisticasGenerales | null = null;
  cargando = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private adminSyncService: AdminSyncService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
    this.setupSyncSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSyncSubscriptions() {
    // Suscribirse a cambios en tiempo real
    const empresasSub = this.adminSyncService.empresas$.subscribe(() => {
      this.cargarEstadisticas();
    });
    
    const usuariosSub = this.adminSyncService.usuarios$.subscribe(() => {
      this.cargarEstadisticas();
    });
    
    const vacantesSub = this.adminSyncService.vacantes$.subscribe(() => {
      this.cargarEstadisticas();
    });
    
    this.subscriptions.push(empresasSub, usuariosSub, vacantesSub);
  }

  cargarEstadisticas() {
    this.cargando = true;
    
    Promise.all([
      this.apiService.get<any>('usuarios?pageSize=1000').toPromise(),
      this.apiService.get<any>('empresas?pageSize=1000').toPromise(),
      this.apiService.get<any>('vacantes?pageSize=1000').toPromise(),
      this.apiService.get<any>('postulaciones?pageSize=1000').toPromise(),
      this.apiService.get<any>('categorias?pageSize=1000').toPromise(),
      this.apiService.get<any>('carreras?pageSize=1000').toPromise()
    ]).then(([usuarios, empresas, vacantes, postulaciones, categorias, carreras]) => {
      // Extraer datos de PagedResult
      const empresasData = (empresas as any)?.data || [];
      const usuariosData = (usuarios as any)?.data || [];
      const vacantesData = (vacantes as any)?.data || [];
      const postulacionesData = (postulaciones as any)?.data || [];
      const categoriasData = (categorias as any)?.data || [];
      const carrerasData = (carreras as any)?.data || [];
      
      // Filtrar usuarios empresa
      const usuariosEmpresa = usuariosData.filter((u: any) => u.rol?.nombreRol === 'Empresa');
      
      // Calcular vacantes activas (no vencidas)
      const hoy = new Date();
      const vacantesActivas = vacantesData.filter((v: any) => {
        const fechaCierre = new Date(v.fechaCierre);
        return fechaCierre > hoy;
      });
      
      // Calcular postulaciones pendientes
      const postulacionesPendientes = postulacionesData.filter((p: any) => p.estado === 'Pendiente');
      
      this.estadisticas = {
        totalUsuarios: usuariosData.length,
        totalEmpresas: empresasData.length,
        totalVacantes: vacantesData.length,
        totalPostulaciones: postulacionesData.length,
        empresasPendientes: usuariosEmpresa.filter((u: any) => u.estadoAprobacion === 'Pendiente').length,
        empresasAprobadas: usuariosEmpresa.filter((u: any) => u.estadoAprobacion === 'Aprobado').length,
        empresasRechazadas: usuariosEmpresa.filter((u: any) => u.estadoAprobacion === 'Rechazado').length,
        vacantesActivas: vacantesActivas.length,
        postulacionesPendientes: postulacionesPendientes.length,
        categorias: categoriasData.length,
        carreras: carrerasData.length
      };
      
      console.log('Estadísticas actualizadas:', this.estadisticas);
      this.cargando = false;
    }).catch(error => {
      console.error('Error cargando estadísticas:', error);
      this.cargando = false;
    });
  }

  getPorcentajeEmpresas(tipo: 'pendientes' | 'aprobadas' | 'rechazadas'): number {
    if (!this.estadisticas) return 0;
    
    const total = this.estadisticas.totalEmpresas;
    if (total === 0) return 0;
    
    let valor = 0;
    switch (tipo) {
      case 'pendientes':
        valor = this.estadisticas.empresasPendientes;
        break;
      case 'aprobadas':
        valor = this.estadisticas.empresasAprobadas;
        break;
      case 'rechazadas':
        valor = this.estadisticas.empresasRechazadas;
        break;
    }
    
    return Math.round((valor / total) * 100);
  }

  getTasaAprobacion(): number {
    if (!this.estadisticas) return 0;
    
    const totalProcesadas = this.estadisticas.empresasAprobadas + this.estadisticas.empresasRechazadas;
    if (totalProcesadas === 0) return 0;
    
    return Math.round((this.estadisticas.empresasAprobadas / totalProcesadas) * 100);
  }

  getPromedioPostulaciones(): number {
    if (!this.estadisticas || this.estadisticas.totalVacantes === 0) return 0;
    
    return Math.round(this.estadisticas.totalPostulaciones / this.estadisticas.totalVacantes * 10) / 10;
  }

  getBarHeight(tipo: string): number {
    if (!this.estadisticas) return 0;
    
    const valores = {
      usuarios: this.estadisticas.totalUsuarios,
      empresas: this.estadisticas.totalEmpresas,
      vacantes: this.estadisticas.totalVacantes,
      postulaciones: this.estadisticas.totalPostulaciones
    };
    
    const maxValor = Math.max(...Object.values(valores));
    if (maxValor === 0) return 0;
    
    const valor = (valores as any)[tipo] || 0;
    return Math.max((valor / maxValor) * 100, 5); // Mínimo 5% para visibilidad
  }
}