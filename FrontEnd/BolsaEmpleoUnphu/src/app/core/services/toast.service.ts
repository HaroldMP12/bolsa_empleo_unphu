import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  showSuccess(message: string, duration: number = 5000): void {
    this.addToast({
      id: this.generateId(),
      type: 'success',
      title: 'Éxito',
      message,
      duration
    });
  }

  showError(message: string, duration: number = 7000): void {
    this.addToast({
      id: this.generateId(),
      type: 'error',
      title: 'Error',
      message,
      duration
    });
  }

  showWarning(message: string, duration: number = 6000): void {
    this.addToast({
      id: this.generateId(),
      type: 'warning',
      title: 'Advertencia',
      message,
      duration
    });
  }

  showInfo(message: string, duration: number = 5000): void {
    this.addToast({
      id: this.generateId(),
      type: 'info',
      title: 'Información',
      message,
      duration
    });
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  private addToast(toast: ToastMessage): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}