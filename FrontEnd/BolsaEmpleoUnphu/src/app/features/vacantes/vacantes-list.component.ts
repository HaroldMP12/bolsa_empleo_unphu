import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vacantes-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vacantes-container">
      <h1>Vacantes Disponibles</h1>
      <p>Próximamente: Lista de vacantes con filtros y búsqueda</p>
    </div>
  `,
  styles: [`
    .vacantes-container {
      padding: 2rem;
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class VacantesListComponent {}