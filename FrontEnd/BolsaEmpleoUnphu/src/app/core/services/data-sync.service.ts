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
  
  // Expose current values
  getVacantesValue(): any[] {
    return this.vacantesSubject.getValue();
  }
  
  getPostulacionesValue(): any[] {
    return this.postulacionesSubject.getValue();
  }

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
    // Cargar desde localStorage como fallback
    const vacantesGuardadas = JSON.parse(localStorage.getItem('vacantes') || '[]');
    const postulacionesGuardadas = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    
    // Update application counts for each vacante
    const vacantesConPostulaciones = vacantesGuardadas.map((vacante: any) => ({
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

  // Get all vacantes
  getVacantes(): Observable<any[]> {
    return this.vacantes$;
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