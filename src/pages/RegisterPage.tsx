import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
// import apiClient from '../lib/apiClient';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom de famille doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
    // .regex(/[a-z]/, { message: "Doit contenir au moins une minuscule."}) // Example: add more rules
    // .regex(/[A-Z]/, { message: "Doit contenir au moins une majuscule."})
    // .regex(/[0-9]/, { message: "Doit contenir au moins un chiffre."}),
    ,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"], // Path of error
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Or handle registration differently, e.g., redirect to login

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    const toastId = toast.loading('Création du compte...');
    try {
      // Simulate API call - remove confirmPassword before sending
      const { confirmPassword, ...apiData } = data;
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await apiClient.post('/auth/register', apiData);
      // const { token, user } = response.data; // Assuming API returns token and user

      // For simulation:
      const MOCK_USER_DATA = { id: '2', email: apiData.email, role: 'client', firstName: apiData.firstName, lastName: apiData.lastName };
      const MOCK_TOKEN = 'mock-jwt-token-67890';

      toast.success('Compte créé avec succès! Vous allez être redirigé.', { id: toastId });

      // Option 1: Log the user in directly
      // login(MOCK_USER_DATA, MOCK_TOKEN);
      // navigate('/profile');

      // Option 2: Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error: any) {
      // const errorMessage = error.response?.data?.message || "L'inscription a échoué. Veuillez réessayer.";
      const errorMessage = "L'inscription a échoué (simulation). Veuillez réessayer.";
      toast.error(errorMessage, { id: toastId });
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <UserPlus className="mx-auto h-12 w-auto text-brand-green" />
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-neutral-gray-darker">
            Créez votre compte Dounie Cuisine Pro
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-gray-dark">
            Déjà membre?{' '}
            <Link to="/login" className="font-medium text-brand-green hover:text-brand-green-dark">
              Connectez-vous ici
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label htmlFor="firstName" className="sr-only">Prénom</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  {...register("firstName")}
                  required
                  className={`appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border ${errors.firstName ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-neutral-gray-darker focus:ring-brand-green focus:border-brand-green'} focus:z-10 sm:text-sm`}
                  placeholder="Prénom"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="sr-only">Nom de famille</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  {...register("lastName")}
                  required
                  className={`appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border ${errors.lastName ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-neutral-gray-darker focus:ring-brand-green focus:border-brand-green'} focus:z-10 sm:text-sm`}
                  placeholder="Nom de famille"
                />
              </div>
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email-address-register" className="sr-only">Adresse Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email-address-register"
                type="email"
                autoComplete="email"
                {...register("email")}
                required
                className={`appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-neutral-gray-darker focus:ring-brand-green focus:border-brand-green'} focus:z-10 sm:text-sm`}
                placeholder="Adresse Email"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password-register" className="sr-only">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password-register"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                required
                className={`appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-neutral-gray-darker focus:ring-brand-green focus:border-brand-green'} focus:z-10 sm:text-sm`}
                placeholder="Mot de passe (min. 8 caractères)"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="sr-only">Confirmer le mot de passe</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  required
                  className={`appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border ${errors.confirmPassword ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-neutral-gray-darker focus:ring-brand-green focus:border-brand-green'} focus:z-10 sm:text-sm`}
                  placeholder="Confirmer le mot de passe"
                />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
            >
              {isSubmitting ? 'Création...' : "S'inscrire"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
