import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-employes',
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.css']
})
export class EmployesComponent implements OnInit {
  employes: any[] = [];
  loading = true;
  currentUser: any = null;
  showDetailModal = false;
  showSignalModal = false;
  selectedEmploye: any = null;

  // Statistiques par employé
  employeStats: any = {};

  // Form signalement
  signalementForm = {
    motif: '',
    details: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadEmployes();
  }

  loadEmployes(): void {
    this.loading = true;

    this.userService.getEmployesDepartement().subscribe({
      next: (data) => {
        this.employes = data;
        this.loading = false;

        console.log('Employés chargés:', this.employes);
      },
      error: (error) => {
        console.error('Erreur chargement employés:', error);
        this.loading = false;

        if (error.status === 403) {
          alert('Accès refusé. Vous devez être Chef de département.');
        }
      }
    });
  }

  viewEmploye(employe: any): void {
    this.selectedEmploye = employe;
    this.showDetailModal = true;
    this.loadEmployeStats(employe.id);
  }

  loadEmployeStats(employeId: number): void {
    // Simulation de statistiques
    this.employeStats = {
      documents_crees: Math.floor(Math.random() * 50),
      documents_modifies: Math.floor(Math.random() * 30),
      telechargements: Math.floor(Math.random() * 100),
      derniere_activite: new Date()
    };
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEmploye = null;
    this.employeStats = {};
  }

  /**
   * ✅ NOUVEAU : Ouvrir le modal de signalement
   */
  openSignalModal(employe: any): void {
    this.selectedEmploye = employe;
    this.signalementForm = {
      motif: '',
      details: ''
    };
    this.showSignalModal = true;
  }

  /**
   * ✅ NOUVEAU : Fermer le modal de signalement
   */
  closeSignalModal(): void {
    this.showSignalModal = false;
    this.selectedEmploye = null;
    this.signalementForm = {
      motif: '',
      details: ''
    };
  }

  /**
   * ✅ NOUVEAU : Soumettre le signalement
   */
  submitSignalement(): void {
    if (!this.signalementForm.motif || !this.signalementForm.details) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    // TODO: Appeler l'API backend pour envoyer le signalement à l'admin
    const signalementData = {
      employe_id: this.selectedEmploye.id,
      employe_nom: this.selectedEmploye.nom_complet,
      chef_id: this.currentUser?.id,
      chef_nom: this.currentUser?.nom_complet,
      departement: this.currentUser?.departement,
      motif: this.signalementForm.motif,
      details: this.signalementForm.details,
      date: new Date().toISOString()
    };

    console.log('Signalement envoyé:', signalementData);

    // Simulation d'envoi
    alert(`Signalement envoyé à l'administrateur !\n\nEmployé: ${this.selectedEmploye.nom_complet}\nMotif: ${this.signalementForm.motif}`);

    this.closeSignalModal();
  }

  getRoleName(roleId: number): string {
    const roles: any = {
      1: 'Admin',
      2: 'Chef de Département',
      3: 'Employé'
    };
    return roles[roleId] || 'N/A';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
