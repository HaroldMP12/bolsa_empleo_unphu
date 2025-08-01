import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="perfil-container">
      <h1>Mi Perfil</h1>
      <p>Próximamente: Gestión de perfil de usuario</p>
    </div>
  `,
  styles: [`
    .perfil-container {
      padding: 2rem;
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class PerfilComponent {}