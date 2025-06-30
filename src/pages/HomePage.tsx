import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Star, Users, CalendarDays, UtensilsCrossed, Sparkles, Info } from 'lucide-react'; // Icons

// Placeholder components for sections that might be complex or use dynamic data
const TestimonialsSection: React.FC = () => (
  <div className="py-12 bg-orange-50">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-serif font-bold text-center text-brand-orange mb-8">
        Ce que disent nos clients
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Placeholder Testimonials */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
            <Star className="text-yellow-400 mb-2" size={24} />
            <p className="text-neutral-gray-dark mb-4">
              "Service incroyable et plats délicieux! Dounie Cuisine Pro a rendu notre événement inoubliable."
            </p>
            <p className="font-semibold text-neutral-gray-darker">- Client Satisfait {i}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CompanyStatsSection: React.FC = () => (
  <div className="py-12 bg-white">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div>
          <Users className="text-brand-green mx-auto mb-2" size={48} />
          <p className="text-4xl font-bold text-brand-green">500+</p>
          <p className="text-neutral-gray-dark">Clients Satisfaits</p>
        </div>
        <div>
          <CalendarDays className="text-brand-green mx-auto mb-2" size={48} />
          <p className="text-4xl font-bold text-brand-green">1000+</p>
          <p className="text-neutral-gray-dark">Événements Organisés</p>
        </div>
        <div>
          <ChefHat className="text-brand-green mx-auto mb-2" size={48} />
          <p className="text-4xl font-bold text-brand-green">10+</p>
          <p className="text-neutral-gray-dark">Années d'Expérience</p>
        </div>
      </div>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-orange-light via-orange-50 to-green-50 py-20 text-center md:text-left">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-orange-dark mb-6">
              L'Authenticité de la Cuisine Haïtienne, <span className="text-brand-green">Pour Vos Événements</span>
            </h1>
            <p className="text-lg text-neutral-gray-darker mb-8">
              Découvrez des saveurs exquises et un service traiteur impeccable qui transformeront vos occasions spéciales en moments mémorables.
            </p>
            <Link
              to="/booking"
              className="inline-block bg-brand-orange text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-brand-orange-dark transition duration-300 text-lg transform hover:scale-105"
            >
              Réserver Nos Services
            </Link>
            <Link
              to="/menu"
              className="ml-4 inline-block bg-brand-green text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 text-lg transform hover:scale-105"
            >
              Voir Notre Menu
            </Link>
          </div>
          <div className="hidden md:block">
            {/* Placeholder for a captivating image of Haitian food or an event */}
            <img
              src="https://via.placeholder.com/500x400.png?text=Plat+Haïtien+Appétissant"
              alt="Cuisine Haïtienne"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <UtensilsCrossed className="text-brand-green mx-auto mb-4" size={56} />
          <h2 className="text-3xl font-serif font-bold text-neutral-gray-darker mb-4">Nos Services Traiteur</h2>
          <p className="text-neutral-gray-dark max-w-2xl mx-auto mb-8">
            Nous offrons une gamme complète de services traiteur pour mariages, fêtes d'anniversaire, événements corporatifs, et plus encore. Chaque plat est préparé avec passion, en utilisant des ingrédients frais et authentiques.
          </p>
          <Link
            to="/services"
            className="text-brand-orange font-semibold hover:underline"
          >
            En savoir plus sur nos services &rarr;
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Company Statistics Section */}
      <CompanyStatsSection />

      {/* About Us Section */}
      <section className="py-12 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Info className="text-brand-orange mb-3" size={40} />
              <h2 className="text-3xl font-serif font-bold text-neutral-gray-darker mb-4">À Propos de Dounie Cuisine Pro</h2>
              <p className="text-neutral-gray-dark mb-4">
                Fondée par Dounie, une passionnée de la cuisine haïtienne, notre mission est de partager la richesse et la diversité culinaire d'Haïti avec Montréal. Nous croyons en l'utilisation d'ingrédients de qualité, un service client exceptionnel, et la création d'expériences gastronomiques uniques.
              </p>
              <p className="text-neutral-gray-dark mb-6">
                Que ce soit pour un grand rassemblement ou une célébration intime, notre équipe est dédiée à faire de votre événement un succès retentissant.
              </p>
              <Link
                to="/contact"
                className="text-brand-green font-semibold hover:underline"
              >
                Contactez-nous pour discuter de votre projet &rarr;
              </Link>
            </div>
            <div className="hidden md:block">
              {/* Placeholder for an image of Dounie or the team */}
              <img
                src="https://via.placeholder.com/450x350.png?text=L'équipe+Dounie+Cuisine"
                alt="L'équipe Dounie Cuisine Pro"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action for Reservation */}
      <section className="py-16 bg-brand-green text-white">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="mx-auto mb-4" size={56} />
          <h2 className="text-4xl font-serif font-bold mb-6">Prêt à Éblouir Vos Convives?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Laissez Dounie Cuisine Pro s'occuper de la gastronomie pour votre prochain événement. Contactez-nous dès aujourd'hui pour une consultation personnalisée.
          </p>
          <Link
            to="/booking"
            className="bg-brand-orange text-white font-semibold px-10 py-4 rounded-lg shadow-lg hover:bg-brand-orange-dark transition duration-300 text-xl transform hover:scale-105"
          >
            Planifier Votre Événement
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
