import { Component, OnInit } from '@angular/core';
import { DocumentService, Document } from '../../../services/document.service';
import { TypeDocumentService, TypeDocument } from '../../../services/type-document.service';
import { AuthService } from '../../../services/auth.service';
import { Departement, DepartementService } from '../../../services/departement';

@Component({
  selector: 'app-mes-documents',
  templateUrl: './mes-documents.component.html',
  styleUrls: ['./mes-documents.component.css']
})
export class MesDocumentsComponent implements OnInit {
  documents: Document[] = [];
  types: TypeDocument[] = [];
  departements: Departement[] = [];

  loading = false;
  showModal = false;
  showDetailModal = false;
  isEditMode = false;

  // Filtres et recherche
  searchQuery = '';
  selectedType = '';
  selectedDepartement = '';

  // Formulaire
  documentForm = {
    id: 0,
    titre: '',
    description: '',
    type_document_id: '',
    departement_id: '',
    mots_cles: '',
    fichier: null as File | null
  };

  selectedDocument: Document | null = null;
  currentUserId = 0;
  currentUserDepartementId = 0;

  constructor(
    private documentService: DocumentService,
    private typeDocumentService: TypeDocumentService,
    private departementService: DepartementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user: any = this.authService.getUser();
    this.currentUserId = user?.id || 0;
    this.currentUserDepartementId = user?.departement_id || 0;

    console.log('👤 Utilisateur:', user);
    console.log('🆔 User ID:', this.currentUserId);
    console.log('🏢 Département ID:', this.currentUserDepartementId);

    this.loadDocuments();
    this.loadTypes();
    this.loadDepartements();
  }

  /**
   * Charger MES documents (créés par moi)
   */
  loadDocuments(): void {
    this.loading = true;

    const filters = {
      search: this.searchQuery,
      type_document_id: this.selectedType,
      departement_id: this.selectedDepartement
    };

    this.documentService.getAll(filters).subscribe({
      next: (response) => {
        const allDocs = response.data || [];
        this.documents = allDocs.filter((doc: Document) =>
          doc.user_createur_id === this.currentUserId
        );

        console.log('📄 Mes documents chargés:', this.documents);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement documents:', error);
        alert('Erreur lors du chargement des documents');
        this.loading = false;
      }
    });
  }

  /**
   * Charger les types de documents
   */
  loadTypes(): void {
    this.typeDocumentService.getAll().subscribe({
      next: (types) => {
        this.types = types;
        console.log('📋 Types chargés:', this.types);
      },
      error: (error) => console.error('Erreur types:', error)
    });
  }

  /**
   * Charger les départements
   */
  loadDepartements(): void {
    this.departementService.getAll().subscribe({
      next: (depts) => {
        this.departements = depts;

        // ✅ APRÈS le chargement, assigner le département
        if (this.currentUserDepartementId) {
          this.documentForm.departement_id = this.currentUserDepartementId.toString();
          console.log('🏢 Départements chargés:', this.departements);
          console.log('🔒 Département pré-sélectionné:', this.documentForm.departement_id);
        }
      },
      error: (error) => console.error('Erreur départements:', error)
    });
  }

  /**
   * Rechercher des documents
   */
  searchDocuments(): void {
    this.loadDocuments();
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedDepartement = '';
    this.loadDocuments();
  }

  /**
   * Ouvrir le modal pour AJOUTER un document
   */
  openAddModal(): void {
    this.isEditMode = false;
    this.resetForm();

    // ✅ Réassigner le département après reset
    if (this.currentUserDepartementId) {
      this.documentForm.departement_id = this.currentUserDepartementId.toString();
      console.log('🔓 Modal ouvert - Département assigné:', this.documentForm.departement_id);
    }

    this.showModal = true;
  }

  /**
   * Ouvrir le modal pour MODIFIER un document
   */
  openEditModal(doc: Document): void {
    this.isEditMode = true;
    this.documentForm = {
      id: doc.id,
      titre: doc.titre,
      description: doc.description || '',
      type_document_id: doc.type_document_id.toString(),
      departement_id: doc.departement_id.toString(),
      mots_cles: doc.mots_cles || '',
      fichier: null
    };
    this.showModal = true;
  }

  /**
   * Fermer le modal
   */
  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.documentForm = {
      id: 0,
      titre: '',
      description: '',
      type_document_id: '',
      departement_id: this.currentUserDepartementId.toString(), // ✅ Pré-remplir
      mots_cles: '',
      fichier: null
    };
  }

  /**
   * Gérer la sélection de fichier
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.documentForm.fichier = file;
      console.log('📎 Fichier sélectionné:', file.name);
    }
  }

  /**
   * Soumettre le formulaire (Ajouter ou Modifier)
   */
  submitForm(): void {
    // Validation
    if (!this.documentForm.titre || !this.documentForm.type_document_id || !this.documentForm.departement_id) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!this.isEditMode && !this.documentForm.fichier) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    this.loading = true;

    // Créer FormData
    const formData = new FormData();
    formData.append('titre', this.documentForm.titre);
    formData.append('description', this.documentForm.description);
    formData.append('type_document_id', this.documentForm.type_document_id);
    formData.append('departement_id', this.documentForm.departement_id);
    formData.append('mots_cles', this.documentForm.mots_cles);

    if (this.documentForm.fichier) {
      formData.append('fichier', this.documentForm.fichier);
    }

    // Ajouter ou Modifier
    const action = this.isEditMode
      ? this.documentService.update(this.documentForm.id, formData)
      : this.documentService.create(formData);

    action.subscribe({
      next: (response) => {
        console.log('✅ Document enregistré:', response);
        alert(this.isEditMode ? 'Document modifié avec succès' : 'Document ajouté avec succès');
        this.closeModal();
        this.loadDocuments();
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        alert('Erreur lors de l\'enregistrement du document');
        this.loading = false;
      }
    });
  }

  /**
   * Voir les détails d'un document
   */
  viewDetails(doc: Document): void {
    this.selectedDocument = doc;
    this.showDetailModal = true;
  }

  /**
   * Fermer le modal de détails
   */
  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDocument = null;
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
   * Supprimer un document
   */
  deleteDocument(doc: Document): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${doc.titre}" ?`)) {
      this.documentService.delete(doc.id).subscribe({
        next: () => {
          console.log('✅ Document supprimé');
          alert('Document supprimé avec succès');
          this.loadDocuments();
        },
        error: (error) => {
          console.error('❌ Erreur suppression:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
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
   * Formater la date
   */
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
}
