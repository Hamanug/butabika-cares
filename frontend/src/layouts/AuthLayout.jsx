import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <main className="min-h-screen bg-surface">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
