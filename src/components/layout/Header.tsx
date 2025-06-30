import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X as XIcon, UserCircle, ShoppingCart, LogOut, LogIn as LogInIcon, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const logoutHandler = () => {
    logout();
    setIsMobileMenuOpen(false); // Close mobile menu if open
    navigate('/'); // Redirect to home or login page after logout
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Base classes for nav links for DRYness
  const navLinkBaseStyle = "px-3 py-2 rounded-md font-medium flex items-center space-x-1 transition-colors";
  const navLinkDesktopStyle = `${navLinkBaseStyle} text-sm`;
  const navLinkMobileStyle = `${navLinkBaseStyle} text-base block`; // block for full width

  const getActiveClasses = (isActive: boolean) =>
    isActive ? 'bg-brand-orange-dark text-white' : 'text-neutral-gray-darker hover:bg-brand-orange-light hover:text-neutral-gray-darker';

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => `${navLinkDesktopStyle} ${getActiveClasses(isActive)}`;
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) => `${navLinkMobileStyle} ${getActiveClasses(isActive)}`;

  // Auth button styles
  const authButtonBaseStyle = "px-3 py-2 rounded-md font-medium flex items-center space-x-1 transition-colors";
  const authButtonDesktopStyle = `${authButtonBaseStyle} text-sm text-neutral-gray-darker hover:bg-brand-orange-light hover:text-neutral-gray-darker`;
  const primaryAuthButtonDesktopStyle = `${authButtonBaseStyle} text-sm ml-2 text-white bg-brand-orange hover:bg-brand-orange-dark shadow`;

  const authButtonMobileStyle = `${authButtonBaseStyle} text-base block w-full text-left text-neutral-gray-darker hover:bg-brand-orange-light hover:text-neutral-gray-darker`;
  const primaryAuthButtonMobileStyle = `${authButtonBaseStyle} text-base block w-full text-left text-white bg-brand-orange hover:bg-brand-orange-dark`;


  const renderAuthLinks = (isMobile: boolean) => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full px-3"><Loader2 className={`animate-spin h-6 w-6 text-brand-orange`} /></div>;
    }
    if (isAuthenticated) {
      return (
        <>
          <NavLink
            to="/profile"
            className={isMobile ? mobileNavLinkClasses : navLinkClasses}
            onClick={isMobile ? closeMobileMenu : undefined}
          >
            <UserCircle size={isMobile ? 20 : 18} />
            <span>{user?.firstName || user?.email || 'Profil'}</span>
          </NavLink>
          <button
            onClick={logoutHandler}
            className={isMobile ? authButtonMobileStyle : authButtonDesktopStyle}
          >
            <LogOut size={isMobile ? 20 : 18} />
            <span>Déconnexion</span>
          </button>
        </>
      );
    }
    return (
      <>
        <NavLink
          to="/login"
          className={isMobile ? mobileNavLinkClasses : navLinkClasses}
          onClick={isMobile ? closeMobileMenu : undefined}
        >
          <LogInIcon size={isMobile ? 20 : 18} />
          <span>Connexion</span>
        </NavLink>
        <NavLink
          to="/register"
          className={isMobile ? primaryAuthButtonMobileStyle : primaryAuthButtonDesktopStyle}
          onClick={isMobile ? closeMobileMenu : undefined}
        >
          <UserPlus size={isMobile ? 20 : 18} />
          <span>Inscription</span>
        </NavLink>
      </>
    );
  };

  // Main navigation links data
  const mainNavLinks = [
    { to: "/", label: "Accueil", end: true },
    { to: "/menu", label: "Menu" },
    { to: "/services", label: "Services" },
    { to: "/gallery", label: "Galerie" },
    { to: "/contact", label: "Contact" },
    { to: "/booking", label: "Réservation" },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <img className="h-10 w-auto" src="/placeholder-logo.svg" alt="Dounie Cuisine Pro Logo" />
              <span className="font-serif text-2xl font-bold text-brand-orange">Dounie Cuisine Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavLinks.map(link => (
              <NavLink key={link.to} to={link.to} className={navLinkClasses} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* User Menu / Auth Links - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {renderAuthLinks(false)}
            <NavLink to="/cart" className={navLinkClasses} aria-label="Panier">
                <ShoppingCart size={20} />
                {/* Optional: Add a badge for cart items count here */}
            </NavLink>
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="md:hidden flex items-center">
             <NavLink to="/cart" className={`p-2 mr-1 rounded-md text-neutral-gray-darker hover:text-brand-orange hover:bg-orange-100`} aria-label="Panier">
                <ShoppingCart size={24} />
            </NavLink>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-brand-orange hover:text-brand-orange-dark hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-orange"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <XIcon className="block h-6 w-6" aria-hidden="true" /> : <MenuIcon className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {mainNavLinks.map(link => (
              <NavLink key={link.to} to={link.to} className={mobileNavLinkClasses} onClick={closeMobileMenu} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              {renderAuthLinks(true)}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
