import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PerfilEstudiante {
  perfilID?: number;
  usuarioID: number;
  tipoPerfil: string;
  matricula?: string;
  carreraID: number;
  semestre?: number | null;
  fechaIngreso?: Date | null;
  tituloObtenido?: string;
  fechaEgreso?: Date | null;
  añoGraduacion?: number | null;
  urlImagen?: string;
  resumen?: string;
  redesSociales?: string;
}

export interface PerfilEmpresa {
  empresaID?: number;
  usuarioID: number;
  nombreEmpresa: string;
  rnc: string;
  sector?: string;
  telefonoEmpresa?: string;
  direccion?: string;
  sitioWeb?: string;
  descripcion?: string;
  imagenLogo?: string;
  imagenPortada?: string;
  cantidadEmpleados?: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  constructor(private apiService: ApiService) {}

  // Perfil Estudiante/Egresado
  obtenerPerfilEstudiante(usuarioId: number): Observable<PerfilEstudiante> {
    return this.apiService.get<PerfilEstudiante>(`perfiles/usuario/${usuarioId}`);
  }

  crearPerfilEstudiante(perfil: PerfilEstudiante): Observable<PerfilEstudiante> {
    return this.apiService.post<PerfilEstudiante>('perfiles', perfil);
  }

  actualizarPerfilEstudiante(id: number, perfil: PerfilEstudiante): Observable<any> {
    return this.apiService.put(`perfiles/${id}`, perfil);
  }

  // Perfil Empresa
  obtenerPerfilEmpresa(usuarioId: number): Observable<PerfilEmpresa> {
    return this.apiService.get<PerfilEmpresa>(`empresas/usuario/${usuarioId}`);
  }

  crearPerfilEmpresa(empresa: PerfilEmpresa): Observable<PerfilEmpresa> {
    return this.apiService.post<PerfilEmpresa>('empresas', empresa);
  }

  actualizarPerfilEmpresa(id: number, empresa: PerfilEmpresa): Observable<any> {
    return this.apiService.put(`empresas/${id}`, empresa);
  }

  // Calcular progreso del perfil
  calcularProgresoEstudiante(perfil: PerfilEstudiante): number {
    const campos = [
      perfil.tipoPerfil,
      perfil.matricula,
      perfil.carreraID,
      perfil.semestre,
      perfil.fechaIngreso,
      perfil.urlImagen,
      perfil.resumen
    ];
    
    const camposCompletos = campos.filter(campo => 
      campo !== null && campo !== undefined && campo !== '' && campo !== 0
    ).length;
    
    return Math.round((camposCompletos / campos.length) * 100);
  }

  calcularProgresoEmpresa(empresa: PerfilEmpresa): number {
    const campos = [
      empresa.nombreEmpresa,
      empresa.rnc,
      empresa.sector,
      empresa.telefonoEmpresa,
      empresa.direccion,
      empresa.descripcion,
      empresa.imagenLogo
    ];
    
    const camposCompletos = campos.filter(campo => 
      campo !== null && campo !== undefined && campo !== ''
    ).length;
    
    return Math.round((camposCompletos / campos.length) * 100);
  }
}