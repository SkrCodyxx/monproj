import React from 'react';
import { Loader2 } from 'lucide-react';

const SuspenseFallback: React.FC<{ message?: string }> = ({ message = "Chargement de la page..." }) => {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] min-h-[200px] text-center"> {/* Adjust height as needed */}
      <Loader2 className="animate-spin h-12 w-12 text-brand-orange mb-4" />
      <p className="text-lg text-neutral-gray-dark">{message}</p>
    </div>
  );
};

export default SuspenseFallback;
