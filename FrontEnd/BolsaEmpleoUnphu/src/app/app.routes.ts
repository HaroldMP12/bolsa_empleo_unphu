import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
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
      { path: 'candidatos/:id', loadComponent: () => import('./features/postulaciones/gestion-candidatos.component').then(m => m.GestionCandidatosComponent) },
      { path: 'perfil', loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent) },
      { path: 'perfil-empresa', loadComponent: () => import('./features/empresas/perfil-empresa.component').then(m => m.PerfilEmpresaComponent) },
      
      // Rutas de Administración (protegidas con AdminGuard)
      { path: 'admin', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [AdminGuard] },
      { path: 'admin/empresas', loadComponent: () => import('./features/admin/empresas-admin.component').then(m => m.EmpresasAdminComponent), canActivate: [AdminGuard] },
      { path: 'admin/usuarios', loadComponent: () => import('./features/admin/usuarios-admin.component').then(m => m.UsuariosAdminComponent), canActivate: [AdminGuard] },
      { path: 'admin/categorias', loadComponent: () => import('./features/admin/categorias-admin.component').then(m => m.CategoriasAdminComponent), canActivate: [AdminGuard] },
      { path: 'admin/carreras', loadComponent: () => import('./features/admin/carreras-admin.component').then(m => m.CarrerasAdminComponent), canActivate: [AdminGuard] },
      { path: 'admin/reportes', loadComponent: () => import('./features/admin/reportes-admin.component').then(m => m.ReportesAdminComponent), canActivate: [AdminGuard] }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
