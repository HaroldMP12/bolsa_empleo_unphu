export interface Postulacion {
  postulacionID: number;
  vacanteID: number;
  usuarioID: number;
  fechaPostulacion: Date;
  estado: 'Pendiente' | 'En Revisión' | 'Aceptado' | 'Rechazado';
  respuestas: RespuestaPostulacion[];
  vacante?: {
    titulo: string;
    empresa: string;
    modalidad: string;
    ubicacion: string;
  };
  usuario?: {
    nombreCompleto: string;
    correo: string;
    telefono: string;
    carrera?: string;
  };
}

export interface RespuestaPostulacion {
  respuestaID?: number;
  postulacionID: number;
  preguntaID: number;
  pregunta: string;
  respuesta: string;
}

export interface CreatePostulacionDto {
  vacanteID: number;
  respuestas: {
    preguntaID: number;
    respuesta: string;
  }[];
}

export interface UpdateEstadoPostulacionDto {
  postulacionID: number;
  estado: 'Pendiente' | 'En Revisión' | 'Aceptado' | 'Rechazado';
  comentarios?: string;
}