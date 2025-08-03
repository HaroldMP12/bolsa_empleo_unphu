import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

interface Categoria {
  categoriaID: number;
  nombreCategoria: string;
  categoriaPadreID?: number;
  categoriaPadre?: {
    nombreCategoria: string;
  };
  categoriasHijas?: Categoria[];
}

@Component({
  selector: 'app-categorias-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="categorias-admin">
      <div class="header">
        <h2>Gestión de Categorías</h2>
        <button class="btn-nuevo" (click)="nuevaCategoria()">+ Nueva Categoría</button>
      </div>

      <div class="categorias-tree" *ngIf="categorias.length > 0">
        <div class="categoria-item" *ngFor="let categoria of categoriasPrincipales">
          <div class="categoria-card principal">
            <div class="categoria-info">
              <h3>{{categoria.nombreCategoria}}</h3>
              <span class="subcategorias-count">
                {{categoria.categoriasHijas?.length || 0}} subcategorías
              </span>
            </div>
            <div class="categoria-actions">
              <button class="btn-editar" (click)="editarCategoria(categoria)">Editar</button>
              <button class="btn-eliminar" (click)="eliminarCategoria(categoria)">Eliminar</button>
            </div>
          </div>

          <div class="subcategorias" *ngIf="categoria.categoriasHijas && categoria.categoriasHijas.length > 0">
            <div class="categoria-card subcategoria" *ngFor="let subcategoria of categoria.categoriasHijas">
              <div class="categoria-info">
                <h4>{{subcategoria.nombreCategoria}}</h4>
              </div>
              <div class="categoria-actions">
                <button class="btn-editar" (click)="editarCategoria(subcategoria)">Editar</button>
                <button class="btn-eliminar" (click)="eliminarCategoria(subcategoria)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="categorias.length === 0 && !cargando">
        <p>No hay categorías registradas</p>
        <button class="btn-nuevo" (click)="nuevaCategoria()">Crear primera categoría</button>
      </div>

      <div class="loading" *ngIf="cargando">
        <p>Cargando categorías...</p>
      </div>

      <!-- Modal de edición/creación -->
      <div class="modal-overlay" *ngIf="categoriaEditando" (click)="cerrarModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{modoEdicion ? 'Editar' : 'Nueva'}} Categoría</h3>
            <button class="btn-close" (click)="cerrarModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre de la Categoría</label>
              <input type="text" [(ngModel)]="categoriaEditando.nombreCategoria" 
                     placeholder="Ingrese el nombre de la categoría">
            </div>
            <div class="form-group">
              <label>Categoría Padre (opcional)</label>
              <select [(ngModel)]="categoriaEditando.categoriaPadreID">
                <option value="">Sin categoría padre (Principal)</option>
                <option *ngFor="let cat of categoriasPrincipales" [value]="cat.categoriaID">
                  {{cat.nombreCategoria}}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancelar" (click)="cerrarModal()">Cancelar</button>
            <button class="btn-guardar" (click)="guardarCategoria()" 
                    [disabled]="!categoriaEditando.nombreCategoria">
              {{modoEdicion ? 'Actualizar' : 'Crear'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categorias-admin {
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

    .categorias-tree {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .categoria-item {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .categoria-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
    }

    .categoria-card.principal {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }

    .categoria-card.subcategoria {
      background: white;
      border-bottom: 1px solid #f1f3f4;
      padding-left: 3rem;
    }

    .categoria-card.subcategoria:last-child {
      border-bottom: none;
    }

    .categoria-info h3, .categoria-info h4 {
      margin: 0;
      color: #2c3e50;
    }

    .categoria-info h4 {
      font-size: 1rem;
      font-weight: 500;
    }

    .subcategorias-count {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .categoria-actions {
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

    .btn-guardar:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .empty-state, .loading {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }
  `]
})
export class CategoriasAdminComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriasPrincipales: Categoria[] = [];
  categoriaEditando: any = null;
  modoEdicion = false;
  cargando = false;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.cargando = true;
    this.apiService.get<Categoria[]>('categorias').subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.organizarCategorias();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.toastService.showError('Error al cargar las categorías');
        this.cargando = false;
      }
    });
  }

  organizarCategorias() {
    // Separar categorías principales y subcategorías
    this.categoriasPrincipales = this.categorias.filter(cat => !cat.categoriaPadreID);
    
    // Asignar subcategorías a sus padres
    this.categoriasPrincipales.forEach(principal => {
      principal.categoriasHijas = this.categorias.filter(cat => cat.categoriaPadreID === principal.categoriaID);
    });
  }

  nuevaCategoria() {
    this.categoriaEditando = {
      nombreCategoria: '',
      categoriaPadreID: null
    };
    this.modoEdicion = false;
  }

  editarCategoria(categoria: Categoria) {
    this.categoriaEditando = { ...categoria };
    this.modoEdicion = true;
  }

  cerrarModal() {
    this.categoriaEditando = null;
    this.modoEdicion = false;
  }

  guardarCategoria() {
    if (!this.categoriaEditando.nombreCategoria.trim()) {
      this.toastService.showError('El nombre de la categoría es requerido');
      return;
    }

    const categoria = {
      ...this.categoriaEditando,
      categoriaPadreID: this.categoriaEditando.categoriaPadreID || null
    };

    if (this.modoEdicion) {
      this.apiService.put(`categorias/${categoria.categoriaID}`, categoria).subscribe({
        next: () => {
          this.toastService.showSuccess('Categoría actualizada exitosamente');
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
          this.toastService.showError('Error al actualizar la categoría');
        }
      });
    } else {
      this.apiService.post('categorias', categoria).subscribe({
        next: () => {
          this.toastService.showSuccess('Categoría creada exitosamente');
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          this.toastService.showError('Error al crear la categoría');
        }
      });
    }
  }

  eliminarCategoria(categoria: Categoria) {
    const tieneSubcategorias = categoria.categoriasHijas && categoria.categoriasHijas.length > 0;
    const mensaje = tieneSubcategorias 
      ? `¿Está seguro de eliminar "${categoria.nombreCategoria}"? Esto también eliminará sus ${categoria.categoriasHijas!.length} subcategorías.`
      : `¿Está seguro de eliminar la categoría "${categoria.nombreCategoria}"?`;

    if (confirm(mensaje)) {
      this.apiService.delete(`categorias/${categoria.categoriaID}`).subscribe({
        next: () => {
          this.toastService.showSuccess('Categoría eliminada exitosamente');
          this.cargarCategorias();
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
          this.toastService.showError('Error al eliminar la categoría');
        }
      });
    }
  }
}