import { Component, OnInit } from '@angular/core';
import { StatistiqueService } from '../../../services/statistique.service';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css']
})
export class StatistiquesComponent implements OnInit {
  stats: any = null;
  rapport: any = null;
  loading = true;
  loadingRapport = false;

  constructor(private statistiqueService: StatistiqueService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.statistiqueService.getGlobal().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
        this.loading = false;
      }
    });
  }

  loadRapportHebdomadaire(): void {
    this.loadingRapport = true;
    this.statistiqueService.getRapportHebdomadaire().subscribe({
      next: (data) => {
        this.rapport = data;
        this.loadingRapport = false;
      },
      error: (error) => {
        console.error('Erreur chargement rapport:', error);
        this.loadingRapport = false;
      }
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
