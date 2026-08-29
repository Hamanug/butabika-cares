// Note: This serves as a placeholder wrapper for the clinical views. 
// It currently mirrors MainLayout but will be replaced with a Sidebar architecture in Phase 4.
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
