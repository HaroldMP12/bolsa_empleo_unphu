import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        <h2>Iniciar Sesión</h2>
        
        <div class="form-group">
          <input 
            type="email" 
            formControlName="correo" 
            placeholder="Correo electrónico"
            class="form-control">
          <div *ngIf="loginForm.get('correo')?.invalid && loginForm.get('correo')?.touched" class="error">
            Correo requerido
          </div>
        </div>

        <div class="form-group">
          <input 
            type="password" 
            formControlName="contraseña" 
            placeholder="Contraseña"
            class="form-control">
          <div *ngIf="loginForm.get('contraseña')?.invalid && loginForm.get('contraseña')?.touched" class="error">
            Contraseña requerida
          </div>
        </div>

        <button type="submit" [disabled]="loginForm.invalid || loading" class="btn-primary">
          {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>

        <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
        
        <p class="register-link">
          ¿No tienes cuenta? <a href="/auth/register">Regístrate aquí</a>
        </p>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    .login-form {
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
      background-color: #007bff;
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
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
    }
    .register-link {
      text-align: center;
      margin-top: 1rem;
    }
    .register-link a {
      color: #007bff;
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = 'Credenciales inválidas';
          this.loading = false;
        }
      });
    }
  }
}