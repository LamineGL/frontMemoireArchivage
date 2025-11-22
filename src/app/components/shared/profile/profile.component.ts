import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  loading = false;

  // Tabs
  activeTab: 'info' | 'security' | 'photo' = 'info';

  // Form informations personnelles
  infoForm = {
    nom_complet: '',
    email: ''
  };

  // Form sécurité
  passwordForm = {
    current_password: '',
    password: '',
    password_confirmation: ''
  };

  // Photo
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;

  // Messages
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.currentUser = this.authService.getUser();

    if (this.currentUser) {
      this.infoForm = {
        nom_complet: this.currentUser.nom_complet,
        email: this.currentUser.email
      };
    }

    console.log('👤 Profil chargé:', this.currentUser);
  }

  /**
   * Changer d'onglet
   */
  setActiveTab(tab: 'info' | 'security' | 'photo'): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  /**
   * ✅ Mettre à jour les informations personnelles
   */
  updateInfo(): void {
    if (!this.infoForm.nom_complet || !this.infoForm.email) {
      this.showError('Veuillez remplir tous les champs');
      return;
    }

    this.loading = true;

    this.profileService.updateInfo({
      nom_complet: this.infoForm.nom_complet,
      email: this.infoForm.email
    }).subscribe({
      next: (response) => {
        console.log('✅ Profil mis à jour:', response);
        this.showSuccess('Informations mises à jour avec succès');
        this.loadProfile();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur mise à jour:', error);
        this.showError(error.error?.message || 'Erreur lors de la mise à jour');
        this.loading = false;
      }
    });
  }

  /**
   * ✅ Changer le mot de passe
   */
  changePassword(): void {
    if (!this.passwordForm.current_password) {
      this.showError('Veuillez saisir votre mot de passe actuel');
      return;
    }

    if (!this.passwordForm.password || !this.passwordForm.password_confirmation) {
      this.showError('Veuillez remplir tous les champs');
      return;
    }

    if (this.passwordForm.password.length < 8) {
      this.showError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (this.passwordForm.password !== this.passwordForm.password_confirmation) {
      this.showError('Les mots de passe ne correspondent pas');
      return;
    }

    this.loading = true;

    this.profileService.changePassword({
      current_password: this.passwordForm.current_password,
      password: this.passwordForm.password,
      password_confirmation: this.passwordForm.password_confirmation
    }).subscribe({
      next: (response) => {
        console.log('✅ Mot de passe modifié');
        this.showSuccess('Mot de passe modifié avec succès. Un email de confirmation vous a été envoyé.');
        this.passwordForm = {
          current_password: '',
          password: '',
          password_confirmation: ''
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur changement mot de passe:', error);
        this.showError(error.error?.message || 'Erreur lors du changement de mot de passe');
        this.loading = false;
      }
    });
  }

  /**
   * Sélectionner une photo
   */
  onPhotoSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // Vérifier le type
      if (!file.type.match('image.*')) {
        this.showError('Veuillez sélectionner une image');
        return;
      }

      // Vérifier la taille (2 MB max)
      if (file.size > 2 * 1024 * 1024) {
        this.showError('L\'image ne doit pas dépasser 2 MB');
        return;
      }

      this.selectedPhoto = file;

      // Prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * ✅ Uploader la photo
   */
  uploadPhoto(): void {
    if (!this.selectedPhoto) {
      this.showError('Veuillez sélectionner une photo');
      return;
    }

    this.loading = true;

    this.profileService.updatePhoto(this.selectedPhoto).subscribe({
      next: (response) => {
        console.log('✅ Photo mise à jour');
        this.showSuccess('Photo de profil mise à jour avec succès');
        this.selectedPhoto = null;
        this.photoPreview = null;
        this.loadProfile();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur upload photo:', error);
        this.showError('Erreur lors de l\'upload de la photo');
        this.loading = false;
      }
    });
  }

  /**
   * ✅ Supprimer la photo
   */
  deletePhoto(): void {
    if (!confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) {
      return;
    }

    this.loading = true;

    this.profileService.deletePhoto().subscribe({
      next: (response) => {
        console.log('✅ Photo supprimée');
        this.showSuccess('Photo supprimée avec succès');
        this.loadProfile();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur suppression photo:', error);
        this.showError('Erreur lors de la suppression');
        this.loading = false;
      }
    });
  }

  /**
   * Annuler la sélection de photo
   */
  cancelPhotoSelection(): void {
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  /**
   * Afficher un message de succès
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';

    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  /**
   * Afficher un message d'erreur
   */
  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';

    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  /**
   * Effacer les messages
   */
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Obtenir l'URL de la photo de profil
   */
  getPhotoUrl(): string {
    if (this.currentUser?.photo_profil) {
      return `http://127.0.0.1:8000/storage/${this.currentUser.photo_profil}`;
    }
    // Génération d'avatar dynamique avec le nom
    return 'https://ui-avatars.com/api/?name=' +
           encodeURIComponent(this.currentUser?.nom_complet || 'User') +
           '&background=8e44ad&color=fff&size=200';
  }

//   getPhotoUrl(): string {
//   if (this.currentUser?.photo_profil) { // ✅ CHANGÉ de photo_url à photo_profil
//     return `http://127.0.0.1:8000/storage/${this.currentUser.photo_profil}`;
//   }
//   // Génération d'avatar dynamique avec le nom
//   return 'https://ui-avatars.com/api/?name=' +
//          encodeURIComponent(this.currentUser?.nom_complet || 'User') +
//          '&background=8e44ad&color=fff&size=200';
// }

  /**
   * Obtenir le nom du rôle
   */
  getRoleName(): string {
    if (!this.currentUser) return 'N/A';
    if (typeof this.currentUser.role === 'string') {
      return this.currentUser.role;
    }
    return this.currentUser.role?.nom_role || 'N/A';
  }

  /**
   * Obtenir le nom du département
   */
  getDepartementName(): string {
    if (!this.currentUser || !this.currentUser.departement) return 'N/A';
    if (typeof this.currentUser.departement === 'string') {
      return this.currentUser.departement;
    }
    return this.currentUser.departement?.nom_departement || 'N/A';
  }
}
