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
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout'; // New Admin Layout
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin Area Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage';
import AdminMenuManagementPage from './pages/admin/AdminMenuManagementPage';
import AdminOrderManagementPage from './pages/admin/AdminOrderManagementPage';
import AdminReservationManagementPage from './pages/admin/AdminReservationManagementPage';
import AdminGalleryManagementPage from './pages/admin/AdminGalleryManagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';


const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow"> {/* Container/padding handled by layouts/pages */}
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
            <Route path="/unauthorized" element={<UnauthorizedPage />} />


            {/* Client Protected Routes */}
            <Route element={<ProtectedRoute />}> {/* Protects all nested client routes */}
              <Route path="/client" element={<ClientLayout />}>
                <Route index element={<ClientDashboardPage />} />
                <Route path="dashboard" element={<ClientDashboardPage />} />
                <Route path="profile" element={<ClientProfilePage />} />
                <Route path="orders" element={<ClientOrdersPage />} />
                <Route path="reservations" element={<ClientReservationsPage />} />
              </Route>
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}> {/* Protects all nested admin routes for 'admin' role */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUserManagementPage />} />
                <Route path="menu" element={<AdminMenuManagementPage />} />
                <Route path="orders" element={<AdminOrderManagementPage />} />
                <Route path="reservations" element={<AdminReservationManagementPage />} />
                <Route path="gallery" element={<AdminGalleryManagementPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
