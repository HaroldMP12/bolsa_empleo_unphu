export interface VacanteResponse {
  vacanteID: number;
  tituloVacante: string;
  descripcion: string;
  requisitos: string;
  fechaPublicacion: Date;
  fechaCierre: Date;
  fechaModificacion?: Date;
  ubicacion?: string;
  tipoContrato?: string;
  jornada?: string;
  modalidad?: string;
  salario?: number;
  cantidadVacantes: number;
  nombreEmpresa: string;
  sectorEmpresa?: string;
  sitioWebEmpresa?: string;
  nombreCategoria: string;
  totalPostulaciones: number;
}

export interface CreateVacanteDto {
  empresaID: number;
  tituloVacante: string;
  descripcion: string;
  requisitos: string;
  fechaCierre: Date;
  ubicacion?: string;
  tipoContrato?: string;
  jornada?: string;
  modalidad?: string;
  salario?: number;
  cantidadVacantes: number;
  categoriaID: number;
}