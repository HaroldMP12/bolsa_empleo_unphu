export interface AuthResponse {
  token: string;
  usuarioID: number;
  nombreCompleto: string;
  correo: string;
  rol: string;
  expiracion: Date;
}

export interface LoginDto {
  correo: string;
  contraseña: string;
}

export interface CreateUsuarioDto {
  nombreCompleto: string;
  correo: string;
  contraseña: string;
  telefono?: string;
  estado: boolean;
  rolID: number;
}