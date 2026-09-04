import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-surface border-t border-border mt-auto pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & Institutional Seal */}
          <div className="flex flex-col items-start md:col-span-2">
            <Link className="text-2xl font-black tracking-tight hover:opacity-80 transition-opacity mb-4" to="/">
              <span className="text-[#0F766E]">Butabika</span> <span className="text-slate-600">Cares</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md font-medium mb-8">
              An evidence-based digital mental health platform supporting therapeutic care, patient well-being, and clinical excellence across Uganda.
            </p>
            
            {/* Centered Seal Wrapper */}
            <div className="w-full max-w-md flex justify-center">
              <img 
                src="/butabika.png" 
                alt="Butabika Hospital Seal" 
                className="h-28 object-contain drop-shadow-md" 
                onError={(e) => e.target.style.display='none'} 
              />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-slate-900 font-black mb-6 tracking-[0.2em] text-xs uppercase">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link className="text-slate-500 hover:text-primary inline-flex items-center transition-colors" to="/">Home</Link></li>
              <li><Link className="text-slate-500 hover:text-primary inline-flex items-center transition-colors" to="/about">About Us</Link></li>
              <li><Link className="text-slate-500 hover:text-primary inline-flex items-center transition-colors" to="/resources">Resources</Link></li>
              <li>
                {!user ? (
                  <button 
                    onClick={() => {
                      toast('Please sign in to request therapy.', { icon: '🔒' });
                      sessionStorage.setItem('intendedRoute', '/intake');
                      navigate('/auth');
                    }}
                    className="text-slate-500 hover:text-primary inline-flex items-center transition-colors bg-transparent border-none cursor-pointer p-0 text-left font-inherit"
                  >
                    Therapy
                  </button>
                ) : (
                  <Link 
                    className="text-slate-500 hover:text-primary inline-flex items-center transition-colors" 
                    to="/intake"
                  >
                    Therapy
                  </Link>
                )}
              </li>
              {/* Discrete Staff Routing */}
              <li className="pt-2">
                <button 
                  onClick={() => {
                    if (user?.role === 'therapist') return navigate('/therapist/dashboard');
                    if (user?.role === 'clinical_admin') return navigate('/clinical/dashboard');
                    if (user?.role === 'admin') return navigate('/admin/dashboard');
                    navigate('/provider/auth');
                  }}
                  className="text-slate-400 hover:text-primary inline-flex items-center transition-colors font-semibold bg-transparent border-none cursor-pointer p-0 text-left font-inherit"
                >
                  Provider Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-slate-900 font-black mb-6 tracking-[0.2em] text-xs uppercase">Contact</h4>
            <div className="space-y-5">
              <a href="tel:0800211306" className="group flex items-start gap-3 transition-all">
                <div className="mt-1 text-primary group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Toll Free</p>
                  <p className="text-slate-700 font-semibold group-hover:text-primary transition-colors">0800 211 306</p>
                </div>
              </a>
              <a href="mailto:info@butabika.go.ug" className="group flex items-start gap-3 transition-all">
                <div className="mt-1 text-primary group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Email</p>
                  <p className="text-slate-700 font-semibold group-hover:text-primary transition-colors">info@butabika.go.ug</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Clinical & Centered */}
        <div className="flex flex-col items-center justify-center pt-10 border-t border-border gap-5 text-center">
          <a 
            href="https://www.butabikahospital.go.ug" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block py-1 text-sm font-semibold text-slate-500 hover:text-[#0F766E] transition-colors duration-300 cursor-pointer"
          >
            &copy; {currentYear} Butabika National Referral Mental Hospital
          </a>
          
          <div className="flex items-center justify-center gap-6 text-sm font-bold text-slate-500">
            <Link className="hover:text-[#0F766E] transition-colors" to="/privacy">Privacy Policy</Link>
            <Link className="hover:text-[#0F766E] transition-colors" to="/terms">Terms of Service</Link>
          </div>

          <div className="mt-2 text-xs font-medium text-slate-400 tracking-wide">
            Built by{' '}
            <a 
              href="https://share.google/y58FhFwk07ghShY3i" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-[#0F766E] hover:text-[#0D655E] transition-colors duration-300"
            >
              Feyn Systems
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
