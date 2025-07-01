import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UtensilsCrossed, PlusCircle, Edit, Trash2, Search, Filter, Image as ImageIcon, DollarSign, Tag, Eye, EyeOff, ListPlus, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Category, Dish } from '../../../src/types'; // Adjusted path

// Mock API client for simulation (same as UserManagement for now, expand as needed)
const apiClient = {
  get: async (url: string, params?: any) => {
    console.log(`SIMULATE GET: ${url}`, params);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (url === '/categories') {
      const mockCategories: Category[] = [
        { id: 'cat1', name: 'Plats Principaux', description: 'Nos spécialités copieuses.' },
        { id: 'cat2', name: 'Accompagnements', description: 'Pour compléter vos plats.' },
        { id: 'cat3', name: 'Boissons', description: 'Rafraîchissements et plus.' },
        { id: 'cat4', name: 'Desserts', description: 'Douceurs sucrées pour finir en beauté.'}
      ];
      return { data: mockCategories };
    }
    if (url === '/dishes') {
      const page = params?.params?.page || 1;
      const pageSize = params?.params?.pageSize || 5;
      const category_id = params?.params?.category_id;

      let mockDishes: Dish[] = Array.from({ length: 18 }, (_, i) => ({
        id: `dish_${i + 1}`,
        category_id: `cat${(i % 4) + 1}`, // Distribute among 4 categories
        category_name: `CatName${(i % 4) + 1}`, // Will be replaced by actual join
        name: `Plat Délicieux ${i + 1}`,
        description: `Description savoureuse du plat numéro ${i + 1}. Avec des ingrédients frais et locaux.`,
        price: parseFloat((10 + Math.random() * 20).toFixed(2)),
        image_url: `https://via.placeholder.com/150/FFD700/000000?Text=Plat${i+1}`,
        allergens: i % 3 === 0 ? 'Gluten, Noix' : (i % 3 === 1 ? 'Laitages' : undefined),
        is_available: i % 5 !== 0,
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      }));

      if (category_id && category_id !== 'all') {
        mockDishes = mockDishes.filter(d => d.category_id === category_id);
      }

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        data: {
          data: mockDishes.slice(start, end),
          pagination: { page, pageSize, totalItems: mockDishes.length, totalPages: Math.ceil(mockDishes.length / pageSize) }
        }
      };
    }
    return { data: {} };
  },
  post: async (url: string, data: any) => {
    console.log(`SIMULATE POST: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (url === '/categories') return { data: { message: 'Catégorie ajoutée!', category: { id: `cat${Date.now()}`, ...data } } };
    if (url === '/dishes') return { data: { message: 'Plat ajouté!', dish: { id: `dish${Date.now()}`, ...data } } };
    return { data: {} };
  },
  put: async (url: string, data: any) => {
    console.log(`SIMULATE PUT: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const id = url.split('/').pop();
    if (url.includes('/categories/')) return { data: { message: 'Catégorie mise à jour!', category: { id, ...data } } };
    if (url.includes('/dishes/')) return { data: { message: 'Plat mis à jour!', dish: { id, ...data } } };
    return { data: {} };
  },
  delete: async (url: string) => {
    console.log(`SIMULATE DELETE: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: { message: 'Élément supprimé!' } };
  }
};

// --- Modal Component ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white p-5 sm:p-7 rounded-lg shadow-xl w-full max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-neutral-gray-darker">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
// --- End Modal Component ---


// Category Form Data and Schema (simplified)
interface CategoryFormData {
  name: string;
  description?: string;
}

// Dish Form Data and Schema (simplified)
interface DishFormData {
  name: string;
  description: string;
  price: number | string; // string from input, then parse
  category_id: string;
  image_url?: string;
  allergens?: string;
  is_available: boolean;
}

const AdminMenuManagementPage: React.FC = () => {
  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({ name: '', description: '' });

  // Dishes State
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);
  const [dishPagination, setDishPagination] = useState({ page: 1, pageSize: 5, totalItems: 0, totalPages: 1 });
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishFormData, setDishFormData] = useState<DishFormData>({ name: '', description: '', price: '', category_id: '', is_available: true });
  const [dishFilterCategory, setDishFilterCategory] = useState<string>('all');
  const [dishSearchTerm, setDishSearchTerm] = useState('');


  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data || []);
    } catch (error) { toast.error('Erreur chargement catégories.'); }
    finally { setIsLoadingCategories(false); }
  }, []);

  const fetchDishes = useCallback(async (page = 1, categoryId = dishFilterCategory) => {
    setIsLoadingDishes(true);
    try {
      const params: any = { page, pageSize: dishPagination.pageSize };
      if (categoryId !== 'all') params.category_id = categoryId;
      // Add search term to params if API supports it
      // if (dishSearchTerm) params.search = dishSearchTerm;

      const response = await apiClient.get('/dishes', { params });
      setDishes(response.data.data || []);
      setDishPagination(response.data.pagination || { ...dishPagination, totalItems: 0, totalPages:1, page });
    } catch (error) { toast.error('Erreur chargement plats.'); }
    finally { setIsLoadingDishes(false); }
  }, [dishPagination.pageSize, dishFilterCategory /*, dishSearchTerm */]); // Add dishSearchTerm if API supports it

  useEffect(() => {
    fetchCategories();
    fetchDishes(1, dishFilterCategory); // Initial fetch for dishes
  }, [fetchCategories, fetchDishes, dishFilterCategory]); // Fetch dishes when filter changes


  // Category Modal & CRUD
  const handleOpenCategoryModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setCategoryFormData(category ? { name: category.name, description: category.description } : { name: '', description: '' });
    setShowCategoryModal(true);
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCategoryFormData({ ...categoryFormData, [e.target.name]: e.target.value });
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name) {
      toast.error("Le nom de la catégorie est requis.");
      return;
    }
    const apiCall = editingCategory
      ? apiClient.put(`/categories/${editingCategory.id}`, categoryFormData)
      : apiClient.post('/categories', categoryFormData);

    const toastId = toast.loading(editingCategory ? 'Mise à jour...' : 'Ajout...');
    try {
      await apiCall;
      toast.success(`Catégorie ${editingCategory ? 'mise à jour' : 'ajoutée'}!`, {id: toastId});
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error) { toast.error('Erreur sauvegarde catégorie.', {id: toastId}); }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Supprimer cette catégorie? Ceci pourrait affecter les plats associés.")) {
      const toastId = toast.loading('Suppression...');
      try {
        await apiClient.delete(`/categories/${categoryId}`);
        toast.success('Catégorie supprimée!', {id: toastId});
        fetchCategories();
        fetchDishes(1, 'all'); // Refresh dishes in case some were in this category
      } catch (error) { toast.error('Erreur suppression catégorie.', {id: toastId}); }
    }
  };

  // Dish Modal & CRUD
  const handleOpenDishModal = (dish: Dish | null = null) => {
    setEditingDish(dish);
    setDishFormData(dish ? {
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category_id: dish.category_id,
        image_url: dish.image_url,
        allergens: dish.allergens,
        is_available: dish.is_available,
      } : { name: '', description: '', price: '', category_id: categories[0]?.id || '', is_available: true });
    setShowDishModal(true);
  };

  const handleDishFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = e.target.checked; // For checkbox
    setDishFormData({ ...dishFormData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSaveDish = async () => {
    if (!dishFormData.name || !dishFormData.category_id || !dishFormData.price) {
      toast.error("Nom, catégorie et prix sont requis pour un plat.");
      return;
    }
    const payload = { ...dishFormData, price: parseFloat(String(dishFormData.price)) };

    const apiCall = editingDish
      ? apiClient.put(`/dishes/${editingDish.id}`, payload)
      : apiClient.post('/dishes', payload);

    const toastId = toast.loading(editingDish ? 'Mise à jour...' : 'Ajout...');
    try {
      await apiCall;
      toast.success(`Plat ${editingDish ? 'mis à jour' : 'ajouté'}!`, {id: toastId});
      setShowDishModal(false);
      fetchDishes(dishPagination.page, dishFilterCategory);
    } catch (error) { toast.error('Erreur sauvegarde plat.', {id: toastId}); }
  };

  const handleDeleteDish = async (dishId: string) => {
    if (window.confirm("Supprimer ce plat?")) {
      const toastId = toast.loading('Suppression...');
      try {
        await apiClient.delete(`/dishes/${dishId}`);
        toast.success('Plat supprimé!', {id: toastId});
        fetchDishes(dishPagination.page, dishFilterCategory);
      } catch (error) { toast.error('Erreur suppression plat.', {id: toastId}); }
    }
  };

  const handleDishPageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= dishPagination.totalPages) {
      fetchDishes(newPage, dishFilterCategory);
    }
  };

  // Filtered dishes for display (client-side search on current page)
  const displayedDishes = useMemo(() => {
      if (!dishSearchTerm) return dishes;
      return dishes.filter(dish =>
          dish.name.toLowerCase().includes(dishSearchTerm.toLowerCase()) ||
          dish.description.toLowerCase().includes(dishSearchTerm.toLowerCase())
      );
  }, [dishes, dishSearchTerm]);


  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <UtensilsCrossed size={32} className="mr-3 text-brand-green" />
        <h1 className="text-3xl font-serif font-bold text-neutral-gray-darker">Gestion du Menu</h1>
      </div>

      {/* Categories Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-gray-darker flex items-center"><ListPlus className="mr-2" /> Catégories</h2>
          <button onClick={() => handleOpenCategoryModal()} className="bg-green-500 text-white px-4 py-2 text-sm rounded-md hover:bg-green-600 flex items-center">
            <PlusCircle size={18} className="mr-2" /> Ajouter Catégorie
          </button>
        </div>
        {isLoadingCategories ? <p>Chargement des catégories...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="p-3 border rounded-md shadow-sm bg-gray-50">
                <h3 className="font-semibold text-brand-green">{cat.name}</h3>
                {cat.description && <p className="text-xs text-gray-600 mt-1 truncate">{cat.description}</p>}
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleOpenCategoryModal(cat)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-500 col-span-full">Aucune catégorie trouvée.</p>}
          </div>
        )}
      </section>

      {/* Dishes Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-gray-darker mb-3 sm:mb-0 flex items-center"><UtensilsCrossed className="mr-2" /> Plats du Menu</h2>
          <button onClick={() => handleOpenDishModal()}  className="bg-green-500 text-white px-4 py-2 text-sm rounded-md hover:bg-green-600 flex items-center">
            <PlusCircle size={18} className="mr-2" /> Ajouter un Plat
          </button>
        </div>
        {/* Dish Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="dishSearchTerm" className="block text-sm font-medium text-gray-700 mb-1">Rechercher un plat</label>
                <div className="relative">
                <input type="text" id="dishSearchTerm" placeholder="Nom, description..." value={dishSearchTerm} onChange={e => setDishSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"/>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
            </div>
            <div>
                <label htmlFor="dishFilterCategory" className="block text-sm font-medium text-gray-700 mb-1">Filtrer par catégorie</label>
                <select id="dishFilterCategory" value={dishFilterCategory} onChange={e => { setDishFilterCategory(e.target.value); fetchDishes(1, e.target.value);}}
                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm">
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
        </div>

        {isLoadingDishes ? <p>Chargement des plats...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispo.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedDishes.map(dish => (
                  <tr key={dish.id}>
                    <td className="px-4 py-3"><img src={dish.image_url || `https://via.placeholder.com/60/E0E0E0/909090?Text=PasDimage`} alt={dish.name} className="h-12 w-12 object-cover rounded"/></td>
                    <td className="px-4 py-3 font-medium text-gray-900">{dish.name}</td>
                    <td className="px-4 py-3 text-gray-500">{categories.find(c=>c.id === dish.category_id)?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-500">{dish.price.toFixed(2)} CAD</td>
                    <td className="px-4 py-3">
                      <span className={`p-1.5 text-xs font-medium rounded-full ${dish.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {dish.is_available ? <Eye size={14}/> : <EyeOff size={14}/>}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => handleOpenDishModal(dish)} className="text-blue-600 hover:text-blue-800 mr-2" title="Modifier"><Edit size={16}/></button>
                      <button onClick={() => handleDeleteDish(dish.id)} className="text-red-600 hover:text-red-800" title="Supprimer"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {displayedDishes.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-500">Aucun plat trouvé pour les filtres actuels.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {/* Dish Pagination */}
        {!isLoadingDishes && dishPagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
                <button onClick={() => handleDishPageChange(dishPagination.page - 1)} disabled={dishPagination.page === 1}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Précédent</button>
                <span className="text-xs text-gray-600">Page {dishPagination.page} sur {dishPagination.totalPages}</span>
                <button onClick={() => handleDishPageChange(dishPagination.page + 1)} disabled={dishPagination.page === dishPagination.totalPages}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Suivant</button>
            </div>
        )}
      </section>

      {/* Category Modal */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title={editingCategory ? "Modifier Catégorie" : "Ajouter Catégorie"}>
        <div className="space-y-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Nom</label>
            <input type="text" name="name" id="categoryName" value={categoryFormData.name} onChange={handleCategoryFormChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green sm:text-sm" />
          </div>
          <div>
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700">Description <span className="text-xs text-gray-500">(Optionnel)</span></label>
            <textarea name="description" id="categoryDescription" value={categoryFormData.description} onChange={handleCategoryFormChange} rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green sm:text-sm"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Annuler</button>
            <button type="button" onClick={handleSaveCategory} className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md">Enregistrer</button>
          </div>
        </div>
      </Modal>

      {/* Dish Modal */}
      <Modal isOpen={showDishModal} onClose={() => setShowDishModal(false)} title={editingDish ? "Modifier Plat" : "Ajouter Plat"}>
        <form onSubmit={e => { e.preventDefault(); handleSaveDish(); }} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="dishName" className="block text-sm font-medium text-gray-700">Nom du Plat</label>
            <input type="text" name="name" id="dishName" value={dishFormData.name} onChange={handleDishFormChange} required
                   className="mt-1 block w-full input-style"/>
          </div>
          <div>
            <label htmlFor="dishCategoryId" className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select name="category_id" id="dishCategoryId" value={dishFormData.category_id} onChange={handleDishFormChange} required
                    className="mt-1 block w-full input-style">
              <option value="" disabled>Sélectionner une catégorie</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="dishPrice" className="block text-sm font-medium text-gray-700">Prix (CAD)</label>
            <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="h-4 w-4 text-gray-400"/></div>
                <input type="number" name="price" id="dishPrice" value={dishFormData.price} onChange={handleDishFormChange} required step="0.01"
                    className="block w-full pl-9 input-style"/>
            </div>
          </div>
          <div>
            <label htmlFor="dishDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="dishDescription" value={dishFormData.description} onChange={handleDishFormChange} required rows={3}
                      className="mt-1 block w-full input-style"></textarea>
          </div>
          <div>
            <label htmlFor="dishImageUrl" className="block text-sm font-medium text-gray-700">URL de l'image <span className="text-xs text-gray-500">(Optionnel)</span></label>
            <input type="url" name="image_url" id="dishImageUrl" value={dishFormData.image_url} onChange={handleDishFormChange}
                   className="mt-1 block w-full input-style"/>
          </div>
          <div>
            <label htmlFor="dishAllergens" className="block text-sm font-medium text-gray-700">Allergènes <span className="text-xs text-gray-500">(Optionnel, séparés par virgule)</span></label>
            <input type="text" name="allergens" id="dishAllergens" value={dishFormData.allergens} onChange={handleDishFormChange}
                   className="mt-1 block w-full input-style"/>
          </div>
          <div className="flex items-center pt-1">
            <input type="checkbox" name="is_available" id="dishIsAvailable" checked={dishFormData.is_available} onChange={handleDishFormChange}
                   className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"/>
            <label htmlFor="dishIsAvailable" className="ml-2 block text-sm text-gray-900">Disponible à la commande</label>
          </div>
          <style jsx>{`
            .input-style {
              box-shadow: sm;
              border-color: #D1D5DB; /* gray-300 */
              border-radius: 0.375rem; /* rounded-md */
              padding: 0.5rem 0.75rem; /* px-3 py-2 */
            }
            .input-style:focus {
              --tw-ring-color: #10B981; /* brand-green, adjust if needed */
              border-color: #10B981; /* brand-green */
            }
          `}</style>
          <div className="flex justify-end space-x-3 pt-3">
            <button type="button" onClick={() => setShowDishModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Annuler</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md">Enregistrer Plat</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

// Helper for XIcon if not directly imported from lucide-react
const XIcon: React.FC<{size: number}> = ({size}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


export default AdminMenuManagementPage;
