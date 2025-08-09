export interface Mensaje {
  mensajeID: number;
  conversacionID: number;
  emisorID: number;
  receptorID: number;
  contenido: string;
  fechaEnvio: Date;
  leido: boolean;
  tipoMensaje: string;
  nombreEmisor: string;
  nombreReceptor: string;
}

export interface Conversacion {
  conversacionID: number;
  empresaID: number;
  candidatoID: number;
  vacanteID?: number;
  fechaCreacion: Date;
  ultimoMensaje?: Date;
  estado: string;
  nombreEmpresa: string;
  nombreCandidato: string;
  tituloVacante?: string;
  mensajesNoLeidos: number;
  ultimoMensajeObj?: Mensaje;
}

export interface CreateMensajeDto {
  receptorID: number;
  vacanteID?: number;
  contenido: string;
  tipoMensaje?: string;
}