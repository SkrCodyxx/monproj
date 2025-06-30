import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext is set up
// import apiClient from '../lib/apiClient'; // For actual API call

const loginSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const toastId = toast.loading('Connexion en cours...');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await apiClient.post('/auth/login', data);
      // const { token, user } = response.data; // Assuming API returns token and user info

      // For simulation:
      const MOCK_USER_DATA = { id: '1', email: data.email, role: 'client', name: 'Test User' };
      const MOCK_TOKEN = 'mock-jwt-token-12345';

      login(MOCK_USER_DATA, MOCK_TOKEN); // Update AuthContext

      toast.success('Connexion réussie!', { id: toastId });
      navigate('/profile'); // Redirect to profile page or dashboard
    } catch (error: any) {
      // const errorMessage = error.response?.data?.message || "La connexion a échoué. Vérifiez vos identifiants.";
      const errorMessage = "La connexion a échoué (simulation). Vérifiez vos identifiants.";
      toast.error(errorMessage, { id: toastId });
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-green-50"> {/* Adjust min-h if header/footer height changes */}
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <LogIn className="mx-auto h-12 w-auto text-brand-orange" />
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-neutral-gray-darker">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-gray-dark">
            Ou{' '}
            <Link to="/register" className="font-medium text-brand-orange hover:text-brand-orange-dark">
              créez un nouveau compte
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  required
                  className={`appearance-none rounded-none relative block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-neutral-gray-darker focus:ring-brand-orange focus:border-brand-orange'} focus:z-10 sm:text-sm rounded-t-md`}
                  placeholder="Adresse Email"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div className={errors.email ? "" : "pt-px"}> {/* Adjust spacing if no email error */}
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  required
                  className={`appearance-none rounded-none relative block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-neutral-gray-darker focus:ring-brand-orange focus:border-brand-orange'} focus:z-10 sm:text-sm rounded-b-md`}
                  placeholder="Mot de passe"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-brand-orange focus:ring-brand-orange-dark border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-gray-dark">
                Se souvenir de moi
              </label> */}
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-brand-orange hover:text-brand-orange-dark">
                Mot de passe oublié?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-dark disabled:opacity-70"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
