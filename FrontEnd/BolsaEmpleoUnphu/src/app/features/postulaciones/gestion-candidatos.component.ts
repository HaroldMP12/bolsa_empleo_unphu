import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSyncService } from '../../core/services/data-sync.service';
import { MensajeService } from '../../core/services/mensaje.service';
import { Postulacion, UpdateEstadoPostulacionDto } from '../../core/models/postulacion.models';
import { CreateMensajeDto } from '../../core/models/mensaje.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-candidatos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="candidatos-page">
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Candidatos para: {{ vacanteTitulo || 'Vacante' }}</h1>
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
              <button class="btn-outline" (click)="contactarCandidato(postulacion)">Email</button>
              <button class="btn-primary" (click)="enviarMensaje(postulacion)">💬 Mensaje</button>
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
            <!-- Foto de Perfil y CV -->
            <div class="info-section">
              <h3>Documentos y Foto</h3>
              <div class="documentos-grid">
                <div class="documento-item">
                  <span class="label">Foto de Perfil:</span>
                  <div class="foto-perfil">
                    <img *ngIf="getUserProperty(candidatoSeleccionado.usuario, 'fotoPerfil')" 
                         [src]="getUserProperty(candidatoSeleccionado.usuario, 'fotoPerfil')" 
                         alt="Foto de perfil" class="foto-img">
                    <div *ngIf="!getUserProperty(candidatoSeleccionado.usuario, 'fotoPerfil')" class="no-disponible">
                      📷 No disponible
                    </div>
                  </div>
                </div>
                <div class="documento-item">
                  <span class="label">Currículum Vitae:</span>
                  <div class="cv-section">
                    <a *ngIf="getUserProperty(candidatoSeleccionado.usuario, 'cv')" 
                       [href]="getUserProperty(candidatoSeleccionado.usuario, 'cv')" 
                       target="_blank" 
                       class="btn-cv">
                      📄 Ver CV
                    </a>
                    <div *ngIf="!getUserProperty(candidatoSeleccionado.usuario, 'cv')" class="no-disponible">
                      📄 No disponible
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
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
              <h3>Información Académica</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Matrícula:</span>
                  <span>{{ getUserProperty(candidatoSeleccionado.usuario, 'matricula') || 'No disponible' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Semestre:</span>
                  <span>{{ getUserProperty(candidatoSeleccionado.usuario, 'semestre') || 'No disponible' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Promedio:</span>
                  <span>{{ getUserProperty(candidatoSeleccionado.usuario, 'promedio') || 'No disponible' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="cerrarModalPerfil()">Cerrar</button>
          <button class="btn-outline" (click)="contactarCandidato(candidatoSeleccionado!)">Email</button>
          <button class="btn-primary" (click)="enviarMensaje(candidatoSeleccionado!)">💬 Mensaje</button>
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
    @media (max-width: 768px) {
      .documentos-grid, .info-grid {
        grid-template-columns: 1fr;
      }
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
    
    /* Documentos y Foto */
    .documentos-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .documento-item {
      text-align: center;
    }
    .documento-item .label {
      display: block;
      margin-bottom: 1rem;
      font-weight: 600;
      color: var(--unphu-blue-dark);
    }
    .foto-perfil {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 120px;
    }
    .foto-img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--unphu-green-primary);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .cv-section {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 120px;
    }
    .btn-cv {
      background: var(--unphu-blue-dark);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-cv:hover {
      background: #0a2a3f;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .no-disponible {
      background: #f8f9fa;
      color: #666;
      padding: 1rem;
      border-radius: 8px;
      border: 2px dashed #dee2e6;
      font-style: italic;
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
export class GestionCandidatosComponent implements OnInit, OnDestroy {
  vacanteId: number = 0;
  vacanteTitulo: string = '';
  postulaciones: Postulacion[] = [];
  postulacionesFiltradas: Postulacion[] = [];
  estadoSeleccionado = 'Todos';
  estadosDisponibles = ['Todos', 'Pendiente', 'En Revisión', 'Aceptado', 'Rechazado'];
  mostrarModalPerfil = false;
  candidatoSeleccionado: Postulacion | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataSyncService: DataSyncService,
    private mensajeService: MensajeService
  ) {}

  ngOnInit(): void {
    const routeSub = this.route.params.subscribe(params => {
      this.vacanteId = +params['id'];
      this.cargarCandidatos();
    });
    this.subscriptions.push(routeSub);
    
    // Subscribe to data changes
    const postulacionesSub = this.dataSyncService.postulaciones$.subscribe(() => {
      this.cargarCandidatos();
    });
    this.subscriptions.push(postulacionesSub);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarCandidatos(): void {
    // Get vacante title from API directly
    fetch(`https://localhost:7236/api/vacantes/${this.vacanteId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(vacante => {
      this.vacanteTitulo = vacante?.TituloVacante || vacante?.tituloVacante || 'Vacante';
      console.log('Vacante desde API:', vacante);
      console.log('Título asignado:', this.vacanteTitulo);
    })
    .catch(error => {
      console.error('Error obteniendo vacante:', error);
      this.vacanteTitulo = 'Vacante';
    });
    
    // Get applications for this vacante
    const aplicaciones = this.dataSyncService.getVacanteApplications(this.vacanteId);
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // Convert applications to display format
    this.postulaciones = aplicaciones.map((p: any) => {
      const usuario = usuariosGuardados.find((u: any) => u.usuarioID === p.usuarioID) || {
        nombreCompleto: 'Usuario UNPHU',
        correo: 'usuario@unphu.edu.do',
        telefono: '809-555-0000',
        carrera: 'Ingeniería en Sistemas'
      };
      
      return {
        postulacionID: p.postulacionID,
        vacanteID: p.vacanteID,
        usuarioID: p.usuarioID,
        fechaPostulacion: new Date(p.fechaPostulacion),
        estado: p.estado,
        respuestas: p.respuestas,
        usuario: usuario
      };
    });
    
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
    
    // Llamar al API para cambiar el estado
    this.dataSyncService.cambiarEstadoPostulacion(postulacion.usuarioID, this.vacanteTitulo, postulacion.estado)
      .subscribe({
        next: () => {
          console.log('Estado cambiado exitosamente');
          // Update in localStorage
          const postulacionesGuardadas = JSON.parse(localStorage.getItem('postulaciones') || '[]');
          const index = postulacionesGuardadas.findIndex((p: any) => p.postulacionID === postulacion.postulacionID);
          
          if (index !== -1) {
            postulacionesGuardadas[index].estado = postulacion.estado;
            localStorage.setItem('postulaciones', JSON.stringify(postulacionesGuardadas));
            
            // Notify data sync service of the change
            this.dataSyncService.notifyPostulacionesChanged();
          }
          
          // Actualizar filtros si es necesario
          this.filtrarPorEstado(this.estadoSeleccionado);
        },
        error: (error) => {
          console.error('Error cambiando estado:', error);
          // Revertir el cambio en la UI
          this.cargarCandidatos();
        }
      });
  }

  verPerfil(postulacion: Postulacion): void {
    this.candidatoSeleccionado = postulacion;
    this.cargarPerfilCompleto(postulacion.usuarioID);
    this.mostrarModalPerfil = true;
  }
  
  cerrarModalPerfil(): void {
    this.mostrarModalPerfil = false;
    this.candidatoSeleccionado = null;
  }

  contactarCandidato(postulacion: Postulacion): void {
    console.log('Contactar candidato:', postulacion.usuario?.nombreCompleto);
    const subject = `Oportunidad laboral - ${this.vacanteTitulo}`;
    window.open(`mailto:${postulacion.usuario?.correo}?subject=${encodeURIComponent(subject)}`);
  }

  enviarMensaje(postulacion: Postulacion): void {
    const mensaje: CreateMensajeDto = {
      receptorID: postulacion.usuarioID,
      vacanteID: this.vacanteId,
      contenido: `Hola ${postulacion.usuario?.nombreCompleto}, me interesa conversar contigo sobre tu postulación para la vacante "${this.vacanteTitulo}".`,
      tipoMensaje: 'texto'
    };

    this.mensajeService.enviarMensaje(mensaje).subscribe({
      next: () => {
        this.router.navigate(['/mensajes']);
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
      }
    });
  }

  getUserProperty(usuario: any, property: string): any {
    return usuario && usuario[property] ? usuario[property] : null;
  }

  cargarPerfilCompleto(usuarioID: number): void {
    // Cargar perfil del estudiante desde la API
    fetch(`https://localhost:7236/api/perfiles/usuario/${usuarioID}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(perfil => {
      console.log('Perfil cargado:', perfil);
      if (this.candidatoSeleccionado && perfil) {
        // Actualizar datos del usuario con información real del perfil
        this.candidatoSeleccionado.usuario = {
          ...this.candidatoSeleccionado.usuario,
          carrera: perfil.carrera?.nombreCarrera || 'No especificada',
          matricula: perfil.matricula || 'No disponible',
          semestre: perfil.semestre || 'No disponible',
          promedio: perfil.promedio || 'No disponible',
          fotoPerfil: perfil.fotoPerfil,
          cv: perfil.cv
        };
      }
    })
    .catch(error => {
      console.error('Error cargando perfil:', error);
    });
  }
}