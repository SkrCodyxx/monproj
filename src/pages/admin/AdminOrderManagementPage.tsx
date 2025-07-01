import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, Search, Filter as FilterIcon, Eye, Edit2, ChevronDown, ChevronUp, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Order, OrderItem, OrderStatus, User, Address } from '../../../src/types'; // Adjusted path

// --- Mock API Client ---
const apiClient = {
  get: async (url: string, config?: { params?: any }) => {
    console.log(`SIMULATE GET: ${url}`, config?.params);
    await new Promise(resolve => setTimeout(resolve, 400));
    if (url.startsWith('/orders/')) { // Get single order
      const id = url.split('/').pop();
      const mockOrderItems: OrderItem[] = Array.from({length: Math.floor(Math.random()*3)+1}, (_, i) => ({
        id: `oi_${id}_${i}`, order_id: id!, dish_id: `d_${i}`, dish_name: `Plat Commandé ${i+1}`, quantity: Math.floor(Math.random()*2)+1, price_per_item: 10 + Math.random()*5
      }));
      const mockOrder: Order = {
        id: id!, user_id: `usr_${Math.floor(Math.random()*5)+1}`,
        customer_name: `Client ${id?.replace('ord_','')}`, customer_email: `client${id?.replace('ord_','')}@example.com`,
        total_amount: mockOrderItems.reduce((sum, item) => sum + item.quantity * item.price_per_item, 0),
        status: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'][Math.floor(Math.random()*5)] as OrderStatus,
        created_at: new Date(Date.now() - Math.random() * 20000000000).toISOString(),
        updated_at: new Date().toISOString(),
        items: mockOrderItems,
        shipping_address: { street: '123 Rue Principale', city: 'Montréal', postalCode: 'H1H 1H1', country: 'Canada' } as Address,
        notes: "Ceci est une note pour la commande."
      };
      return { data: mockOrder };
    }
    if (url === '/orders') {
      const params = config?.params || {};
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const statusFilter = params.status;

      const mockOrders: Order[] = Array.from({ length: 35 }, (_, i) => ({
        id: `ord_${i + 1}`, user_id: `usr_${(i % 5) + 1}`,
        customer_name: `Client Nom ${i+1}`, customer_email: `client${i+1}@example.com`,
        total_amount: parseFloat((50 + Math.random() * 200).toFixed(2)),
        status: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'][i % 5] as OrderStatus,
        created_at: new Date(Date.now() - Math.random() * 20000000000).toISOString(),
        updated_at: new Date().toISOString(),
        user: { email: `client${(i%5)+1}@example.com`, firstName: `ClientPrénom${(i%5)+1}`, lastName: `ClientNom${(i%5)+1}` }
      }));

      const filtered = statusFilter && statusFilter !== 'all' ? mockOrders.filter(o => o.status === statusFilter) : mockOrders;
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
    const id = url.split('/')[2];
    return { data: { message: 'Statut mis à jour!', order: { id, status: data.status } } };
  }
};
// --- End Mock API Client ---

// --- Modal Component (Simplified) ---
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl'; }
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;
  const sizeClasses = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
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


const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};


const AdminOrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });

  const [filters, setFilters] = useState({ status: 'all', dateFrom: '', dateTo: '', search: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatusOrderId, setEditingStatusOrderId] = useState<string | null>(null);


  const fetchOrders = useCallback(async (page = pagination.page, currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, pageSize: pagination.pageSize };
      if (currentFilters.status !== 'all') params.status = currentFilters.status;
      if (currentFilters.dateFrom) params.dateFrom = currentFilters.dateFrom;
      if (currentFilters.dateTo) params.dateTo = currentFilters.dateTo;
      if (currentFilters.search) params.search = currentFilters.search;

      const response = await apiClient.get('/orders', { params });
      setOrders(response.data.data || []);
      setPagination(response.data.pagination || { ...pagination, totalItems: 0, totalPages: 1, page });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      toast.error('Erreur lors de la récupération des commandes.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]); // Dependencies refined

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // fetchOrders is memoized with useCallback

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = () => {
    fetchOrders(1, filters); // Reset to page 1 when applying new filters
  };

  const handleViewDetails = async (order: Order) => {
    const toastId = toast.loading("Chargement des détails...");
    try {
        const response = await apiClient.get(`/orders/${order.id}`);
        setSelectedOrder(response.data);
        setShowDetailsModal(true);
        toast.dismiss(toastId);
    } catch(err) {
        toast.error("Erreur chargement détails.", {id: toastId});
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const toastId = toast.loading("Mise à jour du statut...");
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Statut mis à jour!", { id: toastId });
      fetchOrders(); // Refresh list
      if (selectedOrder && selectedOrder.id === orderId) { // If details modal is open for this order, refresh it too
        const response = await apiClient.get(`/orders/${orderId}`);
        setSelectedOrder(response.data);
      }
    } catch (err) {
      toast.error("Erreur mise à jour statut.", { id: toastId });
    }
    setEditingStatusOrderId(null); // Close dropdown after attempt
  };

  const OrderRow: React.FC<{order: Order}> = ({order}) => (
    <tr key={order.id}>
      <td className="px-5 py-4 whitespace-nowrap text-blue-600 hover:underline cursor-pointer" onClick={() => handleViewDetails(order)}>{order.id}</td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div>{order.customer_name || order.user?.firstName + ' ' + order.user?.lastName}</div>
        <div className="text-xs text-gray-500">{order.customer_email || order.user?.email}</div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
      <td className="px-5 py-4 whitespace-nowrap text-gray-500">{order.total_amount.toFixed(2)} CAD</td>
      <td className="px-5 py-4 whitespace-nowrap">
        {editingStatusOrderId === order.id ? (
          <select
            value={order.status}
            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
            onBlur={() => setEditingStatusOrderId(null)} // Close on blur
            autoFocus
            className={`p-1 text-xs rounded-md border-gray-300 focus:ring-brand-green focus:border-brand-green ${statusColors[order.status]}`}
          >
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        ) : (
          <span
            onClick={() => setEditingStatusOrderId(order.id)}
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${statusColors[order.status]}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        )}
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
        <button onClick={() => handleViewDetails(order)} className="text-indigo-600 hover:text-indigo-900" title="Voir Détails">
          <Eye size={18} />
        </button>
        {/* Add other actions like Edit or Cancel if applicable */}
      </td>
    </tr>
  );


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold text-neutral-gray-darker flex items-center">
        <ShoppingCart size={28} className="mr-3 text-brand-green" />
        Gestion des Commandes
      </h1>

      {/* Filters Section */}
      <div className="p-4 bg-white rounded-lg shadow space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 md:items-end">
        <div className="md:col-span-3">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input type="text" name="search" id="search" value={filters.search} onChange={handleFilterChange} placeholder="ID Commande, Nom, Email..." className="w-full text-sm input-style"/>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="w-full text-sm input-style">
            <option value="all">Tous</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">Date (De)</label>
          <input type="date" name="dateFrom" id="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="w-full text-sm input-style"/>
        </div>
        <div className="md:col-span-3">
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">Date (À)</label>
          <input type="date" name="dateTo" id="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="w-full text-sm input-style"/>
        </div>
        <div className="md:col-span-1">
          <button onClick={applyFilters} className="w-full bg-brand-green text-white px-3 py-2 text-sm rounded-md hover:bg-green-700 flex items-center justify-center">
            <FilterIcon size={16} className="mr-1 sm:mr-2"/> Filtrer
          </button>
        </div>
      </div>
      <style jsx>{`.input-style { box-shadow: sm; border-width: 1px; border-color: #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem;} .input-style:focus { --tw-ring-color: #10B981; border-color: #10B981; }`}</style>


      {/* Orders Table */}
      {isLoading && <p className="text-center py-4">Chargement des commandes...</p>}
      {error && <p className="text-center py-4 text-red-500">Erreur: {error}</p>}
      {!isLoading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Client', 'Date', 'Total', 'Statut', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? orders.map(order => <OrderRow key={order.id} order={order} />)
                                 : <tr><td colSpan={6} className="text-center py-10 text-gray-500">Aucune commande trouvée pour les filtres actuels.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button onClick={() => fetchOrders(pagination.page - 1, filters)} disabled={pagination.page === 1}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Précédent</button>
          <span>Page {pagination.page} sur {pagination.totalPages} (Total: {pagination.totalItems})</span>
          <button onClick={() => fetchOrders(pagination.page + 1, filters)} disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Suivant</button>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title={`Détails Commande #${selectedOrder?.id}`} size="xl">
        {selectedOrder ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Client:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_email})</div>
                <div><strong>Téléphone:</strong> {selectedOrder.customer_phone || 'N/A'}</div>
                <div><strong>Date Commande:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                <div><strong>Montant Total:</strong> {selectedOrder.total_amount.toFixed(2)} CAD</div>
                <div><strong>Statut Actuel:</strong>
                    <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedOrder.status]}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                </div>
            </div>
            {selectedOrder.shipping_address && (typeof selectedOrder.shipping_address === 'object') &&
                <div><strong>Adresse Livraison:</strong> {`${selectedOrder.shipping_address.street}, ${selectedOrder.shipping_address.city}, ${selectedOrder.shipping_address.postalCode}`}</div>}
            {selectedOrder.notes && <div><strong>Notes:</strong> <p className="whitespace-pre-wrap bg-gray-50 p-2 rounded-md">{selectedOrder.notes}</p></div>}

            <h4 className="font-semibold mt-3 pt-3 border-t">Articles Commandés:</h4>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <ul className="divide-y">
                {selectedOrder.items.map(item => (
                  <li key={item.id} className="py-2 flex justify-between">
                    <span>{item.quantity} x {item.dish_name}</span>
                    <span>{(item.quantity * item.price_per_item).toFixed(2)} CAD</span>
                  </li>
                ))}
              </ul>
            ) : <p>Aucun article trouvé pour cette commande.</p>}
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowDetailsModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Fermer</button>
            </div>
          </div>
        ) : <p>Chargement des détails...</p>}
      </Modal>
    </div>
  );
};

export default AdminOrderManagementPage;
