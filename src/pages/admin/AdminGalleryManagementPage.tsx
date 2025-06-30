import React from 'react';
import { Image } from 'lucide-react';

const AdminGalleryManagementPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-neutral-gray-darker mb-6 flex items-center">
        <Image size={28} className="mr-3 text-brand-green" />
        Gestion de la Galerie
      </h1>
      <p className="text-neutral-gray-dark">
        Section pour uploader des images, créer des albums, organiser les photos et gérer leur publication.
      </p>
      {/* Placeholder for image upload, album creation, etc. */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-500">Le contenu de la gestion de la galerie sera implémenté ici.</p>
      </div>
    </div>
  );
};

export default AdminGalleryManagementPage;
