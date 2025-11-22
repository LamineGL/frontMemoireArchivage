import { Component, OnInit } from '@angular/core';
import { Departement, DepartementService } from '../../../services/departement';

@Component({
  selector: 'app-departements',
  templateUrl: './departements.component.html',
  styleUrls: ['./departements.component.css']
})
export class DepartementsComponent implements OnInit {
  departements: Departement[] = [];
  loading = true;
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedDepartement: Departement | null = null;

  formData = {
    nom_departement: '',
    description: ''
  };

  constructor(private departementService: DepartementService) { }

  ngOnInit(): void {
    this.loadDepartements();
  }

  loadDepartements(): void {
    this.loading = true;
    this.departementService.getAll().subscribe({
      next: (data) => {
        this.departements = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement départements:', error);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(dept: Departement): void {
    this.modalMode = 'edit';
    this.selectedDepartement = dept;
    this.formData = {
      nom_departement: dept.nom_departement,
      description: dept.description || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      nom_departement: '',
      description: ''
    };
    this.selectedDepartement = null;
  }

  onSubmit(): void {
    if (this.modalMode === 'create') {
      this.createDepartement();
    } else {
      this.updateDepartement();
    }
  }

  createDepartement(): void {
    this.departementService.create(this.formData).subscribe({
      next: () => {
        alert('Département créé avec succès !');
        this.loadDepartements();
        this.closeModal();
      },
      error: (error) => {
        console.error('Erreur création:', error);
        alert('Erreur lors de la création');
      }
    });
  }

  updateDepartement(): void {
    if (this.selectedDepartement) {
      this.departementService.update(this.selectedDepartement.id, this.formData).subscribe({
        next: () => {
          alert('Département modifié avec succès !');
          this.loadDepartements();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur modification:', error);
          alert('Erreur lors de la modification');
        }
      });
    }
  }

  deleteDepartement(dept: Departement): void {
    if (confirm(`Voulez-vous vraiment supprimer le département "${dept.nom_departement}" ?`)) {
      this.departementService.delete(dept.id).subscribe({
        next: () => {
          alert('Département supprimé avec succès !');
          this.loadDepartements();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert(error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }
}
