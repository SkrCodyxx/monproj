import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail } from 'lucide-react'; // Added more icons

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Placeholder data - this could come from a config or API later
  const companyName = "Dounie Cuisine Pro";
  const address = "123 Rue de la Saveur, Montréal, QC H1A 1A1";
  const phone = "(514) 123-4567";
  const email = "contact@douniecuisine.ca";

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/douniecuisinepro' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/douniecuisinepro' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/douniecuisinepro' },
    // { name: 'LinkedIn', icon: Linkedin, href: '#' }, // Example if needed
  ];

  const quickLinks = [
    { name: 'Notre Menu', href: '/menu' },
    { name: 'Nos Services', href: '/services' },
    { name: 'Galerie Photos', href: '/gallery' },
    { name: 'Faire une Réservation', href: '/booking' },
    { name: 'Politique de Confidentialité', href: '/privacy-policy' }, // Example legal link
    { name: 'Termes et Conditions', href: '/terms-of-service' }, // Example legal link
  ];

  return (
    <footer className="bg-neutral-gray-darker text-neutral-gray-light pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About / Brand */}
          <div>
            <h5 className="font-serif text-xl font-semibold text-white mb-4">{companyName}</h5>
            <p className="text-sm mb-4">
              Votre traiteur haïtien de choix à Montréal, offrant des saveurs authentiques pour tous vos événements.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-gray-light hover:text-brand-orange transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={24} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Liens Rapides</h5>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-brand-orange hover:underline transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Contactez-Nous</h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin size={20} className="flex-shrink-0 mr-2 mt-0.5 text-brand-orange" />
                <span>{address}</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="flex-shrink-0 mr-2 text-brand-orange" />
                <a href={`tel:${phone}`} className="hover:text-brand-orange transition-colors">{phone}</a>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="flex-shrink-0 mr-2 text-brand-orange" />
                <a href={`mailto:${email}`} className="hover:text-brand-orange transition-colors">{email}</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter/Call to action (Optional) */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Restez Informé</h5>
            <p className="text-sm mb-3">Abonnez-vous à notre infolettre pour les dernières nouvelles et offres spéciales.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full px-3 py-2 rounded-md text-neutral-gray-darker focus:ring-brand-orange focus:border-brand-orange sm:max-w-xs"
                aria-label="Email pour infolettre"
              />
              <button
                type="submit"
                className="bg-brand-orange text-white px-4 py-2 rounded-md hover:bg-brand-orange-dark transition-colors font-medium"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-neutral-gray-dark pt-8 text-center text-sm">
          <p>&copy; {currentYear} {companyName}. Tous droits réservés.</p>
          <p className="mt-1">
            Conçu avec <span className="text-brand-orange">&hearts;</span> par [Votre Nom/Agence si applicable]
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
