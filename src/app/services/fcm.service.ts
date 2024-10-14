import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  
  private totalLeads: BehaviorSubject<number> = new BehaviorSubject(0);
  private totalLead: BehaviorSubject<number> = new BehaviorSubject(0);
  adminLeadIndexesLength: BehaviorSubject<number> = new BehaviorSubject(0);
  leadIndexesLength: BehaviorSubject<number> = new BehaviorSubject(0);
  uncontactedLeadsLength: BehaviorSubject<number> = new BehaviorSubject(0);
  completedLeadsLength: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor() { }

  getTotalLeads(): Observable<number> {
    return this.totalLeads.asObservable();
  }

  setTotalLeads(count: number) {
    this.totalLeads.next(count);
  }

  getTotalLead(): Observable<number> {
    return this.totalLead.asObservable();
  }

  setTotalLead(count: number) {
    this.totalLead.next(count);
  }

  setLeadIndexLengths(adminLeadIndexesLength: number, leadIndexesLength: number, uncontactedLeadsLength: number, completedLeadsLength: number) {
    this.adminLeadIndexesLength.next(adminLeadIndexesLength);
    this.leadIndexesLength.next(leadIndexesLength);
    this.uncontactedLeadsLength.next(uncontactedLeadsLength);
    this.completedLeadsLength.next(completedLeadsLength);
  }

  getLeadIndexLengths(): Observable<number> {
    return this.adminLeadIndexesLength.asObservable();
  }

  getLeadIndexLengthsU(): Observable<number> {
    return this.leadIndexesLength.asObservable();
  }

  getUncontactedLeadsLength(): Observable<number> {
    return this.uncontactedLeadsLength.asObservable();
  }

  setUncontactedLeadsLength(length: number) {
    this.uncontactedLeadsLength.next(length);
  }

  getCompletedLeadsLength(): Observable<number> {
    return this.completedLeadsLength.asObservable();
  }
}