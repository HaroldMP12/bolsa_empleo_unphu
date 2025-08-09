import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

interface Carrera {
  carreraID: number;
  nombreCarrera: string;
  facultad: string;
  perfiles?: {
    perfilID: number;
    usuarioID: number;
    tipoPerfil: 'Estudiante' | 'Egresado' | 'Ambos';
    matricula?: string;
    semestre?: number;
  }[];
}

@Component({
  selector: 'app-carreras-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="carreras-admin">
      <div class="header">
        <h2>Gestión de Carreras</h2>
        <button class="btn-nuevo" (click)="nuevaCarrera()">+ Nueva Carrera</button>
      </div>

      <div class="estadisticas-resumen" *ngIf="carreras.length > 0">
        <div class="stat-card">
          <h4>{{carreras.length}}</h4>
          <p>Total Carreras</p>
        </div>
        <div class="stat-card">
          <h4>{{getTotalEstudiantes()}}</h4>
          <p>Total Estudiantes</p>
        </div>
        <div class="stat-card">
          <h4>{{facultades.length}}</h4>
          <p>Facultades</p>
        </div>
        <div class="stat-card">
          <h4>{{getCarrerasSinEstudiantes()}}</h4>
          <p>Sin Estudiantes</p>
        </div>
      </div>

      <div class="filtros">
        <input type="text" [(ngModel)]="busqueda" (input)="filtrarCarreras()" 
               placeholder="Buscar por nombre de carrera o facultad...">
        <select [(ngModel)]="filtroFacultad" (change)="filtrarCarreras()">
          <option value="">Todas las facultades</option>
          <option *ngFor="let facultad of facultades" [value]="facultad">{{facultad}}</option>
        </select>
      </div>

      <div class="carreras-grid" *ngIf="carrerasFiltradas.length > 0">
        <div class="carrera-card" *ngFor="let carrera of carrerasFiltradas">
          <div class="carrera-header">
            <h3>{{carrera.nombreCarrera}}</h3>
            <div class="carrera-actions">
              <button class="btn-editar" (click)="editarCarrera(carrera)">Editar</button>
              <button class="btn-eliminar" (click)="eliminarCarrera(carrera)">Eliminar</button>
            </div>
          </div>
          <div class="carrera-info">
            <p><strong>Facultad:</strong> {{carrera.facultad}}</p>
            <p><strong>Estudiantes registrados:</strong> 
              <span class="contador-estudiantes" [class.sin-estudiantes]="(carrera.perfiles?.length || 0) === 0">
                {{carrera.perfiles?.length || 0}}
              </span>
            </p>
            <div class="tipos-perfil" *ngIf="carrera.perfiles && carrera.perfiles.length > 0">
              <span class="tipo-badge estudiante" *ngIf="getEstudiantesCount(carrera) > 0">
                {{getEstudiantesCount(carrera)}} Estudiantes
              </span>
              <span class="tipo-badge egresado" *ngIf="getEgresadosCount(carrera) > 0">
                {{getEgresadosCount(carrera)}} Egresados
              </span>
              <span class="tipo-badge ambos" *ngIf="getAmbosCount(carrera) > 0">
                {{getAmbosCount(carrera)}} Ambos
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="carrerasFiltradas.length === 0 && !cargando">
        <p>{{carreras.length === 0 ? 'No hay carreras registradas' : 'No se encontraron carreras con los filtros aplicados'}}</p>
        <button class="btn-nuevo" (click)="nuevaCarrera()" *ngIf="carreras.length === 0">
          Crear primera carrera
        </button>
      </div>

      <div class="loading" *ngIf="cargando">
        <p>Cargando carreras...</p>
      </div>

      <!-- Modal de edición/creación -->
      <div class="modal-overlay" *ngIf="carreraEditando" (click)="cerrarModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{modoEdicion ? 'Editar' : 'Nueva'}} Carrera</h3>
            <button class="btn-close" (click)="cerrarModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre de la Carrera</label>
              <input type="text" [(ngModel)]="carreraEditando.nombreCarrera" 
                     placeholder="Ej: Ingeniería en Sistemas">
            </div>
            <div class="form-group">
              <label>Facultad</label>
              <input type="text" [(ngModel)]="carreraEditando.facultad" 
                     placeholder="Ej: Facultad de Ciencias y Tecnología"
                     list="facultades-list">
              <datalist id="facultades-list">
                <option *ngFor="let facultad of facultades" [value]="facultad">
              </datalist>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancelar" (click)="cerrarModal()">Cancelar</button>
            <button class="btn-guardar" (click)="guardarCarrera()" 
                    [disabled]="!carreraEditando.nombreCarrera || !carreraEditando.facultad">
              {{modoEdicion ? 'Actualizar' : 'Crear'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carreras-admin {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .btn-nuevo {
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }

    .filtros {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filtros input, .filtros select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      flex: 1;
      min-width: 200px;
    }

    .carreras-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .carrera-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #3498db;
    }

    .carrera-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .carrera-header h3 {
      margin: 0;
      color: #2c3e50;
      flex: 1;
      margin-right: 1rem;
    }

    .carrera-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-editar, .btn-eliminar {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .btn-editar {
      background: #3498db;
      color: white;
    }

    .btn-eliminar {
      background: #e74c3c;
      color: white;
    }

    .carrera-info p {
      margin: 0.5rem 0;
      color: #555;
    }

    .contador-estudiantes {
      font-weight: bold;
      color: #27ae60;
    }

    .contador-estudiantes.sin-estudiantes {
      color: #e74c3c;
    }

    .tipos-perfil {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .tipo-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      color: white;
    }

    .tipo-badge.estudiante {
      background: #3498db;
    }

    .tipo-badge.egresado {
      background: #9b59b6;
    }

    .tipo-badge.ambos {
      background: #f39c12;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #eee;
    }

    .btn-cancelar, .btn-guardar {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-cancelar {
      background: #95a5a6;
      color: white;
    }

    .btn-guardar {
      background: #27ae60;
      color: white;
    }

    .btn-guardar:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .estadisticas-resumen {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #3498db;
    }

    .stat-card h4 {
      margin: 0;
      font-size: 2rem;
      color: #2c3e50;
      font-weight: bold;
    }

    .stat-card p {
      margin: 0.5rem 0 0 0;
      color: #7f8c8d;
      font-weight: 600;
    }

    .empty-state, .loading {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }
  `]
})
export class CarrerasAdminComponent implements OnInit {
  carreras: Carrera[] = [];
  carrerasFiltradas: Carrera[] = [];
  facultades: string[] = [];
  carreraEditando: any = null;
  modoEdicion = false;
  cargando = false;
  busqueda = '';
  filtroFacultad = '';

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarCarreras();
  }

  cargarCarreras() {
    this.cargando = true;
    this.apiService.get<Carrera[]>('carreras').subscribe({
      next: (carreras) => {
        this.carreras = carreras;
        this.carrerasFiltradas = carreras;
        this.extraerFacultades();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar carreras:', error);
        this.toastService.showError('Error al cargar las carreras');
        this.cargando = false;
      }
    });
  }

  extraerFacultades() {
    const facultadesSet = new Set(this.carreras.map(c => c.facultad));
    this.facultades = Array.from(facultadesSet).sort();
  }

  filtrarCarreras() {
    this.carrerasFiltradas = this.carreras.filter(carrera => {
      const coincideBusqueda = !this.busqueda || 
        carrera.nombreCarrera.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        carrera.facultad.toLowerCase().includes(this.busqueda.toLowerCase());
      
      const coincideFacultad = !this.filtroFacultad || carrera.facultad === this.filtroFacultad;
      
      return coincideBusqueda && coincideFacultad;
    });
  }

  nuevaCarrera() {
    this.carreraEditando = {
      nombreCarrera: '',
      facultad: ''
    };
    this.modoEdicion = false;
  }

  editarCarrera(carrera: Carrera) {
    this.carreraEditando = { ...carrera };
    this.modoEdicion = true;
  }

  cerrarModal() {
    this.carreraEditando = null;
    this.modoEdicion = false;
  }

  guardarCarrera() {
    if (!this.carreraEditando.nombreCarrera.trim() || !this.carreraEditando.facultad.trim()) {
      this.toastService.showError('Todos los campos son requeridos');
      return;
    }

    if (this.modoEdicion) {
      this.apiService.put(`carreras/${this.carreraEditando.carreraID}`, this.carreraEditando).subscribe({
        next: () => {
          this.toastService.showSuccess('Carrera actualizada exitosamente');
          this.cerrarModal();
          this.cargarCarreras();
        },
        error: (error) => {
          console.error('Error al actualizar carrera:', error);
          this.toastService.showError('Error al actualizar la carrera');
        }
      });
    } else {
      this.apiService.post('carreras', this.carreraEditando).subscribe({
        next: () => {
          this.toastService.showSuccess('Carrera creada exitosamente');
          this.cerrarModal();
          this.cargarCarreras();
        },
        error: (error) => {
          console.error('Error al crear carrera:', error);
          this.toastService.showError('Error al crear la carrera');
        }
      });
    }
  }

  eliminarCarrera(carrera: Carrera) {
    const estudiantesCount = carrera.perfiles?.length || 0;
    const mensaje = estudiantesCount > 0 
      ? `¿Está seguro de eliminar "${carrera.nombreCarrera}"? Hay ${estudiantesCount} estudiantes registrados en esta carrera.`
      : `¿Está seguro de eliminar la carrera "${carrera.nombreCarrera}"?`;

    if (confirm(mensaje)) {
      this.apiService.delete(`carreras/${carrera.carreraID}`).subscribe({
        next: () => {
          this.toastService.showSuccess('Carrera eliminada exitosamente');
          this.cargarCarreras();
        },
        error: (error) => {
          console.error('Error al eliminar carrera:', error);
          this.toastService.showError('Error al eliminar la carrera');
        }
      });
    }
  }

  getEstudiantesCount(carrera: Carrera): number {
    return carrera.perfiles?.filter(p => p.tipoPerfil === 'Estudiante').length || 0;
  }

  getEgresadosCount(carrera: Carrera): number {
    return carrera.perfiles?.filter(p => p.tipoPerfil === 'Egresado').length || 0;
  }

  getAmbosCount(carrera: Carrera): number {
    return carrera.perfiles?.filter(p => p.tipoPerfil === 'Ambos').length || 0;
  }

  getTotalEstudiantes(): number {
    return this.carreras.reduce((total, carrera) => {
      return total + (carrera.perfiles?.length || 0);
    }, 0);
  }

  getCarrerasSinEstudiantes(): number {
    return this.carreras.filter(carrera => (carrera.perfiles?.length || 0) === 0).length;
  }
}