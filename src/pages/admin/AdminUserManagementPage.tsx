import React, { useState, useEffect, useMemo } from 'react';
import { Users, Edit, ToggleLeft, ToggleRight, Search, Filter, ChevronDown, ChevronUp, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '../../../src/types'; // Adjusted path
// import apiClient from '../../lib/apiClient'; // For actual API calls

// Mock API client for simulation
const apiClient = {
  get: async (url: string, params?: any) => {
    console.log(`SIMULATE GET: ${url}`, params);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (url.startsWith('/users')) {
      // Simulate pagination and some users
      const page = params?.params?.page || 1;
      const pageSize = params?.params?.pageSize || 10;
      const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
        id: `usr_${i + 1}`,
        firstName: `UserFirstName${i + 1}`,
        lastName: `UserLastName${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 3 === 0 ? 'admin' : 'client',
        isActive: i % 4 !== 0,
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        phone: `555-01${String(i).padStart(2, '0')}`
      }));
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        data: {
          data: mockUsers.slice(start, end),
          pagination: { page, pageSize, totalItems: mockUsers.length, totalPages: Math.ceil(mockUsers.length / pageSize) }
        }
      };
    }
    return { data: {} };
  },
  put: async (url: string, data: any) => {
    console.log(`SIMULATE PUT: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate success, return updated user (mocked)
    const userId = url.split('/')[2]; // very naive ID extraction
    return { data: { message: 'Mise à jour réussie!', user: { id: userId, ...data } } };
  },
  patch: async (url: string, data: any) => {
    console.log(`SIMULATE PATCH: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate success, return updated user (mocked)
    const userId = url.split('/')[2]; // very naive ID extraction
    return { data: { message: 'Statut mis à jour!', user: { id: userId, isActive: data.isActive } } };
  }
};


interface UserManagementState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  searchTerm: string;
  roleFilter: string; // 'all', 'client', 'admin'
  statusFilter: string; // 'all', 'active', 'inactive'
  editingUser: User | null; // For Edit Role Modal
  activatingUser: User | null; // For Toggle Activation Modal/Confirmation
}

const initialPagination = { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 };

const AdminUserManagementPage: React.FC = () => {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    isLoading: true,
    error: null,
    pagination: initialPagination,
    searchTerm: '',
    roleFilter: 'all',
    statusFilter: 'all',
    editingUser: null,
    activatingUser: null,
  });

  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'admin'>('client');

  const fetchUsers = async (page = 1, pageSize = 10) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const response = await apiClient.get('/users', { params: { page, pageSize } });
      setState(s => ({
        ...s,
        users: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
        error: null
      }));
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message || 'Failed to fetch users' }));
      toast.error('Erreur lors de la récupération des utilisateurs.');
    }
  };

  useEffect(() => {
    fetchUsers(state.pagination.page, state.pagination.pageSize);
  }, [state.pagination.page, state.pagination.pageSize]); // Re-fetch on page/pageSize change

  const handleEditRole = (user: User) => {
    setState(s => ({ ...s, editingUser: user }));
    setSelectedRole(user.role || 'client');
    setShowEditRoleModal(true);
  };

  const submitEditRole = async () => {
    if (!state.editingUser) return;
    const toastId = toast.loading('Mise à jour du rôle...');
    try {
      await apiClient.put(`/users/${state.editingUser.id}/role`, { role: selectedRole });
      toast.success('Rôle mis à jour avec succès!', { id: toastId });
      setShowEditRoleModal(false);
      setState(s => ({ ...s, editingUser: null }));
      fetchUsers(state.pagination.page, state.pagination.pageSize); // Refresh list
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle.', { id: toastId });
    }
  };

  const handleToggleActivation = (user: User) => {
    // Simple confirm, could be a modal too
    if (window.confirm(`Êtes-vous sûr de vouloir ${user.isActive ? 'désactiver' : 'activer'} cet utilisateur (${user.email})?`)) {
      submitToggleActivation(user);
    }
  };

  const submitToggleActivation = async (user: User) => {
    const toastId = toast.loading(`${user.isActive ? 'Désactivation' : 'Activation'} en cours...`);
    try {
      await apiClient.patch(`/users/${user.id}/activation`, { isActive: !user.isActive });
      toast.success(`Utilisateur ${user.isActive ? 'désactivé' : 'activé'}!`, { id: toastId });
      fetchUsers(state.pagination.page, state.pagination.pageSize); // Refresh list
    } catch (error) {
      toast.error('Erreur lors du changement de statut.', { id: toastId });
    }
  };

  const filteredUsers = useMemo(() => {
    return state.users.filter(user => {
      const searchMatch = (user.firstName?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           user.lastName?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(state.searchTerm.toLowerCase()));
      const roleMatch = state.roleFilter === 'all' || user.role === state.roleFilter;
      const statusMatch = state.statusFilter === 'all' ||
                          (state.statusFilter === 'active' && user.isActive) ||
                          (state.statusFilter === 'inactive' && !user.isActive);
      return searchMatch && roleMatch && statusMatch;
    });
  }, [state.users, state.searchTerm, state.roleFilter, state.statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= state.pagination.totalPages) {
      setState(s => ({ ...s, pagination: { ...s.pagination, page: newPage } }));
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-serif font-bold text-neutral-gray-darker mb-4 sm:mb-0 flex items-center">
          <Users size={28} className="mr-3 text-brand-green" />
          Gestion des Utilisateurs
        </h1>
        <button className="bg-brand-green text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center text-sm">
            <UserPlus size={18} className="mr-2" /> Ajouter un Utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow">
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
          <div className="relative">
            <input
              type="text"
              id="searchTerm"
              placeholder="Nom, prénom, email..."
              value={state.searchTerm}
              onChange={(e) => setState(s => ({ ...s, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <select id="roleFilter" value={state.roleFilter} onChange={(e) => setState(s => ({ ...s, roleFilter: e.target.value }))}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm">
            <option value="all">Tous les rôles</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select id="statusFilter" value={state.statusFilter} onChange={(e) => setState(s => ({ ...s, statusFilter: e.target.value }))}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm">
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      {state.isLoading && <p className="text-center py-4">Chargement des utilisateurs...</p>}
      {state.error && <p className="text-center py-4 text-red-500">Erreur: {state.error}</p>}
      {!state.isLoading && !state.error && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Nom Complet', 'Email', 'Rôle', 'Statut', 'Inscrit le', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right font-medium">
                    <button onClick={() => handleEditRole(user)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Modifier le rôle">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleToggleActivation(user)}
                            className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={user.isActive ? 'Désactiver' : 'Activer'}>
                      {user.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                     {/* <button className="text-gray-400 hover:text-gray-600 ml-2" title="Supprimer (non implémenté)">
                        <Trash2 size={18} />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!state.isLoading && !state.error && state.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(state.pagination.page - 1)}
            disabled={state.pagination.page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-700">
            Page {state.pagination.page} sur {state.pagination.totalPages} (Total: {state.pagination.totalItems})
          </span>
          <button
            onClick={() => handlePageChange(state.pagination.page + 1)}
            disabled={state.pagination.page === state.pagination.totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && state.editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-neutral-gray-darker mb-4">Modifier le Rôle de {state.editingUser.email}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Nouveau Rôle</label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'client' | 'admin')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm rounded-md"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditRoleModal(false); setState(s => ({...s, editingUser: null})); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={submitEditRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-green hover:bg-green-700 rounded-md"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
