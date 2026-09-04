import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
// Removes formatUserName
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

const formatUserName = (user) => {
  if (!user) return '';
  if (user.role === 'admin') return `IT Admin (${user.email.split('@')[0]})`;
  if (user.role === 'clinical_admin') return `Clinical Admin (${user.email.split('@')[0]})`;
  if (user.role === 'therapist') return `Provider (${user.email.split('@')[0]})`;
  return `Patient ${user.display_id || 'ID_PENDING'}`;
};

const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/therapist/auth';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let intervalId;
    
    const fetchUnreadCount = async () => {
      if (!user || user.role === 'admin') return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/unread-count`, { withCredentials: true });
        setUnreadCount(res.data.count || 0);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    if (user) {
      fetchUnreadCount();
      intervalId = setInterval(fetchUnreadCount, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (_message) => {
      if (location.pathname !== '/messages') {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleMessagesRead = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/unread-count`, { withCredentials: true });
        setUnreadCount(res.data.count || 0);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };
  
    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead);
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, location.pathname, user]);

  const getDashboardPath = () => {
    if (!user) return '/auth';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'therapist') return '/therapist/dashboard';
    return '/dashboard'; // Default to patient
  };

  const getLogoPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'therapist') return '/therapist/dashboard';
    return '/';
  };

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? "px-4 py-2 text-[15px] font-bold text-[#0F766E] bg-teal-50 rounded-full transition-all duration-300 ease-out whitespace-nowrap"
      : "px-4 py-2 text-[15px] font-semibold text-slate-500 hover:text-[#0F766E] hover:bg-teal-50/50 rounded-full transition-all duration-300 ease-out whitespace-nowrap";
  };

  const getMobileNavLinkClass = (path) => {
    return location.pathname === path
      ? "block w-full px-5 py-3.5 text-base font-bold text-[#0F766E] bg-teal-50/50 rounded-xl border-l-4 border-[#0F766E] transition-all duration-200 shadow-sm"
      : "block w-full px-5 py-3.5 text-base font-medium text-slate-600 hover:text-[#0F766E] hover:bg-slate-50 rounded-xl border-l-4 border-transparent transition-all duration-200";
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 fixed w-full top-0 z-50 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      {/* MAIN WRAPPER */}
      <nav className="flex items-center justify-between w-full h-20 gap-2 sm:gap-4 max-w-[1400px] mx-auto px-3 sm:px-6 md:px-8">
        
        {/* LEFT ZONE: Logo & Nav Links Grouped Tightly */}
        <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
          
          <Link to={getLogoPath()} className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <img src="/butabika.png" alt="Butabika Logo" className="h-9 sm:h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight hidden md:block">
              <span className="text-[#0F766E]">Butabika</span> <span className="text-slate-600">Cares</span>
            </span>
          </Link>
          
          {/* Navigation Links (No more ml-4 margin, directly next to logo) */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {isLoading ? (
              <div className="flex gap-6 animate-pulse opacity-40">
                <div className="h-5 w-12 bg-slate-200 rounded"></div>
                <div className="h-5 w-12 bg-slate-200 rounded"></div>
                <div className="h-5 w-16 bg-slate-200 rounded"></div>
              </div>
            ) : (
              (!user || (user.role !== 'therapist' && user.role !== 'admin')) ? (
                <>
                  <Link to="/" className={getNavLinkClass('/')}>Home</Link>
                  <Link to="/about" className={getNavLinkClass('/about')}>About</Link>
                  <Link to="/resources" className={getNavLinkClass('/resources')}>Resources</Link>
                  
                  {!user ? (
                    <button 
                      onClick={() => {
                        toast('Please sign in to request therapy.', { icon: '🔒' });
                        sessionStorage.setItem('intendedRoute', '/intake');
                        navigate('/auth');
                      }}
                      className={`${getNavLinkClass('/intake')} bg-transparent border-none cursor-pointer`}
                    >
                      Therapy
                    </button>
                  ) : (
                    <Link to="/intake" className={getNavLinkClass('/intake')}>Therapy</Link>
                  )}
                  {user && <Link to={getDashboardPath()} className={getNavLinkClass(getDashboardPath())}>Dashboard</Link>}
                </>
              ) : (
                <Link to={getDashboardPath()} className={getDashboardPath() ? getNavLinkClass(getDashboardPath()) : getNavLinkClass('/')}>Workspace</Link>
              )
            )}
          </div>
        </div>

        {/* RIGHT ZONE: Sponsors & Profile */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 min-w-0">
          
          {/* Reverted back to lg:flex to show on standard laptops, with tighter padding */}
          <div className="hidden lg:flex flex-col items-start gap-1.5 pr-3 xl:pr-4 border-r border-slate-200 mr-1 xl:mr-2 flex-shrink-0">
            {/* Row 1: Supported By */}
            <div className="flex items-center gap-3 xl:gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">Supported By</span>
              <a href="https://exteriors.gencat.cat" target="_blank" rel="noopener noreferrer">
                <img src="/catalonia.png" alt="Catalonia" className="h-4 xl:h-5 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              </a>
              <a href="https://africahumanitarian.org" target="_blank" rel="noopener noreferrer">
                <img src="/aha.png" alt="AHA" className="h-3 xl:h-4 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              </a>
              <a href="https://farmamundi.org" target="_blank" rel="noopener noreferrer">
                <img src="/famamundi.jpeg" alt="Farmamundi" className="h-3 xl:h-4 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              </a>
            </div>

            {/* Row 2: Clinical Partner */}
            <div className="flex items-center gap-3 xl:gap-4">
              <span className="text-[10px] font-bold text-[#0F766E]/60 uppercase tracking-widest select-none">
                Clinical Partner
              </span>
              
              {/* Group container synchronizes hover effects for both logo and text */}
              <div className="flex items-center gap-1.5 group cursor-default">
                <img 
                  src="/elixir.png" 
                  alt="Elixir Logo" 
                  className="h-4 xl:h-5 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" 
                />
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#0F766E] transition-colors duration-300">
                  Elixir PHC
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse opacity-50 hidden sm:block flex-shrink-0"></div>
          ) : (
            <>
              {!user && !isAuthPage && (
                <Button onClick={() => navigate('/auth')} size="sm" className="hidden sm:flex rounded-full px-6 py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-[#0F766E] hover:bg-[#0D655E] text-[15px] font-bold text-white flex-shrink-0">
                  Sign In
                </Button>
              )}
              
              {user && (
                <>
                  {user.role !== 'admin' && (
                    <button onClick={() => navigate('/messages')} className="relative text-slate-500 hover:text-[#0F766E] transition-colors flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-50 hover:bg-teal-50 border border-transparent hover:border-teal-100 flex-shrink-0">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )}
                  <div className="relative flex-shrink-0" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#0F766E] transition-colors cursor-pointer focus:ring-2 focus:ring-[#0F766E]/20 shadow-sm"
                    >
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    
                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                        <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
                          <div className="border-b border-slate-100 pb-3 mb-1 px-4 pt-4 bg-slate-50/50">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Signed in as</p>
                            <p className="text-sm text-slate-900 truncate font-bold">{formatUserName(user)}</p>
                          </div>
                          {(user.role !== 'admin' && user.role !== 'clinical_admin') && (
                            <Link
                              to="/profile"
                              className="block px-4 py-3 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-[#0F766E] transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              My Profile
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              logout();
                              navigate('/');
                            }}
                            className="w-full text-left block px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Mobile Hamburger Menu */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-slate-600 hover:text-[#0F766E] focus:outline-none transition-colors h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center bg-slate-50 rounded-md border border-slate-200 shadow-sm flex-shrink-0"
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Full-Height Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-[80px] left-0 w-full h-[calc(100dvh-80px)] bg-slate-50 border-t border-slate-200 z-40 flex flex-col justify-between overflow-y-auto">
          
          {/* Links Section */}
          <div className="px-4 py-6 flex flex-col gap-2">
            {(!user || (user.role !== 'therapist' && user.role !== 'admin')) ? (
              <>
                <Link to="/" className={getMobileNavLinkClass('/')}>Home</Link>
                <Link to="/about" className={getMobileNavLinkClass('/about')}>About</Link>
                <Link to="/resources" className={getMobileNavLinkClass('/resources')}>Resources</Link>
                
                {!user ? (
                  <button 
                    onClick={() => {
                      toast('Please sign in to request therapy.', { icon: '🔒' });
                      sessionStorage.setItem('intendedRoute', '/intake');
                      navigate('/auth');
                    }}
                    className={`${getMobileNavLinkClass('/intake')} bg-transparent border-none cursor-pointer text-left`}
                  >
                    Therapy
                  </button>
                ) : (
                  <Link to="/intake" className={getMobileNavLinkClass('/intake')}>Therapy</Link>
                )}

                {user && <Link to={getDashboardPath()} className={getMobileNavLinkClass(getDashboardPath())}>Dashboard</Link>}
                
                {/* Mobile specific sign-in button if not logged in */}
                {!user && !isAuthPage && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <Button onClick={() => navigate('/auth')} className="w-full h-12 text-[15px] font-bold bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl shadow-sm">
                      Sign In
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Link to={getDashboardPath()} className={getMobileNavLinkClass(getDashboardPath())}>Workspace Dashboard</Link>
            )}
          </div>
          
          {/* Mobile Sponsors at the Absolute Bottom */}
          <div className="mt-auto bg-white border-t border-slate-200 px-4 py-8 flex flex-col items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Institutional Partners</span>
            <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
              <a href="https://exteriors.gencat.cat" target="_blank" rel="noopener noreferrer">
                <img src="/catalonia.png" alt="Catalonia" className="h-6 sm:h-7 w-auto object-contain grayscale opacity-60" />
              </a>
              <a href="https://africahumanitarian.org" target="_blank" rel="noopener noreferrer">
                <img src="/aha.png" alt="AHA" className="h-5 sm:h-6 w-auto object-contain grayscale opacity-60" />
              </a>
              <a href="https://farmamundi.org" target="_blank" rel="noopener noreferrer">
                <img src="/famamundi.jpeg" alt="Farmamundi" className="h-5 sm:h-6 w-auto object-contain grayscale opacity-60" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
