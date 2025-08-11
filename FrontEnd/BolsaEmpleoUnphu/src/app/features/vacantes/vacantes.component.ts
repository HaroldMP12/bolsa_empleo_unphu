import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataSyncService } from '../../core/services/data-sync.service';
import { ApiService } from '../../core/services/api.service';
import { AuthResponse } from '../../core/models/auth.models';
import { Vacante, VacanteFiltros, CreateVacanteDto, PreguntaVacante } from '../../core/models/vacante.models';
import { CreatePostulacionDto } from '../../core/models/postulacion.models';
import { ModalPostulacionComponent } from '../postulaciones/modal-postulacion.component';
import { Subscription } from 'rxjs';

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

      <!-- SECCIÓN DE RECOMENDACIONES -->
      <div *ngIf="!isCompany() && vacantesRecomendadas.length > 0" class="recomendaciones-section">
        <div class="section-header">
          <h2>🎯 Recomendadas para ti</h2>
          <p>Basadas en tu carrera: <strong>{{ carreraUsuario }}</strong></p>
        </div>
        <div class="recomendaciones-grid">
          <div *ngFor="let vacante of vacantesRecomendadas" class="vacante-card recomendada">
            <div class="recomendacion-badge">Recomendada</div>
            <div class="vacante-header">
              <h3>{{ getTituloVacante(vacante) }}</h3>
              <div class="vacante-meta">
                <span class="empresa">{{ getEmpresaNombre(vacante.empresa) }}</span>
                <span class="modalidad modalidad-{{ vacante.modalidad ? vacante.modalidad.toLowerCase() : 'sin-modalidad' }}">{{ vacante.modalidad || 'No especificada' }}</span>
              </div>
            </div>
            
            <div class="vacante-body">
              <p class="descripcion">{{ vacante.descripcion.length > 100 ? (vacante.descripcion | slice:0:100) + '...' : vacante.descripcion }}</p>
              
              <div class="vacante-details">
                <div class="detail-item">
                  <span class="icon">📍</span>
                  <span>{{ vacante.ubicacion }}</span>
                </div>
                <div class="detail-item" *ngIf="vacante.salario">
                  <span class="icon">💰</span>
                  <span>RD$ {{ vacante.salario | number }}</span>
                </div>
              </div>
            </div>
            
            <div class="vacante-footer">
              <div class="student-actions">
                <button class="btn-outline" (click)="verDetalles(vacante)">Ver Detalles</button>
                <button class="btn-primary" (click)="postularse(vacante)">Postularse</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LISTA DE VACANTES -->
      <div class="vacantes-content">
        <div class="section-header" *ngIf="!isCompany()">
          <h2>Todas las vacantes</h2>
        </div>
        <div class="vacantes-grid">
          <div *ngFor="let vacante of vacantesFiltradas" class="vacante-card">
            <div class="vacante-header">
              <h3>{{ getTituloVacante(vacante) }}</h3>
              <div class="vacante-meta">
                <span class="empresa">{{ getEmpresaNombre(vacante.empresa) }}</span>
                <span class="modalidad modalidad-{{ vacante.modalidad ? vacante.modalidad.toLowerCase() : 'sin-modalidad' }}">{{ vacante.modalidad || 'No especificada' }}</span>
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
                  <span>Vence: {{ (vacante.fechaCierre || vacante.fechaVencimiento) | date:'dd/MM/yyyy' }}</span>
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
                <input type="number" [(ngModel)]="nuevaVacante.salario" name="salario" class="form-control" min="0" placeholder="Opcional">
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

    <!-- MODAL CONFIRMACIÓN -->
    <div *ngIf="mostrarConfirmacionModal" class="modal-overlay" (click)="cerrarConfirmacion()">
      <div class="confirmation-modal" (click)="$event.stopPropagation()">
        <div class="confirmation-header">
          <h3>{{ confirmacionTitulo }}</h3>
        </div>
        <div class="confirmation-body">
          <p>{{ confirmacionMensaje }}</p>
        </div>
        <div class="confirmation-footer">
          <button class="btn-confirm" (click)="cerrarConfirmacion()">Aceptar</button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMACIÓN ELIMINAR -->
    <div *ngIf="mostrarConfirmacionEliminarModal" class="modal-overlay" (click)="cerrarConfirmacionEliminar()">
      <div class="confirmation-modal" (click)="$event.stopPropagation()">
        <div class="confirmation-header">
          <h3>{{ confirmacionEliminarTitulo }}</h3>
        </div>
        <div class="confirmation-body">
          <p>{{ confirmacionEliminarMensaje }}</p>
        </div>
        <div class="confirmation-footer">
          <button class="btn-cancel" (click)="cerrarConfirmacionEliminar()">Cancelar</button>
          <button class="btn-confirm" (click)="confirmarEliminacion()">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLES VACANTE -->
    <div *ngIf="mostrarModalDetalles" class="modal-overlay" (click)="cerrarModalDetalles()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Detalles de la Vacante</h2>
          <button class="btn-close" (click)="cerrarModalDetalles()">×</button>
        </div>
        
        <div class="modal-body" *ngIf="vacanteSeleccionada">
          <div class="vacante-detalles">
            <h3>{{ getTituloVacante(vacanteSeleccionada) }}</h3>
            <div class="empresa-info">
              <span class="empresa-nombre">{{ getEmpresaNombre(vacanteSeleccionada.empresa) }}</span>
              <span class="modalidad modalidad-{{ vacanteSeleccionada.modalidad ? vacanteSeleccionada.modalidad.toLowerCase() : 'sin-modalidad' }}">{{ vacanteSeleccionada.modalidad || 'No especificada' }}</span>
            </div>
            
            <div class="detalles-grid">
              <div class="detalle-item">
                <span class="label">Ubicación:</span>
                <span>{{ vacanteSeleccionada.ubicacion }}</span>
              </div>
              <div class="detalle-item" *ngIf="vacanteSeleccionada.salario">
                <span class="label">Salario:</span>
                <span>RD$ {{ vacanteSeleccionada.salario | number }}</span>
              </div>
              <div class="detalle-item">
                <span class="label">Fecha de Vencimiento:</span>
                <span>{{ vacanteSeleccionada.fechaVencimiento | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="detalle-item">
                <span class="label">Categoría:</span>
                <span>{{ vacanteSeleccionada.categoria }}</span>
              </div>
            </div>
            
            <div class="descripcion-section">
              <h4>Descripción</h4>
              <p>{{ vacanteSeleccionada.descripcion }}</p>
            </div>
            
            <div class="requisitos-section">
              <h4>Requisitos</h4>
              <p>{{ vacanteSeleccionada.requisitos }}</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="cerrarModalDetalles()">Cerrar</button>
          <button *ngIf="!isCompany()" class="btn-primary" (click)="postularseDesdeDetalles()">Postularse</button>
        </div>
      </div>
    </div>
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
    
    /* Recomendaciones */
    .recomendaciones-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 2px solid var(--unphu-green-primary);
    }
    .recomendaciones-section .section-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .recomendaciones-section .section-header h2 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }
    .recomendaciones-section .section-header p {
      color: #666;
      margin: 0;
    }
    .recomendaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    .vacante-card.recomendada {
      position: relative;
      border: 2px solid var(--unphu-green-primary);
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);
    }
    .recomendacion-badge {
      position: absolute;
      top: -8px;
      right: 12px;
      background: var(--unphu-green-primary);
      color: white;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
      z-index: 1;
      backdrop-filter: blur(10px);
    }
    
    /* Vacantes Grid */
    .vacantes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .section-header {
      margin-bottom: 1.5rem;
    }
    .section-header h2 {
      color: var(--unphu-blue-dark);
      margin: 0;
      font-size: 1.5rem;
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
    
    /* Modal de Confirmación */
    .confirmation-modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .confirmation-header {
      background: var(--unphu-green-primary);
      color: white;
      padding: 1.5rem;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .confirmation-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .confirmation-body {
      padding: 2rem;
      text-align: center;
    }
    .confirmation-body p {
      margin: 0;
      color: #666;
      line-height: 1.5;
      font-size: 1rem;
    }
    .confirmation-footer {
      padding: 1.5rem;
      display: flex;
      justify-content: center;
    }
    .btn-confirm {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .btn-confirm:hover {
      background: #0a2a3f;
    }
    
    .btn-cancel {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .btn-cancel:hover {
      background: #e9ecef;
    }
    
    .confirmation-footer {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    /* Campos con error */
    .form-control.error {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
    
    .form-control.error:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
    
    /* Modal Detalles */
    .vacante-detalles h3 {
      color: var(--unphu-blue-dark);
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }
    .empresa-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .empresa-nombre {
      color: #666;
      font-weight: 500;
      font-size: 1.1rem;
    }
    .detalles-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .detalle-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .detalle-item .label {
      font-weight: 500;
      color: var(--unphu-blue-dark);
    }
    .descripcion-section, .requisitos-section {
      margin-bottom: 1.5rem;
    }
    .descripcion-section h4, .requisitos-section h4 {
      color: var(--unphu-blue-dark);
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }
    .descripcion-section p, .requisitos-section p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }
  `]
})
export class VacantesComponent implements OnInit, OnDestroy {
  currentUser: AuthResponse | null = null;
  vacantes: Vacante[] = [];
  vacantesFiltradas: Vacante[] = [];
  vacantesRecomendadas: Vacante[] = [];
  vacantesRecomendadasOriginales: Vacante[] = [];
  carreraUsuario = '';
  filtros: VacanteFiltros = {};
  
  mostrarModal = false;
  mostrarModalPostulacion = false;
  vacanteEditando: Vacante | null = null;
  vacanteSeleccionada: Vacante | null = null;
  mostrarConfirmacionModal = false;
  confirmacionTitulo = '';
  confirmacionMensaje = '';
  mostrarConfirmacionEliminarModal = false;
  confirmacionEliminarTitulo = '';
  confirmacionEliminarMensaje = '';
  confirmacionEliminarCallback: (() => void) | null = null;
  mostrarModalDetalles = false;
  nuevaVacante: CreateVacanteDto = {
    titulo: '',
    descripcion: '',
    requisitos: '',
    modalidad: '',
    ubicacion: '',
    categoriaID: 0,
    fechaVencimiento: '',
    salario: undefined,
    preguntas: []
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private dataSyncService: DataSyncService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cargarVacantes();
    });
    this.subscriptions.push(userSub);
    
    const vacantesSub = this.dataSyncService.vacantes$.subscribe(() => {
      this.cargarVacantes();
    });
    this.subscriptions.push(vacantesSub);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  isCompany(): boolean {
    return this.currentUser?.rol === 'Empresa';
  }

  cargarVacantes(): void {
    if (this.isCompany()) {
      // Para empresas, usar endpoint específico
      this.apiService.get(`empresas/usuario/${this.currentUser?.usuarioID}`).subscribe({
        next: (empresa: any) => {
          if (empresa && empresa.empresaID) {
            this.apiService.get(`vacantes/empresa/${empresa.empresaID}`).subscribe({
              next: (vacantesEmpresa: any) => {
                const vacantesData = vacantesEmpresa.data || vacantesEmpresa || [];
                
                // Cargar postulaciones desde localStorage para contar
                const todasPostulaciones = JSON.parse(localStorage.getItem('postulaciones') || '[]');
                
                // Mapear los datos del backend al formato esperado por el frontend
                this.vacantes = vacantesData.map((v: any) => {
                  const postulacionesVacante = todasPostulaciones.filter((p: any) => p.vacanteID == v.vacanteID);
                  return {
                    ...v,
                    titulo: v.tituloVacante,
                    empresa: v.nombreEmpresa,
                    categoria: v.nombreCategoria,
                    fechaVencimiento: v.fechaCierre,
                    postulaciones: postulacionesVacante.length
                  };
                });
                this.vacantesFiltradas = [...this.vacantes];
              },
              error: () => {
                this.vacantes = [];
                this.vacantesFiltradas = [];
              }
            });
          } else {
            this.vacantes = [];
            this.vacantesFiltradas = [];
          }
        },
        error: () => {
          this.vacantes = [];
          this.vacantesFiltradas = [];
        }
      });
    } else {
      // Para estudiantes, cargar recomendaciones y todas las vacantes
      this.cargarVacantesRecomendadas();
      this.cargarTodasLasVacantes();
    }
  }

  cargarVacantesRecomendadas(): void {
    this.apiService.get<any>('vacantes/recomendadas').subscribe({
      next: (vacantesData) => {
        this.vacantesRecomendadasOriginales = vacantesData.map((v: any) => ({
          ...v,
          titulo: v.tituloVacante,
          empresa: v.nombreEmpresa,
          categoria: v.nombreCategoria,
          fechaVencimiento: v.fechaCierre,
          categoriaID: v.categoriaID || v.CategoriaID
        }));
        this.vacantesRecomendadas = [...this.vacantesRecomendadasOriginales];
        
        // Obtener carrera del usuario para mostrar en la UI
        this.obtenerCarreraUsuario();
      },
      error: (error) => {
        console.error('Error al cargar recomendaciones:', error);
        this.vacantesRecomendadas = [];
        this.vacantesRecomendadasOriginales = [];
      }
    });
  }

  cargarTodasLasVacantes(): void {
    this.apiService.get<any>('vacantes').subscribe({
      next: (response) => {
        const vacantesData = response.data || response || [];
        // Mapear los datos del backend al formato esperado por el frontend
        this.vacantes = vacantesData.map((v: any) => ({
          ...v,
          titulo: v.tituloVacante,
          empresa: v.nombreEmpresa,
          categoria: v.nombreCategoria,
          fechaVencimiento: v.fechaCierre,
          categoriaID: v.categoriaID || v.CategoriaID
        }));
        this.vacantesFiltradas = [...this.vacantes];
      },
      error: (error) => {
        console.error('Error al cargar vacantes:', error);
        this.vacantes = [];
        this.vacantesFiltradas = [];
      }
    });
  }

  obtenerCarreraUsuario(): void {
    if (this.currentUser?.usuarioID) {
      this.apiService.get(`perfiles/usuario/${this.currentUser.usuarioID}`).subscribe({
        next: (perfil: any) => {
          if (perfil && perfil.carrera) {
            this.carreraUsuario = perfil.carrera.nombreCarrera || 'No especificada';
          }
        },
        error: () => {
          this.carreraUsuario = 'No especificada';
        }
      });
    }
  }

  aplicarFiltros(): void {
    // Filtrar vacantes normales
    this.vacantesFiltradas = this.vacantes.filter(vacante => this.aplicarFiltroAVacante(vacante));
    
    // Filtrar vacantes recomendadas también
    this.vacantesRecomendadas = this.vacantesRecomendadas.filter(vacante => this.aplicarFiltroAVacante(vacante));
  }
  
  private aplicarFiltroAVacante(vacante: any): boolean {
    const titulo = vacante.titulo || vacante.tituloVacante || '';
    const empresaNombre = this.getEmpresaNombre(vacante.empresa);
    
    const matchSearch = !this.filtros.search || 
      titulo.toLowerCase().includes(this.filtros.search.toLowerCase()) ||
      empresaNombre.toLowerCase().includes(this.filtros.search.toLowerCase());
    
    const matchCategoria = !this.filtros.categoria || 
      (vacante.categoriaID || vacante.CategoriaID)?.toString() === this.filtros.categoria.toString();
    
    const matchModalidad = !this.filtros.modalidad || 
      (vacante.modalidad || vacante.Modalidad) === this.filtros.modalidad;
    
    const matchUbicacion = !this.filtros.ubicacion || 
      (vacante.ubicacion || vacante.Ubicacion)?.includes(this.filtros.ubicacion);

    return matchSearch && matchCategoria && matchModalidad && matchUbicacion;
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.vacantesFiltradas = [...this.vacantes];
    this.vacantesRecomendadas = [...this.vacantesRecomendadasOriginales];
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
      salario: undefined,
      preguntas: []
    };
    this.mostrarModal = true;
  }

  editarVacante(vacante: Vacante): void {
    this.vacanteEditando = vacante;
    const fechaVencimiento = vacante.fechaVencimiento || vacante.fechaCierre;
    this.nuevaVacante = {
      titulo: vacante.titulo || vacante.tituloVacante || '',
      descripcion: vacante.descripcion,
      requisitos: vacante.requisitos,
      salario: vacante.salario,
      modalidad: vacante.modalidad || '',
      ubicacion: vacante.ubicacion,
      categoriaID: vacante.categoriaID,
      fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento).toISOString().split('T')[0] : '',
      preguntas: (vacante.preguntas || []).map(p => ({
        ...p,
        opcionesTexto: p.opciones ? p.opciones.join(', ') : ''
      }))
    };
    this.mostrarModal = true;
  }

  eliminarVacante(vacante: Vacante): void {
    this.mostrarConfirmacionEliminar(
      'Eliminar Vacante',
      `¿Estás seguro de que deseas eliminar la vacante "${this.getTituloVacante(vacante)}"? Esta acción no se puede deshacer.`,
      () => {
        // Eliminar usando la API
        console.log('Eliminando vacante ID:', vacante.vacanteID);
        this.apiService.delete(`vacantes/${vacante.vacanteID}`).subscribe({
          next: () => {
            console.log('Vacante eliminada exitosamente');
            this.mostrarConfirmacion('Vacante Eliminada', 'La vacante ha sido eliminada exitosamente.');
            this.cargarVacantes();
            this.dataSyncService.notifyVacantesChanged();
          },
          error: (error) => {
            console.error('Error completo al eliminar vacante:', error);
            console.error('Status:', error.status);
            console.error('Message:', error.message);
            this.mostrarConfirmacion('Error', `No se pudo eliminar la vacante. Error: ${error.status}`);
          }
        });
      }
    );
  }

  verPostulaciones(vacante: Vacante): void {
    this.router.navigate(['/candidatos', vacante.vacanteID]);
  }

  verDetalles(vacante: Vacante): void {
    this.vacanteSeleccionada = vacante;
    this.mostrarModalDetalles = true;
  }
  
  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.vacanteSeleccionada = null;
  }
  
  postularseDesdeDetalles(): void {
    this.cerrarModalDetalles();
    this.postularse(this.vacanteSeleccionada!);
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
    
    const usuarioID = this.currentUser?.usuarioID || Date.now();
    const vacanteID = this.vacanteSeleccionada?.vacanteID;
    
    // Validar postulación duplicada
    const postulacionesExistentes = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    const yaPostulado = postulacionesExistentes.some((p: any) => 
      p.vacanteID == vacanteID && p.usuarioID == usuarioID
    );
    
    if (yaPostulado) {
      this.mostrarConfirmacion('Ya te postulaste', 'Ya te has postulado a esta vacante anteriormente.');
      this.cerrarModalPostulacion();
      return;
    }
    
    // Crear postulación
    const nuevaPostulacion = {
      postulacionID: Date.now(), // ID temporal
      vacanteID: this.vacanteSeleccionada?.vacanteID || postulacionDto.vacanteID, // Usar el vacanteID correcto
      usuarioID: usuarioID,
      fechaPostulacion: new Date(), // Fecha actual real
      estado: 'Pendiente' as const,
      respuestas: postulacionDto.respuestas.map(r => ({
        postulacionID: Date.now(),
        preguntaID: r.preguntaID,
        pregunta: this.vacanteSeleccionada?.preguntas?.find(p => p.preguntaID === r.preguntaID)?.pregunta || '',
        respuesta: r.respuesta
      })),
      vacante: {
        titulo: this.vacanteSeleccionada?.titulo || this.vacanteSeleccionada?.tituloVacante || '',
        empresa: this.getEmpresaNombre(this.vacanteSeleccionada?.empresa),
        modalidad: this.vacanteSeleccionada?.modalidad || '',
        ubicacion: this.vacanteSeleccionada?.ubicacion || ''
      }
    };
    
    console.log('Nueva postulación creada:', nuevaPostulacion);
    
    // Guardar datos del usuario actual para que la empresa los vea
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioExistente = usuariosGuardados.find((u: any) => u.usuarioID === usuarioID);
    
    if (!usuarioExistente && this.currentUser) {
      const datosUsuario = {
        usuarioID: usuarioID,
        nombreCompleto: this.currentUser.nombreCompleto,
        correo: this.currentUser.correo,
        telefono: '809-555-0000', // Mock data
        carrera: 'Ingeniería en Sistemas' // Mock data
      };
      usuariosGuardados.push(datosUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));
    }
    
    // Guardar en localStorage (funciona inmediatamente)
    const postulacionesGuardadas = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    postulacionesGuardadas.push(nuevaPostulacion);
    localStorage.setItem('postulaciones', JSON.stringify(postulacionesGuardadas));
    
    // Enviar al backend en segundo plano
    const postulacionBackend = {
      VacanteID: this.vacanteSeleccionada?.vacanteID,
      UsuarioID: usuarioID,
      Observaciones: 'Postulación desde frontend'
    };
    
    this.apiService.post('postulaciones', postulacionBackend).subscribe({
      next: () => console.log('Postulación enviada al backend'),
      error: (error) => console.error('Error al enviar al backend:', error)
    });
    
    window.dispatchEvent(new CustomEvent('postulacionesChanged'));
    this.cerrarModalPostulacion();
    this.mostrarConfirmacion('Postulación Enviada', '¡Tu postulación ha sido enviada exitosamente! Recibirás una notificación cuando sea revisada.');
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
    // Validar campos requeridos
    if (!this.validarFormulario()) {
      this.mostrarConfirmacion('Error de Validación', 'Por favor completa todos los campos requeridos marcados con *');
      return;
    }
    
    console.log('Guardando vacante:', this.nuevaVacante);
    
    // Obtener empresaID primero
    this.apiService.get(`empresas/usuario/${this.currentUser?.usuarioID}`).subscribe({
      next: (empresa: any) => {
        if (!empresa || !empresa.empresaID) {
          this.mostrarConfirmacion('Error', 'No se encontró información de la empresa.');
          return;
        }
        
        // Preparar datos para la API (nombres exactos del DTO)
        const vacanteData = {
          EmpresaID: empresa.empresaID,
          TituloVacante: this.nuevaVacante.titulo || '',
          Descripcion: this.nuevaVacante.descripcion,
          Requisitos: this.nuevaVacante.requisitos,
          FechaCierre: this.nuevaVacante.fechaVencimiento ? new Date(this.nuevaVacante.fechaVencimiento).toISOString() : new Date().toISOString(),
          Ubicacion: this.nuevaVacante.ubicacion,
          TipoContrato: 'Fijo',
          Jornada: 'Tiempo completo',
          Modalidad: this.nuevaVacante.modalidad,
          Salario: this.nuevaVacante.salario || null,
          CantidadVacantes: 1,
          CategoriaID: parseInt(this.nuevaVacante.categoriaID.toString())
        };
        
        console.log('Datos a enviar:', vacanteData);
        
        this.crearOActualizarVacante(vacanteData);
      },
      error: () => {
        this.mostrarConfirmacion('Error', 'No se pudo obtener información de la empresa.');
      }
    });
  }
  
  private crearOActualizarVacante(vacanteData: any): void {
    if (this.vacanteEditando) {
      // Actualizar vacante existente
      const updateData = { ...vacanteData, VacanteID: this.vacanteEditando.vacanteID };
      this.apiService.put(`vacantes/${this.vacanteEditando.vacanteID}`, updateData).subscribe({
        next: () => {
          this.mostrarConfirmacion('Vacante Actualizada', 'La vacante ha sido actualizada exitosamente.');
          this.cerrarModal();
          this.cargarVacantes();
          this.dataSyncService.notifyVacantesChanged();
        },
        error: (error) => {
          console.error('Error al actualizar vacante:', error);
          let errorMessage = 'No se pudo actualizar la vacante.';
          if (error.error && error.error.errors) {
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = validationErrors.join(', ');
          }
          this.mostrarConfirmacion('Error de Validación', errorMessage);
        }
      });
    } else {
      // Crear nueva vacante
      this.apiService.post('vacantes', vacanteData).subscribe({
        next: () => {
          this.mostrarConfirmacion('Vacante Creada', 'La vacante ha sido creada exitosamente y ya está visible para los estudiantes.');
          this.cerrarModal();
          this.cargarVacantes();
          this.dataSyncService.notifyVacantesChanged();
        },
        error: (error) => {
          console.error('Error al crear vacante:', error);
          let errorMessage = 'No se pudo crear la vacante.';
          if (error.error && error.error.errors) {
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = validationErrors.join(', ');
          }
          this.mostrarConfirmacion('Error de Validación', errorMessage);
        }
      });
    }
  }
  
  validarFormulario(): boolean {
    // Validar campos requeridos
    if (!this.nuevaVacante.titulo?.trim()) return false;
    if (!this.nuevaVacante.descripcion.trim()) return false;
    if (!this.nuevaVacante.requisitos.trim()) return false;
    if (!this.nuevaVacante.modalidad?.trim()) return false;
    if (!this.nuevaVacante.ubicacion.trim()) return false;
    if (!this.nuevaVacante.categoriaID || this.nuevaVacante.categoriaID === 0) return false;
    if (!this.nuevaVacante.fechaVencimiento?.trim()) return false;
    
    // Validar que la fecha de vencimiento sea futura
    if (this.nuevaVacante.fechaVencimiento) {
      const fechaVencimiento = new Date(this.nuevaVacante.fechaVencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaVencimiento <= hoy) {
        this.mostrarConfirmacion('Fecha Inválida', 'La fecha de vencimiento debe ser posterior a hoy.');
        return false;
      }
    }
    
    // Validar preguntas requeridas
    for (const pregunta of this.nuevaVacante.preguntas) {
      if (!pregunta.pregunta.trim()) {
        this.mostrarConfirmacion('Pregunta Inválida', 'Todas las preguntas deben tener texto.');
        return false;
      }
      if (pregunta.tipo === 'opcion_multiple' && (!pregunta.opcionesTexto || !pregunta.opcionesTexto.trim())) {
        this.mostrarConfirmacion('Opciones Faltantes', 'Las preguntas de opción múltiple deben tener opciones.');
        return false;
      }
    }
    
    return true;
  }
  
  getCategoriaName(categoriaID: number): string {
    const categorias: {[key: number]: string} = {
      1: 'Tecnología',
      2: 'Administración',
      3: 'Contabilidad',
      4: 'Mercadeo',
      5: 'Derecho'
    };
    return categorias[categoriaID] || 'Otra';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.vacanteEditando = null;
  }
  
  mostrarConfirmacion(titulo: string, mensaje: string): void {
    this.confirmacionTitulo = titulo;
    this.confirmacionMensaje = mensaje;
    this.mostrarConfirmacionModal = true;
  }
  
  cerrarConfirmacion(): void {
    this.mostrarConfirmacionModal = false;
    this.confirmacionTitulo = '';
    this.confirmacionMensaje = '';
  }
  
  mostrarConfirmacionEliminar(titulo: string, mensaje: string, callback: () => void): void {
    this.confirmacionEliminarTitulo = titulo;
    this.confirmacionEliminarMensaje = mensaje;
    this.confirmacionEliminarCallback = callback;
    this.mostrarConfirmacionEliminarModal = true;
  }
  
  confirmarEliminacion(): void {
    if (this.confirmacionEliminarCallback) {
      this.confirmacionEliminarCallback();
    }
    this.cerrarConfirmacionEliminar();
  }
  
  cerrarConfirmacionEliminar(): void {
    this.mostrarConfirmacionEliminarModal = false;
    this.confirmacionEliminarTitulo = '';
    this.confirmacionEliminarMensaje = '';
    this.confirmacionEliminarCallback = null;
  }

  getEmpresaNombre(empresa: string | { nombreEmpresa: string } | undefined): string {
    if (!empresa) return 'Empresa no disponible';
    if (typeof empresa === 'string') return empresa || 'Empresa no disponible';
    return empresa.nombreEmpresa || 'Empresa no disponible';
  }

  getTituloVacante(vacante: Vacante | null): string {
    if (!vacante) return '';
    return vacante.titulo || vacante.tituloVacante || '';
  }
}