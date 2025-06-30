import React from 'react';
import { Settings } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-neutral-gray-darker mb-6 flex items-center">
        <Settings size={28} className="mr-3 text-brand-green" />
        Paramètres du Site
      </h1>
      <p className="text-neutral-gray-dark">
        Section pour gérer les informations de l'entreprise, taxes, tarification, horaires, réseaux sociaux, et pages légales.
      </p>
      {/* Placeholder for settings form */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-500">Le contenu des paramètres du site sera implémenté ici.</p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
