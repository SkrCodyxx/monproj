import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Image as ImageIcon, PlusCircle, Edit, Trash2, ArrowLeft, Film, ThumbsUp, ShieldQuestion } from 'lucide-react';
import toast from 'react-hot-toast';
import { GalleryAlbum, GalleryImage } from '../../../src/types'; // Adjusted path

// --- Mock API Client ---
const apiClient = {
  get: async (url: string, config?: { params?: any }) => {
    console.log(`SIMULATE GET: ${url}`, config?.params);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (url === '/gallery-albums') {
      const mockAlbums: GalleryAlbum[] = Array.from({length: 4}, (_, i) => ({
        id: `album_${i+1}`, name: `Album Événement ${i+1}`, description: `Description de l'album ${i+1}`,
        cover_image_url: `https://via.placeholder.com/300x200/FFA500/FFFFFF?Text=Album+${i+1}`,
        image_count: Math.floor(Math.random() * 15) + 5,
        created_at: new Date().toISOString()
      }));
      return { data: mockAlbums };
    }
    if (url.includes('/images')) { // e.g., /gallery-albums/album_1/images
      const albumId = url.split('/')[2];
      const page = config?.params?.page || 1;
      const pageSize = config?.params?.pageSize || 8;
      const mockImages: GalleryImage[] = Array.from({length: 12}, (_, i) => ({
        id: `img_${albumId}_${i+1}`, album_id: albumId!,
        image_url: `https://via.placeholder.com/150/008000/FFFFFF?Text=Image+${i+1}`,
        caption: `Belle image ${i+1} de l'album ${albumId}`, sort_order: i,
        created_at: new Date().toISOString()
      }));
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        data: {
          data: mockImages.slice(start, end),
          pagination: { page, pageSize, totalItems: mockImages.length, totalPages: Math.ceil(mockImages.length / pageSize) }
        }
      };
    }
    return { data: {} };
  },
  post: async (url: string, data: any) => {
    console.log(`SIMULATE POST: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (url === '/gallery-albums') return { data: { message: 'Album créé!', album: { id: `album_${Date.now()}`, ...data, image_count: 0 } } };
    if (url.includes('/images')) return { data: { message: 'Image ajoutée!', image: { id: `img_${Date.now()}`, ...data } } };
    return { data: {} };
  },
  put: async (url: string, data: any) => {
    console.log(`SIMULATE PUT: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const id = url.split('/').pop();
    if (url.includes('/gallery-albums/')) return { data: { message: 'Album mis à jour!', album: { id, ...data } } };
    if (url.includes('/gallery-images/')) return { data: { message: 'Image mise à jour!', image: { id, ...data } } };
    return { data: {} };
  },
  delete: async (url: string) => {
    console.log(`SIMULATE DELETE: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: { message: 'Élément supprimé!' } };
  }
};
// --- End Mock API Client ---

// --- Modal Component (Simplified) ---
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl'; }
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;
  const sizeClasses: Record<string,string> = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className={`relative bg-white p-5 sm:p-7 rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-auto`}>
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button></div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};
// --- End Modal Component ---

type AlbumFormData = Omit<GalleryAlbum, 'id' | 'created_at' | 'updated_at' | 'image_count'>;
type ImageFormData = Omit<GalleryImage, 'id' | 'album_id' | 'created_at' | 'updated_at'>;

const AdminGalleryManagementPage: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);

  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imagePagination, setImagePagination] = useState({ page: 1, pageSize: 8, totalItems: 0, totalPages: 1 });

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [albumFormData, setAlbumFormData] = useState<AlbumFormData>({ name: '', description: '', cover_image_url: '' });

  const [showImageModal, setShowImageModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [imageFormData, setImageFormData] = useState<ImageFormData>({ image_url: '', caption: '', sort_order: 0 });

  const fetchAlbums = useCallback(async () => {
    setIsLoadingAlbums(true);
    try {
      const response = await apiClient.get('/gallery-albums');
      setAlbums(response.data || []);
    } catch (error) { toast.error('Erreur chargement albums.'); }
    finally { setIsLoadingAlbums(false); }
  }, []);

  const fetchImagesForAlbum = useCallback(async (albumId: string, page = 1) => {
    if (!albumId) return;
    setIsLoadingImages(true);
    try {
      const response = await apiClient.get(`/gallery-albums/${albumId}/images`, { params: { page, pageSize: imagePagination.pageSize } });
      setImages(response.data.data || []);
      setImagePagination(response.data.pagination || { ...imagePagination, totalItems: 0, totalPages: 1, page });
    } catch (error) { toast.error('Erreur chargement images.'); }
    finally { setIsLoadingImages(false); }
  }, [imagePagination.pageSize]);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  useEffect(() => {
    if (selectedAlbum) {
      fetchImagesForAlbum(selectedAlbum.id, 1); // Reset to page 1 when album changes
    } else {
      setImages([]); // Clear images if no album selected
    }
  }, [selectedAlbum, fetchImagesForAlbum]);


  // Album CRUD
  const handleOpenAlbumModal = (album: GalleryAlbum | null = null) => {
    setEditingAlbum(album);
    setAlbumFormData(album ? { name: album.name, description: album.description, cover_image_url: album.cover_image_url } : { name: '', description: '', cover_image_url: '' });
    setShowAlbumModal(true);
  };
  const handleAlbumFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAlbumFormData({ ...albumFormData, [e.target.name]: e.target.value });
  const handleSaveAlbum = async () => {
    if (!albumFormData.name) { toast.error("Nom de l'album requis."); return; }
    const apiCall = editingAlbum ? apiClient.put(`/gallery-albums/${editingAlbum.id}`, albumFormData) : apiClient.post('/gallery-albums', albumFormData);
    const toastId = toast.loading(editingAlbum ? 'Mise à jour...' : 'Création...');
    try {
      await apiCall;
      toast.success(`Album ${editingAlbum ? 'mis à jour' : 'créé'}!`, {id: toastId});
      setShowAlbumModal(false); fetchAlbums();
    } catch (error) { toast.error('Erreur sauvegarde album.', {id: toastId}); }
  };
  const handleDeleteAlbum = async (albumId: string) => {
    if (window.confirm("Supprimer cet album? Toutes les images associées seront aussi supprimées.")) {
      const toastId = toast.loading('Suppression...');
      try {
        await apiClient.delete(`/gallery-albums/${albumId}`);
        toast.success('Album supprimé!', {id: toastId});
        fetchAlbums();
        if(selectedAlbum?.id === albumId) setSelectedAlbum(null); // Clear selection if deleted
      } catch (error) { toast.error('Erreur suppression album.', {id: toastId}); }
    }
  };

  // Image CRUD
  const handleOpenImageModal = (image: GalleryImage | null = null) => {
    if (!selectedAlbum) return; // Should not happen if button is only enabled when album selected
    setEditingImage(image);
    setImageFormData(image ? { image_url: image.image_url, caption: image.caption, sort_order: image.sort_order } : { image_url: '', caption: '', sort_order: 0 });
    setShowImageModal(true);
  };
  const handleImageFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    setImageFormData({ ...imageFormData, [name]: type === 'number' ? parseInt(value) : value });
  };
  const handleSaveImage = async () => {
    if (!selectedAlbum || !imageFormData.image_url) { toast.error("URL de l'image requise."); return; }
    const apiCall = editingImage
      ? apiClient.put(`/gallery-images/${editingImage.id}`, imageFormData)
      : apiClient.post(`/gallery-albums/${selectedAlbum.id}/images`, imageFormData);
    const toastId = toast.loading(editingImage ? 'Mise à jour...' : 'Ajout...');
    try {
      await apiCall;
      toast.success(`Image ${editingImage ? 'mise à jour' : 'ajoutée'}!`, {id: toastId});
      setShowImageModal(false); fetchImagesForAlbum(selectedAlbum.id, imagePagination.page); fetchAlbums(); // Refresh album image count
    } catch (error) { toast.error('Erreur sauvegarde image.', {id: toastId}); }
  };
  const handleDeleteImage = async (imageId: string) => {
    if (window.confirm("Supprimer cette image?")) {
      const toastId = toast.loading('Suppression...');
      try {
        await apiClient.delete(`/gallery-images/${imageId}`);
        toast.success('Image supprimée!', {id: toastId});
        if(selectedAlbum) fetchImagesForAlbum(selectedAlbum.id, imagePagination.page); fetchAlbums(); // Refresh album image count
      } catch (error) { toast.error('Erreur suppression image.', {id: toastId}); }
    }
  };

  const handleImagePageChange = (newPage: number) => {
    if (selectedAlbum && newPage > 0 && newPage <= imagePagination.totalPages) {
      fetchImagesForAlbum(selectedAlbum.id, newPage);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-neutral-gray-darker flex items-center">
          <Film size={32} className="mr-3 text-brand-green" /> Gestion de la Galerie
        </h1>
        {!selectedAlbum && (
            <button onClick={() => handleOpenAlbumModal()} className="bg-green-500 text-white px-4 py-2 text-sm rounded-md hover:bg-green-600 flex items-center">
                <PlusCircle size={18} className="mr-2" /> Ajouter un Album
            </button>
        )}
      </div>

      {/* Album List View */}
      {!selectedAlbum && (
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-neutral-gray-darker mb-4">Albums</h2>
          {isLoadingAlbums ? <p>Chargement des albums...</p> : albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map(album => (
                <div key={album.id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                  <img src={album.cover_image_url || `https://via.placeholder.com/300x200/CCCCCC/FFFFFF?Text=${album.name}`} alt={album.name} className="w-full h-40 object-cover"/>
                  <div className="p-3">
                    <h3 className="font-semibold text-brand-green truncate" title={album.name}>{album.name}</h3>
                    <p className="text-xs text-gray-500 truncate" title={album.description}>{album.description || 'Pas de description'}</p>
                    <p className="text-xs text-gray-500">{album.image_count || 0} image(s)</p>
                    <div className="mt-2 pt-2 border-t space-x-2 flex justify-end">
                      <button onClick={() => setSelectedAlbum(album)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Gérer Images</button>
                      <button onClick={() => handleOpenAlbumModal(album)} className="text-xs text-yellow-600 hover:underline"><Edit size={14}/></button>
                      <button onClick={() => handleDeleteAlbum(album.id)} className="text-xs text-red-600 hover:underline"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p>Aucun album. Créez-en un!</p>}
        </section>
      )}

      {/* Images View (for selected album) */}
      {selectedAlbum && (
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setSelectedAlbum(null)} className="text-brand-green hover:underline flex items-center text-sm">
              <ArrowLeft size={18} className="mr-1" /> Retour aux Albums
            </button>
            <h2 className="text-xl font-semibold text-neutral-gray-darker truncate" title={selectedAlbum.name}>Images de: {selectedAlbum.name}</h2>
            <button onClick={() => handleOpenImageModal()} className="bg-green-500 text-white px-4 py-2 text-sm rounded-md hover:bg-green-600 flex items-center">
              <PlusCircle size={18} className="mr-2" /> Ajouter Image
            </button>
          </div>
          {isLoadingImages ? <p>Chargement des images...</p> : images.length > 0 ? (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map(image => (
                <div key={image.id} className="border rounded-lg overflow-hidden shadow group relative">
                  <img src={image.image_url} alt={image.caption || 'Gallery image'} className="w-full h-32 object-cover"/>
                  {image.caption && <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate group-hover:whitespace-normal group-hover:overflow-visible" title={image.caption}>{image.caption}</p>}
                  <div className="absolute top-1 right-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenImageModal(image)} className="p-1 bg-white bg-opacity-75 rounded text-yellow-600 hover:bg-opacity-100"><Edit size={14}/></button>
                    <button onClick={() => handleDeleteImage(image.id)} className="p-1 bg-white bg-opacity-75 rounded text-red-600 hover:bg-opacity-100"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            {/* Image Pagination */}
            {imagePagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-xs">
                    <button onClick={() => handleImagePageChange(imagePagination.page - 1)} disabled={imagePagination.page === 1}
                            className="px-3 py-1 font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Précédent</button>
                    <span>Page {imagePagination.page} / {imagePagination.totalPages}</span>
                    <button onClick={() => handleImagePageChange(imagePagination.page + 1)} disabled={imagePagination.page === imagePagination.totalPages}
                            className="px-3 py-1 font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Suivant</button>
                </div>
            )}
            </>
          ) : <p>Aucune image dans cet album. Ajoutez-en!</p>}
        </section>
      )}

      {/* Album Modal */}
      <Modal isOpen={showAlbumModal} onClose={() => setShowAlbumModal(false)} title={editingAlbum ? "Modifier Album" : "Ajouter Album"}>
        <form onSubmit={e => {e.preventDefault(); handleSaveAlbum();}} className="space-y-3">
          <div><label htmlFor="albumName" className="block text-sm font-medium">Nom</label><input type="text" name="name" id="albumName" value={albumFormData.name} onChange={handleAlbumFormChange} required className="mt-1 w-full input-style"/></div>
          <div><label htmlFor="albumDesc" className="block text-sm font-medium">Description</label><textarea name="description" id="albumDesc" value={albumFormData.description || ''} onChange={handleAlbumFormChange} rows={3} className="mt-1 w-full input-style"></textarea></div>
          <div><label htmlFor="albumCover" className="block text-sm font-medium">URL Image Couverture</label><input type="url" name="cover_image_url" id="albumCover" value={albumFormData.cover_image_url || ''} onChange={handleAlbumFormChange} className="mt-1 w-full input-style"/></div>
          <div className="flex justify-end space-x-2 pt-2"><button type="button" onClick={() => setShowAlbumModal(false)} className="btn-secondary-outline">Annuler</button><button type="submit" className="btn-primary">Enregistrer</button></div>
        </form>
      </Modal>

      {/* Image Modal */}
      <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)} title={editingImage ? "Modifier Image" : "Ajouter Image"}>
         <form onSubmit={e => {e.preventDefault(); handleSaveImage();}} className="space-y-3">
          <div><label htmlFor="imageUrl" className="block text-sm font-medium">URL de l'Image</label><input type="url" name="image_url" id="imageUrl" value={imageFormData.image_url} onChange={handleImageFormChange} required className="mt-1 w-full input-style"/></div>
          <div><label htmlFor="imageCaption" className="block text-sm font-medium">Légende <span className="text-xs">(Optionnel)</span></label><textarea name="caption" id="imageCaption" value={imageFormData.caption || ''} onChange={handleImageFormChange} rows={2} className="mt-1 w-full input-style"></textarea></div>
          <div><label htmlFor="imageSortOrder" className="block text-sm font-medium">Ordre de Tri <span className="text-xs">(Optionnel)</span></label><input type="number" name="sort_order" id="imageSortOrder" value={imageFormData.sort_order || 0} onChange={handleImageFormChange} className="mt-1 w-full input-style"/></div>
          <div className="flex justify-end space-x-2 pt-2"><button type="button" onClick={() => setShowImageModal(false)} className="btn-secondary-outline">Annuler</button><button type="submit" className="btn-primary">Enregistrer Image</button></div>
        </form>
      </Modal>
      <style jsx>{`
        .input-style { box-shadow: sm; border-width: 1px; border-color: #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem;}
        .input-style:focus { --tw-ring-color: #10B981; border-color: #10B981; }
        .btn-primary { background-color: #10B981; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; }
        .btn-primary:hover { background-color: #059669; }
        .btn-secondary-outline { border: 1px solid #D1D5DB; color: #374151; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; }
        .btn-secondary-outline:hover { background-color: #F3F4F6; }
      `}</style>
    </div>
  );
};

export default AdminGalleryManagementPage;
