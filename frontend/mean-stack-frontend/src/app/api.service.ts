import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Base API URL (NO trailing slash)
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  // --------------------------
  // TEST ROUTE
  // --------------------------
  getMessage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  // --------------------------
  // AUTH
  // --------------------------
  registerUser(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/register`, data);
  }

  loginUser(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/login`, data);
  }

  // --------------------------
  // ✅ BUSINESS API (NEW)
  // --------------------------

  /** GET all businesses */
  getBusinesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/businesses`);
  }

  /** ADD new business */
  addBusiness(business: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/businesses`, business);
  }

  /** UPDATE existing business */
  updateBusiness(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/businesses/${id}`, data);
  }

  /** DELETE business */
  deleteBusiness(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/businesses/${id}`);
  }
}
