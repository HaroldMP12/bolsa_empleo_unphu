export interface Vacante {
  vacanteID: number;
  titulo: string;
  descripcion: string;
  requisitos: string;
  salario?: number;
  modalidad: 'Presencial' | 'Remoto' | 'Híbrido';
  ubicacion: string;
  categoriaID: number;
  categoria?: string;
  empresaID: number;
  empresa?: string;
  fechaPublicacion: Date;
  fechaVencimiento: Date;
  estado: boolean;
  preguntas?: PreguntaVacante[];
  postulaciones?: number;
}

export interface PreguntaVacante {
  preguntaID?: number;
  vacanteID: number;
  pregunta: string;
  tipo: 'texto' | 'opcion_multiple' | 'si_no';
  opciones?: string[];
  opcionesTexto?: string;
  requerida: boolean;
}

export interface CreateVacanteDto {
  titulo: string;
  descripcion: string;
  requisitos: string;
  salario?: number;
  modalidad: string;
  ubicacion: string;
  categoriaID: number;
  fechaVencimiento: string;
  preguntas: PreguntaVacante[];
}

export interface VacanteFiltros {
  categoria?: number;
  modalidad?: string;
  ubicacion?: string;
  salarioMin?: number;
  salarioMax?: number;
  search?: string;
}