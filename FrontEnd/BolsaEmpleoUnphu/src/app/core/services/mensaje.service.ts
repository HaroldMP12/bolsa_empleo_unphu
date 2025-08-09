import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversacion, Mensaje, CreateMensajeDto } from '../models/mensaje.models';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private apiUrl = `${environment.apiUrl}/mensajes`;
  private conversacionesSubject = new BehaviorSubject<Conversacion[]>([]);
  private mensajesNoLeidosSubject = new BehaviorSubject<number>(0);

  public conversaciones$ = this.conversacionesSubject.asObservable();
  public mensajesNoLeidos$ = this.mensajesNoLeidosSubject.asObservable();

  constructor(private http: HttpClient) {}

  getConversaciones(): Observable<Conversacion[]> {
    return this.http.get<Conversacion[]>(`${this.apiUrl}/conversaciones`);
  }

  getMensajesConversacion(conversacionId: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.apiUrl}/conversacion/${conversacionId}`);
  }

  enviarMensaje(mensaje: CreateMensajeDto): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.apiUrl, mensaje);
  }

  getMensajesNoLeidos(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/no-leidos`);
  }

  // Métodos para actualizar el estado local
  actualizarConversaciones(): void {
    this.getConversaciones().subscribe(conversaciones => {
      this.conversacionesSubject.next(conversaciones);
    });
  }

  actualizarMensajesNoLeidos(): void {
    this.getMensajesNoLeidos().subscribe(count => {
      this.mensajesNoLeidosSubject.next(count);
    });
  }

  // Método para iniciar conversación desde postulación
  iniciarConversacionDesdePostulacion(candidatoId: number, empresaId: number, vacanteId: number): CreateMensajeDto {
    return {
      receptorID: empresaId,
      vacanteID: vacanteId,
      contenido: '¡Hola! Me interesa conocer más detalles sobre esta vacante.',
      tipoMensaje: 'texto'
    };
  }
}