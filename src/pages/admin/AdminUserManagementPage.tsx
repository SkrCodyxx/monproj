import React from 'react';
import { Users } from 'lucide-react';

const AdminUserManagementPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-neutral-gray-darker mb-6 flex items-center">
        <Users size={28} className="mr-3 text-brand-green" />
        Gestion des Utilisateurs
      </h1>
      <p className="text-neutral-gray-dark">
        Section pour lister, filtrer, modifier les rôles, et activer/désactiver les comptes utilisateurs.
      </p>
      {/* Placeholder for user list, filters, and actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-500">Le contenu de la gestion des utilisateurs sera implémenté ici.</p>
      </div>
    </div>
  );
};

export default AdminUserManagementPage;
