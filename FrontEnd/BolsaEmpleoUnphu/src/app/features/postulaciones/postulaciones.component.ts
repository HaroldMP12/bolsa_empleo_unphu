import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';

interface Postulacion {
  postulacionID: number;
  vacanteID: number;
  vacanteTitulo: string;
  empresa: string;
  fechaPostulacion: Date;
  estado: 'Pendiente' | 'En Revisión' | 'Aceptado' | 'Rechazado';
  modalidad: string;
  ubicacion: string;
}

@Component({
  selector: 'app-postulaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="postulaciones-page">
      <div class="page-header">
        <h1>Mis Postulaciones</h1>
        <p>Revisa el estado de tus aplicaciones a vacantes</p>
      </div>

      <!-- FILTROS DE ESTADO -->
      <div class="filtros-section">
        <div class="filtros-content">
          <button 
            *ngFor="let estado of estadosDisponibles" 
            class="filtro-btn"
            [class.active]="estadoSeleccionado === estado"
            (click)="filtrarPorEstado(estado)">
            {{ estado }} ({{ contarPorEstado(estado) }})
          </button>
        </div>
      </div>

      <!-- LISTA DE POSTULACIONES -->
      <div class="postulaciones-content">
        <div class="postulaciones-list">
          <div *ngFor="let postulacion of postulacionesFiltradas" class="postulacion-card">
            <div class="postulacion-header">
              <div class="vacante-info">
                <h3>{{ postulacion.vacanteTitulo }}</h3>
                <p class="empresa">{{ postulacion.empresa }}</p>
              </div>
              <div class="estado-badge estado-{{ postulacion.estado.toLowerCase().replace(' ', '-') }}">
                {{ postulacion.estado }}
              </div>
            </div>
            
            <div class="postulacion-body">
              <div class="postulacion-details">
                <div class="detail-item">
                  <span class="icon">📍</span>
                  <span>{{ postulacion.ubicacion }}</span>
                </div>
                <div class="detail-item">
                  <span class="icon">💼</span>
                  <span>{{ postulacion.modalidad }}</span>
                </div>
                <div class="detail-item">
                  <span class="icon">📅</span>
                  <span>Postulado: {{ postulacion.fechaPostulacion | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </div>
            
            <div class="postulacion-footer">
              <button class="btn-outline" (click)="verDetalles(postulacion)">Ver Detalles</button>
              <button 
                *ngIf="postulacion.estado === 'Pendiente'" 
                class="btn-danger" 
                (click)="cancelarPostulacion(postulacion)">
                Cancelar
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="postulacionesFiltradas.length === 0" class="empty-state">
          <h3>{{ estadoSeleccionado === 'Todas' ? 'No tienes postulaciones' : 'No tienes postulaciones ' + estadoSeleccionado.toLowerCase() }}</h3>
          <p>{{ estadoSeleccionado === 'Todas' ? 'Explora las vacantes disponibles y postúlate a las que te interesen' : 'Cambia el filtro para ver postulaciones con otros estados' }}</p>
          <button class="btn-primary" routerLink="/vacantes">Explorar Vacantes</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .postulaciones-page {
      padding: 2rem;
    }
    .page-header {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .page-header h1 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
    }
    .page-header p {
      color: #666;
      margin: 0;
      font-size: 1.1rem;
    }
    
    /* Filtros */
    .filtros-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .filtros-content {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .filtro-btn {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }
    .filtro-btn:hover, .filtro-btn.active {
      background: var(--unphu-blue-dark);
      color: white;
      border-color: var(--unphu-blue-dark);
    }
    
    /* Postulaciones */
    .postulaciones-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .postulacion-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s;
    }
    .postulacion-card:hover {
      transform: translateY(-2px);
    }
    .postulacion-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .vacante-info h3 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .empresa {
      color: #666;
      margin: 0;
      font-weight: 500;
    }
    .estado-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .estado-pendiente {
      background: #fff3cd;
      color: #856404;
    }
    .estado-en-revisión {
      background: #d1ecf1;
      color: #0c5460;
    }
    .estado-aceptado {
      background: #d4edda;
      color: #155724;
    }
    .estado-rechazado {
      background: #f8d7da;
      color: #721c24;
    }
    
    .postulacion-body {
      padding: 1.5rem;
    }
    .postulacion-details {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }
    
    .postulacion-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    .btn-outline {
      background: transparent;
      color: var(--unphu-blue-dark);
      border: 1px solid var(--unphu-blue-dark);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-outline:hover {
      background: var(--unphu-blue-dark);
      color: white;
    }
    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
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
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    .empty-state h3 {
      color: var(--unphu-blue-dark);
      margin-bottom: 1rem;
    }
  `]
})
export class PostulacionesComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  postulaciones: Postulacion[] = [];
  postulacionesFiltradas: Postulacion[] = [];
  estadoSeleccionado = 'Todas';
  estadosDisponibles = ['Todas', 'Pendiente', 'En Revisión', 'Aceptado', 'Rechazado'];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cargarPostulaciones();
    });
  }

  cargarPostulaciones(): void {
    // Mock data - replace with real API call
    this.postulaciones = [
      {
        postulacionID: 1,
        vacanteID: 1,
        vacanteTitulo: 'Desarrollador Frontend React',
        empresa: 'TechCorp',
        fechaPostulacion: new Date('2024-01-10'),
        estado: 'En Revisión',
        modalidad: 'Híbrido',
        ubicacion: 'Santo Domingo'
      },
      {
        postulacionID: 2,
        vacanteID: 2,
        vacanteTitulo: 'Analista de Marketing Digital',
        empresa: 'MarketPro',
        fechaPostulacion: new Date('2024-01-08'),
        estado: 'Pendiente',
        modalidad: 'Presencial',
        ubicacion: 'Santiago'
      },
      {
        postulacionID: 3,
        vacanteID: 3,
        vacanteTitulo: 'Diseñador UX/UI',
        empresa: 'CreativeStudio',
        fechaPostulacion: new Date('2024-01-05'),
        estado: 'Aceptado',
        modalidad: 'Remoto',
        ubicacion: 'Remoto'
      },
      {
        postulacionID: 4,
        vacanteID: 4,
        vacanteTitulo: 'Contador Junior',
        empresa: 'ContaPlus',
        fechaPostulacion: new Date('2024-01-03'),
        estado: 'Rechazado',
        modalidad: 'Presencial',
        ubicacion: 'Santo Domingo'
      }
    ];

    this.postulacionesFiltradas = [...this.postulaciones];
  }

  filtrarPorEstado(estado: string): void {
    this.estadoSeleccionado = estado;
    if (estado === 'Todas') {
      this.postulacionesFiltradas = [...this.postulaciones];
    } else {
      this.postulacionesFiltradas = this.postulaciones.filter(p => p.estado === estado);
    }
  }

  contarPorEstado(estado: string): number {
    if (estado === 'Todas') {
      return this.postulaciones.length;
    }
    return this.postulaciones.filter(p => p.estado === estado).length;
  }

  verDetalles(postulacion: Postulacion): void {
    console.log('Ver detalles de postulación:', postulacion.postulacionID);
    // TODO: Show details modal or navigate
  }

  cancelarPostulacion(postulacion: Postulacion): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta postulación?')) {
      console.log('Cancelando postulación:', postulacion.postulacionID);
      // TODO: Call API to cancel
      this.cargarPostulaciones();
    }
  }
}