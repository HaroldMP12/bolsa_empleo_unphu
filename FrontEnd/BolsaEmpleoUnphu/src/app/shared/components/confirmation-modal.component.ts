import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-icon" [ngClass]="'icon-' + type">
            <span *ngIf="type === 'success'">✓</span>
            <span *ngIf="type === 'error'">✕</span>
            <span *ngIf="type === 'warning'">⚠</span>
            <span *ngIf="type === 'info'">ℹ</span>
          </div>
          <h2>{{ title }}</h2>
          <button class="btn-close" (click)="onCancel()" *ngIf="showCancel">×</button>
        </div>
        
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn-secondary" 
            (click)="onCancel()" 
            *ngIf="showCancel">
            {{ cancelText }}
          </button>
          <button 
            type="button" 
            class="btn-primary" 
            [ngClass]="'btn-' + type"
            (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 450px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      flex-direction: column;
      gap: 1rem;
    }
    .modal-icon {
      font-size: 3rem;
      font-weight: bold;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .icon-success {
      background: var(--unphu-green-primary);
    }
    .icon-error {
      background: #dc3545;
    }
    .icon-warning {
      background: #ffc107;
      color: #212529;
    }
    .icon-info {
      background: var(--unphu-blue-dark);
    }
    .modal-header h2 {
      margin: 0;
      color: var(--unphu-blue-dark);
      font-size: 1.5rem;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
    .modal-body {
      padding: 2rem;
      text-align: center;
    }
    .modal-body p {
      margin: 0;
      font-size: 1.1rem;
      color: #666;
      line-height: 1.5;
    }
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .btn-primary {
      background: var(--unphu-blue-dark);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-success {
      background: var(--unphu-green-primary);
    }
    .btn-success:hover {
      background: #2d7a2d;
    }
    .btn-error {
      background: #dc3545;
    }
    .btn-error:hover {
      background: #a71e2a;
    }
    .btn-warning {
      background: #ffc107;
      color: #212529;
    }
    .btn-warning:hover {
      background: #d39e00;
    }
    .btn-info {
      background: var(--unphu-blue-dark);
    }
    .btn-info:hover {
      background: #0a2a3f;
    }
    .btn-secondary {
      background: #f8f9fa;
      color: var(--unphu-blue-dark);
      border: 1px solid #dee2e6;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isVisible = false;
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'success';
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = 'Aceptar';
  @Input() cancelText = 'Cancelar';
  @Input() showCancel = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
    this.isVisible = false;
  }

  onCancel(): void {
    this.cancelled.emit();
    this.isVisible = false;
  }

  onOverlayClick(): void {
    if (this.showCancel) {
      this.onCancel();
    }
  }
}