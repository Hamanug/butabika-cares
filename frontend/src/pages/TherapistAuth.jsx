import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
      if (res.data.requireReset) {
        setOtp(password); // Temporarily store the temp password to send to the reset endpoint
        setPassword(''); // Clear the password field for the new input
        setStep('reset');
        return;
      }
      login(res.data.user);
      navigate('/therapist/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  const handleInitialPasswordSet = async (e) => {
    e.preventDefault();
    if (password.trim().length < 8) return setError('New password must be at least 8 characters.');
    setError(''); setLoading(true);
    try {
      const res = await axios.post('/api/auth/therapist/set-initial-password', { 
        identifier: identifier.trim(), temporary_password: otp, new_password: password.trim() 
      });
      login(res.data.user);
      navigate('/therapist/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      
      {/* Left Side: Secure Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center bg-white px-6 sm:px-12 min-h-screen lg:min-h-0 relative">
        <div className="w-full max-w-md flex flex-col pt-8 lg:pt-12 pb-10">
          
          {/* Centered Header Section */}
          <div className="mb-8 text-center flex flex-col items-center">
            <img src="/butabika.png" alt="Butabika Logo" className="h-28 md:h-36 w-auto mb-2 object-contain" />
            <div className="bg-teal-50 text-[#0F766E] text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mt-2 mb-2 inline-block">SECURE CLINICAL PORTAL</div>
            <h1 className="text-3xl font-black tracking-tight">
              {step === 'login' && <><span className="text-[#0F766E]">Staff</span> <span className="text-slate-600">Login</span></>}
              {step === 'forgot' && <><span className="text-[#0F766E]">Account</span> <span className="text-slate-600">Recovery</span></>}
              {step === 'verify' && <><span className="text-[#0F766E]">Security</span> <span className="text-slate-600">Code</span></>}
              {step === 'reset' && <><span className="text-[#0F766E]">New</span> <span className="text-slate-600">Password</span></>}
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Email or Phone Number</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full h-12 rounded-lg border border-slate-300 px-4 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#0F766E] focus-visible:border-[#0F766E] bg-white text-slate-900 font-medium transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 rounded-lg border border-slate-300 pl-4 pr-12 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#0F766E] focus-visible:border-[#0F766E] bg-white text-slate-900 font-medium transition-colors" required />
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
            <div className="space-y-6 text-center animate-fade-in-up">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-sm font-black text-red-700 mb-2 uppercase tracking-widest">IT Authorization Required</h3>
                <p className="text-sm text-red-600 font-semibold leading-relaxed">
                  For security and compliance purposes, clinical staff cannot self-reset passwords. 
                  <br/><br/>
                  Please contact the Butabika IT Administration Desk at <span className="font-black text-red-800">Internal Ext. 400</span> to receive a temporary access credential.
                </p>
              </div>
              <button type="button" onClick={() => setStep('login')} className="w-full text-sm text-slate-500 flex items-center justify-center font-bold hover:text-[#0F766E] transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Login
              </button>
            </div>
          )}

          {step === 'reset' && (
            <form onSubmit={handleInitialPasswordSet} className="space-y-5 animate-fade-in-up">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4 text-sm text-[#0F766E] font-medium">
                Welcome. For your security, you must replace your temporary IT-issued credential with a permanent private password.
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Create Permanent Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full h-12 rounded-lg border border-slate-300 pl-4 pr-12 focus:outline-none focus:border-[#0F766E] bg-white text-slate-900 font-medium transition-colors" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F766E] focus:outline-none">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white h-12 rounded-full text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center uppercase tracking-widest">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Secure & Continue'}
              </button>
            </form>
          )}

        </div>

        {/* Patient Safety Redirect & Mobile Footer (Left Side) */}
        <div className="w-full mt-auto pb-8 flex flex-col items-center justify-center space-y-5 text-center">
          <div>
            <p className="text-xs text-slate-500 mb-1">Are you a patient? This portal is restricted to authorized personnel.</p>
            <a href="/auth" className="text-xs font-bold text-[#0F766E] hover:underline transition-all">Return to Patient Portal</a>
          </div>
          
          <div className="w-full border-t border-slate-200/60 pt-5 lg:hidden">
            <a 
              href="https://www.butabikahospital.go.ug" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-400 text-center tracking-wide hover:text-[#0F766E] transition-colors"
            >
              &copy; {new Date().getFullYear()} Butabika National Referral Mental Hospital
            </a>
          </div>
        </div>
      </div>

      {/* Right Side: The Clinical Gateway */}
      <div className="hidden lg:flex flex-col lg:w-1/2 bg-gradient-to-br from-slate-900 to-[#0F766E] relative justify-center items-center pt-12 lg:pt-16 px-12 pb-12 overflow-hidden">
        
        {/* Massive Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <img src="/butabika.png" alt="Butabika Crest Watermark" className="w-[80%] h-auto object-contain" />
        </div>

        {/* Frosted Glass Information Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-10 max-w-lg w-full relative z-10 shadow-2xl">
          <h2 className="text-2xl lg:text-3xl font-black text-teal-400 leading-snug mb-4">
            Secure Clinical Access.
          </h2>
          <p className="text-slate-200 text-sm font-medium mb-8 leading-relaxed">
            A dedicated workspace for Butabika National Referral Mental Hospital personnel to manage patient care, clinical records, and private consultations safely.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">SECURE PATIENT CHARTS</h3>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  Review and update longitudinal clinical records with absolute privacy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">STRICT ACCESS CONTROLS</h3>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  Patient data is strictly compartmentalized based on your verified clinical role.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                <Video className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">PRIVATE TELEHEALTH</h3>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  Conduct high-fidelity virtual care in a strictly confidential environment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Footer Placement */}
        <div className="mt-6 text-center w-full max-w-md mx-auto">
          <a href="https://www.butabikahospital.go.ug/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-emerald-400 uppercase tracking-widest opacity-80 transition-colors duration-300 inline-block">
            &copy; 2026 Butabika National Referral Mental Hospital
          </a>
        </div>
      </div>
      
    </div>
  );
}
