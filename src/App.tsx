import React from 'react';
import HomePage from './pages/HomePage';
// Import other page components and router setup here later
// For example, using React Router:
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import MenuPage from './pages/MenuPage';
// import ServicesPage from './pages/ServicesPage';
// import GalleryPage from './pages/GalleryPage';
// import ContactPage from './pages/ContactPage';
// import BookingPage from './pages/BookingPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import ClientDashboardPage from './pages/ClientDashboardPage';
// import AdminDashboardPage from './pages/AdminDashboardPage';

// Import global components like Header and Footer
// import Header from './components/layout/Header';
// import Footer from './components/layout/Footer';

// Import React Hot Toast for notifications
// import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    // <Router>
    //   <Toaster position="top-right" reverseOrder={false} />
    //   {/* <Header /> */}
    //   <main>
    //     <Routes>
    //       <Route path="/" element={<HomePage />} />
    //       {/* Define other routes here */}
    //       {/* <Route path="/menu" element={<MenuPage />} /> */}
    //       {/* <Route path="/services" element={<ServicesPage />} /> */}
    //       {/* <Route path="/gallery" element={<GalleryPage />} /> */}
    //       {/* <Route path="/contact" element={<ContactPage />} /> */}
    //       {/* <Route path="/booking" element={<BookingPage />} /> */}
    //       {/* <Route path="/login" element={<LoginPage />} /> */}
    //       {/* <Route path="/register" element={<RegisterPage />} /> */}
    //       {/* <Route path="/dashboard/client" element={<ClientDashboardPage />} /> */}
    //       {/* <Route path="/dashboard/admin" element={<AdminDashboardPage />} /> */}
    //     </Routes>
    //   </main>
    //   {/* <Footer /> */}
    // </Router>
    <>
      {/* Basic structure for now, router and layout will be added */}
      <HomePage />
    </>
  );
};

export default App;
