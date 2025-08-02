import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vacante } from '../../core/models/vacante.models';
import { CreatePostulacionDto } from '../../core/models/postulacion.models';

@Component({
  selector: 'app-modal-postulacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrar()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Postularse a: {{ vacante?.titulo }}</h2>
          <button class="btn-close" (click)="cerrar()">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Información de la vacante -->
          <div class="vacante-info">
            <h3>{{ vacante?.titulo }}</h3>
            <p class="empresa">{{ vacante?.empresa }}</p>
            <div class="vacante-details">
              <span class="detail">📍 {{ vacante?.ubicacion }}</span>
              <span class="detail">💼 {{ vacante?.modalidad }}</span>
            </div>
          </div>
          
          <!-- Preguntas de la vacante -->
          <div class="preguntas-section" *ngIf="vacante?.preguntas && vacante.preguntas.length > 0">
            <h4>Preguntas Adicionales</h4>
            <div *ngFor="let pregunta of vacante.preguntas; let i = index" class="pregunta-item">
              <label class="pregunta-label">
                {{ pregunta.pregunta }}
                <span *ngIf="pregunta.requerida" class="required">*</span>
              </label>
              
              <!-- Pregunta tipo texto -->
              <div *ngIf="pregunta.tipo === 'texto'">
                <textarea 
                  [(ngModel)]="respuestas[pregunta.preguntaID!]" 
                  class="form-control"
                  rows="3"
                  [placeholder]="'Escribe tu respuesta aquí...'"
                  [required]="pregunta.requerida">
                </textarea>
              </div>
              
              <!-- Pregunta tipo opción múltiple -->
              <div *ngIf="pregunta.tipo === 'opcion_multiple'">
                <select 
                  [(ngModel)]="respuestas[pregunta.preguntaID!]" 
                  class="form-control"
                  [required]="pregunta.requerida">
                  <option value="">Seleccionar opción</option>
                  <option *ngFor="let opcion of pregunta.opciones" [value]="opcion">{{ opcion }}</option>
                </select>
              </div>
              
              <!-- Pregunta tipo sí/no -->
              <div *ngIf="pregunta.tipo === 'si_no'" class="radio-group">
                <label class="radio-label">
                  <input 
                    type="radio" 
                    [name]="'pregunta_' + pregunta.preguntaID" 
                    value="Sí"
                    [(ngModel)]="respuestas[pregunta.preguntaID!]"
                    [required]="pregunta.requerida">
                  Sí
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    [name]="'pregunta_' + pregunta.preguntaID" 
                    value="No"
                    [(ngModel)]="respuestas[pregunta.preguntaID!]"
                    [required]="pregunta.requerida">
                  No
                </label>
              </div>
            </div>
          </div>
          
          <!-- Mensaje de confirmación -->
          <div class="confirmacion-section">
            <div class="info-box">
              <h4>📋 Información importante</h4>
              <ul>
                <li>Tu postulación será revisada por el equipo de recursos humanos</li>
                <li>Recibirás notificaciones sobre el estado de tu postulación</li>
                <li>Asegúrate de que tu perfil esté completo para mejorar tus oportunidades</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="cerrar()">Cancelar</button>
          <button 
            class="btn-primary" 
            (click)="enviarPostulacion()"
            [disabled]="!validarFormulario()">
            Enviar Postulación
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      max-width: 600px;
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
      font-size: 1.5rem;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    .modal-body {
      padding: 2rem;
    }
    .vacante-info {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    .vacante-info h3 {
      margin: 0 0 0.5rem 0;
      color: var(--unphu-blue-dark);
      font-size: 1.25rem;
    }
    .empresa {
      color: #666;
      font-weight: 500;
      margin: 0 0 1rem 0;
    }
    .vacante-details {
      display: flex;
      gap: 1rem;
    }
    .detail {
      color: #666;
      font-size: 0.875rem;
    }
    .preguntas-section {
      margin-bottom: 2rem;
    }
    .preguntas-section h4 {
      color: var(--unphu-blue-dark);
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    .pregunta-item {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
    }
    .pregunta-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--unphu-blue-dark);
    }
    .required {
      color: #dc3545;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--unphu-blue-dark);
    }
    .radio-group {
      display: flex;
      gap: 1rem;
    }
    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: normal;
    }
    .confirmacion-section {
      margin-top: 2rem;
    }
    .info-box {
      background: #e3f2fd;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid var(--unphu-blue-dark);
    }
    .info-box h4 {
      margin: 0 0 1rem 0;
      color: var(--unphu-blue-dark);
    }
    .info-box ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #666;
    }
    .info-box li {
      margin-bottom: 0.5rem;
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
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-primary:hover:not(:disabled) {
      background: #0a2a3f;
    }
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
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
export class ModalPostulacionComponent implements OnInit {
  @Input() vacante: Vacante | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() postulacionEnviada = new EventEmitter<CreatePostulacionDto>();
  
  respuestas: { [key: number]: string } = {};

  ngOnInit(): void {
    // Inicializar respuestas vacías
    if (this.vacante?.preguntas) {
      this.vacante.preguntas.forEach(pregunta => {
        if (pregunta.preguntaID) {
          this.respuestas[pregunta.preguntaID] = '';
        }
      });
    }
  }

  validarFormulario(): boolean {
    if (!this.vacante?.preguntas) return true;
    
    // Validar preguntas requeridas
    for (const pregunta of this.vacante.preguntas) {
      if (pregunta.requerida && pregunta.preguntaID) {
        const respuesta = this.respuestas[pregunta.preguntaID];
        if (!respuesta || respuesta.trim() === '') {
          return false;
        }
      }
    }
    return true;
  }

  enviarPostulacion(): void {
    if (!this.validarFormulario() || !this.vacante) return;

    const postulacionDto: CreatePostulacionDto = {
      vacanteID: this.vacante.vacanteID,
      respuestas: Object.entries(this.respuestas)
        .filter(([_, respuesta]) => respuesta.trim() !== '')
        .map(([preguntaId, respuesta]) => ({
          preguntaID: parseInt(preguntaId),
          respuesta: respuesta
        }))
    };

    this.postulacionEnviada.emit(postulacionDto);
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}