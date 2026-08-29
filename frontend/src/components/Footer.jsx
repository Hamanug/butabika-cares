import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: Brand & Description */}
          <div className="flex flex-col items-start">
            
            {/* Inline Logo and Brand Text */}
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/butabika.png" 
                alt="Butabika Hospital" 
                className="h-14 object-contain drop-shadow-sm" 
                onError={(e) => e.target.style.display='none'} 
              />
              <Link className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-fuchsia-600 tracking-tight hover:opacity-80 transition-opacity" to="/">
                BUTABIKA CARES
              </Link>
            </div>

            {/* Description text */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm font-medium">
              Evidence-based digital mental health platform supporting therapeutic care and patient well-being across Uganda.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:pl-8">
            <h4 className="text-slate-900 font-bold mb-5 tracking-wider text-sm uppercase">Quick Links</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link className="text-slate-600 hover:text-cyan-600 hover:translate-x-1 inline-flex items-center gap-2 transition-all" to="/"><span className="text-cyan-600">›</span> Home</Link></li>
              <li><Link className="text-slate-600 hover:text-cyan-600 hover:translate-x-1 inline-flex items-center gap-2 transition-all" to="/about"><span className="text-cyan-600">›</span> About</Link></li>
              <li><Link className="text-slate-600 hover:text-cyan-600 hover:translate-x-1 inline-flex items-center gap-2 transition-all" to="/resources"><span className="text-cyan-600">›</span> Resources</Link></li>
              <li><Link className="text-slate-600 hover:text-cyan-600 hover:translate-x-1 inline-flex items-center gap-2 transition-all" to="/therapists"><span className="text-cyan-600">›</span> Therapists</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-slate-900 font-bold mb-5 tracking-wider text-sm uppercase">Contact Us</h4>
            <div className="space-y-3">
              
              {/* Toll Free */}
              <a href="tel:0800211306" className="group flex items-center gap-4 p-3 rounded-xl bg-cyan-50 border border-cyan-100 hover:bg-cyan-100/70 transition-all shadow-sm">
                <div className="bg-white p-2.5 rounded-full shadow-sm text-cyan-600 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] text-cyan-700 uppercase font-bold tracking-widest mb-0.5">Toll Free Helpline</p>
                  <p className="text-cyan-900 font-extrabold text-lg tracking-tight">0800 211 306</p>
                </div>
              </a>
              
              {/* Direct Line */}
              <a href="tel:0414504376" className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                <div className="text-slate-400 group-hover:text-cyan-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Direct Line</p>
                  <p className="text-slate-700 font-semibold group-hover:text-cyan-700 transition-colors">0414 504 376</p>
                </div>
              </a>

              {/* Email - Distinctive Orange Styling */}
              <a href="mailto:info@butabika.go.ug" className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-orange-200">
                <div className="text-orange-500 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] text-orange-600 uppercase font-bold tracking-widest mb-0.5">Email Us</p>
                  <p className="text-slate-700 font-semibold group-hover:text-orange-600 transition-colors">info@butabika.go.ug</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Strictly Centered */}
        <div className="flex flex-col items-center text-center justify-center pt-8 border-t border-slate-200 gap-3">
          
          {/* Line 1: Copyright */}
          <p className="text-lg font-bold text-slate-900">
            &copy; {currentYear} Butabika National Referral Mental Hospital
          </p>

          {/* Line 2: Legal Links */}
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
            <Link className="hover:text-cyan-600 transition-colors" to="/privacy">Privacy Policy</Link>
            <span className="text-slate-300">|</span>
            <Link className="hover:text-cyan-600 transition-colors" to="/terms">Terms of Service</Link>
          </div>
          
          {/* Line 3: Powered By Pill */}
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-black text-slate-400 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 mt-2">
            <span>POWERED BY</span>
            <img src="/elixir-logo.png" alt="Elixir Logo" className="h-4 object-contain ml-1" onError={(e) => e.target.style.display='none'} />
            <span className="text-cyan-600 text-xs">ELIXIR PHC</span>
            <span className="text-slate-300 mx-1">&amp;</span>
            <span className="text-orange-500 text-xs drop-shadow-sm">FEYN SYSTEMS</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
