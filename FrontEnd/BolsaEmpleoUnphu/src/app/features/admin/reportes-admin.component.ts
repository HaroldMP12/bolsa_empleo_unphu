import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface EstadisticasGenerales {
  totalUsuarios: number;
  totalEmpresas: number;
  totalVacantes: number;
  totalPostulaciones: number;
  empresasPendientes: number;
  empresasAprobadas: number;
  empresasRechazadas: number;
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
              <span class="activity-label">Empresas más activas:</span>
              <span class="activity-value">{{estadisticas.totalEmpresas > 0 ? 'Disponible' : 'Sin datos'}}</span>
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  `]
})
export class ReportesAdminComponent implements OnInit {
  estadisticas: EstadisticasGenerales | null = null;
  cargando = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargando = true;
    
    Promise.all([
      this.apiService.get<any>('usuarios?pageSize=1000').toPromise(),
      this.apiService.get<any>('empresas?pageSize=1000').toPromise(),
      this.apiService.get<any>('vacantes?pageSize=1000').toPromise(),
      this.apiService.get<any>('postulaciones?pageSize=1000').toPromise()
    ]).then(([usuarios, empresas, vacantes, postulaciones]) => {
      // Extraer datos de PagedResult
      const empresasData = (empresas as any)?.data || [];
      const usuariosData = (usuarios as any)?.data || [];
      const vacantesData = (vacantes as any)?.data || [];
      const postulacionesData = (postulaciones as any)?.data || [];
      
      // Filtrar usuarios empresa
      const usuariosEmpresa = usuariosData.filter((u: any) => u.rol?.nombreRol === 'Empresa');
      
      this.estadisticas = {
        totalUsuarios: usuariosData.length,
        totalEmpresas: empresasData.length,
        totalVacantes: vacantesData.length,
        totalPostulaciones: postulacionesData.length,
        empresasPendientes: usuariosEmpresa.filter((u: any) => u.estadoAprobacion === 'Pendiente').length,
        empresasAprobadas: usuariosEmpresa.filter((u: any) => u.estadoAprobacion === 'Aprobado').length,
        empresasRechazadas: usuariosEmpresa.filter((u: any) => u.estadoAprobacion === 'Rechazado').length
      };
      
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
}