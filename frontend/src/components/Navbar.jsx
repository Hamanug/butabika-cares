import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/therapist/auth';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAvatarText = () => {
    if (user?.name) {
      const parts = user.name.split(' ').filter(Boolean);
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    return "User";
  };

  return (
    <header className="px-4 md:px-8 bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <nav className="flex items-center justify-between w-full h-16 gap-4">
        {/* Left Zone: Brand & Nav */}
        <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-3 mr-4 lg:mr-8">
          <img src="/butabika.png" alt="Butabika Logo" className="h-8 md:h-12 w-auto object-contain" />
          <span className="text-[13px] sm:text-base md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-fuchsia-600 tracking-tight whitespace-nowrap">BUTABIKA CARES</span>
        </Link>
        <div className="hidden lg:flex gap-4 md:gap-6 text-sm md:text-base whitespace-nowrap">
          <Link to="/" className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">Home</Link>
          <Link to="/about" className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">About</Link>
          <Link to="/resources" className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">Resources</Link>
          <Link to="/therapists" className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">Therapists</Link>
          {user && <Link to="/dashboard" className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">Dashboard</Link>}
        </div>
      </div>

      {/* Middle Zone: Sponsors */}
      <div className="hidden xl:flex items-center justify-center gap-4 px-4 border-l border-r border-slate-200/60 my-2">
        <span className="whitespace-nowrap text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 select-none">Supported By</span>
        <a href="https://exteriors.gencat.cat" target="_blank" rel="noopener noreferrer">
          <img src="/catalonia.png" alt="Catalonia Logo" className="h-8 md:h-10 w-auto object-contain hover:opacity-80 transition-opacity" />
        </a>
        <a href="https://africahumanitarian.org" target="_blank" rel="noopener noreferrer">
          <img src="/aha.png" alt="AHA Logo" className="h-7 md:h-9 w-auto object-contain hover:opacity-80 transition-opacity" />
        </a>
        <a href="https://farmamundi.org" target="_blank" rel="noopener noreferrer">
          <img src="/famamundi.jpeg" alt="Famamundi Logo" className="h-7 md:h-9 w-auto object-contain hover:opacity-80 transition-opacity" />
        </a>
      </div>

      {/* Right Zone: Auth Dropdown */}
      <div className="flex items-center gap-2 md:gap-4 relative">
        {!user && !isAuthPage && (
          <button
            onClick={() => navigate('/auth')}
            className="whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            Sign In
          </button>
        )}
        
        {user && (
          <>
            <Link to="#" className="relative text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center h-9 w-9 rounded-full hover:bg-slate-100 mr-2">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">2</span>
            </Link>
            <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer ml-2"
            >
              <User className="h-5 w-5" />
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-100 z-50">
                  <div className="border-b border-slate-100 pb-2 mb-2 px-4 pt-2 text-slate-800 truncate font-medium">
                    {user?.name || user?.email || 'User'}
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-slate-600 hover:bg-slate-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left block px-4 py-2 text-red-500 hover:bg-red-50 rounded-b-md"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
          </>
        )}

        {/* Mobile Hamburger Menu */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden ml-2 text-slate-600 hover:text-cyan-600 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          )}
        </button>
      </div>
      </nav>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-t border-slate-100 shadow-lg px-6 py-4 flex flex-col gap-4 z-40">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">Home</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">About</Link>
          <Link to="/resources" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">Resources</Link>
          <Link to="/therapists" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">Therapists</Link>
          {user && <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-cyan-600 transition-colors">Dashboard</Link>}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-6 pt-4 border-t border-slate-100 mb-4">Supported By</div>
          <div className="flex items-center justify-center gap-4">
            <a href="https://exteriors.gencat.cat" target="_blank" rel="noopener noreferrer"><img src="/catalonia.png" alt="Catalonia" className="h-6 w-auto object-contain" /></a>
            <a href="https://africahumanitarian.org" target="_blank" rel="noopener noreferrer"><img src="/aha.png" alt="AHA" className="h-5 w-auto object-contain" /></a>
            <a href="https://farmamundi.org" target="_blank" rel="noopener noreferrer"><img src="/famamundi.jpeg" alt="Farmamundi" className="h-5 w-auto object-contain" /></a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
