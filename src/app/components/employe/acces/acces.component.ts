import { Component, OnInit } from '@angular/core';
import { AccesService } from '../../../services/acces.service';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-acces',
  templateUrl: './acces.component.html',
  styleUrls: ['./acces.component.css']
})
export class AccesComponent implements OnInit {
  mesAcces: any[] = [];
  loading = true;
  showDetailModal = false;
  selectedDocument: any = null;

  constructor(
    private accesService: AccesService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.loadMesAcces();
  }

  loadMesAcces(): void {
    this.loading = true;

    this.accesService.getMesAcces().subscribe({
      next: (data) => {
        this.mesAcces = data;
        this.loading = false;
        console.log('🔐 Mes accès chargés:', this.mesAcces);
      },
      error: (error) => {
        console.error('❌ Erreur chargement accès:', error);
        alert('Erreur lors du chargement de vos accès');
        this.loading = false;
      }
    });
  }

  viewDetails(acces: any): void {
    this.selectedDocument = acces.document;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDocument = null;
  }

  downloadDocument(acces: any): void {
    if (!acces.peut_telecharger) {
      alert('Vous n\'avez pas la permission de télécharger ce document');
      return;
    }

    this.documentService.download(acces.document_id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = acces.document.nom_fichier_original;
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

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileIcon(mimeType: string): string {
    if (!mimeType) return 'fa-file text-muted';
    if (mimeType.includes('pdf')) return 'fa-file-pdf text-danger';
    if (mimeType.includes('word')) return 'fa-file-word text-primary';
    if (mimeType.includes('excel')) return 'fa-file-excel text-success';
    if (mimeType.includes('powerpoint')) return 'fa-file-powerpoint text-warning';
    if (mimeType.includes('image')) return 'fa-file-image text-info';
    return 'fa-file text-muted';
  }
}
