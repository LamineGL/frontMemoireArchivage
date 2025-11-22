import { Component, OnInit } from '@angular/core';
import { StatistiqueService } from '../../../services/statistique.service';

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
    storageUsed: 0
  };

  loading = true;
  error = '';

  constructor(private statistiqueService: StatistiqueService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    // Charger les statistiques depuis l'API
    this.statistiqueService.getGlobal().subscribe({
      next: (response) => {
        console.log('Stats reçues:', response);

        this.stats = {
          totalDocuments: response.total_documents || 0,
          totalUsers: response.total_utilisateurs || 0,
          totalDepartments: response.total_departements || 0,
          storageUsed: this.formatBytes(response.volume_stockage_total || 0)
        };

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });
  }

  // Convertir bytes en GB
  formatBytes(bytes: number): number {
    return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100;
  }
}
