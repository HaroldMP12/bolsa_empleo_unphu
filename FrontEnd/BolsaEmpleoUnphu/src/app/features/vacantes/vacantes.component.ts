import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';
import { Vacante, VacanteFiltros, CreateVacanteDto, PreguntaVacante } from '../../core/models/vacante.models';
import { CreatePostulacionDto } from '../../core/models/postulacion.models';
import { ModalPostulacionComponent } from '../postulaciones/modal-postulacion.component';

@Component({
  selector: 'app-vacantes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalPostulacionComponent],
  template: `
    <div class="vacantes-page">
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>{{ isCompany() ? 'Mis Vacantes' : 'Vacantes Disponibles' }}</h1>
            <p>{{ isCompany() ? 'Gestiona tus ofertas de empleo' : 'Explora las oportunidades laborales disponibles' }}</p>
          </div>
          <div class="header-actions" *ngIf="isCompany()">
            <button class="btn-primary" (click)="crearVacante()">+ Nueva Vacante</button>
          </div>
        </div>
      </div>

      <!-- FILTROS PARA ESTUDIANTES -->
      <div *ngIf="!isCompany()" class="filtros-section">
        <div class="filtros-content">
          <div class="filtro-item">
            <label>Buscar</label>
            <input type="text" [(ngModel)]="filtros.search" (input)="aplicarFiltros()" 
                   placeholder="Buscar por título o empresa..." class="form-control">
          </div>
          <div class="filtro-item">
            <label>Categoría</label>
            <select [(ngModel)]="filtros.categoria" (change)="aplicarFiltros()" class="form-control">
              <option value="">Todas las categorías</option>
              <option value="1">Tecnología</option>
              <option value="2">Administración</option>
              <option value="3">Contabilidad</option>
              <option value="4">Mercadeo</option>
              <option value="5">Derecho</option>
            </select>
          </div>
          <div class="filtro-item">
            <label>Modalidad</label>
            <select [(ngModel)]="filtros.modalidad" (change)="aplicarFiltros()" class="form-control">
              <option value="">Todas</option>
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>
          <div class="filtro-item">
            <label>Ubicación</label>
            <select [(ngModel)]="filtros.ubicacion" (change)="aplicarFiltros()" class="form-control">
              <option value="">Todas</option>
              <option value="Santo Domingo">Santo Domingo</option>
              <option value="Santiago">Santiago</option>
              <option value="La Romana">La Romana</option>
              <option value="Remoto">Remoto</option>
            </select>
          </div>
          <button class="btn-secondary" (click)="limpiarFiltros()">Limpiar</button>
        </div>
      </div>

      <!-- LISTA DE VACANTES -->
      <div class="vacantes-content">
        <div class="vacantes-grid">
          <div *ngFor="let vacante of vacantesFiltradas" class="vacante-card">
            <div class="vacante-header">
              <h3>{{ vacante.titulo }}</h3>
              <div class="vacante-meta">
                <span class="empresa">{{ vacante.empresa }}</span>
                <span class="modalidad modalidad-{{ vacante.modalidad.toLowerCase() }}">{{ vacante.modalidad }}</span>
              </div>
            </div>
            
            <div class="vacante-body">
              <p class="descripcion">{{ vacante.descripcion.length > 150 ? (vacante.descripcion | slice:0:150) + '...' : vacante.descripcion }}</p>
              
              <div class="vacante-details">
                <div class="detail-item">
                  <span class="icon">📍</span>
                  <span>{{ vacante.ubicacion }}</span>
                </div>
                <div class="detail-item" *ngIf="vacante.salario">
                  <span class="icon">💰</span>
                  <span>RD$ {{ vacante.salario | number }}</span>
                </div>
                <div class="detail-item">
                  <span class="icon">📅</span>
                  <span>Vence: {{ vacante.fechaVencimiento | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </div>
            
            <div class="vacante-footer">
              <!-- ACCIONES PARA ESTUDIANTES -->
              <div *ngIf="!isCompany()" class="student-actions">
                <button class="btn-outline" (click)="verDetalles(vacante)">Ver Detalles</button>
                <button class="btn-primary" (click)="postularse(vacante)">Postularse</button>
              </div>
              
              <!-- ACCIONES PARA EMPRESAS -->
              <div *ngIf="isCompany()" class="company-actions">
                <div class="postulaciones-count">
                  <span>{{ vacante.postulaciones || 0 }} postulaciones</span>
                </div>
                <div class="action-buttons">
                  <button class="btn-outline" (click)="editarVacante(vacante)">Editar</button>
                  <button class="btn-outline" (click)="verPostulaciones(vacante)">Ver Postulaciones</button>
                  <button class="btn-danger" (click)="eliminarVacante(vacante)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="vacantesFiltradas.length === 0" class="empty-state">
          <h3>{{ isCompany() ? 'No tienes vacantes publicadas' : 'No se encontraron vacantes' }}</h3>
          <p>{{ isCompany() ? 'Crea tu primera vacante para comenzar a recibir postulaciones' : 'Intenta ajustar los filtros de búsqueda' }}</p>
          <button *ngIf="isCompany()" class="btn-primary" (click)="crearVacante()">Crear Primera Vacante</button>
        </div>
      </div>
    </div>

    <!-- MODAL CREAR/EDITAR VACANTE -->
    <div *ngIf="mostrarModal" class="modal-overlay" (click)="cerrarModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ vacanteEditando ? 'Editar Vacante' : 'Nueva Vacante' }}</h2>
          <button class="btn-close" (click)="cerrarModal()">×</button>
        </div>
        
        <div class="modal-body">
          <form class="vacante-form">
            <div class="form-row">
              <div class="form-group">
                <label>Título de la Vacante *</label>
                <input type="text" [(ngModel)]="nuevaVacante.titulo" name="titulo" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Categoría *</label>
                <select [(ngModel)]="nuevaVacante.categoriaID" name="categoria" class="form-control" required>
                  <option value="">Seleccionar categoría</option>
                  <option value="1">Tecnología</option>
                  <option value="2">Administración</option>
                  <option value="3">Contabilidad</option>
                  <option value="4">Mercadeo</option>
                  <option value="5">Derecho</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>Descripción *</label>
              <textarea [(ngModel)]="nuevaVacante.descripcion" name="descripcion" class="form-control" rows="4" required></textarea>
            </div>
            
            <div class="form-group">
              <label>Requisitos *</label>
              <textarea [(ngModel)]="nuevaVacante.requisitos" name="requisitos" class="form-control" rows="3" required></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Modalidad *</label>
                <select [(ngModel)]="nuevaVacante.modalidad" name="modalidad" class="form-control" required>
                  <option value="">Seleccionar modalidad</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ubicación *</label>
                <input type="text" [(ngModel)]="nuevaVacante.ubicacion" name="ubicacion" class="form-control" required>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Salario (Opcional)</label>
                <input type="number" [(ngModel)]="nuevaVacante.salario" name="salario" class="form-control" min="0">
              </div>
              <div class="form-group">
                <label>Fecha de Vencimiento *</label>
                <input type="date" [(ngModel)]="nuevaVacante.fechaVencimiento" name="fechaVencimiento" class="form-control" required>
              </div>
            </div>
            
            <!-- PREGUNTAS PERSONALIZADAS -->
            <div class="preguntas-section">
              <div class="section-header">
                <h4>Preguntas Personalizadas</h4>
                <button type="button" class="btn-add" (click)="agregarPregunta()">+ Agregar Pregunta</button>
              </div>
              
              <div *ngFor="let pregunta of nuevaVacante.preguntas; let i = index" class="pregunta-item">
                <div class="form-row">
                  <div class="form-group">
                    <label>Pregunta</label>
                    <input type="text" [(ngModel)]="pregunta.pregunta" [name]="'pregunta_' + i" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Tipo</label>
                    <select [(ngModel)]="pregunta.tipo" [name]="'tipo_' + i" class="form-control">
                      <option value="texto">Texto</option>
                      <option value="opcion_multiple">Opción Múltiple</option>
                      <option value="si_no">Sí/No</option>
                    </select>
                  </div>
                </div>
                
                <div *ngIf="pregunta.tipo === 'opcion_multiple'" class="form-group">
                  <label>Opciones (separadas por coma)</label>
                  <input type="text" [(ngModel)]="pregunta.opcionesTexto" [name]="'opciones_' + i" 
                         class="form-control" placeholder="Opción 1, Opción 2, Opción 3">
                </div>
                
                <div class="pregunta-actions">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="pregunta.requerida" [name]="'requerida_' + i"> Requerida
                  </label>
                  <button type="button" class="btn-remove" (click)="removerPregunta(i)">Eliminar</button>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="cerrarModal()">Cancelar</button>
          <button class="btn-primary" (click)="guardarVacante()">{{ vacanteEditando ? 'Actualizar' : 'Crear' }} Vacante</button>
        </div>
      </div>
    </div>

    <!-- MODAL POSTULACIÓN -->
    <app-modal-postulacion
      *ngIf="mostrarModalPostulacion"
      [vacante]="vacanteSeleccionada"
      (cerrarModal)="cerrarModalPostulacion()"
      (postulacionEnviada)="procesarPostulacion($event)">
    </app-modal-postulacion>
  `,
  styles: [`
    .vacantes-page {
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
    
    /* Filtros */
    .filtros-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .filtros-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
    }
    .filtro-item label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--unphu-blue-dark);
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }
    .btn-secondary {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
    }
    
    /* Vacantes Grid */
    .vacantes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .vacante-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s;
    }
    .vacante-card:hover {
      transform: translateY(-2px);
    }
    .vacante-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .vacante-header h3 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .vacante-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .empresa {
      color: #666;
      font-weight: 500;
    }
    .modalidad {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .modalidad-presencial { background: #e3f2fd; color: #1976d2; }
    .modalidad-remoto { background: #e8f5e8; color: #388e3c; }
    .modalidad-híbrido { background: #fff3e0; color: #f57c00; }
    
    .vacante-body {
      padding: 1.5rem;
    }
    .descripcion {
      color: #666;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    .vacante-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }
    
    .vacante-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
    }
    .student-actions {
      display: flex;
      gap: 1rem;
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
    .company-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .postulaciones-count {
      color: #666;
      font-size: 0.875rem;
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    /* Modal */
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
      max-width: 800px;
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
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--unphu-blue-dark);
    }
    .preguntas-section {
      margin-top: 2rem;
      border-top: 1px solid #eee;
      padding-top: 2rem;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .section-header h4 {
      margin: 0;
      color: var(--unphu-blue-dark);
    }
    .btn-add {
      background: var(--unphu-green-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .pregunta-item {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .pregunta-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    .btn-remove {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
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
export class VacantesComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  vacantes: Vacante[] = [];
  vacantesFiltradas: Vacante[] = [];
  filtros: VacanteFiltros = {};
  
  mostrarModal = false;
  mostrarModalPostulacion = false;
  vacanteEditando: Vacante | null = null;
  vacanteSeleccionada: Vacante | null = null;
  nuevaVacante: CreateVacanteDto = {
    titulo: '',
    descripcion: '',
    requisitos: '',
    modalidad: '',
    ubicacion: '',
    categoriaID: 0,
    fechaVencimiento: '',
    preguntas: []
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cargarVacantes();
    });
  }

  isCompany(): boolean {
    return this.currentUser?.rol === 'Empresa';
  }

  cargarVacantes(): void {
    // Mock data - replace with real API call
    this.vacantes = [
      {
        vacanteID: 1,
        titulo: 'Desarrollador Frontend React',
        descripcion: 'Buscamos desarrollador frontend con experiencia en React, TypeScript y CSS. Trabajarás en proyectos innovadores con tecnologías modernas.',
        requisitos: 'Experiencia mínima 2 años, React, TypeScript, Git',
        salario: 45000,
        modalidad: 'Híbrido',
        ubicacion: 'Santo Domingo',
        categoriaID: 1,
        categoria: 'Tecnología',
        empresaID: 1,
        empresa: 'TechCorp',
        fechaPublicacion: new Date(),
        fechaVencimiento: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // En 15 días
        estado: true,
        postulaciones: 12,
        preguntas: [
          {
            preguntaID: 1,
            vacanteID: 1,
            pregunta: '¿Cuántos años de experiencia tienes con React?',
            tipo: 'opcion_multiple',
            opciones: ['Menos de 1 año', '1-2 años', '3-5 años', 'Más de 5 años'],
            requerida: true
          },
          {
            preguntaID: 2,
            vacanteID: 1,
            pregunta: '¿Tienes experiencia con TypeScript?',
            tipo: 'si_no',
            requerida: true
          },
          {
            preguntaID: 3,
            vacanteID: 1,
            pregunta: 'Describe un proyecto en el que hayas trabajado con React',
            tipo: 'texto',
            requerida: false
          }
        ]
      },
      {
        vacanteID: 2,
        titulo: 'Analista de Marketing Digital',
        descripcion: 'Únete a nuestro equipo de marketing para desarrollar estrategias digitales innovadoras y gestionar campañas en redes sociales.',
        requisitos: 'Licenciatura en Marketing, Google Ads, Facebook Ads',
        salario: 35000,
        modalidad: 'Presencial',
        ubicacion: 'Santiago',
        categoriaID: 4,
        categoria: 'Mercadeo',
        empresaID: 2,
        empresa: 'MarketPro',
        fechaPublicacion: new Date(),
        fechaVencimiento: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // En 10 días
        estado: true,
        postulaciones: 8,
        preguntas: [
          {
            preguntaID: 4,
            vacanteID: 2,
            pregunta: '¿Tienes certificaciones en Google Ads o Facebook Ads?',
            tipo: 'si_no',
            requerida: true
          },
          {
            preguntaID: 5,
            vacanteID: 2,
            pregunta: '¿Cuál es tu nivel de experiencia en marketing digital?',
            tipo: 'opcion_multiple',
            opciones: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
            requerida: true
          }
        ]
      },
      {
        vacanteID: 3,
        titulo: 'Contador Senior',
        descripcion: 'Posición para contador con experiencia en estados financieros, impuestos y auditorías. Excelente oportunidad de crecimiento.',
        requisitos: 'CPA, 3+ años experiencia, conocimiento NIIF',
        modalidad: 'Presencial',
        ubicacion: 'Santo Domingo',
        categoriaID: 3,
        categoria: 'Contabilidad',
        empresaID: 3,
        empresa: 'ContaPlus',
        fechaPublicacion: new Date(),
        fechaVencimiento: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 días
        estado: true,
        postulaciones: 15,
        preguntas: [
          {
            preguntaID: 6,
            vacanteID: 3,
            pregunta: '¿Tienes experiencia con software contable como SAP o QuickBooks?',
            tipo: 'opcion_multiple',
            opciones: ['SAP', 'QuickBooks', 'Contpaq', 'Aspel', 'Ninguno'],
            requerida: true
          }
        ]
      }
    ];

    if (this.isCompany()) {
      // Filter only company's vacantes
      this.vacantes = this.vacantes.filter(v => v.empresaID === 1); // Mock company ID
    }

    this.vacantesFiltradas = [...this.vacantes];
  }

  aplicarFiltros(): void {
    this.vacantesFiltradas = this.vacantes.filter(vacante => {
      const matchSearch = !this.filtros.search || 
        vacante.titulo.toLowerCase().includes(this.filtros.search.toLowerCase()) ||
        vacante.empresa!.toLowerCase().includes(this.filtros.search.toLowerCase());
      
      const matchCategoria = !this.filtros.categoria || 
        vacante.categoriaID.toString() === this.filtros.categoria.toString();
      
      const matchModalidad = !this.filtros.modalidad || 
        vacante.modalidad === this.filtros.modalidad;
      
      const matchUbicacion = !this.filtros.ubicacion || 
        vacante.ubicacion === this.filtros.ubicacion;

      return matchSearch && matchCategoria && matchModalidad && matchUbicacion;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.vacantesFiltradas = [...this.vacantes];
  }

  crearVacante(): void {
    this.vacanteEditando = null;
    this.nuevaVacante = {
      titulo: '',
      descripcion: '',
      requisitos: '',
      modalidad: '',
      ubicacion: '',
      categoriaID: 0,
      fechaVencimiento: '',
      preguntas: []
    };
    this.mostrarModal = true;
  }

  editarVacante(vacante: Vacante): void {
    this.vacanteEditando = vacante;
    this.nuevaVacante = {
      titulo: vacante.titulo,
      descripcion: vacante.descripcion,
      requisitos: vacante.requisitos,
      salario: vacante.salario,
      modalidad: vacante.modalidad,
      ubicacion: vacante.ubicacion,
      categoriaID: vacante.categoriaID,
      fechaVencimiento: vacante.fechaVencimiento.toISOString().split('T')[0],
      preguntas: vacante.preguntas || []
    };
    this.mostrarModal = true;
  }

  eliminarVacante(vacante: Vacante): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta vacante?')) {
      console.log('Eliminando vacante:', vacante.vacanteID);
      // TODO: Call API to delete
      this.cargarVacantes();
    }
  }

  verPostulaciones(vacante: Vacante): void {
    this.router.navigate(['/candidatos', vacante.vacanteID]);
  }

  verDetalles(vacante: Vacante): void {
    console.log('Ver detalles de:', vacante.titulo);
    // TODO: Show details modal or navigate
  }

  postularse(vacante: Vacante): void {
    this.vacanteSeleccionada = vacante;
    this.mostrarModalPostulacion = true;
  }
  
  cerrarModalPostulacion(): void {
    this.mostrarModalPostulacion = false;
    this.vacanteSeleccionada = null;
  }
  
  procesarPostulacion(postulacionDto: CreatePostulacionDto): void {
    console.log('Procesando postulación:', postulacionDto);
    
    // Simular creación de postulación
    const nuevaPostulacion = {
      postulacionID: Date.now(), // ID temporal
      vacanteID: postulacionDto.vacanteID,
      usuarioID: 1, // ID del usuario actual
      fechaPostulacion: new Date(), // Fecha actual real
      estado: 'Pendiente' as const,
      respuestas: postulacionDto.respuestas.map(r => ({
        postulacionID: Date.now(),
        preguntaID: r.preguntaID,
        pregunta: this.vacanteSeleccionada?.preguntas?.find(p => p.preguntaID === r.preguntaID)?.pregunta || '',
        respuesta: r.respuesta
      })),
      vacante: {
        titulo: this.vacanteSeleccionada?.titulo || '',
        empresa: this.vacanteSeleccionada?.empresa || '',
        modalidad: this.vacanteSeleccionada?.modalidad || '',
        ubicacion: this.vacanteSeleccionada?.ubicacion || ''
      }
    };
    
    // Guardar en localStorage para persistencia temporal
    const postulacionesExistentes = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    postulacionesExistentes.push(nuevaPostulacion);
    localStorage.setItem('postulaciones', JSON.stringify(postulacionesExistentes));
    
    alert('¡Postulación enviada exitosamente! Recibirás una notificación cuando sea revisada.');
    this.cerrarModalPostulacion();
  }

  agregarPregunta(): void {
    this.nuevaVacante.preguntas.push({
      vacanteID: 0,
      pregunta: '',
      tipo: 'texto',
      requerida: false,
      opcionesTexto: ''
    });
  }

  removerPregunta(index: number): void {
    this.nuevaVacante.preguntas.splice(index, 1);
  }

  guardarVacante(): void {
    console.log('Guardando vacante:', this.nuevaVacante);
    // TODO: Call API to save
    this.cerrarModal();
    this.cargarVacantes();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.vacanteEditando = null;
  }
}