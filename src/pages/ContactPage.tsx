import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
// import apiClient from '../lib/apiClient'; // Will be used later for actual submission
import toast from 'react-hot-toast';

// Define Zod schema for form validation
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  phone: z.string().optional(),
    // .regex(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/, "Numéro de téléphone invalide") // More specific regex if needed
  eventType: z.string().optional(),
  eventDate: z.string().optional(), // Consider using a date type if a date picker is integrated
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères." }).max(1000),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

const ContactPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    // console.log(data); // For testing form data
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // try {
    //   const response = await apiClient.post('/contact', data);
    //   toast.success('Votre message a été envoyé avec succès!');
    //   reset();
    // } catch (error) {
    //   toast.error('Une erreur est survenue. Veuillez réessayer.');
    // }
    toast.success('Message envoyé (simulation)! Nous vous répondrons bientôt.');
    reset();
  };

  // Placeholder data (could come from config or API)
  const companyAddress = "123 Rue de la Saveur, Montréal, QC H1A 1A1";
  const companyPhone = "(514) 123-4567";
  const companyEmail = "contact@douniecuisine.ca";
  const openingHours = [
    { day: "Lundi - Vendredi", hours: "9h00 - 18h00" },
    { day: "Samedi", hours: "10h00 - 16h00 (sur RDV)" },
    { day: "Dimanche", hours: "Fermé" },
  ];

  return (
    <div className="py-12">
      {/* Page Header */}
      <section className="text-center mb-16">
        <Mail className="mx-auto text-brand-orange mb-4" size={64} />
        <h1 className="text-5xl font-serif font-bold text-brand-orange-dark mb-4">
          Contactez-Nous
        </h1>
        <p className="text-lg text-neutral-gray-darker max-w-xl mx-auto">
          Nous sommes ravis de discuter de votre prochain événement ou de répondre à vos questions.
        </p>
      </section>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12">
        {/* Contact Form Section */}
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-serif font-semibold text-neutral-gray-darker mb-6">Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-gray-dark">Nom complet</label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-gray-dark">Adresse Email</label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-gray-dark">Numéro de téléphone <span className="text-xs text-gray-500">(Optionnel)</span></label>
              <input
                type="tel"
                id="phone"
                {...register("phone")}
                className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-neutral-gray-dark">Type d'événement <span className="text-xs text-gray-500">(Optionnel)</span></label>
                <input
                  type="text"
                  id="eventType"
                  {...register("eventType")}
                  placeholder="Ex: Mariage, Anniversaire"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm`}
                />
                 {errors.eventType && <p className="mt-1 text-xs text-red-600">{errors.eventType.message}</p>}
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-neutral-gray-dark">Date de l'événement <span className="text-xs text-gray-500">(Optionnel)</span></label>
                <input
                  type="date" // Using type="date" for basic date picker
                  id="eventDate"
                  {...register("eventDate")}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm`}
                />
                {errors.eventDate && <p className="mt-1 text-xs text-red-600">{errors.eventDate.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-gray-dark">Votre Message</label>
              <textarea
                id="message"
                rows={4}
                {...register("message")}
                className={`mt-1 block w-full px-3 py-2 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm`}
              ></textarea>
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi en cours...' : <>Envoyer le Message <Send size={18} className="ml-2" /></>}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-serif font-semibold text-neutral-gray-darker mb-3">Nos Coordonnées</h3>
            <ul className="space-y-3 text-neutral-gray-dark">
              <li className="flex items-start">
                <MapPin size={22} className="flex-shrink-0 mr-3 mt-1 text-brand-green" />
                <span>{companyAddress}</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="flex-shrink-0 mr-3 text-brand-green" />
                <a href={`tel:${companyPhone}`} className="hover:text-brand-orange transition-colors">{companyPhone}</a>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="flex-shrink-0 mr-3 text-brand-green" />
                <a href={`mailto:${companyEmail}`} className="hover:text-brand-orange transition-colors">{companyEmail}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-serif font-semibold text-neutral-gray-darker mb-3">Heures d'Ouverture</h3>
            <ul className="space-y-1 text-neutral-gray-dark">
              {openingHours.map(item => (
                <li key={item.day} className="flex">
                  <Clock size={18} className="flex-shrink-0 mr-3 mt-0.5 text-brand-green" />
                  <span className="font-medium w-32">{item.day}:</span>
                  <span>{item.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Map Placeholder Section */}
          <div>
            <h3 className="text-xl font-serif font-semibold text-neutral-gray-darker mb-3">Retrouvez-Nous</h3>
            {/* Replace with actual map embed or image */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg shadow-md overflow-hidden">
               <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2795.909991228038!2d-73.57004968444137!3d45.51340997910178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc91a4edc1fffff%3A0x8f01b6b7b5c53040!2sMontreal%2C%20QC!5e0!3m2!1sen!2sca!4v1678886400000!5m2!1sen!2sca"
                width="100%"
                height="300"
                style={{border:0}}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Placeholder"
              ></iframe>
            </div>
            <p className="mt-2 text-xs text-neutral-gray-dark">
              Note: Ceci est une carte placeholder. L'adresse affichée peut ne pas être exacte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
