import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserCircle, Edit3, ShieldCheck, Save, Loader2 } from 'lucide-react';
// import apiClient from '../../lib/apiClient'; // Will be used for actual API calls

// Schema for personal information update
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  lastName: z.string().min(2, "Le nom de famille doit contenir au moins 2 caractères."),
  email: z.string().email("Veuillez entrer une adresse email valide.").optional(), // Email might not be updatable by user directly
  phone: z.string().optional(), // Add regex for phone if needed
});
type PersonalInfoFormInputs = z.infer<typeof personalInfoSchema>;

// Schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis."),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas.",
  path: ["confirmNewPassword"],
});
type PasswordChangeFormInputs = z.infer<typeof passwordChangeSchema>;


const ProfilePage: React.FC = () => {
  const { user, login, isLoading: authLoading } = useAuth(); // Assuming login can update user in context

  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    reset: resetInfoForm,
    formState: { errors: errorsInfo, isSubmitting: isSubmittingInfo },
    setValue: setInfoValue,
  } = useForm<PersonalInfoFormInputs>({
    resolver: zodResolver(personalInfoSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordChangeFormInputs>({
    resolver: zodResolver(passwordChangeSchema),
  });

  useEffect(() => {
    if (user) {
      setInfoValue("firstName", user.firstName || "");
      setInfoValue("lastName", user.lastName || "");
      setInfoValue("email", user.email || "");
      // setInfoValue("phone", user.phone || ""); // Assuming user object has phone
    }
  }, [user, setInfoValue]);


  const onInfoSubmit: SubmitHandler<PersonalInfoFormInputs> = async (data) => {
    const toastId = toast.loading('Mise à jour des informations...');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await apiClient.put('/users/profile', data); // Or your actual API endpoint
      // const updatedUser = response.data.user;

      // For simulation:
      const updatedUser = { ...user, ...data } as any; // Type assertion for simulation

      login(updatedUser, localStorage.getItem('dcp-token') || ""); // Update context (token remains same)
      toast.success('Informations mises à jour avec succès!', { id: toastId });
      resetInfoForm(updatedUser); // Reset form with new values
    } catch (error: any) {
      // const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour.";
      const errorMessage = "Erreur lors de la mise à jour (simulation).";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const onPasswordSubmit: SubmitHandler<PasswordChangeFormInputs> = async (data) => {
    const toastId = toast.loading('Changement du mot de passe...');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await apiClient.put('/users/profile/password', {
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword,
      // });
      // toast.success(response.data.message || 'Mot de passe changé avec succès!', { id: toastId });

      toast.success('Mot de passe changé avec succès (simulation)!', { id: toastId });
      resetPasswordForm();
    } catch (error: any) {
      // const errorMessage = error.response?.data?.message || "Erreur lors du changement de mot de passe.";
      const errorMessage = "Erreur (simulation): Mot de passe actuel incorrect ou autre problème.";
      toast.error(errorMessage, { id: toastId });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center space-x-3">
        <UserCircle size={40} className="text-brand-orange" />
        <h1 className="text-3xl font-serif font-bold text-neutral-gray-darker">Mon Profil</h1>
      </div>

      {/* Personal Information Section */}
      <section className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <Edit3 size={24} className="text-brand-green" />
          <h2 className="text-2xl font-semibold text-neutral-gray-darker">Informations Personnelles</h2>
        </div>
        <form onSubmit={handleSubmitInfo(onInfoSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" id="firstName" {...registerInfo("firstName")}
                     className={`mt-1 block w-full px-3 py-2 border ${errorsInfo.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm`} />
              {errorsInfo.firstName && <p className="text-xs text-red-500 mt-1">{errorsInfo.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom de famille</label>
              <input type="text" id="lastName" {...registerInfo("lastName")}
                     className={`mt-1 block w-full px-3 py-2 border ${errorsInfo.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm`} />
              {errorsInfo.lastName && <p className="text-xs text-red-500 mt-1">{errorsInfo.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse Email</label>
            <input type="email" id="email" {...registerInfo("email")} readOnly disabled // Email usually not editable by user directly
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-500 mt-1">L'adresse email ne peut pas être modifiée.</p>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Numéro de téléphone <span className="text-xs text-gray-500">(Optionnel)</span></label>
            <input type="tel" id="phone" {...registerInfo("phone")}
                   className={`mt-1 block w-full px-3 py-2 border ${errorsInfo.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm`} />
            {errorsInfo.phone && <p className="text-xs text-red-500 mt-1">{errorsInfo.phone.message}</p>}
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isSubmittingInfo}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
              {isSubmittingInfo ? <Loader2 className="animate-spin h-5 w-5 mr-2"/> : <Save size={18} className="mr-2"/>}
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </section>

      {/* Change Password Section */}
      <section className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <ShieldCheck size={24} className="text-brand-green" />
          <h2 className="text-2xl font-semibold text-neutral-gray-darker">Changer le Mot de Passe</h2>
        </div>
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
            <input type="password" id="currentPassword" {...registerPassword("currentPassword")}
                   className={`mt-1 block w-full px-3 py-2 border ${errorsPassword.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm`} />
            {errorsPassword.currentPassword && <p className="text-xs text-red-500 mt-1">{errorsPassword.currentPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <input type="password" id="newPassword" {...registerPassword("newPassword")}
                   className={`mt-1 block w-full px-3 py-2 border ${errorsPassword.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm`} />
            {errorsPassword.newPassword && <p className="text-xs text-red-500 mt-1">{errorsPassword.newPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
            <input type="password" id="confirmNewPassword" {...registerPassword("confirmNewPassword")}
                   className={`mt-1 block w-full px-3 py-2 border ${errorsPassword.confirmNewPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm`} />
            {errorsPassword.confirmNewPassword && <p className="text-xs text-red-500 mt-1">{errorsPassword.confirmNewPassword.message}</p>}
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isSubmittingPassword}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-dark disabled:opacity-50">
              {isSubmittingPassword ? <Loader2 className="animate-spin h-5 w-5 mr-2"/> : <ShieldCheck size={18} className="mr-2"/>}
              Changer le mot de passe
            </button>
          </div>
        </form>
      </section>

      {/* Contact Preferences Section (Placeholder) */}
      <section className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-neutral-gray-darker mb-4">Préférences de Contact</h2>
        <p className="text-sm text-gray-600">
          (Cette section sera développée ultérieurement pour gérer vos préférences de communication, par exemple pour les newsletters ou les notifications d'offres spéciales.)
        </p>
        {/* Example: Checkboxes for preferences */}
        {/* <div className="mt-4 space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-brand-orange rounded focus:ring-brand-orange-dark" />
            <span className="ml-2 text-gray-700">Recevoir la newsletter mensuelle</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-brand-orange rounded focus:ring-brand-orange-dark" />
            <span className="ml-2 text-gray-700">Être notifié des offres spéciales par email</span>
          </label>
        </div> */}
      </section>
    </div>
  );
};

export default ProfilePage;
