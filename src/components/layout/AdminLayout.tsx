import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UtensilsCrossed, ShoppingCart, CalendarDays, Image, Settings, LogOut, ChevronLeft, ChevronRight, Menu as MenuIcon, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on desktop
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after admin logout
  };

  const commonLinkClasses = "flex items-center space-x-3 px-3 py-3 rounded-md transition-colors text-sm";
  const activeLinkClasses = "bg-brand-green text-white shadow-md"; // Using green as admin accent
  const inactiveLinkClasses = "text-neutral-gray-darker hover:bg-green-50 hover:text-brand-green-dark";

  const navLinkResolver = ({ isActive }: { isActive: boolean }) =>
    `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

  const sidebarNavLinks = [
    { to: "/admin/dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { to: "/admin/users", label: "Gestion Utilisateurs", icon: Users },
    { to: "/admin/menu", label: "Gestion Menu", icon: UtensilsCrossed },
    { to: "/admin/orders", label: "Gestion Commandes", icon: ShoppingCart },
    { to: "/admin/reservations", label: "Gestion Réservations", icon: CalendarDays },
    { to: "/admin/gallery", label: "Gestion Galerie", icon: Image },
    { to: "/admin/settings", label: "Paramètres du Site", icon: Settings },
  ];

  const SidebarContent = (props?: {isMobile?: boolean}) => (
    <>
      <div className="px-4 py-5">
        <h2 className={`font-serif text-xl font-semibold text-brand-green ${!isSidebarOpen && !props?.isMobile ? 'hidden' : 'block'} lg:block`}>
          Admin Panel
        </h2>
        {user?.firstName && (
          <p className={`text-sm text-neutral-gray-dark mt-1 ${!isSidebarOpen && !props?.isMobile ? 'hidden' : 'block'} lg:block`}>
            Utilisateur: {user.firstName} ({user.role})
          </p>
        )}
      </div>
      <nav className="flex-grow px-2 py-2 space-y-1">
        {sidebarNavLinks.map(link => (
          <NavLink
            key={link.label}
            to={link.to}
            className={navLinkResolver}
            onClick={props?.isMobile ? () => setIsMobileMenuOpen(false) : undefined}
            end={link.to === "/admin/dashboard"}
          >
            <link.icon size={18} className="flex-shrink-0" />
            <span className={`${!isSidebarOpen && !props?.isMobile ? 'hidden' : 'block'} lg:block`}>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-2 py-3 mt-auto border-t border-gray-200 space-y-2">
        <RouterLink
            to="/"
            target="_blank" // Open site in new tab
            className={`${commonLinkClasses} w-full ${inactiveLinkClasses}`}
            title="Voir le site public"
        >
            <ExternalLink size={18} className="flex-shrink-0" />
            <span className={`${!isSidebarOpen && !props?.isMobile ? 'hidden' : 'block'} lg:block`}>Voir le Site</span>
        </RouterLink>
        <button
          onClick={handleLogout}
          className={`${commonLinkClasses} w-full ${inactiveLinkClasses}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className={`${!isSidebarOpen && !props?.isMobile ? 'hidden' : 'block'} lg:block`}>Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100"> {/* Admin area with a slightly different bg */}
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white shadow-xl transition-all duration-300 ease-in-out border-r border-gray-200 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex items-center justify-between p-3 border-b h-16">
            <RouterLink to="/admin/dashboard" className={`font-serif text-xl font-bold text-brand-green ${!isSidebarOpen && 'hidden'}`}>
                DounieAdmin
            </RouterLink>
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-green-50 text-brand-green"
                title={isSidebarOpen ? "Réduire" : "Agrandir"}
            >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Burger Menu Button */}
      <div className="lg:hidden p-3 fixed top-3 left-3 z-40">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white rounded-full shadow-lg text-brand-green hover:bg-green-50"
            aria-label="Ouvrir le menu administrateur"
          >
              <MenuIcon size={24} />
          </button>
      </div>

      {/* Mobile Sidebar (Off-canvas) */}
      {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 flex z-50">
              <div
                className="fixed inset-0 bg-black opacity-50"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              ></div>
              <aside className="relative flex flex-col w-64 max-w-[80vw] h-full bg-white shadow-xl py-3">
                  <div className="flex items-center justify-between px-4 pb-2 border-b h-14">
                      <h2 className="font-serif text-xl font-semibold text-brand-green">Menu Admin</h2>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-neutral-gray-dark hover:text-brand-green">
                          <ChevronLeft size={24} />
                      </button>
                  </div>
                  <div className="flex-grow overflow-y-auto pt-2">
                    <SidebarContent isMobile={true} />
                  </div>
              </aside>
          </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Optional: A simple header for mobile view if needed, or to show current page title */}
        <header className="lg:hidden bg-white shadow-sm p-3 h-14 flex items-center">
          {/* Mobile menu button is fixed, so this header can be simpler */}
          <h1 className="text-lg font-semibold text-neutral-gray-darker ml-12"> {/* Margin left for burger button space */}
            Panneau d'Administration
          </h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
