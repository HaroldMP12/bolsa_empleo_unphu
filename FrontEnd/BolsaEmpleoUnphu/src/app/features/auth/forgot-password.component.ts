import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <div class="forgot-password-header">
          <h1>Recuperar Contraseña</h1>
          <p>Te enviaremos un enlace para restablecer tu contraseña</p>
        </div>
        
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form">
          <div class="form-group">
            <input 
              type="email" 
              formControlName="correo" 
              placeholder="Ingresa tu correo electrónico"
              class="form-control">
            <div *ngIf="forgotPasswordForm.get('correo')?.invalid && forgotPasswordForm.get('correo')?.touched" class="error">
              Correo electrónico válido requerido
            </div>
          </div>

          <button type="submit" [disabled]="forgotPasswordForm.invalid || loading" class="btn-primary">
            {{ loading ? 'Enviando...' : 'Enviar Enlace' }}
          </button>

          <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="success">{{ successMessage }}</div>
          
          <p class="back-link">
            <a routerLink="/auth/login">← Volver al inicio de sesión</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, rgba(15, 56, 90, 0.8) 0%, rgba(67, 148, 65, 0.8) 100%),
                  url('/images/login-background.jpg') center/cover;
      padding: 1rem;
    }
    .forgot-password-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      width: 100%;
      max-width: 450px;
    }
    .forgot-password-header {
      background: var(--unphu-blue-dark);
      color: white;
      padding: 2.5rem;
      text-align: center;
    }
    .forgot-password-header h1 {
      margin: 0 0 0.75rem 0;
      font-size: 1.8rem;
      font-weight: 700;
    }
    .forgot-password-header p {
      margin: 0;
      opacity: 0.95;
      font-size: 1rem;
      font-weight: 300;
    }
    .forgot-password-form {
      padding: 2.5rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
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
      margin-top: 0.5rem;
      text-align: center;
    }
    .success {
      color: var(--unphu-green-primary);
      font-size: 0.875rem;
      margin-top: 0.5rem;
      text-align: center;
      font-weight: 500;
    }
    .back-link {
      text-align: center;
      margin-top: 1.5rem;
    }
    .back-link a {
      color: var(--unphu-green-primary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .back-link a:hover {
      color: #3a7f39;
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      this.apiService.post('auth/forgot-password', this.forgotPasswordForm.value).subscribe({
        next: (response: any) => {
          this.successMessage = response.message;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al procesar la solicitud. Intenta nuevamente.';
          this.loading = false;
        }
      });
    }
  }
}