import React from 'react';
// import { useQuery } from 'react-query'; // Example for data fetching
// import apiClient from '../../lib/apiClient';
import { ShoppingBag, AlertTriangle } from 'lucide-react';

// Mock order type - replace with actual Order type from src/types if it matches
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

// Mock data fetching function
// const fetchOrders = async (): Promise<Order[]> => {
//   const response = await apiClient.get('/orders/my-orders');
//   return response.data;
// };

const ClientOrdersPage: React.FC = () => {
  // const { data: orders, isLoading, error } = useQuery<Order[], Error>('clientOrders', fetchOrders);

  // Mock data for now
  const isLoading = false;
  const error = null;
  const orders: Order[] = [
    // { id: '1', orderNumber: 'DCP-00123', date: '2024-03-15', totalAmount: 150.75, status: 'delivered' },
    // { id: '2', orderNumber: 'DCP-00124', date: '2024-03-20', totalAmount: 85.00, status: 'pending' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-neutral-gray-darker mb-8 flex items-center">
        <ShoppingBag size={32} className="mr-3 text-brand-orange" />
        Mes Commandes
      </h1>

      {isLoading && (
        <div className="text-center py-10">
          <p className="text-lg text-neutral-gray-dark">Chargement de vos commandes...</p>
          {/* Add a spinner here if desired */}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
            <div>
              <p className="font-bold">Erreur de chargement</p>
              <p className="text-sm">Impossible de récupérer l'historique de vos commandes pour le moment. Veuillez réessayer plus tard.</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && orders && orders.length === 0 && (
        <div className="text-center py-10 bg-white p-8 rounded-lg shadow">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-gray-darker mb-2">Aucune commande trouvée</h2>
          <p className="text-neutral-gray-dark">Vous n'avez pas encore passé de commande.</p>
          {/* Optional: Link to menu or services */}
          {/* <Link to="/menu" className="mt-4 inline-block bg-brand-orange text-white px-6 py-2 rounded hover:bg-brand-orange-dark">
            Découvrir notre menu
          </Link> */}
        </div>
      )}

      {!isLoading && !error && orders && orders.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.totalAmount.toFixed(2)} CAD</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                      ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      ${['confirmed', 'preparing', 'ready'].includes(order.status) ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" className="text-brand-orange hover:text-brand-orange-dark">Détails</a>
                    {/* Potentially download invoice link */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientOrdersPage;
