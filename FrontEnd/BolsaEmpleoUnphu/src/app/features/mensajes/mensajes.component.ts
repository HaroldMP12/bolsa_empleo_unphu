import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajeService } from '../../core/services/mensaje.service';
import { AuthService } from '../../core/services/auth.service';
import { Conversacion, Mensaje, CreateMensajeDto } from '../../core/models/mensaje.models';
import { AuthResponse } from '../../core/models/auth.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mensajes-container">
      <!-- Lista de Conversaciones -->
      <div class="conversaciones-panel">
        <div class="panel-header">
          <h3>Mensajes</h3>
          <button class="btn-refresh" (click)="cargarConversaciones()">🔄</button>
        </div>
        
        <div class="conversaciones-lista">
          <div *ngFor="let conversacion of conversaciones" 
               class="conversacion-item"
               [class.activa]="conversacionSeleccionada?.conversacionID === conversacion.conversacionID"
               [class.no-leida]="conversacion.mensajesNoLeidos > 0"
               (click)="seleccionarConversacion(conversacion)">
            
            <div class="conversacion-avatar">
              {{ getIniciales(getNombreContacto(conversacion)) }}
            </div>
            
            <div class="conversacion-info">
              <div class="conversacion-header">
                <h4>{{ getNombreContacto(conversacion) }}</h4>
                <span class="fecha">{{ formatearFecha(conversacion.ultimoMensaje || conversacion.fechaCreacion) }}</span>
              </div>
              
              <div class="conversacion-preview">
                <p class="ultimo-mensaje">{{ conversacion.ultimoMensajeObj?.contenido || 'Nueva conversación' }}</p>
                <span *ngIf="conversacion.tituloVacante" class="vacante-tag">{{ conversacion.tituloVacante }}</span>
              </div>
              
              <div class="conversacion-badges">
                <span *ngIf="conversacion.mensajesNoLeidos > 0" class="badge-no-leidos">
                  {{ conversacion.mensajesNoLeidos }}
                </span>
              </div>
            </div>
          </div>
          
          <div *ngIf="conversaciones.length === 0" class="empty-state">
            <p>No tienes conversaciones aún</p>
          </div>
        </div>
      </div>

      <!-- Panel de Chat -->
      <div class="chat-panel" *ngIf="conversacionSeleccionada">
        <div class="chat-header">
          <div class="contacto-info">
            <div class="contacto-avatar">
              {{ getIniciales(getNombreContacto(conversacionSeleccionada)) }}
            </div>
            <div>
              <h4>{{ getNombreContacto(conversacionSeleccionada) }}</h4>
              <p *ngIf="conversacionSeleccionada.tituloVacante">{{ conversacionSeleccionada.tituloVacante }}</p>
            </div>
          </div>
        </div>

        <div class="mensajes-lista" #mensajesContainer>
          <div *ngFor="let mensaje of mensajes" 
               class="mensaje"
               [class.propio]="mensaje.emisorID === currentUser?.usuarioID"
               [class.ajeno]="mensaje.emisorID !== currentUser?.usuarioID">
            
            <div class="mensaje-contenido">
              <p>{{ mensaje.contenido }}</p>
              <span class="mensaje-fecha">{{ formatearHora(mensaje.fechaEnvio) }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-container">
            <textarea [(ngModel)]="nuevoMensaje" 
                     (keydown.enter)="enviarMensaje()"
                     placeholder="Escribe tu mensaje..."
                     rows="1"></textarea>
            <button (click)="enviarMensaje()" 
                    [disabled]="!nuevoMensaje.trim()"
                    class="btn-enviar">
              📤
            </button>
          </div>
        </div>
      </div>

      <!-- Panel vacío -->
      <div class="chat-empty" *ngIf="!conversacionSeleccionada">
        <div class="empty-content">
          <h3>Selecciona una conversación</h3>
          <p>Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mensajes-container {
      display: grid;
      grid-template-columns: 350px 1fr;
      height: calc(100vh - 120px);
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin: 2rem;
    }

    .conversaciones-panel {
      border-right: 1px solid #e1e8ed;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: 1rem;
      border-bottom: 1px solid #e1e8ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
    }

    .panel-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-refresh {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .conversaciones-lista {
      flex: 1;
      overflow-y: auto;
    }

    .conversacion-item {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid #f1f3f4;
      cursor: pointer;
      transition: background 0.2s;
    }

    .conversacion-item:hover {
      background: #f8f9fa;
    }

    .conversacion-item.activa {
      background: #e3f2fd;
      border-right: 3px solid #2196f3;
    }

    .conversacion-item.no-leida {
      background: #fff3e0;
    }

    .conversacion-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #2196f3;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-right: 1rem;
    }

    .conversacion-info {
      flex: 1;
      position: relative;
    }

    .conversacion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .conversacion-header h4 {
      margin: 0;
      font-size: 0.9rem;
      color: #2c3e50;
    }

    .fecha {
      font-size: 0.8rem;
      color: #7f8c8d;
    }

    .ultimo-mensaje {
      margin: 0;
      font-size: 0.85rem;
      color: #7f8c8d;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vacante-tag {
      display: inline-block;
      background: #e8f5e8;
      color: #2e7d32;
      padding: 0.2rem 0.5rem;
      border-radius: 10px;
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }

    .badge-no-leidos {
      position: absolute;
      top: 0;
      right: 0;
      background: #f44336;
      color: white;
      border-radius: 10px;
      padding: 0.2rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .chat-panel {
      display: flex;
      flex-direction: column;
    }

    .chat-header {
      padding: 1rem;
      border-bottom: 1px solid #e1e8ed;
      background: #f8f9fa;
    }

    .contacto-info {
      display: flex;
      align-items: center;
    }

    .contacto-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #2196f3;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-right: 1rem;
    }

    .contacto-info h4 {
      margin: 0;
      color: #2c3e50;
    }

    .contacto-info p {
      margin: 0;
      font-size: 0.85rem;
      color: #7f8c8d;
    }

    .mensajes-lista {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mensaje {
      display: flex;
    }

    .mensaje.propio {
      justify-content: flex-end;
    }

    .mensaje.ajeno {
      justify-content: flex-start;
    }

    .mensaje-contenido {
      max-width: 70%;
      padding: 0.75rem 1rem;
      border-radius: 18px;
      position: relative;
    }

    .mensaje.propio .mensaje-contenido {
      background: #2196f3;
      color: white;
    }

    .mensaje.ajeno .mensaje-contenido {
      background: #f1f3f4;
      color: #2c3e50;
    }

    .mensaje-contenido p {
      margin: 0;
      word-wrap: break-word;
    }

    .mensaje-fecha {
      font-size: 0.7rem;
      opacity: 0.7;
      display: block;
      margin-top: 0.25rem;
    }

    .chat-input {
      padding: 1rem;
      border-top: 1px solid #e1e8ed;
      background: #f8f9fa;
    }

    .input-container {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    }

    .input-container textarea {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 0.75rem 1rem;
      resize: none;
      max-height: 100px;
      font-family: inherit;
    }

    .btn-enviar {
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-enviar:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .chat-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
    }

    .empty-content {
      text-align: center;
      color: #7f8c8d;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #7f8c8d;
    }
  `]
})
export class MensajesComponent implements OnInit, OnDestroy {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  conversaciones: Conversacion[] = [];
  mensajes: Mensaje[] = [];
  conversacionSeleccionada: Conversacion | null = null;
  currentUser: AuthResponse | null = null;
  nuevoMensaje = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private mensajeService: MensajeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.cargarConversaciones();
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarConversaciones(): void {
    this.mensajeService.getConversaciones().subscribe({
      next: (conversaciones) => {
        this.conversaciones = conversaciones;
      },
      error: (error) => {
        console.error('Error al cargar conversaciones:', error);
      }
    });
  }

  seleccionarConversacion(conversacion: Conversacion): void {
    this.conversacionSeleccionada = conversacion;
    this.cargarMensajes(conversacion.conversacionID);
  }

  cargarMensajes(conversacionId: number): void {
    this.mensajeService.getMensajesConversacion(conversacionId).subscribe({
      next: (mensajes) => {
        this.mensajes = mensajes;
        setTimeout(() => this.scrollToBottom(), 100);
        this.cargarConversaciones();
      },
      error: (error) => {
        console.error('Error al cargar mensajes:', error);
      }
    });
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || !this.conversacionSeleccionada) return;

    const mensaje: CreateMensajeDto = {
      receptorID: this.getReceptorId(),
      vacanteID: this.conversacionSeleccionada.vacanteID,
      contenido: this.nuevoMensaje.trim(),
      tipoMensaje: 'texto'
    };

    this.mensajeService.enviarMensaje(mensaje).subscribe({
      next: (nuevoMensaje) => {
        this.mensajes.push(nuevoMensaje);
        this.nuevoMensaje = '';
        setTimeout(() => this.scrollToBottom(), 100);
        this.cargarConversaciones();
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
      }
    });
  }

  private getReceptorId(): number {
    if (!this.conversacionSeleccionada || !this.currentUser) return 0;
    
    return this.currentUser.usuarioID === this.conversacionSeleccionada.empresaID 
      ? this.conversacionSeleccionada.candidatoID 
      : this.conversacionSeleccionada.empresaID;
  }

  getNombreContacto(conversacion: Conversacion): string {
    if (!this.currentUser) return '';
    
    return this.currentUser.usuarioID === conversacion.empresaID 
      ? conversacion.nombreCandidato 
      : conversacion.nombreEmpresa;
  }

  getIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const fechaMensaje = new Date(fecha);
    const diffMs = ahora.getTime() - fechaMensaje.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) {
      return fechaMensaje.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDias === 1) {
      return 'Ayer';
    } else if (diffDias < 7) {
      return fechaMensaje.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return fechaMensaje.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  }

  formatearHora(fecha: Date): string {
    return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    if (this.mensajesContainer) {
      const element = this.mensajesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}