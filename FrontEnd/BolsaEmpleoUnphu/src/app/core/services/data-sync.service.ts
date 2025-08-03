import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface VacanteStats {
  totalVacantes: number;
  vacantesActivas: number;
  totalPostulaciones: number;
}

export interface PostulacionStats {
  totalPostulaciones: number;
  pendientes: number;
  enRevision: number;
  aceptadas: number;
  rechazadas: number;
}

@Injectable({ providedIn: 'root' })
export class DataSyncService {
  private vacantesSubject = new BehaviorSubject<any[]>([]);
  private postulacionesSubject = new BehaviorSubject<any[]>([]);
  
  public vacantes$ = this.vacantesSubject.asObservable();
  public postulaciones$ = this.postulacionesSubject.asObservable();

  constructor() {
    this.loadInitialData();
    this.setupEventListeners();
  }

  private loadInitialData(): void {
    this.refreshVacantes();
    this.refreshPostulaciones();
  }

  private setupEventListeners(): void {
    window.addEventListener('vacantesChanged', () => {
      this.refreshVacantes();
    });
    
    window.addEventListener('postulacionesChanged', () => {
      this.refreshPostulaciones();
    });
  }

  private refreshVacantes(): void {
    const vacantesGuardadas = JSON.parse(localStorage.getItem('vacantes') || '[]');
    const postulacionesGuardadas = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    
    // Mock data inicial
    const vacantesMock = [
      {
        vacanteID: 1,
        titulo: 'Desarrollador Frontend React',
        descripcion: 'Buscamos desarrollador frontend con experiencia en React, TypeScript y CSS.',
        requisitos: 'Experiencia mínima 2 años, React, TypeScript, Git',
        salario: 45000,
        modalidad: 'Híbrido',
        ubicacion: 'Santo Domingo',
        categoriaID: 1,
        categoria: 'Tecnología',
        empresaID: 1,
        empresa: 'TechCorp',
        fechaPublicacion: new Date(),
        fechaVencimiento: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000),
        estado: true,
        createdBy: 'system',
        preguntas: [
          {
            preguntaID: 1,
            vacanteID: 1,
            pregunta: '¿Cuántos años de experiencia tienes con React?',
            tipo: 'opcion_multiple',
            opciones: ['Menos de 1 año', '1-2 años', '3-5 años', 'Más de 5 años'],
            requerida: true
          }
        ]
      }
    ];
    
    const todasVacantes = [...vacantesMock, ...vacantesGuardadas];
    
    // Update application counts for each vacante
    const vacantesConPostulaciones = todasVacantes.map(vacante => ({
      ...vacante,
      postulaciones: postulacionesGuardadas.filter((p: any) => p.vacanteID === vacante.vacanteID).length
    }));
    
    this.vacantesSubject.next(vacantesConPostulaciones);
  }

  private refreshPostulaciones(): void {
    const postulacionesGuardadas = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    this.postulacionesSubject.next(postulacionesGuardadas);
  }

  // Get company statistics
  getCompanyStats(empresaID: number): VacanteStats {
    const vacantes = this.vacantesSubject.getValue().filter(v => v.empresaID === empresaID);
    const postulaciones = this.postulacionesSubject.getValue();
    
    const hoy = new Date();
    const vacantesActivas = vacantes.filter(v => {
      const fechaVencimiento = new Date(v.fechaVencimiento);
      return fechaVencimiento > hoy && v.estado;
    });
    
    const vacantesIds = vacantes.map(v => v.vacanteID);
    const totalPostulaciones = postulaciones.filter((p: any) => 
      vacantesIds.includes(p.vacanteID)
    ).length;
    
    return {
      totalVacantes: vacantes.length,
      vacantesActivas: vacantesActivas.length,
      totalPostulaciones
    };
  }

  // Get student statistics
  getStudentStats(usuarioID: number): PostulacionStats {
    const postulaciones = this.postulacionesSubject.getValue().filter((p: any) => p.usuarioID === usuarioID);
    
    return {
      totalPostulaciones: postulaciones.length,
      pendientes: postulaciones.filter((p: any) => p.estado === 'Pendiente').length,
      enRevision: postulaciones.filter((p: any) => p.estado === 'En Revisión').length,
      aceptadas: postulaciones.filter((p: any) => p.estado === 'Aceptado').length,
      rechazadas: postulaciones.filter((p: any) => p.estado === 'Rechazado').length
    };
  }

  // Get vacantes for company
  getCompanyVacantes(empresaID: number): any[] {
    return this.vacantesSubject.getValue().filter(v => v.empresaID === empresaID);
  }

  // Get all active vacantes for students
  getActiveVacantes(): any[] {
    const hoy = new Date();
    return this.vacantesSubject.getValue().filter(v => {
      const fechaVencimiento = new Date(v.fechaVencimiento);
      return fechaVencimiento > hoy && v.estado;
    });
  }

  // Get applications for a specific vacante
  getVacanteApplications(vacanteID: number): any[] {
    return this.postulacionesSubject.getValue().filter((p: any) => p.vacanteID === vacanteID);
  }

  // Get applications for a specific user
  getUserApplications(usuarioID: number): any[] {
    return this.postulacionesSubject.getValue().filter((p: any) => p.usuarioID === usuarioID);
  }

  // Trigger data refresh
  refreshData(): void {
    this.refreshVacantes();
    this.refreshPostulaciones();
  }

  // Notify components of changes
  notifyVacantesChanged(): void {
    window.dispatchEvent(new CustomEvent('vacantesChanged'));
  }

  notifyPostulacionesChanged(): void {
    window.dispatchEvent(new CustomEvent('postulacionesChanged'));
  }
}