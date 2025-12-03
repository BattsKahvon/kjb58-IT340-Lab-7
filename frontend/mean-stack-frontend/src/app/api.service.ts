import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;   // points to http://localhost:3000

  constructor(private http: HttpClient) {}

  // Example GET request to Express
  getMessage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  // Example POST request
  sendData(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data);
}
}
  
