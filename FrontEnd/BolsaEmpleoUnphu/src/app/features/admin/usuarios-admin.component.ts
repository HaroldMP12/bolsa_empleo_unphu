import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminSyncService } from '../../core/services/admin-sync.service';
import { Subscription } from 'rxjs';

interface Usuario {
  usuarioID: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  estado: boolean;
  fechaRegistro: string;
  rol: {
    rolID: number;
    nombreRol: string;
  };
}

interface Rol {
  rolID: number;
  nombreRol: string;
}

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="usuarios-admin">
      <div class="header">
        <h2>Gestión de Usuarios</h2>
        <div class="filters">
          <select [(ngModel)]="filtroRol" (change)="cargarUsuarios()">
            <option value="">Todos los roles</option>
            <option *ngFor="let rol of roles" [value]="rol.rolID">{{rol.nombreRol}}</option>
          </select>
          <select [(ngModel)]="filtroEstado" (change)="cargarUsuarios()">
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <input type="text" [(ngModel)]="busqueda" (input)="cargarUsuarios()" 
                 placeholder="Buscar por nombre o correo...">
        </div>
      </div>

      <div class="usuarios-table" *ngIf="usuarios.length > 0">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let usuario of usuarios">
              <td>
                <div class="usuario-info">
                  <strong>{{usuario.nombreCompleto}}</strong>
                  <small>ID: {{usuario.usuarioID}}</small>
                </div>
              </td>
              <td>{{usuario.correo}}</td>
              <td>{{usuario.telefono || 'No especificado'}}</td>
              <td>
                <span class="rol-badge" [class]="usuario.rol.nombreRol.toLowerCase()">
                  {{usuario.rol.nombreRol}}
                </span>
              </td>
              <td>
                <span class="estado-badge" [class]="usuario.estado ? 'activo' : 'inactivo'">
                  {{usuario.estado ? 'Activo' : 'Inactivo'}}
                </span>
              </td>
              <td>{{formatearFecha(usuario.fechaRegistro)}}</td>
              <td>
                <div class="acciones">
                  <button class="btn-toggle" 
                          (click)="toggleEstadoUsuario(usuario)"
                          [class.activar]="!usuario.estado"
                          [class.desactivar]="usuario.estado">
                    {{usuario.estado ? 'Desactivar' : 'Activar'}}
                  </button>
                  <button class="btn-editar" (click)="editarUsuario(usuario)">
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" *ngIf="usuarios.length === 0 && !cargando">
        <p>No se encontraron usuarios con los filtros aplicados</p>
      </div>

      <div class="loading" *ngIf="cargando">
        <p>Cargando usuarios...</p>
      </div>

      <!-- Modal de edición -->
      <div class="modal-overlay" *ngIf="usuarioEditando" (click)="cerrarModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Editar Usuario</h3>
            <button class="btn-close" (click)="cerrarModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre Completo</label>
              <input type="text" [(ngModel)]="usuarioEditando.nombreCompleto">
            </div>
            <div class="form-group">
              <label>Correo</label>
              <input type="email" [(ngModel)]="usuarioEditando.correo">
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" [(ngModel)]="usuarioEditando.telefono">
            </div>
            <div class="form-group">
              <label>Rol</label>
              <select [(ngModel)]="usuarioEditando.rolID">
                <option *ngFor="let rol of roles" [value]="rol.rolID">{{rol.nombreRol}}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancelar" (click)="cerrarModal()">Cancelar</button>
            <button class="btn-guardar" (click)="guardarUsuario()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .usuarios-admin {
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

    .filters select, .filters input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .usuarios-table {
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

    .usuario-info strong {
      display: block;
    }

    .usuario-info small {
      color: #7f8c8d;
    }

    .rol-badge, .estado-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .rol-badge.admin {
      background: #e8f4fd;
      color: #3498db;
    }

    .rol-badge.estudiante {
      background: #eafaf1;
      color: #27ae60;
    }

    .rol-badge.empresa {
      background: #fef9e7;
      color: #f39c12;
    }

    .estado-badge.activo {
      background: #eafaf1;
      color: #27ae60;
    }

    .estado-badge.inactivo {
      background: #fdedec;
      color: #e74c3c;
    }

    .acciones {
      display: flex;
      gap: 0.5rem;
    }

    .btn-toggle, .btn-editar {
      padding: 0.25rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .btn-toggle.activar {
      background: #27ae60;
      color: white;
    }

    .btn-toggle.desactivar {
      background: #e74c3c;
      color: white;
    }

    .btn-editar {
      background: #3498db;
      color: white;
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
      max-height: 90vh;
      overflow-y: auto;
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

    .form-group input, .form-group select {
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

    .empty-state, .loading {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }
  `]
})
export class UsuariosAdminComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  filtroRol = '';
  filtroEstado = '';
  busqueda = '';
  cargando = false;
  usuarioEditando: any = null;
  private syncSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private syncService: AdminSyncService
  ) {}

  ngOnInit() {
    this.cargarRoles();
    this.cargarUsuarios();
    this.syncSubscription = this.syncService.refresh$.subscribe(() => {
      this.cargarUsuarios();
    });
  }

  ngOnDestroy() {
    this.syncSubscription?.unsubscribe();
  }

  cargarRoles() {
    this.apiService.get<Rol[]>('roles').subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  cargarUsuarios() {
    this.cargando = true;
    const params: any = {};
    
    if (this.filtroRol) params.rolId = this.filtroRol;
    if (this.filtroEstado) params.estado = this.filtroEstado;
    if (this.busqueda) params.search = this.busqueda;

    this.apiService.get<any>('usuarios', params).subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.toastService.showError('Error al cargar los usuarios');
        this.cargando = false;
      }
    });
  }

  toggleEstadoUsuario(usuario: Usuario) {
    const accion = usuario.estado ? 'desactivar' : 'activar';
    if (confirm(`¿Está seguro de ${accion} este usuario?`)) {
      const usuarioActualizado = { ...usuario, estado: !usuario.estado };
      
      this.apiService.put(`usuarios/${usuario.usuarioID}`, usuarioActualizado).subscribe({
        next: () => {
          this.toastService.showSuccess(`Usuario ${accion}do exitosamente`);
          this.syncService.notifyUserChange();
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.toastService.showError('Error al actualizar el usuario');
        }
      });
    }
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioEditando = { ...usuario, rolID: usuario.rol.rolID };
  }

  cerrarModal() {
    this.usuarioEditando = null;
  }

  guardarUsuario() {
    if (this.usuarioEditando) {
      this.apiService.put(`usuarios/${this.usuarioEditando.usuarioID}`, this.usuarioEditando).subscribe({
        next: () => {
          this.toastService.showSuccess('Usuario actualizado exitosamente');
          this.cerrarModal();
          this.syncService.notifyUserChange();
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.toastService.showError('Error al actualizar el usuario');
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}