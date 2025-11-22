import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  nom_complet: string;
  email: string;
  role_id: number;
  departement_id: number;
  statut: string;
  role?: any;
  departement?: any;

}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //private apiUrl = 'http://127.0.0.1:8000/api/users';
  private apiUrl = `${environment.apiUrl}/type-documents`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: number, user: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

   getEmployesDepartement(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/departement/employes`);
  }
}
