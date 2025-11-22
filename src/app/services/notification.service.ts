import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Notification {
  id: number;
  user_destinataire_id: number;
  document_id: number | null;
  type_notification: 'document_ajoute' | 'document_modifie' | 'document_partage' | 'systeme';
  titre: string;
  message: string;
  statut: 'non_lu' | 'lu';
  read_at: string | null;
  created_at: string;
  document?: {
    id: number;
    titre: string;
  };
}

export interface NotificationResponse {
  current_page: number;
  data: Notification[];
  total: number;
  per_page: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  //private apiUrl = 'http://127.0.0.1:8000/api/notifications';
  private apiUrl = `${environment.apiUrl}/notifications`;

  // BehaviorSubject pour le compteur (observable)
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  /**
   * Polling automatique toutes les 30 secondes
   */
  startPolling(): void {
    interval(30000) // 30 secondes
      .pipe(
        startWith(0),
        switchMap(() => this.getUnreadCount())
      )
      .subscribe();
  }

  /**
   * Récupérer le nombre de notifications non lues
   */
  getUnreadCount(): Observable<any> {
    return this.http.get<{ unread_count: number }>(`${this.apiUrl}/unread-count`).pipe(
      tap(response => {
        this.unreadCountSubject.next(response.unread_count);
      })
    );
  }

  /**
   * Récupérer toutes les notifications
   */
  getAll(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}?page=${page}`);
}


  /**
   * Marquer une notification comme lue
   */
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        // Décrémenter le compteur
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));
      })
    );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  /**
   * Supprimer une notification
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Forcer le rechargement du compteur
   */
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}
