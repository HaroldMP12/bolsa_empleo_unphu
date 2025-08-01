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
      background: linear-gradient(135deg, var(--unphu-blue-dark) 0%, var(--unphu-green-primary) 100%);
      padding: 1rem;
    }
    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      overflow: hidden;
      width: 100%;
      max-width: 400px;
    }
    .login-header {
      background: var(--unphu-blue-dark);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .login-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
    }
    .login-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }
    .login-form {
      padding: 2rem;
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
      background: linear-gradient(45deg, var(--unphu-green-primary), var(--unphu-green-light));
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-primary:hover:not(:disabled) {
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
      margin-top: 1rem;
    }
    .register-link a {
      color: var(--unphu-green-primary);
      text-decoration: none;
      font-weight: 500;
    }
    .register-link a:hover {
      color: var(--unphu-green-secondary);
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