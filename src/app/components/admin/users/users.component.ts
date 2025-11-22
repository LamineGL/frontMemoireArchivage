import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = true;
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedUser: any = null;

  // Form data
  formData = {
    nom_complet: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: 3,
    departement_id: 1,
    statut: 'actif'
  };

  roles = [
    { id: 1, nom: 'Admin' },
    { id: 2, nom: 'Chef_Departement' },
    { id: 3, nom: 'Employe' }
  ];

  departements = [
    { id: 1, nom: 'Ressources Humaines' },
    { id: 2, nom: 'Comptabilité' },
    { id: 3, nom: 'IT' },
    { id: 4, nom: 'Production' },
    { id: 5, nom: 'Commercial' }
  ];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (response) => {
        this.users = response.data || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs:', error);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(user: any): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.formData = {
      nom_complet: user.nom_complet,
      email: user.email,
      password: '',
      password_confirmation: '',
      role_id: user.role_id,
      departement_id: user.departement_id,
      statut: user.statut
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      nom_complet: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: 3,
      departement_id: 1,
      statut: 'actif'
    };
    this.selectedUser = null;
  }

  onSubmit(): void {
    if (this.modalMode === 'create') {
      this.createUser();
    } else {
      this.updateUser();
    }
  }

  createUser(): void {
    this.userService.create(this.formData).subscribe({
      next: (response) => {
        alert('Utilisateur créé avec succès !');
        this.loadUsers();
        this.closeModal();
      },
      error: (error) => {
        console.error('Erreur création:', error);
        alert('Erreur lors de la création');
      }
    });
  }

  // updateUser(): void {
  //   const updateData = { ...this.formData };

  //   // Ne pas envoyer le mot de passe si vide
  //   // if (!updateData.password) {
  //   //   delete updateData.password;
  //   //   delete updateData.password_confirmation;
  //   // }

  //   this.userService.update(this.selectedUser.id, updateData).subscribe({
  //     next: (response) => {
  //       alert('Utilisateur modifié avec succès !');
  //       this.loadUsers();
  //       this.closeModal();
  //     },
  //     error: (error) => {
  //       console.error('Erreur modification:', error);
  //       alert('Erreur lors de la modification');
  //     }
  //   });
  // }

  updateUser(): void {
  // Construire les données à envoyer (SANS le mot de passe s'il est vide)
  const updateData: any = {
    nom_complet: this.formData.nom_complet,
    email: this.formData.email,
    role_id: this.formData.role_id,
    departement_id: this.formData.departement_id,
    statut: this.formData.statut
  };

  // Ajouter le mot de passe UNIQUEMENT s'il est rempli
  if (this.formData.password && this.formData.password.trim() !== '') {
    updateData.password = this.formData.password;
    updateData.password_confirmation = this.formData.password_confirmation;
  }

  console.log('Données envoyées:', updateData); // Pour déboguer

  this.userService.update(this.selectedUser.id, updateData).subscribe({
    next: (response) => {
      alert('Utilisateur modifié avec succès !');
      this.loadUsers();
      this.closeModal();
    },
    error: (error) => {
      console.error('Erreur modification:', error);

      // Afficher le message d'erreur détaillé du backend
      if (error.error?.message) {
        alert('Erreur: ' + error.error.message);
      } else if (error.error?.errors) {
        // Si Laravel retourne des erreurs de validation
        const errors = Object.values(error.error.errors).flat();
        alert('Erreurs de validation:\n' + errors.join('\n'));
      } else {
        alert('Erreur lors de la modification');
      }
    }
  });
}

  deleteUser(user: any): void {
    if (confirm(`Voulez-vous vraiment supprimer l'utilisateur "${user.nom_complet}" ?`)) {
      this.userService.delete(user.id).subscribe({
        next: () => {
          alert('Utilisateur supprimé avec succès !');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.nom : 'N/A';
  }

  getDepartementName(deptId: number): string {
    const dept = this.departements.find(d => d.id === deptId);
    return dept ? dept.nom : 'N/A';
  }
}
