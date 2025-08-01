export interface UsuarioResponseDto {
  usuarioID: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  fechaRegistro: Date;
  estado: boolean;
  rolID: number;
  nombreRol: string;
}

export interface UpdateUsuarioDto {
  usuarioID: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  estado: boolean;
  rolID: number;
}