import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { TypeDocumentService } from '../../../services/type-document.service';
import { AuthService } from '../../../services/auth.service';
import { AccesService } from '../../../services/acces.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class ChefDocumentsComponent implements OnInit {
  documents: any[] = [];
  typesDocuments: any[] = [];
  loading = true;
  employes: any[] = [];
  showModal = false;
  showDetailModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedDocument: any = null;
  currentUser: any = null;
  documentPermissions: any[] = [];
  permissionsForm: any = {};

  showPermissionsModal = false;

  // Filtres
  filters = {
    search: '',
    type_document_id: '',
    date_debut: '',
    date_fin: ''
  };

  // Form upload
  uploadForm = {
    titre: '',
    description: '',
    type_document_id: '',
    mots_cles: '',
    fichier: null as File | null,
    commentaire: ''
  };

  constructor(
    private documentService: DocumentService,
    private typeDocumentService: TypeDocumentService,
    private accesService: AccesService,
     private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadDocuments();
    this.loadTypesDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    const params = this.buildFilterParams();

    // Filtrer par département du chef
    params.departement_id = this.currentUser?.departement_id;

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


  loadEmployes(): void {
  this.loading = true;

  this.userService.getEmployesDepartement().subscribe({
    next: (data) => {
      this.employes = data;

      // ✅ IMPORTANT : Initialiser immédiatement permissionsForm
      this.initPermissionsForm();

      this.loading = false;
      console.log('👥 Employés chargés:', this.employes);
      console.log('📋 Permissions form initialisé:', this.permissionsForm);
    },
    error: (error) => {
      console.error('❌ Erreur chargement employés:', error);
      this.loading = false;

      if (error.status === 403) {
        alert('Accès refusé. Vous devez être Chef de département.');
      }
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

  buildFilterParams(): any {
    const params: any = {};

    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.type_document_id) params.type_document_id = this.filters.type_document_id;
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
      date_debut: '',
      date_fin: ''
    };
    this.loadDocuments();
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetUploadForm();
    this.showModal = true;
  }

  openEditModal(doc: any): void {
    this.modalMode = 'edit';
    this.selectedDocument = doc;
    this.uploadForm = {
      titre: doc.titre,
      description: doc.description || '',
      type_document_id: doc.type_document_id,
      mots_cles: doc.mots_cles || '',
      fichier: null,
      commentaire: ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetUploadForm();
  }

  resetUploadForm(): void {
    this.uploadForm = {
      titre: '',
      description: '',
      type_document_id: '',
      mots_cles: '',
      fichier: null,
      commentaire: ''
    };
    this.selectedDocument = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 10 MB)');
        return;
      }
      this.uploadForm.fichier = file;
    }
  }

  onSubmit(): void {
    if (this.modalMode === 'create') {
      this.createDocument();
    } else {
      this.updateDocument();
    }
  }

  createDocument(): void {
    if (!this.uploadForm.fichier) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('titre', this.uploadForm.titre);
    formData.append('description', this.uploadForm.description);
    formData.append('type_document_id', this.uploadForm.type_document_id);
    formData.append('departement_id', this.currentUser.departement_id.toString());
    formData.append('mots_cles', this.uploadForm.mots_cles);
    formData.append('fichier', this.uploadForm.fichier);

    this.documentService.create(formData).subscribe({
      next: () => {
        alert('Document créé avec succès !');
        this.loadDocuments();
        this.closeModal();
      },
      error: (error) => {
        console.error('Erreur création:', error);
        alert('Erreur lors de la création');
      }
    });
  }

  updateDocument(): void {
    const formData = new FormData();
    formData.append('titre', this.uploadForm.titre);
    formData.append('description', this.uploadForm.description);
    formData.append('type_document_id', this.uploadForm.type_document_id);
    formData.append('departement_id', this.currentUser.departement_id.toString());
    formData.append('mots_cles', this.uploadForm.mots_cles);
    formData.append('commentaire', this.uploadForm.commentaire);

    if (this.uploadForm.fichier) {
      formData.append('fichier', this.uploadForm.fichier);
    }

    this.documentService.update(this.selectedDocument.id, formData).subscribe({
      next: () => {
        alert('Document modifié avec succès !');
        this.loadDocuments();
        this.closeModal();
      },
      error: (error) => {
        console.error('Erreur modification:', error);
        alert('Erreur lors de la modification');
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

  loadDocumentPermissions(documentId: number): void {
    this.accesService.getDocumentPermissions(documentId).subscribe({
      next: (permissions) => {
        this.documentPermissions = permissions;
        console.log('🔐 Permissions chargées:', permissions);
      },
      error: (error) => console.error('❌ Erreur permissions:', error)
    });
  }

  initPermissionsForm(): void {
    this.permissionsForm = {};
    this.employes.forEach(emp => {
      const existing = this.documentPermissions.find(p => p.user_id === emp.id);
      this.permissionsForm[emp.id] = {
        selected: !!existing,
        peut_lire: existing?.peut_lire || true,
        peut_telecharger: existing?.peut_telecharger || false,
        peut_modifier: existing?.peut_modifier || false,
        peut_supprimer: existing?.peut_supprimer || false
      };
    });
  }

  openPermissionsModal(doc: any): void {
  this.selectedDocument = doc;
  this.showPermissionsModal = true;
  this.loadEmployes(); // Charger les employés
  this.loadDocumentPermissions(doc.id);
}

  closePermissionsModal(): void {
    this.showPermissionsModal = false;
    this.selectedDocument = null;
    this.documentPermissions = [];
    this.permissionsForm = {};
  }

  toggleAllEmployees(event: any): void {
  const checked = event.target.checked;
  this.employes.forEach(emp => {
    this.permissionsForm[emp.id].selected = checked;
  });
}

// Définir des permissions prédéfinies
setAllPermissions(type: 'lecture' | 'complet' | 'aucun'): void {
  this.employes.forEach(emp => {
    if (!this.permissionsForm[emp.id].selected) return;

    switch (type) {
      case 'lecture':
        this.permissionsForm[emp.id].peut_lire = true;
        this.permissionsForm[emp.id].peut_telecharger = false;
        this.permissionsForm[emp.id].peut_modifier = false;
        this.permissionsForm[emp.id].peut_supprimer = false;
        break;
      case 'complet':
        this.permissionsForm[emp.id].peut_lire = true;
        this.permissionsForm[emp.id].peut_telecharger = true;
        this.permissionsForm[emp.id].peut_modifier = true;
        this.permissionsForm[emp.id].peut_supprimer = true;
        break;
      case 'aucun':
        this.permissionsForm[emp.id].selected = false;
        break;
    }
  });
}

// Enregistrer les permissions
savePermissions(): void {
  const permissions: any[] = [];

  this.employes.forEach(emp => {
    if (this.permissionsForm[emp.id].selected) {
      permissions.push({
        user_id: emp.id,
        peut_lire: this.permissionsForm[emp.id].peut_lire,
        peut_telecharger: this.permissionsForm[emp.id].peut_telecharger,
        peut_modifier: this.permissionsForm[emp.id].peut_modifier,
        peut_supprimer: this.permissionsForm[emp.id].peut_supprimer
      });
    }
  });

  console.log('💾 Enregistrement permissions:', permissions);

  // Envoyer chaque permission individuellement
  const requests = permissions.map(perm =>
    this.accesService.setPermissions(this.selectedDocument.id, perm)
  );

  // Attendre toutes les requêtes
  Promise.all(requests.map(req => req.toPromise()))
    .then(() => {
      alert('Permissions enregistrées avec succès !');
      this.closePermissionsModal();
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    });
}

  getFileIcon(mimeType: string): string {
    if (!mimeType) return 'fa-file text-muted';
    if (mimeType.includes('pdf')) return 'fa-file-pdf text-danger';
    if (mimeType.includes('word')) return 'fa-file-word text-primary';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fa-file-excel text-success';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fa-file-powerpoint text-warning';
    if (mimeType.includes('image')) return 'fa-file-image text-info';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'fa-file-archive text-secondary';
    return 'fa-file text-muted';
  }
}
