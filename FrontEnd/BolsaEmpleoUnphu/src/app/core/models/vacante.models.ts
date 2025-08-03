export interface Vacante {
  vacanteID: number;
  titulo?: string; // Para compatibilidad
  tituloVacante?: string; // Como viene del backend
  descripcion: string;
  requisitos: string;
  salario?: number;
  modalidad: 'Presencial' | 'Remoto' | 'Híbrido';
  ubicacion: string;
  categoriaID: number;
  categoria?: string;
  empresaID: number;
  empresa?: string | { nombreEmpresa: string }; // Puede ser string o objeto
  fechaPublicacion: Date;
  fechaVencimiento?: Date; // Para compatibilidad
  fechaCierre?: string; // Como viene del backend
  estado: boolean;
  preguntas?: PreguntaVacante[];
  postulaciones?: number;
  createdBy?: string;
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