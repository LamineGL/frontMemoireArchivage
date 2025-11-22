import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Acces {
  id: number;
  user_id: number;
  document_id: number;
  peut_lire: boolean;
  peut_telecharger: boolean;
  peut_modifier: boolean;
  peut_supprimer: boolean;
  created_at: string;
  user?: any;
  document?: any;
}

export interface PermissionRequest {
  user_id: number;
  peut_lire: boolean;
  peut_telecharger: boolean;
  peut_modifier: boolean;
  peut_supprimer: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccesService {
  //private apiUrl = 'http://127.0.0.1:8000/api';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Définir les permissions pour un document
   */
  setPermissions(documentId: number, permissions: PermissionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/documents/${documentId}/permissions`, permissions);
  }

  /**
   * Obtenir les permissions d'un document
   */
  getDocumentPermissions(documentId: number): Observable<Acces[]> {
    return this.http.get<Acces[]>(`${this.apiUrl}/documents/${documentId}/permissions`);
  }

  /**
   * Révoquer l'accès d'un utilisateur
   */
  revokeAccess(documentId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents/${documentId}/permissions/${userId}`);
  }

  /**
   * Mes accès (documents auxquels j'ai accès)
   */
  getMesAcces(): Observable<Acces[]> {
    return this.http.get<Acces[]>(`${this.apiUrl}/mes-acces`);
  }
}
