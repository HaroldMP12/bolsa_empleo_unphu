import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { DashboardComponent } from '../features/dashboard/dashboard.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, DashboardComponent],
  template: `
    <div class="main-layout">
      <app-header></app-header>
      <main class="content">
        <app-dashboard></app-dashboard>
      </main>
    </div>
  `,
  styles: [`
    .main-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .content {
      flex: 1;
      background: var(--unphu-background);
    }
  `]
})
export class MainLayoutComponent {}