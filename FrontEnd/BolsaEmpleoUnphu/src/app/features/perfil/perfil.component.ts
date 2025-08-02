import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService, PerfilEstudiante, PerfilEmpresa } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal.component';
import { AuthResponse } from '../../core/models/auth.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmationModalComponent],
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
                    <option value="1">Ingeniería en Sistemas</option>
                    <option value="2">Ingeniería Civil</option>
                    <option value="3">Medicina</option>
                    <option value="4">Enfermería</option>
                    <option value="5">Administración de Empresas</option>
                    <option value="6">Contabilidad</option>
                    <option value="7">Derecho</option>
                    <option value="8">Psicología</option>
                    <option value="9">Comunicación Social</option>
                    <option value="10">Arquitectura</option>
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
        <button type="button" class="btn-primary" (click)="guardarPerfil()" [disabled]="guardando">{{ guardando ? 'Guardando...' : 'Guardar Cambios' }}</button>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <app-confirmation-modal
      [isVisible]="showModal"
      [type]="modalType"
      [title]="modalTitle"
      [message]="modalMessage"
      [confirmText]="modalConfirmText"
      (confirmed)="onModalConfirmed()">
    </app-confirmation-modal>
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
  
  guardando = false;
  showModal = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'success';
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Aceptar';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private perfilService: PerfilService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.initializeForms();
      if (user) {
        this.loadExistingProfile();
      }
    });
  }

  private loadExistingProfile(): void {
    if (!this.currentUser) return;

    if (this.isStudent()) {
      this.perfilService.obtenerPerfilEstudiante(this.currentUser.usuarioID).subscribe({
        next: (perfil) => {
          if (perfil && perfil.perfilID) {
            this.populateStudentForm(perfil);
          }
        },
        error: () => {
          // No hay perfil existente, mantener formulario vacío
        }
      });
    } else if (this.isCompany()) {
      this.perfilService.obtenerPerfilEmpresa(this.currentUser.usuarioID).subscribe({
        next: (empresa) => {
          if (empresa && empresa.empresaID) {
            this.populateCompanyForm(empresa);
          }
        },
        error: () => {
          // No hay perfil existente, mantener formulario vacío
        }
      });
    }
  }

  private populateStudentForm(perfil: any): void {
    console.log('Cargando datos del perfil:', perfil);
    this.academicForm.patchValue({
      carrera: perfil.carreraID?.toString() || '1',
      matricula: perfil.matricula || '',
      semestre: perfil.semestre?.toString() || '',
      anoIngreso: perfil.fechaIngreso ? new Date(perfil.fechaIngreso).getFullYear() : '',
      promedio: ''
    });
    console.log('Formulario actualizado:', this.academicForm.value);
  }

  private populateCompanyForm(empresa: any): void {
    this.empresaForm.patchValue({
      nombreEmpresa: empresa.nombreEmpresa,
      rnc: empresa.rnc,
      sector: empresa.sector,
      sitioWeb: empresa.sitioWeb,
      descripcion: empresa.descripcion,
      tamano: empresa.cantidadEmpleados
    });

    this.contactoForm.patchValue({
      telefono: empresa.telefonoEmpresa,
      direccion: empresa.direccion
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
      carrera: ['1'],
      matricula: [''],
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
    if (!this.currentUser) {
      this.toastService.showError('Error', 'No se pudo identificar el usuario');
      return;
    }

    if (this.isStudent()) {
      this.guardarPerfilEstudiante();
    } else if (this.isCompany()) {
      this.guardarPerfilEmpresa();
    }
  }

  private guardarPerfilEstudiante(): void {
    console.log('Iniciando guardado de perfil estudiante');
    // Remover validaciones temporalmente para testing
    // console.log('Personal form valid:', this.personalForm.valid);
    // console.log('Academic form valid:', this.academicForm.valid);
    console.log('Academic form values:', this.academicForm.value);
    
    this.guardando = true;
    const semestreValue = this.academicForm.get('semestre')?.value;
    const anoIngresoValue = this.academicForm.get('anoIngreso')?.value;
    
    const perfilData: any = {
      usuarioID: this.currentUser!.usuarioID,
      tipoPerfil: semestreValue === 'graduado' ? 'Egresado' : 'Estudiante',
      matricula: this.academicForm.get('matricula')?.value || null,
      carreraID: parseInt(this.academicForm.get('carrera')?.value) || 1,
      semestre: semestreValue !== 'graduado' && semestreValue ? parseInt(semestreValue) : null,
      fechaIngreso: anoIngresoValue ? new Date(anoIngresoValue + '-01-01') : null,
      resumen: this.buildResumenEstudiante(),
      urlImagen: null,
      redesSociales: null,
      tituloObtenido: null,
      fechaEgreso: null,
      añoGraduacion: null
    };
    
    console.log('Datos a enviar:', perfilData);

    // Verificar si ya existe un perfil
    this.perfilService.obtenerPerfilEstudiante(this.currentUser!.usuarioID).subscribe({
      next: (perfilExistente) => {
        console.log('Respuesta del servidor:', perfilExistente);
        if (perfilExistente && perfilExistente.perfilID) {
          console.log('Actualizando perfil existente ID:', perfilExistente.perfilID);
          perfilData.perfilID = perfilExistente.perfilID;
          this.perfilService.actualizarPerfilEstudiante(perfilExistente.perfilID, perfilData).subscribe({
            next: (response) => {
              console.log('Perfil actualizado exitosamente:', response);
              this.guardando = false;
              // Recargar el perfil actualizado
              this.loadExistingProfile();
              this.showModalMessage('success', '¡Perfil Actualizado!', 'Tu perfil ha sido actualizado correctamente');
            },
            error: (error) => {
              console.error('Error al actualizar perfil:', error);
              this.guardando = false;
              this.showModalMessage('error', 'Error al Guardar', 'No se pudo actualizar el perfil. Inténtalo nuevamente.');
            }
          });
        } else {
          console.log('Creando nuevo perfil');
          this.perfilService.crearPerfilEstudiante(perfilData).subscribe({
            next: (response) => {
              console.log('Perfil creado exitosamente:', response);
              this.guardando = false;
              // Recargar el perfil creado
              this.loadExistingProfile();
              this.showModalMessage('success', '¡Perfil Creado!', 'Tu perfil ha sido creado correctamente');
            },
            error: (error) => {
              console.error('Error al crear perfil:', error);
              this.guardando = false;
              this.showModalMessage('error', 'Error al Guardar', 'No se pudo crear el perfil. Inténtalo nuevamente.');
            }
          });
        }
      },
      error: (error) => {
        this.guardando = false;
        this.showModalMessage('error', 'Error', 'Error al verificar el perfil existente.');
      }
    });
  }

  private guardarPerfilEmpresa(): void {
    if (!this.empresaForm.valid || !this.contactoForm.valid) {
      this.showModalMessage('warning', 'Formulario Incompleto', 'Por favor completa todos los campos requeridos');
      return;
    }

    this.guardando = true;
    const empresaData: any = {
      usuarioID: this.currentUser!.usuarioID,
      nombreEmpresa: this.empresaForm.get('nombreEmpresa')?.value,
      rnc: this.empresaForm.get('rnc')?.value,
      sector: this.empresaForm.get('sector')?.value || null,
      telefonoEmpresa: this.contactoForm.get('telefono')?.value || null,
      direccion: this.contactoForm.get('direccion')?.value || null,
      sitioWeb: this.empresaForm.get('sitioWeb')?.value || null,
      descripcion: this.empresaForm.get('descripcion')?.value || null,
      cantidadEmpleados: this.empresaForm.get('tamano')?.value || null,
      imagenLogo: null,
      imagenPortada: null,
      observaciones: null
    };

    // Verificar si ya existe un perfil de empresa
    this.perfilService.obtenerPerfilEmpresa(this.currentUser!.usuarioID).subscribe({
      next: (empresaExistente) => {
        if (empresaExistente && empresaExistente.empresaID) {
          // Actualizar empresa existente
          empresaData.empresaID = empresaExistente.empresaID;
          this.perfilService.actualizarPerfilEmpresa(empresaExistente.empresaID, empresaData).subscribe({
            next: () => {
              this.guardando = false;
              this.showModalMessage('success', '¡Perfil Actualizado!', 'El perfil de tu empresa ha sido actualizado correctamente');
            },
            error: (error) => {
              this.guardando = false;
              this.showModalMessage('error', 'Error al Guardar', 'No se pudo actualizar el perfil. Inténtalo nuevamente.');
            }
          });
        } else {
          // Crear nueva empresa
          this.perfilService.crearPerfilEmpresa(empresaData).subscribe({
            next: () => {
              this.guardando = false;
              this.showModalMessage('success', '¡Perfil Creado!', 'El perfil de tu empresa ha sido creado correctamente');
            },
            error: (error) => {
              this.guardando = false;
              this.showModalMessage('error', 'Error al Guardar', 'No se pudo crear el perfil. Inténtalo nuevamente.');
            }
          });
        }
      },
      error: (error) => {
        this.guardando = false;
        this.showModalMessage('error', 'Error', 'Error al verificar el perfil existente.');
      }
    });
  }

  private buildResumenEstudiante(): string {
    const academic = this.academicForm.value;
    const carreraNames: { [key: string]: string } = {
      '1': 'Ingeniería en Sistemas',
      '2': 'Ingeniería Civil', 
      '3': 'Medicina',
      '4': 'Enfermería',
      '5': 'Administración de Empresas',
      '6': 'Contabilidad',
      '7': 'Derecho',
      '8': 'Psicología',
      '9': 'Comunicación Social',
      '10': 'Arquitectura'
    };
    
    const carreraNombre = carreraNames[academic.carrera] || 'carrera no especificada';
    let resumen = `Estudiante de ${carreraNombre}`;
    
    if (academic.semestre && academic.semestre !== 'graduado') {
      resumen += ` en ${academic.semestre}° semestre`;
    } else if (academic.semestre === 'graduado') {
      resumen += ` graduado`;
    }
    
    if (this.experiencias.length > 0) {
      resumen += ` con experiencia en ${this.experiencias.map(exp => exp.cargo).join(', ')}`;
    }
    
    return resumen;
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }

  private showModalMessage(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  onModalConfirmed(): void {
    if (this.modalType === 'success') {
      this.router.navigate(['/dashboard']);
    }
  }
}