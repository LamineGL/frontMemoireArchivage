import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { StatistiqueService } from '../../../services/statistique.service';

@Component({
  selector: 'app-chef-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class ChefDashboardComponent implements OnInit {
  currentUser: any = null;
  loading = true;

  stats = {
    documentsTotal: 0,
    employesTotal: 0,
    documentsThisMonth: 0,
    pendingActions: 0,
    volumeStockage: 0
  };

  recentDocuments: any[] = [];
  topEmployes: any[] = [];

  constructor(
    private authService: AuthService,
    private statistiqueService: StatistiqueService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Charger les statistiques du département
    this.statistiqueService.getDashboard().subscribe({
      next: (data) => {
        // Adapter les données selon la réponse
        this.stats = {
          documentsTotal: data.total_documents || 0,
          employesTotal: data.total_employes || 0,
          documentsThisMonth: data.documents_ce_mois || 0,
          pendingActions: data.actions_en_attente || 0,
          volumeStockage: data.volume_stockage || 0
        };

        this.recentDocuments = data.documents_recents || [];
        this.topEmployes = data.top_employes || [];

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        // Charger des données simulées en cas d'erreur
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.stats = {
      documentsTotal: 156,
      employesTotal: 12,
      documentsThisMonth: 23,
      pendingActions: 5,
      volumeStockage: 1250000000 // 1.25 GB en bytes
    };

    this.recentDocuments = [
      {
        id: 1,
        titre: 'Rapport Mensuel RH - Janvier 2025',
        mime_type: 'application/pdf',
        created_at: new Date().toISOString(),
        createur: { nom_complet: 'Mamadou Diop' }
      },
      {
        id: 2,
        titre: 'Procédure de recrutement',
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        createur: { nom_complet: 'Aissatou Ndiaye' }
      }
    ];

    this.topEmployes = [
      { nom_complet: 'Mamadou Diop', total_actions: 45 },
      { nom_complet: 'Aissatou Ndiaye', total_actions: 38 },
      { nom_complet: 'Ibrahima Sarr', total_actions: 32 }
    ];
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) return 'Il y a quelques minutes';
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getFileIcon(mimeType: string): string {
    if (!mimeType) return 'fa-file text-muted';
    if (mimeType.includes('pdf')) return 'fa-file-pdf text-danger';
    if (mimeType.includes('word')) return 'fa-file-word text-primary';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fa-file-excel text-success';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fa-file-powerpoint text-warning';
    return 'fa-file text-muted';
  }
}
