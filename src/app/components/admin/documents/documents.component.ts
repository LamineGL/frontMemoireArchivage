import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { TypeDocumentService } from '../../../services/type-document.service';
import { DepartementService } from '../../../services/departement';


@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: any[] = [];
  typesDocuments: any[] = [];
  departements: any[] = [];
  loading = true;
  showModal = false;
  showDetailModal = false;
  selectedDocument: any = null;

  // Filtres
  filters = {
    search: '',
    type_document_id: '',
    departement_id: '',
    date_debut: '',
    date_fin: ''
  };

  // Form upload
  uploadForm = {
    titre: '',
    description: '',
    type_document_id: '',
    departement_id: '',
    mots_cles: '',
    fichier: null as File | null
  };

  constructor(
    private documentService: DocumentService,
    private typeDocumentService: TypeDocumentService,
    private departementService: DepartementService
  ) { }

  ngOnInit(): void {
    this.loadDocuments();
    this.loadTypesDocuments();
    this.loadDepartements();
  }

  loadDocuments(): void {
    this.loading = true;
    const params = this.buildFilterParams();

    this.documentService.getAll(params).subscribe({
      next: (response) => {
        this.documents = response.data || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement documents:', error);
        this.loading = false;
      }
    });
  }

  loadTypesDocuments(): void {
    this.typeDocumentService.getAll().subscribe({
      next: (data) => {
        this.typesDocuments = data;
      },
      error: (error) => {
        console.error('Erreur chargement types:', error);
      }
    });
  }

  loadDepartements(): void {
    this.departementService.getAll().subscribe({
      next: (data) => {
        this.departements = data;
      },
      error: (error) => {
        console.error('Erreur chargement départements:', error);
      }
    });
  }

  buildFilterParams(): any {
    const params: any = {};

    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.type_document_id) params.type_document_id = this.filters.type_document_id;
    if (this.filters.departement_id) params.departement_id = this.filters.departement_id;
    if (this.filters.date_debut) params.date_debut = this.filters.date_debut;
    if (this.filters.date_fin) params.date_fin = this.filters.date_fin;

    return params;
  }

  applyFilters(): void {
    this.loadDocuments();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      type_document_id: '',
      departement_id: '',
      date_debut: '',
      date_fin: ''
    };
    this.loadDocuments();
  }

  openUploadModal(): void {
    this.resetUploadForm();
    this.showModal = true;
  }

  closeUploadModal(): void {
    this.showModal = false;
    this.resetUploadForm();
  }

  resetUploadForm(): void {
    this.uploadForm = {
      titre: '',
      description: '',
      type_document_id: '',
      departement_id: '',
      mots_cles: '',
      fichier: null
    };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille (max 10 MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 10 MB)');
        return;
      }
      this.uploadForm.fichier = file;
    }
  }

  uploadDocument(): void {
    if (!this.uploadForm.fichier) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('titre', this.uploadForm.titre);
    formData.append('description', this.uploadForm.description);
    formData.append('type_document_id', this.uploadForm.type_document_id);
    formData.append('departement_id', this.uploadForm.departement_id);
    formData.append('mots_cles', this.uploadForm.mots_cles);
    formData.append('fichier', this.uploadForm.fichier);

    this.documentService.create(formData).subscribe({
      next: () => {
        alert('Document uploadé avec succès !');
        this.loadDocuments();
        this.closeUploadModal();
      },
      error: (error) => {
        console.error('Erreur upload:', error);
        alert('Erreur lors de l\'upload');
      }
    });
  }

  viewDocument(doc: any): void {
    this.selectedDocument = doc;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDocument = null;
  }

  downloadDocument(doc: any): void {
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
      },
      error: (error) => {
        console.error('Erreur téléchargement:', error);
        alert('Erreur lors du téléchargement');
      }
    });
  }

  deleteDocument(doc: any): void {
    if (confirm(`Voulez-vous vraiment supprimer le document "${doc.titre}" ?`)) {
      this.documentService.delete(doc.id).subscribe({
        next: () => {
          alert('Document supprimé avec succès !');
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'fa-file-pdf text-danger';
    if (mimeType.includes('word')) return 'fa-file-word text-primary';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fa-file-excel text-success';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fa-file-powerpoint text-warning';
    if (mimeType.includes('image')) return 'fa-file-image text-info';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'fa-file-archive text-secondary';
    return 'fa-file text-muted';
  }
}
