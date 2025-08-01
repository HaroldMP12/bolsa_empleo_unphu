export interface EmpresaResponseDto {
  empresaID: number;
  nombreEmpresa: string;
  rnc: string;
  sector?: string;
  telefonoEmpresa?: string;
  direccion?: string;
  sitioWeb?: string;
  descripcion?: string;
  cantidadEmpleados?: string;
}

export interface CreateEmpresaDto {
  nombreEmpresa: string;
  rnc: string;
  sector?: string;
  telefonoEmpresa?: string;
  direccion?: string;
  sitioWeb?: string;
  descripcion?: string;
  cantidadEmpleados?: string;
}