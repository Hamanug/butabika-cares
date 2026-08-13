import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-6 bg-slate-50 border-t border-slate-200 w-full mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/favicon.ico" alt="Elixir Logo" className="h-6" />
          <span className="text-sm text-slate-500">
            © {new Date().getFullYear()} elixir. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
