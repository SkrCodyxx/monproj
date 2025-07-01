import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Eagerly loaded core page components
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Layout Components (eagerly loaded)
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SuspenseFallback from './components/layout/SuspenseFallback';

// Lazy-loaded Public Page Components
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Client Area Pages (eagerly loaded for this example)
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import ClientProfilePage from './pages/client/ProfilePage';
import ClientOrdersPage from './pages/client/ClientOrdersPage';
import ClientReservationsPage from './pages/client/ClientReservationsPage';

// Admin Area Pages (core admin pages eagerly loaded, others lazy)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage';
import AdminMenuManagementPage from './pages/admin/AdminMenuManagementPage';
import AdminOrderManagementPage from './pages/admin/AdminOrderManagementPage';
import AdminReservationManagementPage from './pages/admin/AdminReservationManagementPage';
// Lazy load these admin pages
const AdminGalleryManagementPage = lazy(() => import('./pages/admin/AdminGalleryManagementPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));


const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={<SuspenseFallback />}> {/* Wrap Routes with Suspense */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/gallery" element={<GalleryPage />} /> {/* Lazy */}
              <Route path="/contact" element={<ContactPage />} /> {/* Lazy */}
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Client Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/client" element={<ClientLayout />}>
                  <Route index element={<ClientDashboardPage />} />
                  <Route path="dashboard" element={<ClientDashboardPage />} />
                  <Route path="profile" element={<ClientProfilePage />} />
                  <Route path="orders" element={<ClientOrdersPage />} />
                  <Route path="reservations" element={<ClientReservationsPage />} />
                </Route>
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUserManagementPage />} />
                  <Route path="menu" element={<AdminMenuManagementPage />} />
                  <Route path="orders" element={<AdminOrderManagementPage />} />
                  <Route path="reservations" element={<AdminReservationManagementPage />} />
                  <Route path="gallery" element={<AdminGalleryManagementPage />} /> {/* Lazy */}
                  <Route path="settings" element={<AdminSettingsPage />} /> {/* Lazy */}
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
