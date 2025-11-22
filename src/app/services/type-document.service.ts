import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TypeDocument {
  id: number;
  libelle_type: string;
  description_type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypeDocumentService {
  //private apiUrl = 'http://127.0.0.1:8000/api/type-documents';
  private apiUrl = `${environment.apiUrl}/type-documents`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<TypeDocument[]> {
    return this.http.get<TypeDocument[]>(this.apiUrl);
  }
}
