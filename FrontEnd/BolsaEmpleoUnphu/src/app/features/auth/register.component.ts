import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CreateUsuarioDto } from '../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>Bolsa de Empleo UNPHU</h1>
          <p>Únete a nuestra comunidad de talentos</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <h2>Crear Cuenta</h2>
        
        <div class="form-group">
          <input 
            type="text" 
            formControlName="nombreCompleto" 
            placeholder="Nombre completo"
            class="form-control">
          <div *ngIf="registerForm.get('nombreCompleto')?.invalid && registerForm.get('nombreCompleto')?.touched" class="error">
            Nombre completo requerido (2-150 caracteres)
          </div>
        </div>

        <div class="form-group">
          <input 
            type="email" 
            formControlName="correo" 
            placeholder="Correo electrónico"
            class="form-control">
          <div *ngIf="registerForm.get('correo')?.invalid && registerForm.get('correo')?.touched" class="error">
            Correo electrónico válido requerido
          </div>
        </div>

        <div class="form-group">
          <input 
            type="password" 
            formControlName="contraseña" 
            placeholder="Contraseña (mínimo 8 caracteres)"
            class="form-control">
          <div *ngIf="registerForm.get('contraseña')?.invalid && registerForm.get('contraseña')?.touched" class="error">
            Contraseña requerida (mínimo 8 caracteres)
          </div>
        </div>

        <div class="form-group">
          <input 
            type="tel" 
            formControlName="telefono" 
            placeholder="Teléfono (opcional)"
            class="form-control">
        </div>

        <div class="form-group">
          <select formControlName="rolID" class="form-control">
            <option value="">Seleccionar tipo de usuario</option>
            <option value="1">Estudiante</option>
            <option value="2">Egresado</option>
            <option value="3">Empresa</option>
          </select>
          <div *ngIf="registerForm.get('rolID')?.invalid && registerForm.get('rolID')?.touched" class="error">
            Selecciona un tipo de usuario
          </div>
        </div>

        <button type="submit" [disabled]="registerForm.invalid || loading" class="btn-primary">
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>

          <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="success">{{ successMessage }}</div>
          
          <p class="login-link">
            ¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión aquí</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, rgba(15, 56, 90, 0.8) 0%, rgba(67, 148, 65, 0.8) 100%),
                  url('/images/login-background.jpg') center/cover;
      padding: 1rem;
    }
    .register-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      width: 100%;
      max-width: 500px;
      backdrop-filter: blur(10px);
    }
    .register-header {
      background: var(--unphu-green-primary);
      color: white;
      padding: 2.5rem;
      text-align: center;
    }
    .register-header h1 {
      margin: 0 0 0.75rem 0;
      font-size: 2.2rem;
      font-weight: 700;
    }
    .register-header p {
      margin: 0;
      opacity: 0.95;
      font-size: 1.1rem;
      font-weight: 300;
    }
    .register-form {
      padding: 2.5rem;
    }
    .register-form h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 2rem;
      text-align: center;
      color: #333;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-control {
      width: 100%;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1.1rem;
      transition: border-color 0.3s ease;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--unphu-green-primary);
      box-shadow: 0 0 0 3px rgba(67, 148, 65, 0.1);
    }
    .btn-primary {
      width: 100%;
      padding: 1rem;
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn-primary:hover:not(:disabled) {
      background: #0a2a3f;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(15, 56, 90, 0.3);
    }
    .btn-primary:disabled {
      background: #ccc;
      transform: none;
      box-shadow: none;
    }
    .error {
      color: #dc3545;
      font-size: 1rem;
      margin-top: 0.5rem;
      text-align: center;
    }
    .success {
      color: var(--unphu-green-primary);
      font-size: 1rem;
      margin-top: 0.5rem;
      text-align: center;
      font-weight: 500;
    }
    .login-link {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 1rem;
    }
    .login-link a {
      color: var(--unphu-blue-dark);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    .login-link a:hover {
      color: #0a2a3f;
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(8)]],
      telefono: [''],
      rolID: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const formValue = this.registerForm.value;
      const userData: CreateUsuarioDto = {
        nombreCompleto: formValue.nombreCompleto,
        correo: formValue.correo,
        contraseña: formValue.contraseña,
        telefono: formValue.telefono || null,
        estado: true,
        rolID: parseInt(formValue.rolID)
      };

      console.log('Datos enviados:', userData);
      this.apiService.post('usuarios', userData).subscribe({
        next: () => {
          this.successMessage = 'Usuario registrado exitosamente';
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: (error) => {
          console.error('Error de registro:', error);
          this.errorMessage = error.error?.message || error.message || 'Error al registrar usuario';
          this.loading = false;
        }
      });
    }
  }
}