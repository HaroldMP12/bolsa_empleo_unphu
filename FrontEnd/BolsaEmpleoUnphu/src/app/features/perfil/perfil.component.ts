import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService, PerfilEstudiante, PerfilEmpresa } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthResponse } from '../../core/models/auth.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="perfil-page">
      <!-- HERO SECTION -->
      <div class="profile-hero">
        <div class="hero-background"></div>
        <div class="hero-content">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <span class="avatar-initials">{{ getInitials() }}</span>
            </div>
            <button class="avatar-edit-btn" (click)="editarFoto()">
              <span>📷</span>
            </button>
          </div>
          <div class="profile-info">
            <h1>{{ currentUser?.nombreCompleto }}</h1>
            <p class="profile-title">{{ getProfileTitle() }}</p>
            <p class="profile-location">📍 República Dominicana</p>
          </div>
          <div class="profile-actions">
            <button class="btn-edit-profile" (click)="toggleEditMode()">
              {{ editMode ? '👁️ Ver Perfil' : '✏️ Editar Perfil' }}
            </button>
          </div>
        </div>
      </div>

      <!-- PERFIL UNIFICADO -->
      <div class="perfil-content">
        <div class="profile-layout">
          <!-- SIDEBAR -->
          <div class="profile-sidebar">
            <!-- Información Personal/Empresa Card -->
            <div class="profile-card">
              <div class="card-header">
                <h3>📋 {{ isCompany() ? 'Información de Contacto' : 'Información Personal' }}</h3>
              </div>
              <div class="card-content" *ngIf="!editMode">
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ currentUser?.correo }}</span>
                </div>
                <div class="info-item" *ngIf="getTelefono()">
                  <span class="info-label">Teléfono:</span>
                  <span class="info-value">{{ getTelefono() }}</span>
                </div>
                <div class="info-item" *ngIf="!isCompany() && personalForm.get('fechaNacimiento')?.value">
                  <span class="info-label">Fecha de Nacimiento:</span>
                  <span class="info-value">{{ personalForm.get('fechaNacimiento')?.value | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-item" *ngIf="getDireccion()">
                  <span class="info-label">Dirección:</span>
                  <span class="info-value">{{ getDireccion() }}</span>
                </div>
                <div class="info-item" *ngIf="isCompany() && empresaForm.get('rnc')?.value">
                  <span class="info-label">RNC:</span>
                  <span class="info-value">{{ empresaForm.get('rnc')?.value }}</span>
                </div>
                <div class="info-item" *ngIf="isCompany() && empresaForm.get('sitioWeb')?.value">
                  <span class="info-label">Sitio Web:</span>
                  <span class="info-value">{{ empresaForm.get('sitioWeb')?.value }}</span>
                </div>
              </div>
              <div class="card-content" *ngIf="editMode">
                <!-- Formulario para Estudiantes -->
                <form [formGroup]="personalForm" *ngIf="!isCompany()">
                  <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" formControlName="nombreCompleto" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" formControlName="correo" class="form-control" readonly>
                  </div>
                  <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" formControlName="telefono" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input type="date" formControlName="fechaNacimiento" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Dirección</label>
                    <textarea formControlName="direccion" class="form-control" rows="2"></textarea>
                  </div>
                </form>
                
                <!-- Formulario para Empresas -->
                <div *ngIf="isCompany()">
                  <form [formGroup]="empresaForm">
                    <div class="form-group">
                      <label>Nombre de la Empresa</label>
                      <input type="text" formControlName="nombreEmpresa" class="form-control">
                    </div>
                    <div class="form-group">
                      <label>RNC</label>
                      <input type="text" formControlName="rnc" class="form-control">
                    </div>
                    <div class="form-group">
                      <label>Sitio Web</label>
                      <input type="url" formControlName="sitioWeb" class="form-control" placeholder="https://www.ejemplo.com">
                    </div>
                  </form>
                  <form [formGroup]="contactoForm">
                    <div class="form-group">
                      <label>Teléfono Principal</label>
                      <input type="tel" formControlName="telefono" class="form-control">
                    </div>
                    <div class="form-group">
                      <label>Dirección</label>
                      <textarea formControlName="direccion" class="form-control" rows="2"></textarea>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Documentos Card -->
            <div class="profile-card">
              <div class="card-header">
                <h3>📄 {{ isCompany() ? 'Archivos Corporativos' : 'Documentos' }}</h3>
              </div>
              <div class="card-content">
                <div class="document-item" *ngIf="!isCompany()">
                  <div class="document-info">
                    <span class="document-icon">📄</span>
                    <div>
                      <p class="document-name">Curriculum Vitae</p>
                      <p class="document-status">{{ cvSeleccionado || 'No subido' }}</p>
                    </div>
                  </div>
                  <button class="btn-upload" (click)="triggerFileInput('cv')" *ngIf="editMode">Subir</button>
                </div>
                <div class="document-item" *ngIf="isCompany()">
                  <div class="document-info">
                    <span class="document-icon">🏢</span>
                    <div>
                      <p class="document-name">Logo de la Empresa</p>
                      <p class="document-status">{{ logoSeleccionado || 'No subido' }}</p>
                    </div>
                  </div>
                  <button class="btn-upload" (click)="triggerFileInput('logo')" *ngIf="editMode">Subir</button>
                </div>
                <input type="file" #cvInput accept=".pdf" (change)="onFileSelect($event, 'cv')" style="display: none;">
              </div>
            </div>
          </div>

          <!-- MAIN CONTENT -->
          <div class="profile-main">
            <!-- Información Académica/Empresa Card -->
            <div class="profile-card" *ngIf="!isCompany()">
              <div class="card-header">
                <h3>🎓 Información Académica</h3>
              </div>
              <div class="card-content" *ngIf="!editMode">
                <div class="academic-summary">
                  <div class="university-info">
                    <h4>Universidad Nacional Pedro Henríquez Ureña</h4>
                    <p class="degree">{{ getCarreraName() }}</p>
                    <p class="status">{{ getSemestreStatus() }}</p>
                  </div>
                  <div class="academic-details">
                    <div class="detail-item" *ngIf="academicForm.get('matricula')?.value">
                      <span class="detail-label">Matrícula:</span>
                      <span class="detail-value">{{ academicForm.get('matricula')?.value }}</span>
                    </div>
                    <div class="detail-item" *ngIf="academicForm.get('anoIngreso')?.value">
                      <span class="detail-label">Año de Ingreso:</span>
                      <span class="detail-value">{{ academicForm.get('anoIngreso')?.value }}</span>
                    </div>
                    <div class="detail-item" *ngIf="academicForm.get('promedio')?.value">
                      <span class="detail-label">Promedio:</span>
                      <span class="detail-value">{{ academicForm.get('promedio')?.value }}/4.0</span>
                    </div>
                  </div>
                </div>
              </div>
              <form [formGroup]="academicForm" class="card-content" *ngIf="editMode">
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
            
            <!-- Información Empresarial Card -->
            <div class="profile-card" *ngIf="isCompany()">
              <div class="card-header">
                <h3>🏢 Información Empresarial</h3>
              </div>
              <div class="card-content" *ngIf="!editMode">
                <div class="company-info">
                  <div class="detail-item" *ngIf="empresaForm.get('sector')?.value">
                    <span class="detail-label">Sector:</span>
                    <span class="detail-value">{{ getSectorName() }}</span>
                  </div>
                  <div class="detail-item" *ngIf="empresaForm.get('tamano')?.value">
                    <span class="detail-label">Tamaño:</span>
                    <span class="detail-value">{{ getTamanoName() }}</span>
                  </div>
                </div>
              </div>
              <form [formGroup]="empresaForm" class="card-content" *ngIf="editMode">
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
              </form>
            </div>

            <!-- Experiencia Laboral Card -->
            <div class="profile-card" *ngIf="!isCompany()">
              <div class="card-header">
                <h3>💼 Experiencia Laboral</h3>
                <button type="button" class="btn-add" (click)="agregarExperiencia()" *ngIf="editMode">+ Agregar</button>
              </div>
              <div class="card-content">
                <div *ngIf="experiencias.length === 0 && !editMode" class="empty-experience">
                  <div class="empty-icon">💼</div>
                  <p>Aún no has agregado experiencia laboral</p>
                  <button class="btn-add-first" (click)="toggleEditMode(); agregarExperiencia()">Agregar primera experiencia</button>
                </div>
                
                <div *ngFor="let exp of experiencias; let i = index" class="experience-item">
                  <div class="experience-header" *ngIf="!editMode">
                    <div class="company-logo">🏢</div>
                    <div class="experience-info">
                      <h4>{{ exp.cargo }}</h4>
                      <p class="company-name">{{ exp.empresa }}</p>
                      <p class="experience-period">
                        {{ exp.fechaInicio | date:'MMM yyyy' }} - 
                        {{ exp.actual ? 'Presente' : (exp.fechaFin | date:'MMM yyyy') }}
                      </p>
                      <p class="experience-description" *ngIf="exp.descripcion">{{ exp.descripcion }}</p>
                    </div>
                  </div>
                  
                  <div class="experience-form" *ngIf="editMode">
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
                      <textarea [(ngModel)]="exp.descripcion" class="form-control" rows="3" placeholder="Describe tus responsabilidades y logros..."></textarea>
                    </div>
                    <button type="button" class="btn-remove" (click)="removerExperiencia(i)">🗑️ Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Estadísticas de Empresa -->
            <div class="profile-card" *ngIf="isCompany()">
              <div class="card-header">
                <h3>📊 Estadísticas</h3>
              </div>
              <div class="card-content">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticasEmpresa.totalVacantes || 0 }}</div>
                    <div class="stat-label">Vacantes Publicadas</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticasEmpresa.vacantesActivas || 0 }}</div>
                    <div class="stat-label">Vacantes Activas</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticasEmpresa.totalPostulaciones || 0 }}</div>
                    <div class="stat-label">Total Postulaciones</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticasEmpresa.candidatosPendientes || 0 }}</div>
                    <div class="stat-label">Candidatos Pendientes</div>
                  </div>
                </div>
                <div class="stats-footer">
                  <button class="btn-stats-detail" (click)="verEstadisticasCompletas()">
                    📊 Ver Estadísticas Completas
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Descripción Personal/Empresa -->
            <div class="profile-card">
              <div class="card-header">
                <h3>📝 {{ isCompany() ? 'Acerca de la Empresa' : 'Acerca de mí' }}</h3>
              </div>
              <div class="card-content" *ngIf="!editMode">
                <div class="description-content">
                  <p *ngIf="getDescripcion(); else noDescription">{{ getDescripcion() }}</p>
                  <ng-template #noDescription>
                    <div class="empty-description">
                      <p>{{ isCompany() ? 'Agrega una descripción de tu empresa' : 'Cuéntanos sobre ti, tus objetivos y experiencias' }}</p>
                      <button class="btn-add-first" (click)="toggleEditMode()">Agregar descripción</button>
                    </div>
                  </ng-template>
                </div>
              </div>
              <div class="card-content" *ngIf="editMode">
                <div class="form-group">
                  <label>{{ isCompany() ? 'Descripción de la Empresa' : 'Descripción Personal' }}</label>
                  <textarea 
                    [(ngModel)]="descripcionPersonal" 
                    class="form-control" 
                    rows="4" 
                    [placeholder]="isCompany() ? 'Describe tu empresa, misión, visión y valores...' : 'Cuéntanos sobre ti, tus objetivos profesionales, habilidades y lo que te apasiona...'">
                  </textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botones de Acción -->
      <div class="action-buttons" *ngIf="editMode">
        <button type="button" class="btn-secondary" (click)="cancelarEdicion()">Cancelar</button>
        <button type="button" class="btn-primary" (click)="guardarPerfil()" [disabled]="guardando">
          {{ guardando ? '⏳ Guardando...' : '💾 Guardar Cambios' }}
        </button>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div *ngIf="showModal" class="modal-overlay" (click)="showModal = false">
      <div class="confirmation-modal" (click)="$event.stopPropagation()">
        <div class="confirmation-header">
          <h3>{{ modalTitle }}</h3>
        </div>
        <div class="confirmation-body">
          <p>{{ modalMessage }}</p>
        </div>
        <div class="confirmation-footer">
          <button class="btn-confirm" (click)="onModalConfirmed()">{{ modalConfirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .perfil-page {
      background: var(--unphu-background);
      min-height: 100vh;
    }
    
    /* HERO SECTION */
    .profile-hero {
      position: relative;
      background: white;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .hero-background {
      height: 200px;
      background: linear-gradient(135deg, var(--unphu-blue-dark) 0%, var(--unphu-green-primary) 100%);
      position: relative;
    }
    .hero-content {
      position: relative;
      padding: 0 2rem 2rem;
      display: flex;
      align-items: flex-end;
      gap: 2rem;
    }
    .profile-avatar {
      position: relative;
      margin-top: -80px;
    }
    .avatar-circle {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: var(--unphu-green-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 6px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .avatar-initials {
      font-size: 3rem;
      font-weight: 700;
      color: white;
    }
    .avatar-edit-btn {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--unphu-blue-dark);
      border: 3px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.3s;
    }
    .avatar-edit-btn:hover {
      transform: scale(1.1);
    }
    .profile-info {
      flex: 1;
      padding-top: 1rem;
    }
    .profile-info h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
    }
    .profile-title {
      font-size: 1.25rem;
      color: var(--unphu-gray-medium);
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }
    .profile-location {
      color: #666;
      margin: 0;
      font-size: 1rem;
    }
    .profile-actions {
      padding-top: 1rem;
    }
    .btn-edit-profile {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }
    .btn-edit-profile:hover {
      background: #0a2a3f;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 56, 90, 0.3);
    }
    
    /* LAYOUT */
    .perfil-content {
      padding: 0 2rem 2rem;
    }
    .profile-layout {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .profile-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .profile-main {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    /* CARDS */
    .profile-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }
    .card-header {
      background: linear-gradient(135deg, var(--unphu-blue-dark) 0%, #1a4a6b 100%);
      color: white;
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header h3 {
      margin: 0;
      font-weight: 600;
      font-size: 1.1rem;
    }
    .card-content {
      padding: 1.5rem;
    }
    
    /* INFO ITEMS */
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: var(--unphu-blue-dark);
      min-width: 100px;
    }
    .info-value {
      color: #333;
      text-align: right;
      flex: 1;
    }
    
    /* ACADEMIC SECTION */
    .academic-summary {
      text-align: center;
    }
    .university-info h4 {
      color: var(--unphu-blue-dark);
      font-size: 1.1rem;
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }
    .degree {
      color: var(--unphu-green-primary);
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }
    .status {
      color: #666;
      margin: 0 0 1.5rem 0;
    }
    .academic-details {
      display: grid;
      gap: 0.5rem;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 500;
      color: var(--unphu-blue-dark);
    }
    .detail-value {
      color: #333;
      font-weight: 600;
    }
    
    /* EXPERIENCE SECTION */
    .empty-experience {
      text-align: center;
      padding: 2rem 1rem;
      color: #666;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .btn-add-first {
      background: var(--unphu-green-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 500;
      margin-top: 1rem;
      transition: all 0.3s;
    }
    .btn-add-first:hover {
      background: #3a7f39;
      transform: translateY(-2px);
    }
    .experience-item {
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .experience-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    .experience-header {
      display: flex;
      gap: 1rem;
    }
    .company-logo {
      width: 48px;
      height: 48px;
      background: var(--unphu-background);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .experience-info h4 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .company-name {
      color: #666;
      margin: 0 0 0.25rem 0;
      font-weight: 500;
    }
    .experience-period {
      color: var(--unphu-gray-medium);
      font-size: 0.9rem;
      margin: 0 0 0.75rem 0;
    }
    .experience-description {
      color: #333;
      line-height: 1.5;
      margin: 0;
    }
    
    /* DESCRIPTION SECTION */
    .description-content {
      line-height: 1.6;
    }
    .description-content p {
      color: #333;
      margin: 0;
      text-align: justify;
    }
    .empty-description {
      text-align: center;
      padding: 2rem 1rem;
      color: #666;
    }
    .empty-description p {
      margin-bottom: 1rem;
      text-align: center !important;
    }
    
    /* COMPANY INFO */
    .company-info {
      display: grid;
      gap: 0.5rem;
    }
    
    /* STATISTICS */
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .stat-item {
      text-align: center;
      padding: 1rem;
      background: var(--unphu-background);
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--unphu-green-primary);
      margin-bottom: 0.5rem;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #666;
      font-weight: 500;
    }
    .stats-footer {
      margin-top: 1rem;
      text-align: center;
      border-top: 1px solid #e0e0e0;
      padding-top: 1rem;
    }
    .btn-stats-detail {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
      font-size: 0.9rem;
    }
    .btn-stats-detail:hover {
      background: #0a2a3f;
      transform: translateY(-1px);
    }
    
    /* DOCUMENTS */
    .document-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--unphu-background);
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .document-item:last-child {
      margin-bottom: 0;
    }
    .document-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .document-icon {
      font-size: 1.5rem;
    }
    .document-name {
      font-weight: 600;
      color: var(--unphu-blue-dark);
      margin: 0 0 0.25rem 0;
    }
    .document-status {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }
    .btn-upload {
      background: var(--unphu-green-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.3s;
    }
    .btn-upload:hover {
      background: #3a7f39;
    }
    
    /* FORMS */
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
      font-weight: 600;
      color: var(--unphu-blue-dark);
      font-size: 0.9rem;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s;
      background: white;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--unphu-green-primary);
      box-shadow: 0 0 0 3px rgba(67, 148, 65, 0.1);
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
    }
    
    /* BUTTONS */
    .btn-add {
      background: var(--unphu-green-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.3s;
    }
    .btn-add:hover {
      background: #3a7f39;
    }
    .btn-remove {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      margin-top: 1rem;
      transition: all 0.3s;
    }
    .btn-remove:hover {
      background: #c82333;
    }
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .btn-primary {
      background: var(--unphu-green-primary);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }
    .btn-primary:hover:not(:disabled) {
      background: #3a7f39;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(67, 148, 65, 0.3);
    }
    .btn-primary:disabled {
      background: #ccc;
      transform: none;
      box-shadow: none;
    }
    .btn-secondary {
      background: white;
      color: var(--unphu-blue-dark);
      border: 2px solid var(--unphu-blue-dark);
      padding: 0.75rem 2rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      font-size: 1rem;
    }
    .btn-secondary:hover {
      background: var(--unphu-blue-dark);
      color: white;
      transform: translateY(-2px);
    }
    
    /* RESPONSIVE */
    @media (max-width: 768px) {
      .profile-layout {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .hero-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
      }
      .profile-info {
        padding-top: 0;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
      .profile-info h1 {
        font-size: 2rem;
      }
      .avatar-circle {
        width: 120px;
        height: 120px;
      }
      .avatar-initials {
        font-size: 2.5rem;
      }
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      .stat-number {
        font-size: 1.5rem;
      }
    }
    
    /* MODAL */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .confirmation-modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .confirmation-header {
      background: var(--unphu-green-primary);
      color: white;
      padding: 1.5rem;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .confirmation-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .confirmation-body {
      padding: 2rem;
      text-align: center;
    }
    .confirmation-body p {
      margin: 0;
      color: #666;
      line-height: 1.5;
      font-size: 1rem;
    }
    .confirmation-footer {
      padding: 1.5rem;
      display: flex;
      justify-content: center;
    }
    .btn-confirm {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .btn-confirm:hover {
      background: #0a2a3f;
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
  descripcionPersonal = '';
  estadisticasEmpresa: any = {
    totalVacantes: 0,
    vacantesActivas: 0,
    totalPostulaciones: 0,
    candidatosPendientes: 0
  };
  
  editMode = false;
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
    console.log('=== CARGANDO PERFIL ===');
    console.log('Usuario actual:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('No hay usuario actual');
      return;
    }

    console.log('Rol del usuario:', this.currentUser.rol);
    console.log('Es estudiante?', this.isStudent());
    console.log('Es empresa?', this.isCompany());

    if (this.isStudent()) {
      console.log('Cargando perfil de estudiante...');
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
      console.log('Cargando perfil de empresa para usuario:', this.currentUser.usuarioID);
      this.perfilService.obtenerPerfilEmpresa(this.currentUser.usuarioID).subscribe({
        next: (empresa) => {
          console.log('Respuesta del servicio de empresa:', empresa);
          if (empresa && empresa.empresaID) {
            this.populateCompanyForm(empresa);
          } else {
            console.log('No se encontró perfil de empresa existente');
          }
        },
        error: (error) => {
          console.error('Error al cargar perfil de empresa:', error);
        }
      });
    } else {
      console.log('Tipo de usuario no reconocido');
    }
  }

  private populateStudentForm(perfil: any): void {
    console.log('Cargando datos del perfil:', perfil);
    
    this.personalForm.patchValue({
      nombreCompleto: this.currentUser?.nombreCompleto || '',
      correo: this.currentUser?.correo || '',
      telefono: perfil.usuario?.telefono || '',
      fechaNacimiento: perfil.fechaNacimiento ? perfil.fechaNacimiento.split('T')[0] : '',
      direccion: perfil.direccion || ''
    });
    
    this.academicForm.patchValue({
      carrera: perfil.carreraID?.toString() || '1',
      matricula: perfil.matricula || '',
      semestre: perfil.semestre?.toString() || '',
      anoIngreso: perfil.fechaIngreso ? new Date(perfil.fechaIngreso).getFullYear() : '',
      promedio: perfil.promedioAcademico || ''
    });
    
    if (perfil.experienciaLaboral) {
      try {
        this.experiencias = JSON.parse(perfil.experienciaLaboral);
      } catch {
        this.experiencias = [];
      }
    }
    
    if (perfil.urlCV) {
      this.cvSeleccionado = perfil.urlCV;
    }
    
    if (perfil.urlImagen) {
      this.fotoSeleccionada = perfil.urlImagen;
    }
    
    // Cargar descripción personal
    this.descripcionPersonal = perfil.resumen || '';
    
    console.log('Formulario actualizado:', this.academicForm.value);
  }

  private populateCompanyForm(empresa: any): void {
    console.log('Cargando datos de empresa:', empresa);
    
    this.empresaForm.patchValue({
      nombreEmpresa: empresa.nombreEmpresa || '',
      rnc: empresa.rnc || '',
      sector: empresa.sector || '',
      sitioWeb: empresa.sitioWeb || '',
      descripcion: empresa.descripcion || '',
      tamano: empresa.cantidadEmpleados || ''
    });

    this.contactoForm.patchValue({
      telefono: empresa.telefonoEmpresa || '',
      telefonoSecundario: empresa.telefonoSecundario || '',
      direccion: empresa.direccion || '',
      personaContacto: empresa.personaContacto || '',
      cargoContacto: empresa.cargoContacto || ''
    });
    
    if (empresa.imagenLogo) {
      this.logoSeleccionado = empresa.imagenLogo;
    }
    
    if (empresa.imagenPortada) {
      this.portadaSeleccionada = empresa.imagenPortada;
    }
    
    // Cargar descripción de la empresa
    this.descripcionPersonal = empresa.descripcion || '';
    
    // Cargar estadísticas
    this.cargarEstadisticasEmpresa(empresa.empresaID);
    
    console.log('Formularios actualizados:', {
      empresa: this.empresaForm.value,
      contacto: this.contactoForm.value,
      descripcion: this.descripcionPersonal
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
      this.toastService.showError('No se pudo identificar el usuario');
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
      semestre: semestreValue && semestreValue !== 'graduado' && semestreValue !== '' ? parseInt(semestreValue) : null,
      fechaIngreso: anoIngresoValue ? new Date(anoIngresoValue + '-01-01') : null,
      resumen: this.descripcionPersonal || this.buildResumenEstudiante(),
      urlImagen: this.fotoSeleccionada || null,
      redesSociales: null,
      tituloObtenido: null,
      fechaEgreso: null,
      añoGraduacion: null,
      fechaNacimiento: this.personalForm.get('fechaNacimiento')?.value || null,
      direccion: this.personalForm.get('direccion')?.value || null,
      promedioAcademico: this.academicForm.get('promedio')?.value ? parseFloat(this.academicForm.get('promedio')?.value) : null,
      urlCV: this.cvSeleccionado || null,
      experienciaLaboral: this.experiencias.length > 0 ? JSON.stringify(this.experiencias) : null,
      telefono: this.personalForm.get('telefono')?.value || null
    };
    
    console.log('Datos a enviar:', perfilData);
    console.log('Personal form values:', this.personalForm.value);
    console.log('Experiencias:', this.experiencias);
    console.log('Archivos:', { foto: this.fotoSeleccionada, cv: this.cvSeleccionado });

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
      descripcion: this.descripcionPersonal || this.empresaForm.get('descripcion')?.value || null,
      cantidadEmpleados: this.empresaForm.get('tamano')?.value || null,
      imagenLogo: this.logoSeleccionado || null,
      imagenPortada: this.portadaSeleccionada || null,
      personaContacto: this.contactoForm.get('personaContacto')?.value || null,
      cargoContacto: this.contactoForm.get('cargoContacto')?.value || null,
      telefonoSecundario: this.contactoForm.get('telefonoSecundario')?.value || null,
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

  getInitials(): string {
    if (!this.currentUser?.nombreCompleto) return 'U';
    return this.currentUser.nombreCompleto
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getProfileTitle(): string {
    if (!this.currentUser) return '';
    
    if (this.isStudent()) {
      const carrera = this.getCarreraName();
      const semestre = this.getSemestreStatus();
      return `${semestre} - ${carrera}`;
    }
    
    if (this.isCompany()) {
      const sector = this.getSectorName();
      return sector || 'Empresa';
    }
    
    return 'Usuario';
  }

  getCarreraName(): string {
    const carreraId = this.academicForm?.get('carrera')?.value;
    const carreras: { [key: string]: string } = {
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
    return carreras[carreraId] || 'Carrera no especificada';
  }

  getSemestreStatus(): string {
    const semestre = this.academicForm?.get('semestre')?.value;
    if (semestre === 'graduado') return 'Egresado';
    if (semestre) return `${semestre}° Semestre`;
    return 'Estudiante';
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  editarFoto(): void {
    if (this.editMode) {
      this.triggerFileInput('foto');
    }
  }

  triggerFileInput(tipo: string): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = tipo === 'cv' ? '.pdf' : 'image/*';
    input.onchange = (event: any) => this.onFileSelect(event, tipo);
    input.click();
  }

  cancelarEdicion(): void {
    this.editMode = false;
    this.loadExistingProfile(); // Recargar datos originales
  }

  getDescripcion(): string {
    if (this.isCompany()) {
      return this.empresaForm?.get('descripcion')?.value || this.descripcionPersonal;
    }
    return this.descripcionPersonal;
  }

  getTelefono(): string {
    if (this.isCompany()) {
      return this.contactoForm?.get('telefono')?.value;
    }
    return this.personalForm?.get('telefono')?.value;
  }

  getDireccion(): string {
    if (this.isCompany()) {
      return this.contactoForm?.get('direccion')?.value;
    }
    return this.personalForm?.get('direccion')?.value;
  }

  getSectorName(): string {
    const sector = this.empresaForm?.get('sector')?.value;
    const sectores: { [key: string]: string } = {
      'tecnologia': 'Tecnología',
      'financiero': 'Financiero',
      'salud': 'Salud',
      'educacion': 'Educación',
      'manufactura': 'Manufactura',
      'servicios': 'Servicios',
      'comercio': 'Comercio'
    };
    return sectores[sector] || '';
  }

  getTamanoName(): string {
    const tamano = this.empresaForm?.get('tamano')?.value;
    const tamanos: { [key: string]: string } = {
      'pequena': 'Pequeña (1-50 empleados)',
      'mediana': 'Mediana (51-200 empleados)',
      'grande': 'Grande (200+ empleados)'
    };
    return tamanos[tamano] || '';
  }

  cargarEstadisticasEmpresa(empresaID: number): void {
    // Cargar desde localStorage (datos locales)
    const vacantes = JSON.parse(localStorage.getItem('vacantes') || '[]');
    const postulaciones = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    
    const vacantesEmpresa = vacantes.filter((v: any) => v.empresaID === empresaID);
    const hoy = new Date();
    const vacantesActivas = vacantesEmpresa.filter((v: any) => {
      const fechaVencimiento = new Date(v.fechaVencimiento || v.fechaCierre);
      return fechaVencimiento > hoy;
    });
    
    const postulacionesEmpresa = postulaciones.filter((p: any) => 
      vacantesEmpresa.some((v: any) => v.vacanteID === p.vacanteID)
    );
    
    const candidatosPendientes = postulacionesEmpresa.filter((p: any) => 
      p.estado === 'Pendiente'
    );
    
    this.estadisticasEmpresa = {
      totalVacantes: vacantesEmpresa.length,
      vacantesActivas: vacantesActivas.length,
      totalPostulaciones: postulacionesEmpresa.length,
      candidatosPendientes: candidatosPendientes.length
    };
    
    console.log('Estadísticas cargadas:', this.estadisticasEmpresa);
  }

  verEstadisticasCompletas(): void {
    this.router.navigate(['/perfil-empresa']);
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
    this.showModal = false;
    if (this.modalType === 'success') {
      this.editMode = false;
    }
  }
}