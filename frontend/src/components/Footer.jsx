import React from 'react';

const Footer = () => {
  return (
    <footer className="py-6 bg-slate-50 border-t border-slate-200 w-full mt-auto">
      <div className="container mx-auto px-4 flex items-center justify-center gap-2">
        <img src="/favicon.ico" alt="Elixir Logo" className="h-6" />
        <span className="text-sm text-slate-500">
          © {new Date().getFullYear()} elixir. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
