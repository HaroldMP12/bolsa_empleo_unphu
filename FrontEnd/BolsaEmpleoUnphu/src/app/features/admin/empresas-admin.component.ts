import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSyncService } from '../../core/services/admin-sync.service';
import { Subscription } from 'rxjs';

interface EmpresaAdmin {
  usuarioID: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  estado: boolean;
  estadoAprobacion: string;
  fechaRegistro: string;
  empresa?: {
    nombreEmpresa: string;
    rnc: string;
    sector: string;
  };
}

@Component({
  selector: 'app-empresas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="empresas-admin">
      <div class="header">
        <h2>Gestión de Empresas</h2>
        <div class="filters">
          <select [(ngModel)]="filtroEstado" (change)="cargarEmpresas()">
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Aprobado">Aprobadas</option>
            <option value="Rechazado">Rechazadas</option>
          </select>
          <input type="text" [(ngModel)]="busqueda" (input)="cargarEmpresas()" 
                 placeholder="Buscar por nombre o correo...">
        </div>
      </div>

      <div class="empresas-grid" *ngIf="empresas.length > 0">
        <div class="empresa-card" *ngFor="let empresa of empresas" 
             [class.pendiente]="empresa.estadoAprobacion === 'Pendiente'"
             [class.aprobada]="empresa.estadoAprobacion === 'Aprobado'"
             [class.rechazada]="empresa.estadoAprobacion === 'Rechazado'">
          
          <div class="empresa-header">
            <h3>{{empresa.empresa?.nombreEmpresa || 'Sin nombre'}}</h3>
            <span class="estado-badge" [class]="empresa.estadoAprobacion.toLowerCase()">
              {{empresa.estadoAprobacion}}
            </span>
          </div>

          <div class="empresa-info">
            <p><strong>Contacto:</strong> {{empresa.nombreCompleto}}</p>
            <p><strong>Correo:</strong> {{empresa.correo}}</p>
            <p><strong>Teléfono:</strong> {{empresa.telefono || 'No especificado'}}</p>
            <p><strong>RNC:</strong> {{empresa.empresa?.rnc || 'No especificado'}}</p>
            <p><strong>Sector:</strong> {{empresa.empresa?.sector || 'No especificado'}}</p>
            <p><strong>Fecha registro:</strong> {{formatearFecha(empresa.fechaRegistro)}}</p>
          </div>

          <div class="empresa-actions" *ngIf="empresa.estadoAprobacion === 'Pendiente'">
            <button class="btn-aprobar" (click)="aprobarEmpresa(empresa.usuarioID)">
              ✓ Aprobar
            </button>
            <button class="btn-rechazar" (click)="rechazarEmpresa(empresa.usuarioID)">
              ✗ Rechazar
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="empresas.length === 0 && !cargando">
        <p>No se encontraron empresas con los filtros aplicados</p>
      </div>

      <div class="loading" *ngIf="cargando">
        <p>Cargando empresas...</p>
      </div>
    </div>
  `,
  styles: [`
    .empresas-admin {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
    }

    .filters select, .filters input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .empresas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .empresa-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #ddd;
    }

    .empresa-card.pendiente {
      border-left-color: #f39c12;
    }

    .empresa-card.aprobada {
      border-left-color: #27ae60;
    }

    .empresa-card.rechazada {
      border-left-color: #e74c3c;
    }

    .empresa-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .empresa-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .estado-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-badge.pendiente {
      background: #fef9e7;
      color: #f39c12;
    }

    .estado-badge.aprobado {
      background: #eafaf1;
      color: #27ae60;
    }

    .estado-badge.rechazado {
      background: #fdedec;
      color: #e74c3c;
    }

    .empresa-info p {
      margin: 0.5rem 0;
      color: #555;
    }

    .empresa-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .btn-aprobar, .btn-rechazar {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-aprobar {
      background: #27ae60;
      color: white;
    }

    .btn-aprobar:hover {
      background: #219a52;
    }

    .btn-rechazar {
      background: #e74c3c;
      color: white;
    }

    .btn-rechazar:hover {
      background: #c0392b;
    }

    .empty-state, .loading {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }
  `]
})
export class EmpresasAdminComponent implements OnInit, OnDestroy {
  empresas: EmpresaAdmin[] = [];
  filtroEstado = '';
  busqueda = '';
  cargando = false;
  private syncSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private syncService: AdminSyncService
  ) {}

  ngOnInit() {
    this.cargarEmpresas();
    // Suscribirse a actualizaciones automáticas
    this.syncSubscription = this.syncService.refresh$.subscribe(() => {
      this.cargarEmpresas();
    });
  }

  ngOnDestroy() {
    this.syncSubscription?.unsubscribe();
  }

  cargarEmpresas() {
    this.cargando = true;
    const params: any = { rolId: 3, pageSize: 1000 }; // Rol empresa
    
    if (this.filtroEstado) params.estadoAprobacion = this.filtroEstado;
    if (this.busqueda) params.search = this.busqueda;

    // Cargar usuarios empresa y sus datos de empresa
    Promise.all([
      this.apiService.get<any>('usuarios', params).toPromise(),
      this.apiService.get<any>('empresas', { pageSize: 1000 }).toPromise()
    ]).then(([usuariosResponse, empresasResponse]) => {
      const usuarios = usuariosResponse?.data || [];
      const empresasData = empresasResponse?.data || [];
      
      // Combinar datos de usuario con datos de empresa
      this.empresas = usuarios.map((usuario: any) => {
        const empresaInfo = empresasData.find((emp: any) => emp.usuarioID === usuario.usuarioID);
        return {
          ...usuario,
          empresa: empresaInfo ? {
            nombreEmpresa: empresaInfo.nombreEmpresa,
            rnc: empresaInfo.rnc,
            sector: empresaInfo.sector
          } : null
        };
      });
      
      this.cargando = false;
    }).catch(error => {
      console.error('Error al cargar empresas:', error);
      this.toastService.showError('Error al cargar las empresas');
      this.cargando = false;
    });
  }

  aprobarEmpresa(usuarioId: number) {
    if (confirm('¿Está seguro de aprobar esta empresa?')) {
      this.apiService.post(`usuarios/${usuarioId}/aprobar`, {}).subscribe({
        next: () => {
          this.toastService.showSuccess('Empresa aprobada exitosamente');
          this.syncService.notifyCompanyChange();
        },
        error: (error) => {
          console.error('Error al aprobar empresa:', error);
          this.toastService.showError('Error al aprobar la empresa');
        }
      });
    }
  }

  rechazarEmpresa(usuarioId: number) {
    const motivo = prompt('Ingrese el motivo del rechazo (opcional):');
    if (motivo !== null) {
      this.apiService.post(`usuarios/${usuarioId}/rechazar`, motivo).subscribe({
        next: () => {
          this.toastService.showSuccess('Empresa rechazada');
          this.syncService.notifyCompanyChange();
        },
        error: (error) => {
          console.error('Error al rechazar empresa:', error);
          this.toastService.showError('Error al rechazar la empresa');
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}