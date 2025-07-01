import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarDays, Search, Filter as FilterIcon, Eye, Edit2, ChevronDown, ChevronUp, User as UserIcon, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Reservation, ReservationStatus, User } from '../../../src/types'; // Adjusted path

// --- Mock API Client ---
const apiClient = {
  get: async (url: string, config?: { params?: any }) => {
    console.log(`SIMULATE GET: ${url}`, config?.params);
    await new Promise(resolve => setTimeout(resolve, 400));
    if (url.startsWith('/reservations/')) { // Get single reservation
      const id = url.split('/').pop();
      const mockReservation: Reservation = {
        id: id!, user_id: `usr_${Math.floor(Math.random()*3)+1}`,
        customer_name: `Client Res ${id?.replace('res_','')}`, customer_email: `client_res_${id?.replace('res_','')}@example.com`, customer_phone: '555-1234',
        event_type: ['Mariage', 'Anniversaire', 'Entreprise'][Math.floor(Math.random()*3)],
        event_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Future date
        number_of_guests: Math.floor(Math.random()*100)+20,
        status: ['pending', 'confirmed', 'cancelled'][Math.floor(Math.random()*3)] as ReservationStatus,
        notes: "Notes spécifiques pour la réservation " + id,
        created_at: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        user: { email: `client_res_${id?.replace('res_','')}@example.com`, firstName: `ClientResPrénom${id?.replace('res_','')}`, lastName: `ClientResNom${id?.replace('res_','')}` }
      };
      return { data: mockReservation };
    }
    if (url === '/reservations') {
      const params = config?.params || {};
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const statusFilter = params.status;

      const mockReservations: Reservation[] = Array.from({ length: 28 }, (_, i) => ({
        id: `res_${i + 1}`, user_id: `usr_${(i % 3) + 1}`,
        customer_name: `Client Réservation ${i+1}`, customer_email: `client_res_${i+1}@example.com`, customer_phone: `555-02${String(i).padStart(2,'0')}`,
        event_type: ['Mariage', 'Anniversaire', 'Entreprise', 'Autre'][i % 4],
        event_date: new Date(Date.now() + (Math.random() * 60 - 15) * 24 * 60 * 60 * 1000).toISOString(), // +- 30 days
        number_of_guests: Math.floor(Math.random()*150)+10,
        status: ['pending', 'confirmed', 'cancelled'][i % 3] as ReservationStatus,
        notes: `Notes pour la réservation ${i+1}.`,
        created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        user: { email: `client_res_${(i%3)+1}@example.com`, firstName: `ClientRésPrénom${(i%3)+1}`, lastName: `ClientRésNom${(i%3)+1}` }
      }));

      const filtered = statusFilter && statusFilter !== 'all' ? mockReservations.filter(r => r.status === statusFilter) : mockReservations;
      // Add other filters here (date, search) if implementing client-side fully, or assume server handles them
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        data: {
          data: filtered.slice(start, end),
          pagination: { page, pageSize, totalItems: filtered.length, totalPages: Math.ceil(filtered.length / pageSize) }
        }
      };
    }
    return { data: {} };
  },
  put: async (url: string, data: any) => {
    console.log(`SIMULATE PUT: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 400));
    const id = url.split('/')[2]; // Naive ID extraction
    if (url.includes('/status')) {
      return { data: { message: 'Statut mis à jour!', reservation: { id, status: data.status } } };
    }
    return { data: { message: 'Réservation mise à jour!', reservation: { id, ...data } } };
  }
};
// --- End Mock API Client ---

// --- Modal Component (Re-use from Order Management or define locally if needed) ---
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl' | '2xl'; }
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'xl' }) => {
  if (!isOpen) return null;
  const sizeClasses: Record<string,string> = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className={`relative bg-white p-5 sm:p-7 rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-neutral-gray-darker">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto pr-2">{children}</div>
      </div>
    </div>
  );
};
// --- End Modal Component ---

const RESERVATION_STATUSES: ReservationStatus[] = ['pending', 'confirmed', 'cancelled'];
const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

type ReservationFormData = Partial<Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'user'>>;


const AdminReservationManagementPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });

  const [filters, setFilters] = useState({ status: 'all', dateFrom: '', dateTo: '', search: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [reservationFormData, setReservationFormData] = useState<ReservationFormData>({});


  const fetchReservations = useCallback(async (page = pagination.page, currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, pageSize: pagination.pageSize };
      if (currentFilters.status !== 'all') params.status = currentFilters.status;
      if (currentFilters.dateFrom) params.eventDateFrom = currentFilters.dateFrom; // Ensure correct param name
      if (currentFilters.dateTo) params.eventDateTo = currentFilters.dateTo;     // Ensure correct param name
      if (currentFilters.search) params.search = currentFilters.search;

      const response = await apiClient.get('/reservations', { params });
      setReservations(response.data.data || []);
      setPagination(response.data.pagination || { ...pagination, totalItems: 0, totalPages: 1, page });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservations');
      toast.error('Erreur lors de la récupération des réservations.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]); // Dependencies refined

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = () => {
    fetchReservations(1, filters);
  };

  const handleViewEditDetails = async (reservation: Reservation | null) => {
    if (!reservation) { // For "Add New"
        setEditingReservation(null);
        setReservationFormData({
            customer_name: '', customer_email: '', event_type: '',
            event_date: new Date().toISOString().split('T')[0], // Default to today for new
            number_of_guests: 10, status: 'pending', customer_phone: '', notes: ''
        });
        setShowDetailsModal(true);
        return;
    }
    const toastId = toast.loading("Chargement des détails...");
    try {
        // In a real app, you might re-fetch, but mock can use passed data or "fetch" one
        const response = await apiClient.get(`/reservations/${reservation.id}`);
        setEditingReservation(response.data);
        setReservationFormData({
            customer_name: response.data.customer_name,
            customer_email: response.data.customer_email,
            customer_phone: response.data.customer_phone,
            event_type: response.data.event_type,
            event_date: response.data.event_date.split('T')[0], // Format for date input
            number_of_guests: response.data.number_of_guests,
            status: response.data.status,
            notes: response.data.notes,
        });
        setShowDetailsModal(true);
        toast.dismiss(toastId);
    } catch(err) {
        toast.error("Erreur chargement détails.", {id: toastId});
    }
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const val = type === 'number' ? parseInt(value) : value;
    setReservationFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSaveReservationDetails = async () => {
    if (!editingReservation && !reservationFormData.customer_email) { // Basic validation for new
        toast.error("L'email du client est requis pour une nouvelle réservation.");
        return;
    }
    const toastId = toast.loading(editingReservation ? "Mise à jour..." : "Création...");
    const payload = { ...reservationFormData };
    // Convert event_date back to full ISO string if it's just date part
    if (payload.event_date && !payload.event_date.includes('T')) {
        payload.event_date = new Date(payload.event_date).toISOString();
    }

    try {
      // For new reservation, POST is not defined in this admin page plan, so we'll assume only PUT for edits
      if (editingReservation) {
        await apiClient.put(`/reservations/${editingReservation.id}`, payload);
        toast.success("Réservation mise à jour!", { id: toastId });
      } else {
        // This part is for if "Add New" was implemented fully with POST
        // await apiClient.post(`/reservations`, payload);
        toast.success("Nouvelle réservation (simulation)!", { id: toastId });
      }
      setShowDetailsModal(false);
      setEditingReservation(null);
      fetchReservations();
    } catch(err) {
      toast.error("Erreur sauvegarde.", { id: toastId });
    }
  };

  const ReservationRow: React.FC<{reservation: Reservation}> = ({reservation}) => (
    <tr key={reservation.id}>
      <td className="px-5 py-4 whitespace-nowrap text-blue-600 hover:underline cursor-pointer" onClick={() => handleViewEditDetails(reservation)}>{reservation.id}</td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div>{reservation.customer_name || reservation.user?.firstName + ' ' + reservation.user?.lastName}</div>
        <div className="text-xs text-gray-500">{reservation.customer_email || reservation.user?.email}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-gray-500">{reservation.event_type}</td>
      <td className="px-5 py-4 whitespace-nowrap text-gray-500">{new Date(reservation.event_date).toLocaleDateString()}</td>
      <td className="px-5 py-4 whitespace-nowrap text-gray-500 text-center">{reservation.number_of_guests}</td>
      <td className="px-5 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reservation.status]}`}>
          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
        </span>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
        <button onClick={() => handleViewEditDetails(reservation)} className="text-indigo-600 hover:text-indigo-900" title="Voir/Modifier Détails">
          <Edit2 size={18} />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold text-neutral-gray-darker flex items-center">
        <CalendarDays size={28} className="mr-3 text-brand-green" />
        Gestion des Réservations
      </h1>

      {/* Filters Section */}
      <div className="p-4 bg-white rounded-lg shadow space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 md:items-end">
        {/* Filters similar to Order Management */}
        <div className="md:col-span-3">
          <label htmlFor="searchRes" className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input type="text" name="search" id="searchRes" value={filters.search} onChange={handleFilterChange} placeholder="ID, Client, Type Événement..." className="w-full text-sm input-style"/>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="statusRes" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select name="status" id="statusRes" value={filters.status} onChange={handleFilterChange} className="w-full text-sm input-style">
            <option value="all">Tous</option>
            {RESERVATION_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <label htmlFor="dateFromRes" className="block text-sm font-medium text-gray-700 mb-1">Date Événement (De)</label>
          <input type="date" name="dateFrom" id="dateFromRes" value={filters.dateFrom} onChange={handleFilterChange} className="w-full text-sm input-style"/>
        </div>
        <div className="md:col-span-3">
          <label htmlFor="dateToRes" className="block text-sm font-medium text-gray-700 mb-1">Date Événement (À)</label>
          <input type="date" name="dateTo" id="dateToRes" value={filters.dateTo} onChange={handleFilterChange} className="w-full text-sm input-style"/>
        </div>
        <div className="md:col-span-1">
          <button onClick={applyFilters} className="w-full bg-brand-green text-white px-3 py-2 text-sm rounded-md hover:bg-green-700 flex items-center justify-center">
            <FilterIcon size={16} className="mr-1 sm:mr-2"/> Filtrer
          </button>
        </div>
      </div>
      <style jsx>{`.input-style { box-shadow: sm; border-width: 1px; border-color: #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem;} .input-style:focus { --tw-ring-color: #10B981; border-color: #10B981; }`}</style>

      {/* Reservations Table */}
      {isLoading && <p className="text-center py-4">Chargement des réservations...</p>}
      {error && <p className="text-center py-4 text-red-500">Erreur: {error}</p>}
      {!isLoading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Client', 'Type Événement', 'Date Événement', 'Invités', 'Statut', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.length > 0 ? reservations.map(res => <ReservationRow key={res.id} reservation={res} />)
                                 : <tr><td colSpan={7} className="text-center py-10 text-gray-500">Aucune réservation trouvée pour les filtres actuels.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button onClick={() => fetchReservations(pagination.page - 1, filters)} disabled={pagination.page === 1}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Précédent</button>
          <span>Page {pagination.page} sur {pagination.totalPages} (Total: {pagination.totalItems})</span>
          <button onClick={() => fetchReservations(pagination.page + 1, filters)} disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Suivant</button>
        </div>
      )}

      {/* Reservation Details/Edit Modal */}
        <Modal isOpen={showDetailsModal} onClose={() => { setShowDetailsModal(false); setEditingReservation(null);}} title={editingReservation ? `Modifier Réservation #${editingReservation.id}` : "Ajouter Réservation"} size="2xl">
            { (editingReservation || !editingReservation) && /* Condition always true to show form for add/edit */
            <form onSubmit={(e) => {e.preventDefault(); handleSaveReservationDetails();}} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="customer_name" className="block text-xs font-medium text-gray-700">Nom Client</label>
                        <input type="text" name="customer_name" id="customer_name" value={reservationFormData.customer_name || ''} onChange={handleFormInputChange} className="mt-1 w-full input-style-modal"/>
                    </div>
                    <div>
                        <label htmlFor="customer_email" className="block text-xs font-medium text-gray-700">Email Client</label>
                        <input type="email" name="customer_email" id="customer_email" value={reservationFormData.customer_email || ''} onChange={handleFormInputChange} className="mt-1 w-full input-style-modal"/>
                    </div>
                    <div>
                        <label htmlFor="customer_phone" className="block text-xs font-medium text-gray-700">Téléphone Client</label>
                        <input type="tel" name="customer_phone" id="customer_phone" value={reservationFormData.customer_phone || ''} onChange={handleFormInputChange} className="mt-1 w-full input-style-modal"/>
                    </div>
                    <div>
                        <label htmlFor="event_type" className="block text-xs font-medium text-gray-700">Type d'Événement</label>
                        <input type="text" name="event_type" id="event_type" value={reservationFormData.event_type || ''} onChange={handleFormInputChange} className="mt-1 w-full input-style-modal"/>
                    </div>
                     <div>
                        <label htmlFor="event_date" className="block text-xs font-medium text-gray-700">Date Événement</label>
                        <input type="date" name="event_date" id="event_date" value={reservationFormData.event_date ? reservationFormData.event_date.split('T')[0] : ''} onChange={handleFormInputChange} className="mt-1 w-full input-style-modal"/>
                    </div>
                    <div>
                        <label htmlFor="number_of_guests" className="block text-xs font-medium text-gray-700">Nombre d'Invités</label>
                        <input type="number" name="number_of_guests" id="number_of_guests" value={reservationFormData.number_of_guests || ''} onChange={handleFormInputChange} className="mt-1 w-full input-style-modal"/>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-xs font-medium text-gray-700">Statut</label>
                        <select name="status" id="status" value={reservationFormData.status || 'pending'} onChange={handleFormInputChange} className="mt-1 w-full input-style-modal">
                            {RESERVATION_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="notes" className="block text-xs font-medium text-gray-700">Notes</label>
                    <textarea name="notes" id="notes" value={reservationFormData.notes || ''} onChange={handleFormInputChange} rows={3} className="mt-1 w-full input-style-modal"></textarea>
                </div>
                <style jsx>{`.input-style-modal { font-size: 0.875rem; box-shadow: sm; border-width: 1px; border-color: #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem;} .input-style-modal:focus { --tw-ring-color: #10B981; border-color: #10B981; }`}</style>
                <div className="flex justify-end space-x-3 pt-3">
                    <button type="button" onClick={() => { setShowDetailsModal(false); setEditingReservation(null);}} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Annuler</button>
                    <button type="submit" className="px-4 py-2 text-sm text-white bg-brand-green hover:bg-green-700 rounded-md">Enregistrer</button>
                </div>
            </form>
            }
        </Modal>
    </div>
  );
};

export default AdminReservationManagementPage;
