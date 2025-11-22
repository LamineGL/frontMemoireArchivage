import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../services/auth.service';
import { DocumentService, Document } from '../../../services/document.service';
import { NotificationService } from '../../../services/notification.service';
import { StatistiqueService } from '../../../services/statistique.service';

@Component({
  selector: 'app-employe-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;

  // Statistiques
  stats = {
    mesDocuments: 0,
    documentsAccessibles: 0,
    notificationsNonLues: 0,
    telechargements: 0
  };

  // Documents récents
  recentDocuments: Document[] = [];

  // Notifications récentes
  recentNotifications: any[] = [];

  // Activités récentes
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private documentService: DocumentService,
    private notificationService: NotificationService,
    private statistiqueService: StatistiqueService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    console.log('👤 Employé connecté:', this.currentUser);

    this.loadDashboardData();
  }

  /**
   * Charger toutes les données du dashboard
   */
  loadDashboardData(): void {
    this.loading = true;

    // Charger statistiques personnelles
    this.statistiqueService.getDashboard().subscribe({
      next: (data) => {
        this.stats.mesDocuments = data.mes_documents || 0;
        this.stats.telechargements = data.mes_telechargements || 0;

        console.log('📊 Stats employé:', data);
      },
      error: (error) => console.error('❌ Erreur stats:', error)
    });

    // Charger mes documents récents
    this.loadRecentDocuments();

    // Charger notifications non lues
    this.loadUnreadNotifications();

    // Charger activités récentes
    this.loadRecentActivities();

    this.loading = false;
  }

  /**
   * Charger mes documents récents (créés par moi)
   */
  loadRecentDocuments(): void {
    this.documentService.getAll().subscribe({
      next: (response) => {
        const allDocs = response.data || [];

        // Filtrer mes documents uniquement
        const myDocs = allDocs.filter((doc: Document) =>
          doc.user_createur_id === this.currentUser?.id
        );

        // Prendre les 5 plus récents
        this.recentDocuments = myDocs.slice(0, 5);

        // Compter mes documents
        this.stats.mesDocuments = myDocs.length;

        console.log('📄 Mes documents récents:', this.recentDocuments);
      },
      error: (error) => {
        console.error('❌ Erreur chargement documents:', error);
      }
    });
  }

  /**
   * Charger les notifications non lues
   */
  loadUnreadNotifications(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (response) => {
        this.stats.notificationsNonLues = response.unread_count || 0;
      },
      error: (error) => console.error('❌ Erreur notifications:', error)
    });

    // Charger les 3 dernières notifications
    this.notificationService.getAll(1).subscribe({
      next: (response) => {
        const data = response.data || [];
        this.recentNotifications = data.slice(0, 3);
        console.log('🔔 Notifications récentes:', this.recentNotifications);
      },
      error: (error) => console.error('❌ Erreur notifications récentes:', error)
    });
  }

  /**
   * Charger les activités récentes (mes actions)
   */
  loadRecentActivities(): void {
    this.statistiqueService.getDashboard().subscribe({
      next: (data) => {
        this.recentActivities = data.mes_actions_recentes || [];
        console.log('📋 Activités récentes:', this.recentActivities);
      },
      error: (error) => console.error('❌ Erreur activités:', error)
    });
  }

  /**
   * Télécharger un document
   */
  downloadDocument(doc: Document): void {
    this.documentService.download(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nom_fichier_original;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('✅ Document téléchargé');
      },
      error: (error) => {
        console.error('❌ Erreur téléchargement:', error);
        alert('Erreur lors du téléchargement');
      }
    });
  }

  /**
   * Formater la date en relatif
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
   * Formater la taille du fichier
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Icône selon le type de notification
   */
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'document_ajoute': 'fas fa-file-upload text-success',
      'document_modifie': 'fas fa-edit text-warning',
      'document_partage': 'fas fa-share-alt text-info',
      'systeme': 'fas fa-info-circle text-danger'
    };
    return icons[type] || 'fas fa-bell text-primary';
  }

  /**
   * Icône selon le type d'action
   */
  getActionIcon(typeAction: string): string {
    const icons: { [key: string]: string } = {
      'ajout': 'fas fa-plus-circle text-success',
      'modification': 'fas fa-edit text-warning',
      'suppression': 'fas fa-trash text-danger',
      'telechargement': 'fas fa-download text-info',
      'consultation': 'fas fa-eye text-primary'
    };
    return icons[typeAction] || 'fas fa-circle text-secondary';
  }
}
