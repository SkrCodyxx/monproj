import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Users, ShoppingCart, CalendarClock } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  // Placeholder data for dashboard items
  const summaryItems = [
    { title: "Utilisateurs Actifs", value: "120", icon: Users, link: "/admin/users", color: "text-blue-500" },
    { title: "Commandes en Attente", value: "15", icon: ShoppingCart, link: "/admin/orders", color: "text-red-500" },
    { title: "Réservations à Confirmer", value: "8", icon: CalendarClock, link: "/admin/reservations", color: "text-yellow-500" },
    { title: "Plats au Menu", value: "45", icon: BarChart2, link: "/admin/menu", color: "text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-neutral-gray-darker">
        Tableau de Bord Administrateur
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryItems.map(item => (
          <Link key={item.title} to={item.link} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
              </div>
              <item.icon className={`w-10 h-10 ${item.color} opacity-70`} />
            </div>
            <div className="mt-4 text-xs text-gray-400 hover:text-gray-600 flex items-center">
              Voir détails <ArrowRight size={14} className="ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Placeholder for Recent Activity or Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-neutral-gray-darker mb-4">Activité Récente (Placeholder)</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>Nouvelle commande #1024 reçue.</li>
            <li>Utilisateur 'john.doe@example.com' inscrit.</li>
            <li>Réservation pour 'Événement Corporatif ABC' confirmée.</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-neutral-gray-darker mb-4">Actions Rapides</h2>
          <div className="space-y-2">
            <Link to="/admin/menu/new" className="block text-brand-green hover:underline">Ajouter un nouveau plat</Link>
            <Link to="/admin/users/new" className="block text-brand-green hover:underline">Ajouter un utilisateur</Link>
            <Link to="/admin/settings" className="block text-brand-green hover:underline">Configurer les paramètres</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
