export interface User {
  id: number;
  nom_complet: string;
  email: string;
  nom_role: string;
  role_id: number;
  departement: string;
  departement_id: number;
  statut: 'actif' | 'inactif';
  created_at: string;
}
