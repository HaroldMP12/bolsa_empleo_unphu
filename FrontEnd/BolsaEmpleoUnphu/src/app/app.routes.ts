import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'auth/forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'vacantes', loadComponent: () => import('./features/vacantes/vacantes.component').then(m => m.VacantesComponent) },
      { path: 'postulaciones', loadComponent: () => import('./features/postulaciones/postulaciones.component').then(m => m.PostulacionesComponent) },
      { path: 'mis-vacantes', loadComponent: () => import('./features/vacantes/vacantes.component').then(m => m.VacantesComponent) },
      { path: 'perfil', loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent) }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
