import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';


export interface User {
  id: number;
  nom_complet: string;
  email: string;
  role: { id: number; nom_role: string } | string;
  departement?: { id: number; nom_departement: string };
  statut?: string;
  photo_profil?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface ApiMeResponse {
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // ← MODIFIER
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.access_token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearAuth())
    );
  }

  me(): Observable<ApiMeResponse> {
    return this.http.get<ApiMeResponse>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        if (res?.user) {
          this.saveUser(res.user);
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) as User : null;
  }

  private loadUserFromStorage(): void {
    const user = this.getUser();
    if (user) this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string {
    const u = this.getUser();
    if (!u) return '';
    return typeof u.role === 'string' ? u.role : u.role?.nom_role || '';
  }

  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }
}




// // src/app/services/auth.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, tap } from 'rxjs';

// // ✅ Interface complète pour User
// export interface User {
//   id: number;
//   nom_complet: string;
//   email: string;
//   role: { id: number; nom_role: string } | string; // <-- gère les deux formats
//   departement?: {
//     id: number;
//     nom_departement: string;
//   };
//   statut?: string;
//   photo_profil?: string;
// }

// // ✅ Interface pour la réponse du login
// export interface LoginResponse {
//   message: string;
//   user: User;
//   access_token: string;
//   token_type: string;
// }

// // ✅ Interface pour la réponse /me
// export interface ApiMeResponse {
//   user: User;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = 'http://127.0.0.1:8000/api';
//   private readonly TOKEN_KEY = 'auth_token';
//   private readonly USER_KEY = 'current_user';

//   private currentUserSubject = new BehaviorSubject<User | null>(null);
//   public currentUser$ = this.currentUserSubject.asObservable();

//   constructor(private http: HttpClient) {
//     this.loadUserFromStorage();
//   }

//   // -------------------
//   // 🔐 Auth actions
//   // -------------------

//   login(credentials: { email: string; password: string }): Observable<LoginResponse> {
//     return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
//       tap(response => {
//         // ✅ Sauvegarde cohérente : token + user
//         localStorage.setItem(this.TOKEN_KEY, response.access_token);
//         localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
//         this.currentUserSubject.next(response.user);
//       })
//     );
//   }

//   logout(): Observable<any> {
//     return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
//       tap(() => this.clearAuth())
//     );
//   }

//   // -------------------
//   // 👤 Gestion du profil courant
//   // -------------------

//   me(): Observable<ApiMeResponse> {
//     return this.http.get<ApiMeResponse>(`${this.apiUrl}/me`).pipe(
//       tap(res => {
//         if (res?.user) {
//           this.saveUser(res.user);
//           this.currentUserSubject.next(res.user);
//         }
//       })
//     );
//   }

//   // -------------------
//   // 💾 Helpers stockage
//   // -------------------

//   saveToken(token: string): void {
//     localStorage.setItem(this.TOKEN_KEY, token);
//   }

//   getToken(): string | null {
//     return localStorage.getItem(this.TOKEN_KEY);
//   }

//   saveUser(user: User): void {
//     localStorage.setItem(this.USER_KEY, JSON.stringify(user));
//     this.currentUserSubject.next(user);
//   }

//   getUser(): User | null {
//     const raw = localStorage.getItem(this.USER_KEY);
//     return raw ? JSON.parse(raw) as User : null;
//   }

//   private loadUserFromStorage(): void {
//     const user = this.getUser();
//     if (user) {
//       this.currentUserSubject.next(user);
//     }
//   }

//   // -------------------
//   // 🧩 Helpers logiques
//   // -------------------

//   isAuthenticated(): boolean {
//     return !!this.getToken();
//   }

//   getUserRole(): string {
//     const u = this.getUser();
//     if (!u) return '';
//     // ✅ Gère le cas où "role" est soit string, soit objet
//     return typeof u.role === 'string' ? u.role : u.role?.nom_role || '';
//   }

//   clearAuth(): void {
//     localStorage.removeItem(this.TOKEN_KEY);
//     localStorage.removeItem(this.USER_KEY);
//     this.currentUserSubject.next(null);
//   }
// }
