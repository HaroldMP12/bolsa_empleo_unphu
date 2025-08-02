import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vacantes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vacantes-page">
      <div class="page-header">
        <h1>Vacantes Disponibles</h1>
        <p>Explora las oportunidades laborales disponibles</p>
      </div>
      
      <div class="content-placeholder">
        <div class="placeholder-card">
          <h3>🚧 Página en Construcción</h3>
          <p>Esta página mostrará todas las vacantes disponibles</p>
          <p>Funcionalidades próximas:</p>
          <ul>
            <li>Lista de vacantes con filtros</li>
            <li>Búsqueda por categoría y ubicación</li>
            <li>Botón de postulación</li>
            <li>Detalles de cada vacante</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vacantes-page {
      padding: 2rem;
    }
    .page-header {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .page-header h1 {
      color: var(--unphu-blue-dark);
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
    }
    .page-header p {
      color: #666;
      margin: 0;
      font-size: 1.1rem;
    }
    .content-placeholder {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .placeholder-card {
      padding: 3rem;
      text-align: center;
    }
    .placeholder-card h3 {
      color: var(--unphu-blue-dark);
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    .placeholder-card p {
      color: #666;
      margin-bottom: 1rem;
    }
    .placeholder-card ul {
      text-align: left;
      max-width: 400px;
      margin: 0 auto;
      color: #666;
    }
    .placeholder-card li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class VacantesComponent {}