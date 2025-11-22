import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Departement {
  id: number;
  nom_departement: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartementService {
  //private apiUrl = 'http://127.0.0.1:8000/api/departements';
  private apiUrl = `${environment.apiUrl}/departements`;


  constructor(private http: HttpClient) { }

  getAll(): Observable<Departement[]> {
    return this.http.get<Departement[]>(this.apiUrl);
  }

  getById(id: number): Observable<Departement> {
    return this.http.get<Departement>(`${this.apiUrl}/${id}`);
  }

  create(departement: any): Observable<Departement> {
    return this.http.post<Departement>(this.apiUrl, departement);
  }

  update(id: number, departement: any): Observable<Departement> {
    return this.http.put<Departement>(`${this.apiUrl}/${id}`, departement);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }
}
