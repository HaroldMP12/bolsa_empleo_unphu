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
          <button class="btn-actualizar" (click)="cargarVacantes()" title="Actualizar datos">
            🔄 Actualizar
          </button>
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
              <th>Estado</th>
              <th>Plazas</th>
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
              <td>
                <span class="estado-badge" [class]="getEstadoVacante(vacante.fechaCierre)">
                  {{getEstadoTexto(vacante.fechaCierre)}}
                </span>
              </td>
              <td>{{vacante.cantidadVacantes || 1}}</td>
              <td>
                <div class="acciones">
                  <button class="btn-ver" (click)="verDetalles(vacante)" title="Ver detalles">
                    👁️
                  </button>
                  <button class="btn-eliminar" (click)="eliminarVacante(vacante)" title="Eliminar vacante">
                    🗑️
                  </button>
                </div>
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
      max-width: 1600px;
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

    .btn-actualizar {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn-actualizar:hover {
      background: #0a2a3f;
    }

    .vacantes-table {
      background: white;
      border-radius: 8px;
      overflow-x: auto;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    table {
      width: 100%;
      min-width: 1200px;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #eee;
      font-size: 0.9rem;
    }

    th:nth-child(7), td:nth-child(7),
    th:nth-child(8), td:nth-child(8),
    th:nth-child(9), td:nth-child(9) {
      text-align: center;
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

    .modalidad-badge.sin-modalidad {
      background: #f5f5f5;
      color: #666;
    }

    .estado-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      display: inline-block;
      text-align: center;
      min-width: 80px;
    }

    .estado-badge.activa {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .estado-badge.vencida {
      background: #ffebee;
      color: #c62828;
    }

    .estado-badge.proxima {
      background: #fff3e0;
      color: #ef6c00;
    }

    .acciones {
      display: flex;
      gap: 0.5rem;
    }

    .btn-ver, .btn-eliminar {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }

    .btn-ver:hover {
      background: #e3f2fd;
    }

    .btn-eliminar:hover {
      background: #ffebee;
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
    
    // Cargar vacantes con datos completos de empresa y categoría
    this.apiService.get<any>('vacantes?pageSize=1000').subscribe({
      next: (response) => {
        console.log('Respuesta de vacantes:', response);
        let vacantesData = response.data || response || [];
        
        // Aplicar filtros localmente para mejor rendimiento
        if (this.busqueda) {
          const busquedaLower = this.busqueda.toLowerCase();
          vacantesData = vacantesData.filter((v: any) => 
            v.tituloVacante?.toLowerCase().includes(busquedaLower) ||
            v.empresa?.nombreEmpresa?.toLowerCase().includes(busquedaLower) ||
            v.nombreEmpresa?.toLowerCase().includes(busquedaLower)
          );
        }
        
        if (this.filtroModalidad) {
          vacantesData = vacantesData.filter((v: any) => v.modalidad === this.filtroModalidad);
        }
        
        // Mapear datos con información completa
        this.vacantes = vacantesData.map((v: any) => ({
          vacanteID: v.vacanteID,
          tituloVacante: v.tituloVacante || 'Sin título',
          descripcion: v.descripcion || '',
          nombreEmpresa: v.empresa?.nombreEmpresa || v.nombreEmpresa || 'Empresa no especificada',
          rnc: v.empresa?.rnc || v.rnc,
          nombreCategoria: v.categoria?.nombreCategoria || v.nombreCategoria || 'Sin categoría',
          fechaCierre: v.fechaCierre,
          ubicacion: v.ubicacion || 'No especificada',
          modalidad: v.modalidad || 'No especificada',
          salario: v.salario || 0,
          cantidadVacantes: v.cantidadVacantes || 1
        }));
        
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

  getEstadoVacante(fechaCierre: string): string {
    const hoy = new Date();
    const cierre = new Date(fechaCierre);
    const diasRestantes = Math.ceil((cierre.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return 'vencida';
    if (diasRestantes <= 7) return 'proxima';
    return 'activa';
  }

  getEstadoTexto(fechaCierre: string): string {
    const estado = this.getEstadoVacante(fechaCierre);
    switch (estado) {
      case 'vencida': return 'Vencida';
      case 'proxima': return 'Próxima a vencer';
      case 'activa': return 'Activa';
      default: return 'Activa';
    }
  }

  verDetalles(vacante: VacanteAdmin): void {
    // Implementar modal de detalles o navegación
    console.log('Ver detalles de vacante:', vacante);
    this.toastService.showInfo(`Detalles de: ${vacante.tituloVacante}`);
  }

  eliminarVacante(vacante: VacanteAdmin): void {
    if (confirm(`¿Estás seguro de eliminar la vacante "${vacante.tituloVacante}"?`)) {
      this.apiService.delete(`vacantes/${vacante.vacanteID}`).subscribe({
        next: () => {
          this.toastService.showSuccess('Vacante eliminada correctamente');
          this.syncService.notifyVacancyChange();
          this.cargarVacantes();
        },
        error: (error) => {
          console.error('Error al eliminar vacante:', error);
          this.toastService.showError('Error al eliminar la vacante');
        }
      });
    }
  }
}