import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Document {
  id: number;
  titre: string;
  description?: string;
  chemin_fichier: string;
  nom_fichier_original: string;
  file_size: number;
  mime_type: string;
  type_document_id: number;
  departement_id: number;
  user_createur_id: number;
  version: number;
  mots_cles?: string;
  statut: string;
  created_at: string;
  typeDocument?: any;
  departement?: any;
  createur?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  //private apiUrl = 'http://127.0.0.1:8000/api/documents';
   private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) { }

  getAll(filters?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params: filters });
  }

  getById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  create(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  update(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/restore`, {});
  }

  getVersions(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/versions`);
  }
}
