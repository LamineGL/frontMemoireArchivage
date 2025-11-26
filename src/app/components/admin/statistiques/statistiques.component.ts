import { Component, OnInit } from '@angular/core';
import { StatistiqueService } from '../../../services/statistique.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

  // ✅ Configuration des graphiques
  public pieChartType: ChartType = 'pie';
  public barChartType: ChartType = 'bar';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  // ✅ Données des graphiques
  public departementChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  };

  public typeChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Nombre de documents',
      backgroundColor: '#36A2EB'
    }]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private statistiqueService: StatistiqueService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.statistiqueService.getGlobal().subscribe({
      next: (data) => {
        this.stats = data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
        this.loading = false;
      }
    });
  }

  // ✅ Préparer les données pour les graphiques
  prepareChartData(): void {
    // Graphique Documents par Département
    if (this.stats.documents_par_departement) {
      this.departementChartData.labels = this.stats.documents_par_departement.map(
        (d: any) => d.nom_departement
      );
      this.departementChartData.datasets[0].data = this.stats.documents_par_departement.map(
        (d: any) => d.total
      );
    }

    // Graphique Documents par Type
    if (this.stats.documents_par_type) {
      this.typeChartData.labels = this.stats.documents_par_type.map(
        (t: any) => t.libelle_type
      );
      this.typeChartData.datasets[0].data = this.stats.documents_par_type.map(
        (t: any) => t.total
      );
    }
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

  // ✅ Export PDF
  exportPDF(): void {
    const doc = new jsPDF();

    // Titre
    doc.setFontSize(18);
    doc.text('Rapport Statistiques - Archivage Olam', 14, 20);

    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    // Stats principales
    doc.setFontSize(14);
    doc.text('Statistiques Principales', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Total Documents', this.stats.total_documents],
        ['Total Utilisateurs', this.stats.total_utilisateurs],
        ['Total Départements', this.stats.total_departements],
        ['Stockage Utilisé', this.formatBytes(this.stats.volume_stockage_total)],
        ['Utilisateurs Actifs (7j)', this.stats.utilisateurs_actifs_7j]
      ]
    });

    // Documents par département
    const startY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Documents par Département', 14, startY);

    autoTable(doc, {
      startY: startY + 5,
      head: [['Département', 'Nombre']],
      body: this.stats.documents_par_departement.map((d: any) => [
        d.nom_departement,
        d.total
      ])
    });

    // Documents par type
    const startY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Documents par Type', 14, startY2);

    autoTable(doc, {
      startY: startY2 + 5,
      head: [['Type', 'Nombre']],
      body: this.stats.documents_par_type.map((t: any) => [
        t.libelle_type,
        t.total
      ])
    });

    // Sauvegarder
    doc.save(`rapport-statistiques-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // ✅ Export Excel
  exportExcel(): void {
    // Préparer les données
    const statsData = [
      ['Statistiques Principales'],
      ['Indicateur', 'Valeur'],
      ['Total Documents', this.stats.total_documents],
      ['Total Utilisateurs', this.stats.total_utilisateurs],
      ['Total Départements', this.stats.total_departements],
      ['Stockage Utilisé', this.formatBytes(this.stats.volume_stockage_total)],
      ['Utilisateurs Actifs (7j)', this.stats.utilisateurs_actifs_7j],
      [],
      ['Documents par Département'],
      ['Département', 'Nombre'],
      ...this.stats.documents_par_departement.map((d: any) => [d.nom_departement, d.total]),
      [],
      ['Documents par Type'],
      ['Type', 'Nombre'],
      ...this.stats.documents_par_type.map((t: any) => [t.libelle_type, t.total])
    ];

    // Créer le workbook
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(statsData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');

    // Sauvegarder
    const fileName = `statistiques-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
