import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  //private apiUrl = 'http://127.0.0.1:8000/api/statistiques';
  private apiUrl = `${environment.apiUrl}/statistiques`;

  constructor(private http: HttpClient) { }

  getGlobal(): Observable<any> {
    return this.http.get(`${this.apiUrl}/global`);
  }

  getRapportHebdomadaire(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rapport-hebdomadaire`);
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }
}
