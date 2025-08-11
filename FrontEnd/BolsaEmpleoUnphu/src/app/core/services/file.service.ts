import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadFile(file: File, tipo: 'cv' | 'perfil' | 'empresa'): Observable<any> {
    const formData = new FormData();
    
    switch (tipo) {
      case 'cv':
        formData.append('archivo', file);
        return this.http.post(`${this.apiUrl}/archivos/cv`, formData);
      case 'perfil':
        formData.append('imagen', file);
        return this.http.post(`${this.apiUrl}/archivos/imagen-perfil`, formData);
      case 'empresa':
        formData.append('logo', file);
        return this.http.post(`${this.apiUrl}/archivos/logo-empresa`, formData);
      default:
        throw new Error('Tipo de archivo no válido');
    }
  }

  getFileUrl(fileName: string, tipo: 'cv' | 'perfil' | 'empresa'): string {
    if (!fileName) return '';
    if (fileName.startsWith('http') || fileName.startsWith('blob:')) return fileName;
    
    // Si fileName ya incluye la ruta completa, devolverla tal como está
    if (fileName.startsWith('/uploads/')) {
      return `https://localhost:7236${fileName}`;
    }
    
    const folder = tipo === 'cv' ? 'cvs' : tipo === 'perfil' ? 'perfiles' : 'empresas';
    return `https://localhost:7236/uploads/${folder}/${fileName}`;
  }

  deleteFile(fileName: string, tipo: 'cv' | 'perfil' | 'empresa'): Observable<any> {
    const folder = tipo === 'cv' ? 'cvs' : tipo === 'perfil' ? 'perfiles' : 'empresas';
    return this.http.delete(`${this.apiUrl}/archivos/${folder}/${fileName}`);
  }
}