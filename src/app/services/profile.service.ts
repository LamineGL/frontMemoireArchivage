import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  User,
  ProfileUpdateResponse,
  PhotoDeleteResponse,
  PasswordChangeResponse
} from '../models/profile.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  //private apiUrl = 'http://127.0.0.1:8000/api';
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * ✅ Obtenir le profil actuel
   */
  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/profile`);
  }

  /**
   * ✅ Mettre à jour nom et email uniquement
   */
  updateInfo(data: { nom_complet: string, email: string }): Observable<ProfileUpdateResponse> {
    return this.http.put<ProfileUpdateResponse>(`${this.apiUrl}/profile/info`, data).pipe(
      tap(response => {
        if (response?.user) {
          this.authService.saveUser(response.user);
        }
      })
    );
  }

  /**
   * ✅ Mettre à jour la photo uniquement
   */
  updatePhoto(photo: File): Observable<ProfileUpdateResponse> {
    const formData = new FormData();
    formData.append('photo_profil', photo);

    return this.http.post<ProfileUpdateResponse>(`${this.apiUrl}/profile/photo`, formData).pipe(
      tap(response => {
        if (response?.user) {
          this.authService.saveUser(response.user);
        }
      })
    );
  }

  /**
   * ✅ Supprimer la photo de profil
   */
  deletePhoto(): Observable<PhotoDeleteResponse> {
    return this.http.delete<PhotoDeleteResponse>(`${this.apiUrl}/profile/photo`).pipe(
      tap(response => {
        if (response?.user) {
          this.authService.saveUser(response.user);
        }
      })
    );
  }

  /**
   * ✅ Changer le mot de passe
   */
  changePassword(passwordData: {
    current_password: string,
    password: string,
    password_confirmation: string
  }): Observable<PasswordChangeResponse> {
    return this.http.put<PasswordChangeResponse>(`${this.apiUrl}/profile/password`, passwordData);
  }
}
