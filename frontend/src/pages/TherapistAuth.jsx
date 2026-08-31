import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, FileText, Shield, Video, Eye, EyeOff } from 'lucide-react';

export default function TherapistAuth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('login'); // login, forgot, verify, reset
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post('/api/auth/therapist/login', { identifier: identifier.trim(), password: password.trim() });
      login(res.data.user);
      navigate('/therapist/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  const handleForgotSend = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('/api/auth/therapist/forgot-password-otp', { identifier: identifier.trim() });
      setStep('verify');
      setSuccessMessage('A recovery code has been sent to your registered contact.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to locate account.');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.trim().length < 8) return setError('Password must be at least 8 characters.');
    setError(''); setLoading(true);
    try {
      await axios.post('/api/auth/therapist/reset-password', { 
        identifier: identifier.trim(), otp_code: otp.trim(), new_password: password.trim() 
      });
      setStep('login');
      setPassword(''); setOtp('');
      setSuccessMessage('Password reset successfully! Please sign in.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      
      {/* Left Side: Secure Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center bg-white px-6 sm:px-12 min-h-screen lg:min-h-0 relative">
        <div className="w-full max-w-md flex flex-col pt-12 lg:pt-16 pb-10">
          
          {/* Centered Header Section */}
          <div className="mb-8 text-center flex flex-col items-center">
            <img src="/butabika.png" alt="Butabika Logo" className="h-28 md:h-36 w-auto mb-6 object-contain" />
            <div className="bg-teal-50 text-[#0F766E] text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 mt-2 inline-block">SECURE CLINICAL PORTAL</div>
            <h1 className="text-3xl font-black tracking-tight">
              {step === 'login' && <><span className="text-[#0F766E]">Staff</span> <span className="text-slate-800">Login</span></>}
              {step === 'forgot' && <><span className="text-[#0F766E]">Account</span> <span className="text-slate-800">Recovery</span></>}
              {step === 'verify' && <><span className="text-[#0F766E]">Security</span> <span className="text-slate-800">Code</span></>}
              {step === 'reset' && <><span className="text-[#0F766E]">New</span> <span className="text-slate-800">Password</span></>}
            </h1>
            <p className="text-sm text-slate-500 mt-2 mb-8 font-medium">
              {step === 'login' && 'Secure access for authorized Butabika staff.'}
              {step !== 'login' && 'Follow the protocol to recover your secure access.'}
            </p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-bold">{error}</div>}
          {successMessage && <div className="mb-6 p-4 bg-teal-50 text-[#0F766E] rounded-lg text-sm border border-teal-200 font-bold">{successMessage}</div>}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-700 mb-2">Email or Phone Number</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full h-12 rounded-lg border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] bg-white text-slate-900 font-medium transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 rounded-lg border border-slate-300 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] bg-white text-slate-900 font-medium transition-colors" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F766E] transition-colors focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end mt-1 mb-4">
                <button type="button" onClick={() => { setStep('forgot'); setError(''); setSuccessMessage(''); }} className="text-sm font-bold text-slate-500 hover:text-[#0F766E] transition-colors">Forgot credentials?</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white h-12 rounded-full text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center uppercase tracking-widest mt-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Secure Sign In'}
              </button>
            </form>
          )}

          {step === 'forgot' && (
            <form onSubmit={handleForgotSend} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-700 mb-2">Registered Email or Phone</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full h-12 rounded-lg border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] bg-white text-slate-900 font-medium transition-colors" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white h-12 rounded-full text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center uppercase tracking-widest">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Recovery Code'}
              </button>
              <button type="button" onClick={() => setStep('login')} className="w-full text-sm text-slate-500 flex items-center justify-center mt-4 font-bold hover:text-[#0F766E] transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Login
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={(e) => { e.preventDefault(); if (otp.length === 6) setStep('reset'); else setError('Enter a 6-digit code'); }} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-700 mb-2">6-Digit Code</label>
                <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full h-12 rounded-lg border border-slate-300 px-4 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] bg-white text-slate-900 font-medium transition-colors" required autoFocus />
              </div>
              <button type="submit" className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white h-12 rounded-full text-sm font-bold shadow-sm transition-colors uppercase tracking-widest">Verify Code</button>
              <button type="button" onClick={() => setStep('forgot')} className="w-full text-sm text-slate-500 flex items-center justify-center mt-4 font-bold hover:text-[#0F766E] transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 rounded-lg border border-slate-300 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] bg-white text-slate-900 font-medium transition-colors" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F766E] transition-colors focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white h-12 rounded-full text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center uppercase tracking-widest">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Set New Password'}
              </button>
            </form>
          )}

        </div>

        {/* Absolute Bottom Copyright & Disclaimer Area */}
        <div className="w-full mt-auto pb-6">
          <div className="max-w-md mx-auto text-center border-t border-slate-100 pt-8 mb-6">
            <p className="text-xs text-slate-500 font-medium">Are you a patient? This portal is restricted to authorized Butabika Hospital personnel.</p>
            <Link to="/auth" className="text-xs font-bold text-[#0F766E] hover:underline transition-colors mt-2 block">
              Return to Patient Portal
            </Link>
          </div>
          
          <div className="w-full text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              COPYRIGHT © 2026 BUTABIKA NATIONAL REFERRAL MENTAL HOSPITAL. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: The Clinical Gateway */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-[#0F766E] relative justify-center items-start pt-12 lg:pt-32 px-12 pb-12 overflow-hidden">
        
        {/* Massive Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <img src="/butabika.png" alt="Butabika Crest Watermark" className="w-[80%] h-auto object-contain" />
        </div>

        {/* Frosted Glass Information Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-10 max-w-lg w-full relative z-10 shadow-2xl">
          <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight mb-4">
            Advanced Clinical Workspace.<br/><span className="text-emerald-400">Zero-Trust Security.</span>
          </h2>
          <p className="text-slate-200 text-sm font-medium mb-8 leading-relaxed">
            Engineered for Butabika National Referral Mental Hospital staff. Access your secure EMR tools, manage caseloads, and conduct encrypted telehealth sessions.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Integrated EMR System</h3>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  Access secure patient charts and longitudinal clinical data.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">RBAC Compliance</h3>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  Your session is governed by strict Role-Based Access Control and zero-trust architecture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                <Video className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Encrypted Telehealth</h3>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  Conduct high-fidelity, E2EE virtual sessions natively within the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
