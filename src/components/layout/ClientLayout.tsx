import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, ListOrdered, CalendarDays, LogOut, ChevronLeft, ChevronRight, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // For user name and logout

const ClientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on desktop
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile specific menu

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  const commonLinkClasses = "flex items-center space-x-3 px-3 py-3 rounded-md transition-colors";
  const activeLinkClasses = "bg-brand-orange text-white shadow-md";
  const inactiveLinkClasses = "text-neutral-gray-darker hover:bg-orange-100 hover:text-brand-orange-dark";

  const navLinkResolver = ({ isActive }: { isActive: boolean }) =>
    `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

  const sidebarNavLinks = [
    { to: "/client/dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { to: "/client/profile", label: "Mon Profil", icon: User },
    { to: "/client/orders", label: "Mes Commandes", icon: ListOrdered },
    { to: "/client/reservations", label: "Mes Réservations", icon: CalendarDays },
  ];

  const SidebarContent = () => (
    <>
      <div className="px-4 py-6">
        <h2 className={`font-serif text-xl font-semibold text-brand-orange ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
          Espace Client
        </h2>
        {user?.firstName && (
          <p className={`text-sm text-neutral-gray-dark mt-1 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
            Bienvenue, {user.firstName}!
          </p>
        )}
      </div>
      <nav className="flex-grow px-2 py-2 space-y-2">
        {sidebarNavLinks.map(link => (
          <NavLink key={link.label} to={link.to} className={navLinkResolver} end={link.to === "/client/dashboard"}>
            <link.icon size={20} className="flex-shrink-0" />
            <span className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-2 py-4 mt-auto border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`${commonLinkClasses} w-full ${inactiveLinkClasses}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>Déconnexion</span>
        </button>
      </div>
    </>
  );


  return (
    <div className="flex h-full bg-gray-50"> {/* Ensure ClientLayout takes up height if App.tsx main area is flex-grow */}
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex items-center justify-between p-3 border-b">
            <Link to="/" className={`font-serif text-xl font-bold text-brand-orange ${!isSidebarOpen && 'hidden'}`}>
                DouniePro
            </Link>
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-orange-100 text-brand-orange"
                title={isSidebarOpen ? "Réduire" : "Agrandir"}
            >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Burger Menu Button */}
      <div className="lg:hidden p-4 fixed top-20 left-0 z-40"> {/* Adjust top if main header height changes */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white rounded-md shadow-md text-brand-orange hover:bg-orange-100"
            aria-label="Ouvrir le menu client"
          >
              <MenuIcon size={24} />
          </button>
      </div>

      {/* Mobile Sidebar (Off-canvas) */}
      {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 flex z-50">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black opacity-50"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              ></div>
              {/* Sidebar */}
              <aside className="relative flex flex-col w-64 max-w-[80vw] h-full bg-white shadow-xl py-4">
                  <div className="flex items-center justify-between px-4 pb-2 border-b">
                      <h2 className="font-serif text-xl font-semibold text-brand-orange">Menu Client</h2>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-neutral-gray-dark hover:text-brand-orange">
                          <ChevronLeft size={24} />
                      </button>
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    {/* In mobile, always show text */}
                    {sidebarNavLinks.map(link => (
                      <NavLink key={link.label} to={link.to} className={({isActive}) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`} onClick={() => setIsMobileMenuOpen(false)} end={link.to === "/client/dashboard"}>
                        <link.icon size={20} className="flex-shrink-0" />
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </div>
                  <div className="px-2 py-4 mt-auto border-t border-gray-200">
                    <button
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      className={`${commonLinkClasses} w-full ${inactiveLinkClasses}`}
                    >
                      <LogOut size={20} className="flex-shrink-0" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
              </aside>
          </div>
      )}


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Optional: Client-specific header bar if needed, or rely on main App header */}
        {/* <header className="bg-white shadow-sm p-4 lg:hidden">
          <h1 className="text-xl font-semibold text-neutral-gray-darker">Client Area</h1>
        </header> */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
