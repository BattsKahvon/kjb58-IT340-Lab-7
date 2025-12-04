import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Make sure API URL has NO trailing slash
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  /** TEST ROUTE */
  getMessage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  /** REGISTER USER */
  registerUser(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/register`, data);
  }

  /** LOGIN USER */
  loginUser(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/login`, data);
  }
}
