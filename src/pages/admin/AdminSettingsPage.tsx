import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Settings, Save, Info, DollarSign, Clock, Share2, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppSettings, CompanyInformation, TaxSettings, OpeningHours, SocialMediaLinks, LegalPages } from '../../../src/types'; // Adjusted path

// --- Mock API Client ---
let mockAppSettings: AppSettings = { // Initial mock data
  companyInfo: {
    name: 'Dounie Cuisine Pro (Mock)',
    addressStreet: '123 Rue Fictive',
    addressCity: 'Montréal',
    addressPostalCode: 'H1A 2B3',
    addressCountry: 'Canada',
    phone: '514-555-0199',
    email: 'contact@douniecuisinepro.mock',
    logoUrl: 'https://via.placeholder.com/150/FF8C00/FFFFFF?Text=LogoDounie',
  },
  taxInfo: {
    defaultTaxRate: 0.14975, // Combined GST/QST
    currencySymbol: 'CAD',
  },
  openingHours: {
    monday: '9:00 - 18:00', tuesday: '9:00 - 18:00', wednesday: '9:00 - 18:00',
    thursday: '9:00 - 20:00', friday: '9:00 - 20:00', saturday: '10:00 - 17:00 (Sur RDV)', sunday: 'Fermé',
  },
  socialMedia: {
    facebook: 'https://facebook.com/douniecuisine', instagram: 'https://instagram.com/douniecuisine',
    twitter: '', linkedin: '',
  },
  legalPages: {
    privacyPolicyUrl: '/privacy-policy', termsOfServiceUrl: '/terms-of-service',
  },
};

const apiClient = {
  get: async (url: string) => {
    console.log(`SIMULATE GET: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (url === '/settings') return { data: mockAppSettings };
    return { data: {} };
  },
  put: async (url: string, data: AppSettings) => {
    console.log(`SIMULATE PUT: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    mockAppSettings = { ...mockAppSettings, ...data }; // Update mock data
    return { data: { message: 'Paramètres mis à jour!', settings: mockAppSettings } };
  }
};
// --- End Mock API Client ---


// Zod Schemas for validation (matching types, all optional for partial updates if needed, but form sends all)
const companyInfoSchema = z.object({
  name: z.string().min(1, "Nom de l'entreprise requis").optional(),
  addressStreet: z.string().optional(), addressCity: z.string().optional(),
  addressPostalCode: z.string().optional(), addressCountry: z.string().optional(),
  phone: z.string().optional(), email: z.string().email("Email invalide").optional(),
  logoUrl: z.string().url("URL du logo invalide").optional().nullable(),
}).deepPartial();

const taxInfoSchema = z.object({
  defaultTaxRate: z.number().min(0).max(1, "Taux entre 0 et 1").optional(),
  currencySymbol: z.string().max(5, "Symbole devise trop long").optional(),
}).deepPartial();

const openingHoursSchema = z.object({
  monday: z.string().optional(), tuesday: z.string().optional(), wednesday: z.string().optional(),
  thursday: z.string().optional(), friday: z.string().optional(), saturday: z.string().optional(),
  sunday: z.string().optional(),
}).deepPartial();

const socialMediaSchema = z.object({
  facebook: z.string().url().or(z.literal('')).optional().nullable(),
  instagram: z.string().url().or(z.literal('')).optional().nullable(),
  twitter: z.string().url().or(z.literal('')).optional().nullable(),
  linkedin: z.string().url().or(z.literal('')).optional().nullable(),
}).deepPartial();

const legalPagesSchema = z.object({
  privacyPolicyUrl: z.string().optional().nullable(),
  termsOfServiceUrl: z.string().optional().nullable(),
}).deepPartial();

const appSettingsFormSchema = z.object({
  companyInfo: companyInfoSchema.optional(),
  taxInfo: taxInfoSchema.optional(),
  openingHours: openingHoursSchema.optional(),
  socialMedia: socialMediaSchema.optional(),
  legalPages: legalPagesSchema.optional(),
});


const AdminSettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<AppSettings>({
    resolver: zodResolver(appSettingsFormSchema),
    defaultValues: mockAppSettings, // Initialize with mock or empty structure
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/settings');
        reset(response.data); // Populate form with fetched settings
      } catch (error) {
        toast.error("Erreur lors de la récupération des paramètres.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit: SubmitHandler<AppSettings> = async (data) => {
    const toastId = toast.loading('Sauvegarde des paramètres...');
    try {
      // Ensure numeric fields are numbers if they come from text inputs
      if (data.taxInfo?.defaultTaxRate) {
        data.taxInfo.defaultTaxRate = parseFloat(String(data.taxInfo.defaultTaxRate));
      }
      await apiClient.put('/settings', data);
      toast.success('Paramètres sauvegardés avec succès!', { id: toastId });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des paramètres.', { id: toastId });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-10 w-10 text-brand-green" /> <p className="ml-3">Chargement des paramètres...</p></div>;
  }

  const renderSectionHeader = (title: string, Icon: React.ElementType) => (
    <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
        <Icon size={22} className="mr-2 text-brand-green" />
        <h2 className="text-xl font-semibold text-neutral-gray-darker">{title}</h2>
    </div>
  );

  const daysOfWeek: (keyof OpeningHours)[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];


  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Settings size={32} className="mr-3 text-brand-green" />
        <h1 className="text-3xl font-serif font-bold text-neutral-gray-darker">Paramètres du Site</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Company Information */}
        <section className="p-6 bg-white rounded-lg shadow-md">
          {renderSectionHeader("Informations de l'Entreprise", Info)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Controller name="companyInfo.name" control={control} render={({ field }) => (<div><label className="label-style">Nom Entreprise</label><input {...field} className="input-style"/></div>)} />
            <Controller name="companyInfo.email" control={control} render={({ field }) => (<div><label className="label-style">Email Contact</label><input type="email" {...field} className="input-style"/></div>)} />
            <Controller name="companyInfo.phone" control={control} render={({ field }) => (<div><label className="label-style">Téléphone</label><input type="tel" {...field} className="input-style"/></div>)} />
            <Controller name="companyInfo.addressStreet" control={control} render={({ field }) => (<div><label className="label-style">Rue</label><input {...field} className="input-style"/></div>)} />
            <Controller name="companyInfo.addressCity" control={control} render={({ field }) => (<div><label className="label-style">Ville</label><input {...field} className="input-style"/></div>)} />
            <Controller name="companyInfo.addressPostalCode" control={control} render={({ field }) => (<div><label className="label-style">Code Postal</label><input {...field} className="input-style"/></div>)} />
            <Controller name="companyInfo.addressCountry" control={control} render={({ field }) => (<div><label className="label-style">Pays</label><input {...field} className="input-style"/></div>)} />
            <Controller name="companyInfo.logoUrl" control={control} render={({ field }) => (<div><label className="label-style">URL du Logo</label><input type="url" {...field} placeholder="https://..." className="input-style"/></div>)} />
          </div>
        </section>

        {/* Tax & Pricing */}
        <section className="p-6 bg-white rounded-lg shadow-md">
          {renderSectionHeader("Taxes et Tarification", DollarSign)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Controller name="taxInfo.defaultTaxRate" control={control} render={({ field }) => (<div><label className="label-style">Taux de Taxe (ex: 0.15)</label><input type="number" step="0.0001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="input-style"/></div>)} />
            <Controller name="taxInfo.currencySymbol" control={control} render={({ field }) => (<div><label className="label-style">Symbole Monétaire (ex: CAD)</label><input {...field} className="input-style"/></div>)} />
          </div>
        </section>

        {/* Opening Hours */}
        <section className="p-6 bg-white rounded-lg shadow-md">
          {renderSectionHeader("Horaires d'Ouverture", Clock)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {daysOfWeek.map(day => (
              <Controller key={day} name={`openingHours.${day}`} control={control} render={({ field }) => (
                <div><label className="label-style">{day.charAt(0).toUpperCase() + day.slice(1)}</label><input {...field} placeholder="ex: 9:00-17:00 ou Fermé" className="input-style"/></div>
              )} />
            ))}
          </div>
        </section>

        {/* Social Media */}
        <section className="p-6 bg-white rounded-lg shadow-md">
          {renderSectionHeader("Réseaux Sociaux", Share2)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Controller name="socialMedia.facebook" control={control} render={({ field }) => (<div><label className="label-style">Facebook URL</label><input type="url" {...field} placeholder="https://facebook.com/..." className="input-style"/></div>)} />
            <Controller name="socialMedia.instagram" control={control} render={({ field }) => (<div><label className="label-style">Instagram URL</label><input type="url" {...field} placeholder="https://instagram.com/..." className="input-style"/></div>)} />
            <Controller name="socialMedia.twitter" control={control} render={({ field }) => (<div><label className="label-style">Twitter URL</label><input type="url" {...field} placeholder="https://twitter.com/..." className="input-style"/></div>)} />
            <Controller name="socialMedia.linkedin" control={control} render={({ field }) => (<div><label className="label-style">LinkedIn URL</label><input type="url" {...field} placeholder="https://linkedin.com/..." className="input-style"/></div>)} />
          </div>
        </section>

        {/* Legal Pages */}
        <section className="p-6 bg-white rounded-lg shadow-md">
          {renderSectionHeader("Pages Légales", ShieldCheck)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Controller name="legalPages.privacyPolicyUrl" control={control} render={({ field }) => (<div><label className="label-style">URL Politique de Confidentialité</label><input type="text" {...field} placeholder="/privacy-policy" className="input-style"/></div>)} />
            <Controller name="legalPages.termsOfServiceUrl" control={control} render={({ field }) => (<div><label className="label-style">URL Termes et Conditions</label><input type="text" {...field} placeholder="/terms-of-service" className="input-style"/></div>)} />
          </div>
        </section>

        {/* Form Errors (General) - Could display Zod errors here if needed */}
        {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                <p>Veuillez corriger les erreurs dans le formulaire.</p>
                {/* <pre>{JSON.stringify(errors, null, 2)}</pre> */}
            </div>
        )}

        <div className="pt-5">
          <button type="submit" disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60">
            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2"/> : <Save size={20} className="mr-2"/>}
            Enregistrer les Paramètres
          </button>
        </div>
      </form>
      <style jsx>{`
        .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #4B5563; margin-bottom: 0.25rem; }
        .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; box-shadow: sm; }
        .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #10B981; ring-color: #10B981; }
      `}</style>
    </div>
  );
};

export default AdminSettingsPage;
