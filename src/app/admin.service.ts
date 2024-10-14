import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  isAdmin: boolean = false;
  private refreshDataSubject = new Subject<void>();
  refreshData$ = this.refreshDataSubject.asObservable();
  constructor() { }
  setAdmin(admin: boolean) {
    this.isAdmin = admin;
  }

  getAdmin(): boolean {
    return this.isAdmin;
  }
  refreshData() {
    this.refreshDataSubject.next();
  }
}
