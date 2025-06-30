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
import ProfilePage from './pages/ProfilePage'; // Assuming a client profile page
// import ClientDashboardPage from './pages/ClientDashboardPage'; // If more complex than profile
// import AdminDashboardPage from './pages/AdminDashboardPage'; // For admin section
import NotFoundPage from './pages/NotFoundPage';

// Import Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8"> {/* Added some basic padding and container */}
          <Routes>
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
