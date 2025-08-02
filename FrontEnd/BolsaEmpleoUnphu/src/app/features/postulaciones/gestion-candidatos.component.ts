import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Postulacion, UpdateEstadoPostulacionDto } from '../../core/models/postulacion.models';

@Component({
  selector: 'app-gestion-candidatos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="candidatos-page">
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Candidatos para: {{ vacanteTitulo }}</h1>
            <p>Gestiona las postulaciones recibidas para esta vacante</p>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-number">{{ postulaciones.length }}</span>
              <span class="stat-label">Total Candidatos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTROS POR ESTADO -->
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

      <!-- LISTA DE CANDIDATOS -->
      <div class="candidatos-content">
        <div class="candidatos-list">
          <div *ngFor="let postulacion of postulacionesFiltradas" class="candidato-card">
            <div class="candidato-header">
              <div class="candidato-info">
                <h3>{{ postulacion.usuario?.nombreCompleto }}</h3>
                <div class="candidato-meta">
                  <span class="email">{{ postulacion.usuario?.correo }}</span>
                  <span class="telefono">{{ postulacion.usuario?.telefono }}</span>
                  <span class="carrera" *ngIf="postulacion.usuario?.carrera">{{ postulacion.usuario!.carrera }}</span>
                </div>
              </div>
              <div class="estado-section">
                <select 
                  [(ngModel)]="postulacion.estado" 
                  (change)="cambiarEstado(postulacion)"
                  class="estado-select estado-{{ postulacion.estado.toLowerCase().replace(' ', '-') }}">
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Revisión">En Revisión</option>
                  <option value="Aceptado">Aceptado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            </div>
            
            <div class="candidato-body">
              <div class="postulacion-info">
                <div class="info-item">
                  <span class="icon">📅</span>
                  <span>Postulado: {{ postulacion.fechaPostulacion | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
              
              <!-- Respuestas a preguntas -->
              <div class="respuestas-section" *ngIf="postulacion.respuestas.length > 0">
                <h4>Respuestas del candidato</h4>
                <div class="respuestas-list">
                  <div *ngFor="let respuesta of postulacion.respuestas" class="respuesta-item">
                    <div class="pregunta">{{ respuesta.pregunta }}</div>
                    <div class="respuesta">{{ respuesta.respuesta }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="candidato-footer">
              <button class="btn-outline" (click)="verPerfil(postulacion)">Ver Perfil Completo</button>
              <button class="btn-outline" (click)="contactarCandidato(postulacion)">Contactar</button>
              <button 
                *ngIf="postulacion.estado === 'Aceptado'" 
                class="btn-success">
                ✓ Contratado
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="postulacionesFiltradas.length === 0" class="empty-state">
          <h3>{{ estadoSeleccionado === 'Todos' ? 'No hay candidatos' : 'No hay candidatos ' + estadoSeleccionado.toLowerCase() }}</h3>
          <p>{{ estadoSeleccionado === 'Todos' ? 'Aún no has recibido postulaciones para esta vacante' : 'Cambia el filtro para ver candidatos con otros estados' }}</p>
        </div>
      </div>
    </div>

    <!-- MODAL PERFIL ESTUDIANTE -->
    <div *ngIf="mostrarModalPerfil" class="modal-overlay" (click)="cerrarModalPerfil()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Perfil del Candidato</h2>
          <button class="btn-close" (click)="cerrarModalPerfil()">×</button>
        </div>
        
        <div class="modal-body" *ngIf="candidatoSeleccionado">
          <div class="perfil-info">
            <div class="info-section">
              <h3>Información Personal</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Nombre:</span>
                  <span>{{ candidatoSeleccionado.usuario?.nombreCompleto }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Correo:</span>
                  <span>{{ candidatoSeleccionado.usuario?.correo }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Teléfono:</span>
                  <span>{{ candidatoSeleccionado.usuario?.telefono }}</span>
                </div>
                <div class="info-item" *ngIf="candidatoSeleccionado.usuario?.carrera">
                  <span class="label">Carrera:</span>
                  <span>{{ candidatoSeleccionado.usuario?.carrera }}</span>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Información de Postulación</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Fecha de Postulación:</span>
                  <span>{{ candidatoSeleccionado.fechaPostulacion | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Estado:</span>
                  <span class="estado-badge estado-{{ candidatoSeleccionado.estado.toLowerCase().replace(' ', '-') }}">
                    {{ candidatoSeleccionado.estado }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="info-section" *ngIf="candidatoSeleccionado.respuestas.length > 0">
              <h3>Respuestas a Preguntas</h3>
              <div class="respuestas-detalle">
                <div *ngFor="let respuesta of candidatoSeleccionado.respuestas" class="respuesta-detalle">
                  <div class="pregunta-detalle">{{ respuesta.pregunta }}</div>
                  <div class="respuesta-texto">{{ respuesta.respuesta }}</div>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Información Académica (Mock)</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Matrícula:</span>
                  <span>2021-1234</span>
                </div>
                <div class="info-item">
                  <span class="label">Semestre:</span>
                  <span>8vo Semestre</span>
                </div>
                <div class="info-item">
                  <span class="label">Promedio:</span>
                  <span>3.75</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="cerrarModalPerfil()">Cerrar</button>
          <button class="btn-primary" (click)="contactarCandidato(candidatoSeleccionado!)">Contactar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .candidatos-page {
      padding: 2rem;
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
    .header-text h1 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
    }
    .header-text p {
      color: #666;
      margin: 0;
      font-size: 1.1rem;
    }
    .header-stats {
      text-align: center;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--unphu-blue-dark);
    }
    .stat-label {
      font-size: 0.875rem;
      color: #666;
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
    
    /* Candidatos */
    .candidatos-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .candidato-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .candidato-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .candidato-info h3 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .candidato-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .email, .telefono, .carrera {
      color: #666;
      font-size: 0.875rem;
    }
    .estado-select {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      border: none;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
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
    
    .candidato-body {
      padding: 1.5rem;
    }
    .postulacion-info {
      margin-bottom: 1rem;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }
    .respuestas-section {
      margin-top: 1.5rem;
    }
    .respuestas-section h4 {
      color: var(--unphu-blue-dark);
      margin-bottom: 1rem;
      font-size: 1rem;
    }
    .respuesta-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    .pregunta {
      font-weight: 500;
      color: var(--unphu-blue-dark);
      margin-bottom: 0.5rem;
    }
    .respuesta {
      color: #666;
    }
    
    .candidato-footer {
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
    .btn-success {
      background: var(--unphu-green-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: default;
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
    
    /* Modal Perfil */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
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
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h2 {
      margin: 0;
      color: var(--unphu-blue-dark);
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .modal-body {
      padding: 2rem;
    }
    .info-section {
      margin-bottom: 2rem;
    }
    .info-section h3 {
      color: var(--unphu-blue-dark);
      margin-bottom: 1rem;
      font-size: 1.1rem;
      border-bottom: 2px solid var(--unphu-green-primary);
      padding-bottom: 0.5rem;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .label {
      font-weight: 500;
      color: var(--unphu-blue-dark);
    }
    .respuestas-detalle {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .respuesta-detalle {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid var(--unphu-blue-dark);
    }
    .pregunta-detalle {
      font-weight: 500;
      color: var(--unphu-blue-dark);
      margin-bottom: 0.5rem;
    }
    .respuesta-texto {
      color: #666;
      line-height: 1.5;
    }
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .btn-primary {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-secondary {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class GestionCandidatosComponent implements OnInit {
  vacanteId: number = 0;
  vacanteTitulo: string = '';
  postulaciones: Postulacion[] = [];
  postulacionesFiltradas: Postulacion[] = [];
  estadoSeleccionado = 'Todos';
  estadosDisponibles = ['Todos', 'Pendiente', 'En Revisión', 'Aceptado', 'Rechazado'];
  mostrarModalPerfil = false;
  candidatoSeleccionado: Postulacion | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.vacanteId = +params['id'];
      this.cargarCandidatos();
    });
    
    // Escuchar evento personalizado de cambios en postulaciones
    window.addEventListener('postulacionesChanged', () => {
      this.cargarCandidatos();
    });
  }

  cargarCandidatos(): void {
    // Obtener título de la vacante (mock)
    const vacantes = [
      { vacanteID: 1, titulo: 'Desarrollador Frontend React' },
      { vacanteID: 2, titulo: 'Analista de Marketing Digital' },
      { vacanteID: 3, titulo: 'Contador Senior' }
    ];
    
    const vacante = vacantes.find(v => v.vacanteID === this.vacanteId);
    this.vacanteTitulo = vacante?.titulo || 'Vacante';
    
    // Cargar postulaciones reales del localStorage
    const postulacionesGuardadas = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    
    // Mock data inicial
    const hoy = new Date();
    const postulacionesMock = [
      {
        postulacionID: 1,
        vacanteID: this.vacanteId,
        usuarioID: 1,
        fechaPostulacion: new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000),
        estado: 'Pendiente',
        respuestas: [
          {
            postulacionID: 1,
            preguntaID: 1,
            pregunta: '¿Cuántos años de experiencia tienes con React?',
            respuesta: '3-5 años'
          }
        ],
        usuario: {
          nombreCompleto: 'Juan Carlos Pérez',
          correo: 'juan.perez@email.com',
          telefono: '809-555-0123',
          carrera: 'Ingeniería en Sistemas'
        }
      }
    ];
    
    // Convertir postulaciones guardadas al formato correcto
    const postulacionesReales = postulacionesGuardadas
      .filter((p: any) => p.vacanteID === this.vacanteId)
      .map((p: any) => ({
        postulacionID: p.postulacionID,
        vacanteID: p.vacanteID,
        usuarioID: p.usuarioID,
        fechaPostulacion: new Date(p.fechaPostulacion),
        estado: p.estado,
        respuestas: p.respuestas,
        usuario: {
          nombreCompleto: 'Usuario UNPHU', // Mock user data
          correo: 'usuario@unphu.edu.do',
          telefono: '809-555-0000',
          carrera: 'Ingeniería en Sistemas'
        }
      }));
    
    // Combinar mock + postulaciones reales
    this.postulaciones = [...postulacionesMock, ...postulacionesReales];
    this.postulacionesFiltradas = [...this.postulaciones];
  }

  filtrarPorEstado(estado: string): void {
    this.estadoSeleccionado = estado;
    if (estado === 'Todos') {
      this.postulacionesFiltradas = [...this.postulaciones];
    } else {
      this.postulacionesFiltradas = this.postulaciones.filter(p => p.estado === estado);
    }
  }

  contarPorEstado(estado: string): number {
    if (estado === 'Todos') {
      return this.postulaciones.length;
    }
    return this.postulaciones.filter(p => p.estado === estado).length;
  }

  cambiarEstado(postulacion: Postulacion): void {
    console.log('Cambiando estado de postulación:', postulacion.postulacionID, 'a:', postulacion.estado);
    // TODO: Call API to update estado
    
    // Actualizar filtros si es necesario
    this.filtrarPorEstado(this.estadoSeleccionado);
  }

  verPerfil(postulacion: Postulacion): void {
    this.candidatoSeleccionado = postulacion;
    this.mostrarModalPerfil = true;
  }
  
  cerrarModalPerfil(): void {
    this.mostrarModalPerfil = false;
    this.candidatoSeleccionado = null;
  }

  contactarCandidato(postulacion: Postulacion): void {
    console.log('Contactar candidato:', postulacion.usuario?.nombreCompleto);
    // TODO: Open email client or show contact modal
    window.open(`mailto:${postulacion.usuario?.correo}?subject=Oportunidad laboral - ${this.vacanteTitulo}`);
  }
}