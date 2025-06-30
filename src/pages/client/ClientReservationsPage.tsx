import React from 'react';
// import { useQuery } from 'react-query';
// import apiClient from '../../lib/apiClient';
import { CalendarRange, AlertTriangle } from 'lucide-react';

// Mock reservation type - replace with actual Reservation type from src/types if it matches
interface Reservation {
  id: string;
  eventName: string;
  eventDate: string;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Mock data fetching function
// const fetchReservations = async (): Promise<Reservation[]> => {
//   const response = await apiClient.get('/reservations/my-reservations');
//   return response.data;
// };

const ClientReservationsPage: React.FC = () => {
  // const { data: reservations, isLoading, error } = useQuery<Reservation[], Error>('clientReservations', fetchReservations);

  // Mock data for now
  const isLoading = false;
  const error = null;
  const reservations: Reservation[] = [
    // { id: '1', eventName: 'Anniversaire de mariage', eventDate: '2024-04-10', numberOfGuests: 50, status: 'confirmed' },
    // { id: '2', eventName: 'Fête de bureau', eventDate: '2024-05-05', numberOfGuests: 120, status: 'pending' },
  ];


  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-neutral-gray-darker mb-8 flex items-center">
        <CalendarRange size={32} className="mr-3 text-brand-orange" />
        Mes Réservations
      </h1>

      {isLoading && (
        <div className="text-center py-10">
          <p className="text-lg text-neutral-gray-dark">Chargement de vos réservations...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
           <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
            <div>
              <p className="font-bold">Erreur de chargement</p>
              <p className="text-sm">Impossible de récupérer la liste de vos réservations pour le moment. Veuillez réessayer plus tard.</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && reservations && reservations.length === 0 && (
        <div className="text-center py-10 bg-white p-8 rounded-lg shadow">
          <CalendarRange size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-gray-darker mb-2">Aucune réservation trouvée</h2>
          <p className="text-neutral-gray-dark">Vous n'avez pas encore effectué de réservation.</p>
          {/* Optional: Link to booking page */}
          {/* <Link to="/booking" className="mt-4 inline-block bg-brand-orange text-white px-6 py-2 rounded hover:bg-brand-orange-dark">
            Faire une réservation
          </Link> */}
        </div>
      )}

      {!isLoading && !error && reservations && reservations.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom de l'Événement
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invités
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
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.eventName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(reservation.eventDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{reservation.numberOfGuests}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                      ${reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" className="text-brand-orange hover:text-brand-orange-dark mr-3">Détails</a>
                    {/* Potentially allow modification/cancellation based on status */}
                    {/* {reservation.status === 'pending' && (
                      <a href="#" className="text-red-600 hover:text-red-800">Annuler</a>
                    )} */}
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

export default ClientReservationsPage;
