import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

const AdminMenuManagementPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-neutral-gray-darker mb-6 flex items-center">
        <UtensilsCrossed size={28} className="mr-3 text-brand-green" />
        Gestion du Menu
      </h1>
      <p className="text-neutral-gray-dark">
        Section pour le CRUD des catégories et des plats, la gestion des images et le contrôle de disponibilité.
      </p>
      {/* Placeholder for menu items, categories, and actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-500">Le contenu de la gestion du menu sera implémenté ici.</p>
      </div>
    </div>
  );
};

export default AdminMenuManagementPage;
