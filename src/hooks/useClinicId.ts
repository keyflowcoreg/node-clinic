import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';

/**
 * Returns the clinic_id for the currently authenticated clinic user.
 * Falls back to 'c1' for demo purposes.
 */
export function useClinicId(): string {
  const { user } = useAuth();

  if (!user) return 'c1';

  // If the user has a clinicName, find the matching clinic
  if (user.clinicName) {
    const allClinics = store.clinics.getAll();
    const match = allClinics.find(c => c.name === user.clinicName);
    if (match) return match.id;
  }

  // For clinic role users, use their ID prefix to derive clinic association
  if (user.role === 'clinic' && user.id.startsWith('cli_')) {
    const num = user.id.replace('cli_', '');
    const clinicId = `c${parseInt(num, 10)}`;
    const clinic = store.clinics.getById(clinicId);
    if (clinic) return clinicId;
  }

  return 'c1'; // fallback for demo
}
