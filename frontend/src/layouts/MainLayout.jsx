import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBanner } from '../components/common/DemoBanner';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/common/Toast';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-gray-100 selection:bg-brand-500 selection:text-white">
      <DemoBanner />
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
};
