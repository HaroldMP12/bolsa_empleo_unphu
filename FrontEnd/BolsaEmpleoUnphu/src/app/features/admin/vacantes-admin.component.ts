import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSyncService } from '../../core/services/admin-sync.service';
import { Subscription } from 'rxjs';

interface VacanteAdmin {
  vacanteID: number;
  tituloVacante: string;
  descripcion: string;
  nombreEmpresa: string;
  rnc?: string;
  nombreCategoria: string;
  fechaCierre: string;
  ubicacion: string;
  modalidad: string;
  salario: number;
  cantidadVacantes: number;
  estado: boolean;
}

@Component({
  selector: 'app-vacantes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vacantes-admin">
      <div class="header">
        <h2>Gestión de Vacantes</h2>
        <div class="filters">
          <input type="text" [(ngModel)]="busqueda" (input)="cargarVacantes()" 
                 placeholder="Buscar por título o empresa...">
          <select [(ngModel)]="filtroModalidad" (change)="cargarVacantes()">
            <option value="">Todas las modalidades</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>
      </div>

      <div class="vacantes-table" *ngIf="vacantes.length > 0">
        <table>
          <thead>
            <tr>
              <th>Vacante</th>
              <th>Empresa</th>
              <th>Categoría</th>
              <th>Modalidad</th>
              <th>Ubicación</th>
              <th>Salario</th>
              <th>Fecha Cierre</th>
              <th>Plazas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let vacante of vacantes">
              <td>
                <div class="vacante-info">
                  <strong>{{vacante.tituloVacante}}</strong>
                  <small>{{(vacante.descripcion | slice:0:50) || 'Sin descripción'}}...</small>
                </div>
              </td>
              <td>
                <div class="empresa-info">
                  <strong>{{vacante.nombreEmpresa || 'Sin empresa'}}</strong>
                </div>
              </td>
              <td>{{vacante.nombreCategoria || 'Sin categoría'}}</td>
              <td>
                <span class="modalidad-badge" [class]="(vacante.modalidad || 'sin-modalidad').toLowerCase()">
                  {{vacante.modalidad || 'No especificada'}}
                </span>
              </td>
              <td>{{vacante.ubicacion || 'No especificada'}}</td>
              <td>{{vacante.salario ? ('RD$ ' + (vacante.salario | number)) : 'No especificado'}}</td>
              <td>{{formatearFecha(vacante.fechaCierre)}}</td>
              <td>{{vacante.cantidadVacantes || 1}}</td>
              <td>
                <span class="estado-badge" [class.activa]="vacante.estado" [class.inactiva]="!vacante.estado">
                  {{vacante.estado ? 'Activa' : 'Inactiva'}}
                </span>
              </td>
              <td>
                <button class="btn-toggle" 
                        [class.btn-activar]="!vacante.estado" 
                        [class.btn-desactivar]="vacante.estado"
                        (click)="cambiarEstadoVacante(vacante)">
                  {{vacante.estado ? 'Desactivar' : 'Activar'}}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" *ngIf="vacantes.length === 0 && !cargando">
        <p>No se encontraron vacantes con los filtros aplicados</p>
      </div>

      <div class="loading" *ngIf="cargando">
        <p>Cargando vacantes...</p>
      </div>
    </div>
  `,
  styles: [`
    .vacantes-admin {
      padding: 2rem;
      max-width: 1400px;
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
      flex-wrap: wrap;
    }

    .filters input, .filters select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .vacantes-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }

    .vacante-info strong {
      display: block;
      color: #2c3e50;
    }

    .vacante-info small {
      color: #7f8c8d;
    }

    .empresa-info strong {
      display: block;
      color: #2c3e50;
    }

    .empresa-info small {
      color: #7f8c8d;
    }

    .modalidad-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .modalidad-badge.presencial {
      background: #e3f2fd;
      color: #1976d2;
    }

    .modalidad-badge.remoto {
      background: #e8f5e8;
      color: #388e3c;
    }

    .modalidad-badge.híbrido {
      background: #fff3e0;
      color: #f57c00;
    }

    .estado-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-badge.activa {
      background: #d4edda;
      color: #155724;
    }

    .estado-badge.inactiva {
      background: #f8d7da;
      color: #721c24;
    }

    .btn-toggle {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-activar {
      background: #28a745;
      color: white;
    }

    .btn-activar:hover {
      background: #218838;
    }

    .btn-desactivar {
      background: #dc3545;
      color: white;
    }

    .btn-desactivar:hover {
      background: #c82333;
    }

    .empty-state, .loading {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }
  `]
})
export class VacantesAdminComponent implements OnInit, OnDestroy {
  vacantes: VacanteAdmin[] = [];
  busqueda = '';
  filtroModalidad = '';
  cargando = false;
  private syncSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private syncService: AdminSyncService
  ) {}

  ngOnInit() {
    this.cargarVacantes();
    this.syncSubscription = this.syncService.refresh$.subscribe(() => {
      this.cargarVacantes();
    });
  }

  ngOnDestroy() {
    this.syncSubscription?.unsubscribe();
  }

  cargarVacantes() {
    this.cargando = true;
    const params: any = {};
    
    if (this.busqueda) params.search = this.busqueda;
    if (this.filtroModalidad) params.modalidad = this.filtroModalidad;

    this.apiService.get<any>('vacantes', params).subscribe({
      next: (response) => {
        console.log('Respuesta de vacantes:', response);
        this.vacantes = response.data || response || [];
        console.log('Vacantes procesadas:', this.vacantes);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar vacantes:', error);
        this.toastService.showError('Error al cargar las vacantes');
        this.cargando = false;
      }
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  cambiarEstadoVacante(vacante: VacanteAdmin): void {
    const nuevoEstado = !vacante.estado;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de que deseas ${accion} la vacante "${vacante.tituloVacante}"?`)) {
      this.apiService.put(`vacantes/${vacante.vacanteID}/estado`, nuevoEstado).subscribe({
        next: () => {
          vacante.estado = nuevoEstado;
          this.toastService.showSuccess(`Vacante ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`);
          this.syncService.notifyRefresh();
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          this.toastService.showError('Error al cambiar el estado de la vacante');
        }
      });
    }
  }
}