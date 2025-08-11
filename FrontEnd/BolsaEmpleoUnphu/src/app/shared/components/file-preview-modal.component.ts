import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close()" *ngIf="isOpen">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="close()">✕</button>
        </div>
        <div class="modal-body">
          <!-- Debug info -->
          <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px; font-size: 12px; z-index: 1000;">
            Type: {{ fileType }} | URL: {{ fileUrl.substring(0, 50) }}...
          </div>
          
          <!-- Preview de imagen -->
          <img *ngIf="fileType === 'image'" [src]="fileUrl" [alt]="title" class="preview-image" (error)="onImageError($event)">
          
          <!-- Preview de PDF -->
          <iframe *ngIf="fileType === 'pdf'" [src]="getSafeUrl()" class="preview-pdf" frameborder="0"></iframe>
          
          <!-- Mensaje si no hay archivo -->
          <div *ngIf="!fileUrl" class="no-file">
            <span class="no-file-icon">📄</span>
            <p>No hay archivo disponible</p>
          </div>
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
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 3000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      height: 90%;
      max-width: 1000px;
      max-height: 800px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      background: var(--unphu-blue-dark);
      color: white;
      border-radius: 12px 12px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background 0.3s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .modal-body {
      flex: 1;
      padding: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .preview-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .preview-pdf {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    .no-file {
      text-align: center;
      color: #666;
    }

    .no-file-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .no-file p {
      font-size: 1.1rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        height: 95%;
      }
      
      .modal-header {
        padding: 1rem;
      }
      
      .modal-header h3 {
        font-size: 1.1rem;
      }
    }
  `]
})
export class FilePreviewModalComponent {
  @Input() isOpen = false;
  @Input() fileUrl = '';
  @Input() fileType: 'image' | 'pdf' = 'image';
  @Input() title = 'Vista previa';
  @Output() closeModal = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  getSafeUrl(): SafeResourceUrl {
    console.log('Sanitizing URL:', this.fileUrl);
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);
  }

  onImageError(event: any): void {
    console.error('Error loading image:', event, 'URL:', this.fileUrl);
  }

  close(): void {
    this.closeModal.emit();
  }
}