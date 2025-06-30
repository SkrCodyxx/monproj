import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4 bg-gray-50">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
      <h1 className="text-4xl font-serif font-bold text-neutral-gray-darker mb-3">
        Accès Non Autorisé
      </h1>
      <p className="text-lg text-neutral-gray-dark mb-8 max-w-md">
        Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <div className="space-x-4">
        <Link
          to="/client/dashboard" // Or to home if not a client, or based on role
          className="bg-brand-orange text-white font-semibold px-6 py-3 rounded-md hover:bg-brand-orange-dark transition-colors"
        >
          Retour à mon Espace Client
        </Link>
        <Link
          to="/"
          className="border border-brand-green text-brand-green font-semibold px-6 py-3 rounded-md hover:bg-green-50 transition-colors"
        >
          Retour à l'Accueil
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
