import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminSyncService {
  private refreshTrigger = new BehaviorSubject<number>(0);
  public refresh$ = this.refreshTrigger.asObservable();

  constructor(private apiService: ApiService) {
    // Auto-refresh cada 30 segundos
    interval(30000).subscribe(() => {
      this.triggerRefresh();
    });
  }

  triggerRefresh() {
    this.refreshTrigger.next(Date.now());
  }

  // Métodos para notificar cambios específicos
  notifyUserChange() {
    this.triggerRefresh();
  }

  notifyCompanyChange() {
    this.triggerRefresh();
  }

  notifyVacancyChange() {
    this.triggerRefresh();
  }

  notifyCategoryChange() {
    this.triggerRefresh();
  }

  notifyCareerChange() {
    this.triggerRefresh();
  }
}