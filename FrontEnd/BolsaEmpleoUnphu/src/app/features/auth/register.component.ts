import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CreateUsuarioDto } from '../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
        <h2>Registro</h2>
        
        <div class="form-group">
          <input 
            type="text" 
            formControlName="nombreCompleto" 
            placeholder="Nombre completo"
            class="form-control">
        </div>

        <div class="form-group">
          <input 
            type="email" 
            formControlName="correo" 
            placeholder="Correo electrónico"
            class="form-control">
        </div>

        <div class="form-group">
          <input 
            type="password" 
            formControlName="contraseña" 
            placeholder="Contraseña"
            class="form-control">
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
        </div>

        <button type="submit" [disabled]="registerForm.invalid || loading" class="btn-primary">
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>

        <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="success">{{ successMessage }}</div>
      </form>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    .register-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    .btn-primary:disabled {
      background-color: #ccc;
    }
    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    .success {
      color: #28a745;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
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
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      rolID: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const userData: CreateUsuarioDto = {
        ...this.registerForm.value,
        estado: true,
        rolID: parseInt(this.registerForm.value.rolID)
      };

      this.apiService.post('usuarios', userData).subscribe({
        next: () => {
          this.successMessage = 'Usuario registrado exitosamente';
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al registrar usuario';
          this.loading = false;
        }
      });
    }
  }
}