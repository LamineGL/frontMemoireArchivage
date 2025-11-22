import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notifications-chef',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponentChef implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  showUnreadOnly = false;

  unreadCount = 0;
  totalNotifications = 0;
  currentPage = 1;
  totalPages = 1;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  /**
   * Charger les notifications (avec ou sans filtre "non lues")
   */
  loadNotifications(toggleFilter: boolean = false): void {
  if (toggleFilter) {
    this.showUnreadOnly = !this.showUnreadOnly;
  }

  this.loading = true;

  this.notificationService.getAll(this.currentPage).subscribe({
    next: (response) => {
      // 🔹 Extraire le tableau "data" de la pagination
      const data = response.data || [];

      // 🔹 Filtrer les notifications non lues si nécessaire
      this.notifications = this.showUnreadOnly
        ? data.filter((n: any) => n.statut === 'non_lu')
        : data;

      this.totalNotifications = response.total;
      this.totalPages = response.last_page;
      this.loading = false;

      console.log('📬 Notifications Chef chargées:', response);
    },
    error: (error) => {
      console.error('❌ Erreur chargement notifications:', error);
      this.loading = false;
    }
  });
}


  /**
   * Charger le compteur de notifications non lues
   */
  loadUnreadCount(): void {
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    // Charger une première fois
    this.notificationService.refreshUnreadCount();
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(notification: Notification): void {
    if (notification.statut === 'lu') return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.statut = 'lu';
        notification.read_at = new Date().toISOString();
        console.log('✅ Notification marquée comme lue');
      },
      error: (error) => {
        console.error('❌ Erreur lors du marquage comme lue:', error);
      }
    });
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): void {
    if (this.unreadCount === 0) return;

    if (confirm('Marquer toutes les notifications comme lues ?')) {
      this.notificationService.markAllAsRead().subscribe({
        next: () => {
          this.notifications.forEach(n => {
            n.statut = 'lu';
            n.read_at = new Date().toISOString();
          });
          console.log('✅ Toutes les notifications marquées comme lues');
        },
        error: (error) => {
          console.error('❌ Erreur lors du marquage global:', error);
        }
      });
    }
  }

  /**
   * Supprimer une notification
   */
  deleteNotification(id: number, event: Event): void {
    event.stopPropagation();

    if (confirm('Supprimer cette notification ?')) {
      this.notificationService.delete(id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
          this.totalNotifications--;
          console.log('✅ Notification supprimée');
        },
        error: (error) => {
          console.error('❌ Erreur suppression:', error);
        }
      });
    }
  }

  /**
   * Classe CSS selon le type
   */
  getNotificationClass(type: string): string {
    const classes: { [key: string]: string } = {
      'document_ajoute': 'notif-success',
      'document_modifie': 'notif-warning',
      'document_partage': 'notif-info',
      'systeme': 'notif-danger'
    };
    return classes[type] || 'notif-primary';
  }

  /**
   * Icône selon le type
   */
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'document_ajoute': 'fas fa-file-upload',
      'document_modifie': 'fas fa-edit',
      'document_partage': 'fas fa-share-alt',
      'systeme': 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-bell';
  }

  /**
   * Temps relatif
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

    /**
   * Gérer la pagination (changement de page)
   */
  changePage(page: number): void {
    // Sécurité pour éviter les pages invalides
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    // Recharger les notifications (selon la page)
    this.loadNotifications();
  }

}
