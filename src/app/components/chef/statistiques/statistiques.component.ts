import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DepartementService } from '../../../services/departement';

@Component({
  selector: 'app-chef-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css']
})
export class StatistiquesComponentChef implements OnInit {
  loading = true;
  currentUser: any = null;
  stats: any = null;
  Math = Math; // ✅ Exposer Math pour l'utiliser dans le template

  constructor(
    private departementService: DepartementService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadStats();
  }

  /**
   * ✅ CORRECTION : Charger les VRAIES statistiques depuis l'API
   */
  loadStats(): void {
    this.loading = true;

    if (!this.currentUser?.departement_id) {
      console.error('Aucun département trouvé pour l\'utilisateur');
      this.loading = false;
      return;
    }

    // ✅ Appeler l'API pour récupérer les stats du département
    this.departementService.getStats(this.currentUser.departement_id).subscribe({
      next: (data) => {
        console.log('✅ Statistiques réelles reçues:', data);
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement statistiques:', error);

        // Afficher un message d'erreur à l'utilisateur
        if (error.status === 403) {
          alert('Accès refusé. Vous n\'avez pas les permissions pour voir ces statistiques.');
        } else if (error.status === 404) {
          alert('Département introuvable.');
        } else {
          alert('Erreur lors du chargement des statistiques. Veuillez réessayer.');
        }

        this.loading = false;
      }
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0 || !bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
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

  getProgressColor(value: number, max: number): string {
    if (!max || max === 0) return 'bg-secondary';
    const percentage = (value / max) * 100;
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  exportStats(): void {
    alert('Export des statistiques en PDF (fonctionnalité à venir)');
    // TODO: Implémenter l'export PDF avec les vraies données
    console.log('Stats à exporter:', this.stats);
  }
}
