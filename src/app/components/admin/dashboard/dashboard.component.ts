import { Component, OnInit } from '@angular/core';
import { StatistiqueService } from '../../../services/statistique.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    totalDocuments: 0,
    totalUsers: 0,
    totalDepartments: 0,
    storageUsed: '0 B'
  };

  // Nouvelles données
  documentsParDepartement: any[] = [];
  documentsParType: any[] = [];
  activiteRecente: any[] = [];

  loading = true;
  error = '';

  constructor(private statistiqueService: StatistiqueService) { }

  ngOnInit(): void {
    this.loadAllData();
  }

 // Dans dashboard.component.ts

loadAllData(): void {
  this.loading = true;

  this.statistiqueService.getGlobal().subscribe({
    next: (response) => {
      console.log('📊 Stats reçues:', response);

      // Stats principales
      this.stats = {
        totalDocuments: response.total_documents || 0,
        totalUsers: response.total_utilisateurs || 0,
        totalDepartments: response.total_departements || 0,
        storageUsed: this.formatBytes(response.volume_stockage_total || 0)
      };

      // ✅ Convertir les données si ce sont des objets
      this.documentsParDepartement = Array.isArray(response.documents_par_departement)
        ? response.documents_par_departement
        : Object.values(response.documents_par_departement || {});

      this.documentsParType = Array.isArray(response.documents_par_type)
        ? response.documents_par_type
        : Object.values(response.documents_par_type || {});

      // Activité récente
      this.activiteRecente = Array.isArray(response.activite_recente)
        ? response.activite_recente.slice(0, 5)
        : Object.values(response.activite_recente || {}).slice(0, 5);

      this.loading = false;
    },
    error: (error) => {
      console.error('❌ Erreur chargement stats:', error);
      this.error = 'Impossible de charger les statistiques.';
      this.loading = false;
    }
  });
}
  // Convertir bytes en GB
  formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${value} ${sizes[i]}`;
}

  // Formater la date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Il y a quelques minutes';
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  }

  // Obtenir l'icône selon le type d'action
  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'ajout': 'fa-file-upload text-success',
      'modification': 'fa-edit text-warning',
      'suppression': 'fa-trash text-danger',
      'consultation': 'fa-eye text-info',
      'telechargement': 'fa-download text-primary'
    };
    return icons[action] || 'fa-circle text-secondary';
  }

  // Obtenir le libellé de l'action
  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'ajout': 'Document ajouté',
      'modification': 'Document modifié',
      'suppression': 'Document supprimé',
      'consultation': 'Document consulté',
      'telechargement': 'Document téléchargé'
    };
    return labels[action] || 'Action inconnue';
  }
}
