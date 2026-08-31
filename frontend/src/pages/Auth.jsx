import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Activity, Video, Lock, Globe } from 'lucide-react';

const calculateAge = (dobString) => {
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(location.state?.isSignUp ?? false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form'); 
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhoneClient = (rawPhone) => {
    let cleaned = rawPhone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+256')) return cleaned.slice(1);
    if (cleaned.startsWith('07')) return '256' + cleaned.slice(1);
    if (cleaned.startsWith('7')) return '256' + cleaned;
    if (cleaned.startsWith('256')) return cleaned;
    return cleaned.replace(/\+/g, '');
  };
  const formattedPhone = formatPhoneClient(phoneNumber);

  const resolvePendingActions = async () => {
    try {
      const pendingAppointment = sessionStorage.getItem('pendingAppointment');
      if (pendingAppointment) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/book`, JSON.parse(pendingAppointment), { withCredentials: true });
        sessionStorage.removeItem('pendingAppointment');
      }
      const pendingSleepScore = sessionStorage.getItem('pendingSleepScore');
      if (pendingSleepScore) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/sleep-tracking`, JSON.parse(pendingSleepScore), { withCredentials: true });
        sessionStorage.removeItem('pendingSleepScore');
      }
      const pendingStressScore = sessionStorage.getItem('pendingStressScore');
      if (pendingStressScore) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/stress-tracking`, JSON.parse(pendingStressScore), { withCredentials: true });
        sessionStorage.removeItem('pendingStressScore');
      }
      const pendingThoughtRecord = sessionStorage.getItem('pendingThoughtRecord');
      if (pendingThoughtRecord) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/thought-records`, JSON.parse(pendingThoughtRecord), { withCredentials: true });
        sessionStorage.removeItem('pendingThoughtRecord');
      }
      const pendingMindfulness = sessionStorage.getItem('pendingMindfulness');
      if (pendingMindfulness) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/mindfulness`, JSON.parse(pendingMindfulness), { withCredentials: true });
        sessionStorage.removeItem('pendingMindfulness');
      }
      const pendingJournal = sessionStorage.getItem('pendingJournal');
      if (pendingJournal) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/journal/entries`, JSON.parse(pendingJournal), { withCredentials: true });
        sessionStorage.removeItem('pendingJournal');
      }
      const pendingExercise = sessionStorage.getItem('pendingExercise');
      if (pendingExercise) {
        const { cycles } = JSON.parse(pendingExercise);
        const existingStats = JSON.parse(localStorage.getItem('breathingStats')) || { cycles: 0 };
        const newTotalCycles = (existingStats.cycles || 0) + cycles;
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        localStorage.setItem('breathingStats', JSON.stringify({ cycles: newTotalCycles, lastSession: today }));
        sessionStorage.removeItem('pendingExercise');
      }
    } catch (error) {
      console.error("Failed to save pending items post-login", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!phoneNumber) return setError('Please enter a valid phone number');
    setLoading(true);
    if (!isSignUp) {
      try {
        const res = await axios.post('/api/auth/login', { phone_number: formattedPhone, password: password.trim() });
        login(res.data.user);
        await resolvePendingActions();
        const intendedRoute = sessionStorage.getItem('intendedRoute');
        if (intendedRoute) {
          sessionStorage.removeItem('intendedRoute');
          navigate(intendedRoute);
          return;
        }
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid credentials.');
      } finally { setLoading(false); }
    } else {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      if (!dateOfBirth) {
        setError('Date of birth is required.');
        setLoading(false);
        return;
      }
      const userAge = calculateAge(dateOfBirth);
      if (userAge < 18) {
        setError("You must be at least 18 years old to use this service.");
        setLoading(false);
        return;
      }
      setStep('confirm');
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await axios.post('/api/auth/patient/send-otp', { phone_number: formattedPhone, date_of_birth: dateOfBirth });
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification code.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Please enter a 6-digit code');
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await axios.post('/api/auth/patient/verify-otp', { phone_number: formattedPhone, otp_code: otp, password: password.trim(), date_of_birth: dateOfBirth });
      login(res.data.user);
      await resolvePendingActions();
      const intendedRoute = sessionStorage.getItem('intendedRoute');
      if (intendedRoute) {
        sessionStorage.removeItem('intendedRoute');
        navigate(intendedRoute);
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code.');
    } finally { setLoading(false); }
  };

  const handleForgotPhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!phoneNumber) return setError('Please enter your phone number');
    setLoading(true);
    try {
      await axios.post('/api/auth/patient/forgot-password-otp', { phone_number: formattedPhone });
      setStep('forgot_verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify account.');
    } finally { setLoading(false); }
  };

  const handleForgotVerifySubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (otp.length !== 6) return setError('Please enter a 6-digit code');
    setStep('forgot_reset');
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await axios.post('/api/auth/patient/reset-password', { phone_number: formattedPhone, otp_code: otp, new_password: password.trim() });
      setStep('form');
      setIsSignUp(false);
      setOtp('');
      setPassword('');
      setSuccessMessage('Password reset successfully! Please sign in with your new password.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen w-full bg-surface relative font-sans">
      {/* Minimalist Global Back Navigation */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm z-10 border border-slate-200"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      {/* Left Column: Auth Form */}
      <div className="relative flex w-full flex-col justify-center px-6 lg:w-1/2 lg:flex-none xl:px-24 pt-20 lg:pt-0 bg-white overflow-hidden">
        
        {/* Subtle background glow for depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-lg bg-primary-light/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 mx-auto w-full max-w-sm animate-fade-in-up">
          
          {/* Centered Logo & Headers */}
          <div className="mb-10 flex flex-col items-center text-center">
            <Link to="/" className="mb-6 hover:opacity-80 transition-opacity flex flex-col items-center">
              {/* Mobile: Official Crest */}
              <img src="/butabika.png" alt="Butabika Hospital" className="h-16 w-auto object-contain drop-shadow-sm lg:hidden mb-2" />
              
              {/* Desktop: Premium Eyebrow Text */}
              <span className="hidden lg:block font-heading text-xs md:text-sm font-black text-[#0F766E]/70 uppercase tracking-[0.25em] drop-shadow-sm">
                Butabika Cares
              </span>
            </Link>
            
            {/* Main Header shifted to Slate to prevent color clashing */}
            <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {step === 'form' && (isSignUp ? 'Create Account' : 'Welcome Back')}
              {step === 'confirm' && 'Confirm Number'}
              {step === 'verify' && 'Verify Number'}
              {step === 'forgot_phone' && 'Account Recovery'}
              {step === 'forgot_verify' && 'Verify Recovery Code'}
              {step === 'forgot_reset' && 'Create New Password'}
            </h1>
            <p className="mt-3 text-sm md:text-base font-medium text-slate-500">
              {step === 'form' && (isSignUp ? 'Begin your mental health journey securely.' : 'Please enter your details to sign in.')}
              {step === 'forgot_phone' && "Enter your registered phone number and we'll send a code to reset your password."}
              {step === 'confirm' && "Verify this is the correct number before we send a code."}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-destructive-light/50 p-4 text-sm text-destructive border border-destructive/20 shadow-sm animate-fade-in-up">
              <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-primary-light/50 p-4 text-sm text-[#0F766E] border border-primary/20 shadow-sm animate-fade-in-up">
              <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          )}

          <div className="mt-2">
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#155E75]">Phone Number</label>
                  <Input 
                    type="text" 
                    placeholder="e.g., 0712345678" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+\s]/g, ''))} 
                    className="h-12 text-base shadow-sm border-slate-200 focus-visible:border-[#0F766E] bg-slate-50/50"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#155E75]">Password</label>
                  <div className="relative shadow-sm rounded-md">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="h-12 text-base pr-12 border-slate-200 focus-visible:border-[#0F766E] bg-slate-50/50"
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-3 text-slate-400 hover:text-[#0F766E] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                  {!isSignUp && (
                    <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => { setError(''); setSuccessMessage(''); setStep('forgot_phone'); }} className="text-sm font-semibold text-[#0F766E] hover:text-[#115E59] transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#155E75]">Date of Birth</label>
                    <Input 
                      type="date" 
                      value={dateOfBirth} 
                      onChange={(e) => setDateOfBirth(e.target.value)} 
                      className="h-12 text-base shadow-sm border-slate-200 focus-visible:border-[#0F766E] bg-slate-50/50"
                      required 
                    />
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-12 text-base mt-4 shadow-md font-semibold tracking-wide bg-[#0F766E] hover:bg-[#115E59]">
                  {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>

                <div className="mt-8 text-center">
                  <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMessage(''); }} className="text-sm font-medium text-slate-500 transition-colors">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <span className="text-[#0F766E] font-bold hover:text-[#115E59] hover:underline underline-offset-4">
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* Step: Confirm */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="rounded-xl bg-slate-50 p-6 text-center border border-slate-200 shadow-inner">
                  <p className="text-sm font-medium text-slate-500 mb-2">Registering with number:</p>
                  <p className="text-3xl font-bold tracking-wide text-slate-900">{formattedPhone}</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" type="button" onClick={() => setStep('form')} className="flex-1 h-12 font-semibold border-slate-200 hover:bg-slate-50">Edit</Button>
                  <Button type="button" onClick={handleSendOtp} disabled={loading} className="flex-1 h-12 font-semibold shadow-md bg-[#0F766E] hover:bg-[#115E59]">
                    {loading ? 'Sending...' : 'Confirm'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Verify */}
            {(step === 'verify' || step === 'forgot_verify') && (
              <form onSubmit={step === 'verify' ? handleVerifyOtp : handleForgotVerifySubmit} className="space-y-8">
                <div className="rounded-xl bg-slate-50 p-6 text-center border border-slate-200 shadow-inner">
                  <p className="text-sm font-medium text-slate-500 mb-2">6-digit code sent to:</p>
                  <p className="text-xl font-bold tracking-wide text-slate-900">{formattedPhone}</p>
                </div>
                <div>
                  <Input 
                    type="text" 
                    maxLength={6} 
                    placeholder="• • • • • •" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                    className="text-center text-3xl tracking-[0.5em] font-mono h-16 shadow-inner bg-slate-50/50 border-slate-200 focus-visible:border-[#0F766E]" 
                    autoFocus 
                  />
                </div>
                <Button type="submit" disabled={loading || otp.length !== 6} className="w-full h-12 font-semibold shadow-md bg-[#0F766E] hover:bg-[#115E59]">
                  {step === 'verify' ? 'Verify & Sign In' : 'Verify Code'}
                </Button>
                <button type="button" onClick={() => setStep(step === 'verify' ? 'form' : 'forgot_phone')} className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              </form>
            )}

            {/* Step: Forgot Phone */}
            {step === 'forgot_phone' && (
              <form onSubmit={handleForgotPhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#155E75]">Phone Number</label>
                  <Input 
                    type="text" 
                    placeholder="e.g., 0712345678" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+\s]/g, ''))} 
                    className="h-12 text-base shadow-sm border-slate-200 focus-visible:border-[#0F766E] bg-slate-50/50"
                    required 
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 font-semibold shadow-md bg-[#0F766E] hover:bg-[#115E59]">
                  {loading ? 'Processing...' : 'Send Recovery Code'}
                </Button>
                <button type="button" onClick={() => setStep('form')} className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </button>
              </form>
            )}

            {/* Step: Forgot Reset */}
            {step === 'forgot_reset' && (
              <form onSubmit={handleForgotResetSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#155E75]">New Password</label>
                  <div className="relative shadow-sm rounded-md">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="h-12 text-base pr-12 border-slate-200 focus-visible:border-[#0F766E] bg-slate-50/50"
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-3 text-slate-400 hover:text-[#0F766E] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 font-semibold shadow-md bg-[#0F766E] hover:bg-[#115E59]">
                  {loading ? 'Processing...' : 'Reset Password'}
                </Button>
              </form>
            )}
          </div>

          {/* Mobile Branding & Legal Footer */}
          <div className="mt-12 flex flex-col items-center justify-center space-y-3 border-t border-slate-200/60 pt-6 pb-8 lg:pb-0 animate-fade-in-up">
            <p className="lg:hidden text-xs font-medium text-slate-400 text-center tracking-wide">
              © {new Date().getFullYear()} Butabika National Referral Mental Hospital
            </p>
            <div className="flex gap-6 text-xs font-bold text-[#155E75]">
              <Link to="/privacy" className="hover:text-[#0F766E] hover:underline underline-offset-4 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#0F766E] hover:underline underline-offset-4 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Premium Hospital Branding Visual */}
      <div className="relative hidden w-1/2 lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#0369A1] to-[#0F172A]">
        
        {/* Animated ambient mesh gradients */}
        <div className="absolute top-0 left-0 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl animate-breathe"></div>
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-breathe animation-delay-200"></div>
        
        {/* THE WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img 
            src="/butabika.png" 
            alt="Butabika Watermark" 
            className="h-[120%] w-auto object-contain opacity-[0.07] grayscale mix-blend-overlay" 
          />
        </div>

        {/* Main Graphic Centerpiece (Perfectly Centered) */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-12">
          
          <div className="text-left w-full max-w-xl bg-slate-900/40 p-10 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl animate-fade-in-up">
            <h2 className="font-heading text-3xl font-bold text-white mb-4 drop-shadow-md leading-tight">
              A Centre of Excellence. <br/><span className="text-teal-400">Uncompromising Privacy.</span>
            </h2>
            <p className="text-base text-slate-200 mb-8 leading-relaxed font-light">
              Butabika National Referral Mental Hospital brings the highest standard of clinical care directly to you, removing geographical barriers to the region's top professionals.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-teal-500/20 p-2 rounded-lg border border-teal-500/30 shadow-sm shrink-0">
                  <Activity className="h-5 w-5 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Comprehensive Care</h3>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">Access wellness screenings, family counseling, and specialized recovery support.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-blue-500/20 p-2 rounded-lg border border-blue-500/30 shadow-sm shrink-0">
                  <ShieldCheck className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Healthcare-Grade Security</h3>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">Your data, clinical assessments, and sessions are protected by uncompromising encryption.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-fuchsia-500/20 p-2 rounded-lg border border-fuchsia-500/30 shadow-sm shrink-0">
                  <Globe className="h-5 w-5 text-fuchsia-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">International Standards</h3>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">Delivered by certified specialists and backed by global health partners.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer subtle text for right side */}
        <div className="relative z-10 pb-8 text-center">
          <p className="text-sm text-slate-400/80 font-medium tracking-wide">© {new Date().getFullYear()} Butabika National Referral Mental Hospital</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
