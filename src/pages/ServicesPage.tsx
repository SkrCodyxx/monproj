import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, PartyPopper, Users, CalendarCheck, ShoppingBasket, PhoneCall, CheckCircle } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const eventTypes = [
    { name: "Mariages", icon: PartyPopper, description: "Des menus élégants et personnalisés pour le plus beau jour de votre vie." },
    { name: "Anniversaires", icon: PartyPopper, description: "Célébrez en grand avec des plats festifs et savoureux." },
    { name: "Événements d'Entreprise", icon: Users, description: "Solutions traiteur professionnelles pour séminaires, cocktails, et réunions." },
    { name: "Fêtes de Famille", icon: Users, description: "Rassemblez vos proches autour d'un repas convivial et authentique." },
    { name: "Baptêmes et Communions", icon: CheckCircle, description: "Des mets délicats pour marquer ces occasions spéciales." },
    { name: "Autres Célébrations", icon: CalendarCheck, description: "Nous nous adaptons à tous types d'événements, petits ou grands." },
  ];

  const workProcess = [
    { step: 1, title: "Prise de Contact", description: "Discutons de vos besoins, de la date de votre événement, du nombre d'invités et de vos préférences.", icon: PhoneCall },
    { step: 2, title: "Proposition Personnalisée", description: "Nous élaborons un menu sur mesure et un devis détaillé adapté à votre budget.", icon: ShoppingBasket },
    { step: 3, title: "Confirmation et Planification", description: "Une fois le devis accepté, nous finalisons les détails logistiques et la planification.", icon: CalendarCheck },
    { step: 4, title: "Jour J - Service Impeccable", description: "Notre équipe assure la préparation, la livraison (si applicable) et le service avec professionnalisme.", icon: Utensils },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Page Header Section */}
      <section className="text-center py-12 bg-gradient-to-r from-brand-orange-light via-orange-50 to-green-50">
        <Utensils className="mx-auto text-brand-orange mb-4" size={64} />
        <h1 className="text-5xl font-serif font-bold text-brand-orange-dark mb-4">
          Nos Services Traiteur
        </h1>
        <p className="text-lg text-neutral-gray-darker max-w-2xl mx-auto">
          Dounie Cuisine Pro vous accompagne dans la création d'expériences culinaires mémorables pour tous vos événements. Découvrez comment nous pouvons sublimer vos réceptions.
        </p>
      </section>

      {/* Description of Catering Services Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-semibold text-neutral-gray-darker mb-6 text-center md:text-left">
          Une Cuisine Haïtienne Authentique et Raffinée
        </h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-neutral-gray-dark mb-4">
              Chez Dounie Cuisine Pro, nous sommes fiers de proposer une cuisine haïtienne authentique, préparée avec des ingrédients frais et de première qualité. Notre passion pour les saveurs traditionnelles se reflète dans chaque plat, revisité avec une touche de modernité pour satisfaire les palais les plus exigeants.
            </p>
            <p className="text-neutral-gray-dark mb-4">
              Nous offrons une large variété de mets, des classiques incontournables aux créations originales, toujours dans le respect des traditions culinaires d'Haïti. Que vous souhaitiez un buffet copieux, des bouchées élégantes pour un cocktail, ou un repas assis sophistiqué, notre équipe saura répondre à vos attentes.
            </p>
            <ul className="list-disc list-inside text-neutral-gray-dark space-y-2 mb-4 pl-4">
              <li>Menus personnalisables selon vos goûts et restrictions alimentaires.</li>
              <li>Options végétariennes, végétaliennes et sans gluten disponibles.</li>
              <li>Service de livraison, installation et service sur place.</li>
              <li>Conseils pour l'accord mets et vins (si applicable).</li>
            </ul>
          </div>
          <div className="hidden md:block">
            <img
              src="https://via.placeholder.com/500x350.png?text=Buffet+Traiteur+Haïtien"
              alt="Service traiteur haïtien"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Types of Events Covered Section */}
      <section className="bg-orange-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-semibold text-neutral-gray-darker mb-8 text-center">
            Pour Toutes Vos Occasions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventTypes.map((event) => (
              <div key={event.name} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <event.icon className="mx-auto text-brand-green mb-3" size={40} />
                <h3 className="text-xl font-semibold text-brand-orange-dark mb-2">{event.name}</h3>
                <p className="text-sm text-neutral-gray-dark">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Process Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-serif font-semibold text-neutral-gray-darker mb-10 text-center">
          Notre Processus de Travail Simplifié
        </h2>
        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-brand-orange-light transform -translate-y-1/2 -z-10"></div>
          <div className="grid md:grid-cols-4 gap-8">
            {workProcess.map((item) => (
              <div key={item.step} className="text-center p-4 relative">
                 {/* Circle for desktop line connection */}
                <div className="hidden md:block absolute top-1/2 left-1/2 w-4 h-4 bg-brand-orange rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white"></div>
                <item.icon className="mx-auto text-brand-orange mb-3" size={48} />
                <h3 className="text-lg font-semibold text-brand-orange-dark mb-1">Étape {item.step}: {item.title}</h3>
                <p className="text-sm text-neutral-gray-dark">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Indicative Pricing Section */}
      <section className="bg-green-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-semibold text-neutral-gray-darker mb-4">
            Tarification Indicative
          </h2>
          <p className="text-neutral-gray-dark max-w-xl mx-auto mb-6">
            Chaque événement étant unique, nos tarifs sont établis sur mesure en fonction de vos choix de menu, du nombre d'invités et des services requis. Nous nous engageons à vous offrir le meilleur rapport qualité-prix.
          </p>
          <p className="text-neutral-gray-dark font-semibold mb-6">
            Contactez-nous pour un devis personnalisé et détaillé.
          </p>
          <Link
            to="/contact"
            className="bg-brand-orange text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-brand-orange-dark transition duration-300 text-lg"
          >
            Demander un Devis
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
