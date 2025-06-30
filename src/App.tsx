import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Page Components
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// ProfilePage is now part of client routes
import NotFoundPage from './pages/NotFoundPage';

// Client Area Pages
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import ClientProfilePage from './pages/client/ProfilePage'; // Renamed import for clarity
import ClientOrdersPage from './pages/client/ClientOrdersPage';
import ClientReservationsPage from './pages/client/ClientReservationsPage';

// Import Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ClientLayout from './components/layout/ClientLayout'; // New Client Layout
import ProtectedRoute from './components/auth/ProtectedRoute'; // New Protected Route

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow"> {/* Removed container and padding, ClientLayout or pages will handle it */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} /> {/* Basic profile route */}
          {/* Add routes for client dashboard sections if needed */}
          {/* <Route path="/dashboard/client/orders" element={<ClientOrdersPage />} /> */}
          {/* Add routes for admin sections later, likely with a nested/grouped Route setup */}
          {/* <Route path="/admin/dashboard" element={<AdminDashboardPage />} /> */}
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
