import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="perfil-page">
      <div class="page-header">
        <h1>Mi Perfil</h1>
        <p>Completa tu información para mejorar tus oportunidades</p>
      </div>

      <!-- PERFIL ESTUDIANTE/EGRESADO -->
      <div *ngIf="isStudent()" class="perfil-content">
        <div class="perfil-grid">
          <!-- Información Personal -->
          <div class="perfil-section">
            <div class="section-header">
              <h3>Información Personal</h3>
            </div>
            <form [formGroup]="personalForm" class="form-content">
              <div class="form-row">
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" formControlName="nombreCompleto" class="form-control">
                </div>
                <div class="form-group">
                  <label>Correo Electrónico</label>
                  <input type="email" formControlName="correo" class="form-control" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Teléfono</label>
                  <input type="tel" formControlName="telefono" class="form-control">
                </div>
                <div class="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input type="date" formControlName="fechaNacimiento" class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label>Dirección</label>
                <textarea formControlName="direccion" class="form-control" rows="2"></textarea>
              </div>
            </form>
          </div>

          <!-- Información Académica -->
          <div class="perfil-section">
            <div class="section-header">
              <h3>Información Académica</h3>
            </div>
            <form [formGroup]="academicForm" class="form-content">
              <div class="form-row">
                <div class="form-group">
                  <label>Carrera</label>
                  <select formControlName="carrera" class="form-control">
                    <option value="">Seleccionar carrera</option>
                    <option value="ingenieria-sistemas">Ingeniería en Sistemas</option>
                    <option value="administracion">Administración de Empresas</option>
                    <option value="contabilidad">Contabilidad</option>
                    <option value="mercadeo">Mercadeo</option>
                    <option value="derecho">Derecho</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Matrícula</label>
                  <input type="text" formControlName="matricula" class="form-control" placeholder="Ej: 2020-1234">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Semestre Actual</label>
                  <select formControlName="semestre" class="form-control">
                    <option value="">Seleccionar</option>
                    <option value="1">1er Semestre</option>
                    <option value="2">2do Semestre</option>
                    <option value="3">3er Semestre</option>
                    <option value="4">4to Semestre</option>
                    <option value="5">5to Semestre</option>
                    <option value="6">6to Semestre</option>
                    <option value="7">7mo Semestre</option>
                    <option value="8">8vo Semestre</option>
                    <option value="graduado">Graduado</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Año de Ingreso</label>
                  <input type="number" formControlName="anoIngreso" class="form-control" min="2000" max="2024">
                </div>
              </div>
              <div class="form-group">
                <label>Promedio Académico (Opcional)</label>
                <input type="number" formControlName="promedio" class="form-control" min="0" max="4" step="0.01">
              </div>
            </form>
          </div>

          <!-- Experiencia Laboral -->
          <div class="perfil-section">
            <div class="section-header">
              <h3>Experiencia Laboral</h3>
              <button type="button" class="btn-add" (click)="agregarExperiencia()">+ Agregar</button>
            </div>
            <div class="form-content">
              <div *ngFor="let exp of experiencias; let i = index" class="experiencia-item">
                <div class="form-row">
                  <div class="form-group">
                    <label>Empresa</label>
                    <input type="text" [(ngModel)]="exp.empresa" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Cargo</label>
                    <input type="text" [(ngModel)]="exp.cargo" class="form-control">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Fecha Inicio</label>
                    <input type="date" [(ngModel)]="exp.fechaInicio" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Fecha Fin</label>
                    <input type="date" [(ngModel)]="exp.fechaFin" class="form-control" [disabled]="exp.actual">
                  </div>
                </div>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="exp.actual"> Trabajo actual
                  </label>
                </div>
                <div class="form-group">
                  <label>Descripción</label>
                  <textarea [(ngModel)]="exp.descripcion" class="form-control" rows="2"></textarea>
                </div>
                <button type="button" class="btn-remove" (click)="removerExperiencia(i)">Eliminar</button>
              </div>
              <div *ngIf="experiencias.length === 0" class="empty-state">
                <p>No has agregado experiencia laboral</p>
              </div>
            </div>
          </div>

          <!-- Archivos -->
          <div class="perfil-section">
            <div class="section-header">
              <h3>Documentos</h3>
            </div>
            <div class="form-content">
              <div class="upload-section">
                <div class="upload-item">
                  <label>Foto de Perfil</label>
                  <div class="file-upload">
                    <input type="file" id="foto" accept="image/*" (change)="onFileSelect($event, 'foto')">
                    <label for="foto" class="upload-btn">Seleccionar Imagen</label>
                    <span class="file-info">{{ fotoSeleccionada || 'Ningún archivo seleccionado' }}</span>
                  </div>
                </div>
                <div class="upload-item">
                  <label>Curriculum Vitae (PDF)</label>
                  <div class="file-upload">
                    <input type="file" id="cv" accept=".pdf" (change)="onFileSelect($event, 'cv')">
                    <label for="cv" class="upload-btn">Seleccionar PDF</label>
                    <span class="file-info">{{ cvSeleccionado || 'Ningún archivo seleccionado' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PERFIL EMPRESA -->
      <div *ngIf="isCompany()" class="perfil-content">
        <div class="perfil-grid">
          <!-- Información Corporativa -->
          <div class="perfil-section">
            <div class="section-header">
              <h3>Información Corporativa</h3>
            </div>
            <form [formGroup]="empresaForm" class="form-content">
              <div class="form-row">
                <div class="form-group">
                  <label>Nombre de la Empresa</label>
                  <input type="text" formControlName="nombreEmpresa" class="form-control">
                </div>
                <div class="form-group">
                  <label>RNC</label>
                  <input type="text" formControlName="rnc" class="form-control">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Sector</label>
                  <select formControlName="sector" class="form-control">
                    <option value="">Seleccionar sector</option>
                    <option value="tecnologia">Tecnología</option>
                    <option value="financiero">Financiero</option>
                    <option value="salud">Salud</option>
                    <option value="educacion">Educación</option>
                    <option value="manufactura">Manufactura</option>
                    <option value="servicios">Servicios</option>
                    <option value="comercio">Comercio</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Tamaño de Empresa</label>
                  <select formControlName="tamano" class="form-control">
                    <option value="">Seleccionar</option>
                    <option value="pequena">Pequeña (1-50 empleados)</option>
                    <option value="mediana">Mediana (51-200 empleados)</option>
                    <option value="grande">Grande (200+ empleados)</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Descripción de la Empresa</label>
                <textarea formControlName="descripcion" class="form-control" rows="4" placeholder="Describe tu empresa, misión, visión y valores..."></textarea>
              </div>
              <div class="form-group">
                <label>Sitio Web</label>
                <input type="url" formControlName="sitioWeb" class="form-control" placeholder="https://www.ejemplo.com">
              </div>
            </form>
          </div>

          <!-- Datos de Contacto -->
          <div class="perfil-section">
            <div class="section-header">
              <h3>Datos de Contacto</h3>
            </div>
            <form [formGroup]="contactoForm" class="form-content">
              <div class="form-row">
                <div class="form-group">
                  <label>Teléfono Principal</label>
                  <input type="tel" formControlName="telefono" class="form-control">
                </div>
                <div class="form-group">
                  <label>Teléfono Secundario</label>
                  <input type="tel" formControlName="telefonoSecundario" class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label>Dirección</label>
                <textarea formControlName="direccion" class="form-control" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Persona de Contacto</label>
                  <input type="text" formControlName="personaContacto" class="form-control">
                </div>
                <div class="form-group">
                  <label>Cargo del Contacto</label>
                  <input type="text" formControlName="cargoContacto" class="form-control">
                </div>
              </div>
            </form>
          </div>

          <!-- Imágenes Corporativas -->
          <div class="perfil-section">
            <div class="section-header">
              <h3>Imágenes Corporativas</h3>
            </div>
            <div class="form-content">
              <div class="upload-section">
                <div class="upload-item">
                  <label>Logo de la Empresa</label>
                  <div class="file-upload">
                    <input type="file" id="logo" accept="image/*" (change)="onFileSelect($event, 'logo')">
                    <label for="logo" class="upload-btn">Seleccionar Logo</label>
                    <span class="file-info">{{ logoSeleccionado || 'Ningún archivo seleccionado' }}</span>
                  </div>
                </div>
                <div class="upload-item">
                  <label>Portada de Empresa</label>
                  <div class="file-upload">
                    <input type="file" id="portada" accept="image/*" (change)="onFileSelect($event, 'portada')">
                    <label for="portada" class="upload-btn">Seleccionar Portada</label>
                    <span class="file-info">{{ portadaSeleccionada || 'Ningún archivo seleccionado' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="action-buttons">
        <button type="button" class="btn-secondary" (click)="cancelar()">Cancelar</button>
        <button type="button" class="btn-primary" (click)="guardarPerfil()">Guardar Cambios</button>
      </div>
    </div>
  `,
  styles: [`
    .perfil-page {
      padding: 2rem;
    }
    .page-header {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .page-header h1 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
    }
    .page-header p {
      color: #666;
      margin: 0;
      font-size: 1.1rem;
    }
    .perfil-grid {
      display: grid;
      gap: 2rem;
    }
    .perfil-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .section-header {
      background: var(--unphu-blue-dark);
      color: white;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-header h3 {
      margin: 0;
      font-weight: 600;
    }
    .btn-add {
      background: var(--unphu-green-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .form-content {
      padding: 2rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--unphu-blue-dark);
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--unphu-blue-dark);
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    .experiencia-item {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      position: relative;
    }
    .btn-remove {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
    .upload-section {
      display: grid;
      gap: 1.5rem;
    }
    .upload-item label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--unphu-blue-dark);
    }
    .file-upload {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .file-upload input[type="file"] {
      display: none;
    }
    .upload-btn {
      background: var(--unphu-blue-dark);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.3s;
    }
    .upload-btn:hover {
      background: #0a2a3f;
    }
    .file-info {
      color: #666;
      font-size: 0.875rem;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    .btn-primary {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-primary:hover {
      background: #0a2a3f;
    }
    .btn-secondary {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class PerfilComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  personalForm!: FormGroup;
  academicForm!: FormGroup;
  empresaForm!: FormGroup;
  contactoForm!: FormGroup;
  
  experiencias: any[] = [];
  fotoSeleccionada = '';
  cvSeleccionado = '';
  logoSeleccionado = '';
  portadaSeleccionada = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.initializeForms();
    });
  }

  initializeForms(): void {
    this.personalForm = this.fb.group({
      nombreCompleto: [this.currentUser?.nombreCompleto || '', Validators.required],
      correo: [this.currentUser?.correo || '', [Validators.required, Validators.email]],
      telefono: [''],
      fechaNacimiento: [''],
      direccion: ['']
    });

    this.academicForm = this.fb.group({
      carrera: ['', Validators.required],
      matricula: ['', Validators.required],
      semestre: [''],
      anoIngreso: [''],
      promedio: ['']
    });

    this.empresaForm = this.fb.group({
      nombreEmpresa: [this.currentUser?.nombreCompleto || '', Validators.required],
      rnc: ['', Validators.required],
      sector: ['', Validators.required],
      tamano: [''],
      descripcion: [''],
      sitioWeb: ['']
    });

    this.contactoForm = this.fb.group({
      telefono: ['', Validators.required],
      telefonoSecundario: [''],
      direccion: [''],
      personaContacto: [''],
      cargoContacto: ['']
    });
  }

  isStudent(): boolean {
    return this.currentUser?.rol === 'Estudiante' || this.currentUser?.rol === 'Egresado';
  }

  isCompany(): boolean {
    return this.currentUser?.rol === 'Empresa';
  }

  agregarExperiencia(): void {
    this.experiencias.push({
      empresa: '',
      cargo: '',
      fechaInicio: '',
      fechaFin: '',
      actual: false,
      descripcion: ''
    });
  }

  removerExperiencia(index: number): void {
    this.experiencias.splice(index, 1);
  }

  onFileSelect(event: any, tipo: string): void {
    const file = event.target.files[0];
    if (file) {
      switch (tipo) {
        case 'foto':
          this.fotoSeleccionada = file.name;
          break;
        case 'cv':
          this.cvSeleccionado = file.name;
          break;
        case 'logo':
          this.logoSeleccionado = file.name;
          break;
        case 'portada':
          this.portadaSeleccionada = file.name;
          break;
      }
    }
  }

  guardarPerfil(): void {
    console.log('Guardando perfil...');
    // TODO: Implementar guardado real
    alert('Perfil guardado exitosamente (simulación)');
  }

  cancelar(): void {
    // TODO: Resetear formularios o navegar atrás
    console.log('Cancelando cambios...');
  }
}