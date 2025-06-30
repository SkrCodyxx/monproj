import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-neutral-gray-darker mb-6">
        Tableau de Bord Client
      </h1>
      {user && (
        <p className="text-xl text-neutral-gray-dark mb-8">
          Bonjour, <span className="font-semibold text-brand-orange">{user.firstName || user.email}</span>! Bienvenue dans votre espace personnel.
        </p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder: Recent Orders Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-brand-orange mb-3">Commandes Récentes</h2>
          <p className="text-sm text-neutral-gray-dark mb-4">Aucune commande récente pour le moment.</p>
          <Link to="/client/orders" className="text-sm font-medium text-brand-green hover:underline flex items-center">
            Voir toutes les commandes <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Placeholder: Upcoming Reservations */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-brand-orange mb-3">Réservations à Venir</h2>
          <p className="text-sm text-neutral-gray-dark mb-4">Aucune réservation à venir.</p>
          <Link to="/client/reservations" className="text-sm font-medium text-brand-green hover:underline flex items-center">
            Voir toutes les réservations <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Placeholder: Personal Stats (Optional) */}
        {/* <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-brand-orange mb-3">Vos Statistiques</h2>
          <p className="text-sm text-neutral-gray-dark">Total dépensé: 0.00 CAD</p>
        </div> */}

        {/* Placeholder: Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-semibold text-brand-orange mb-3">Notifications</h2>
          <p className="text-sm text-neutral-gray-dark">Aucune nouvelle notification.</p>
        </div>

         {/* Quick Link to Profile */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-brand-orange mb-3">Mon Profil</h2>
          <p className="text-sm text-neutral-gray-dark mb-4">Gérez vos informations personnelles et préférences.</p>
          <Link to="/client/profile" className="text-sm font-medium text-brand-green hover:underline flex items-center">
            Accéder à mon profil <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;
