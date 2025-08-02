import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Bolsa de Empleo UNPHU</h1>
          <p>Conectando talento con oportunidades</p>
        </div>
        
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
        
        <div class="forgot-password-link">
          <a routerLink="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
        
        <p class="register-link">
          ¿No tienes cuenta? <a routerLink="/auth/register">Regístrate aquí</a>
        </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, rgba(67, 148, 65, 0.8) 0%, rgba(67, 148, 65, 0.8) 100%),
                  url('/images/login-background.jpg') center/cover;
      padding: 1rem;
    }
    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      width: 100%;
      max-width: 500px;
      backdrop-filter: blur(10px);
    }
    .login-header {
      background: var(--unphu-green-primary);
      color: white;
      padding: 2.5rem;
      text-align: center;
    }
    .login-header h1 {
      margin: 0 0 0.75rem 0;
      font-size: 2.2rem;
      font-weight: 700;
    }
    .login-header p {
      margin: 0;
      opacity: 0.95;
      font-size: 1.1rem;
      font-weight: 300;
    }
    .login-form {
      padding: 2.5rem;
    }
    .login-form h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1rem;
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
      background: var(--unphu-green-primary);
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
      background: #3a7f39;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(67, 148, 65, 0.3);
    }
    .btn-primary:disabled {
      background: #ccc;
      transform: none;
      box-shadow: none;
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
      margin-top: 1.5rem;
      font-size: 1rem;
    }
    .register-link a {
      color: var(--unphu-blue-dark);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    .register-link a:hover {
      color: #0a2a3f;
      text-decoration: underline;
    }
    .forgot-password-link {
      text-align: center;
      margin-top: 1rem;
    }
    .forgot-password-link a {
      color: var(--unphu-blue-dark);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .forgot-password-link a:hover {
      color: #0a2a3f;
      text-decoration: underline;
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