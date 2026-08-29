import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const [step, setStep] = useState('form'); // form, confirm, verify, forgot_phone, forgot_verify, forgot_reset
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
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="py-20 pt-32 container mx-auto">
        <div className="max-w-md mx-auto glass rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex justify-center mb-6">
            <img src="/butabika.png" alt="Butabika Logo" className="h-16 w-auto object-contain" />
          </div>
          
          <h1 className="text-3xl font-medium mb-6 text-center text-[#020817]">
            {step === 'form' && (isSignUp ? 'Create an Account' : 'Welcome Back')}
            {step === 'confirm' && 'Confirm Your Number'}
            {step === 'verify' && 'Verify Your Number'}
            {step === 'forgot_phone' && 'Account Recovery'}
            {step === 'forgot_verify' && 'Verify Recovery Code'}
            {step === 'forgot_reset' && 'Create New Password'}
          </h1>

          {step === 'forgot_phone' && (
            <p className="text-center text-slate-600 text-sm mb-6">
              We're sorry you forgot your password. Let's get you safely signed back in. Enter the phone number associated with your account.
            </p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 text-green-700 border border-green-100 p-3 rounded-lg mb-4 text-sm">
              {successMessage}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="text" placeholder="e.g., 0712345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+\s]/g, ''))} className="flex h-10 w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#020817]" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="flex h-10 w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#020817]" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                  </button>
                </div>
                {!isSignUp && (
                  <div className="flex justify-end mt-1 mb-4">
                    <button type="button" onClick={() => { setError(''); setSuccessMessage(''); setStep('forgot_phone'); }} className="text-sm font-medium text-cyan-600 hover:text-cyan-500">
                      Forgot password?
                    </button>
                  </div>
                )}
                {isSignUp && (
                  <div className="mt-4 mb-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="flex h-10 w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#020817]" required />
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading} className="w-full bg-serene-500 hover:bg-serene-600 text-white h-10 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#020817] disabled:opacity-50">
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
              <div className="mt-6 text-center">
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMessage(''); }} className="text-serene-600 hover:text-serene-700 text-sm">
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                <p className="text-gray-600 text-sm mb-2">You are registering with the phone number:</p>
                <p className="font-semibold text-gray-900 text-2xl tracking-wide py-2">{formattedPhone}</p>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setStep('form')} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 h-10 rounded-md text-sm font-medium transition-colors">Edit</button>
                <button type="button" onClick={handleSendOtp} disabled={loading} className="flex-1 bg-serene-500 hover:bg-serene-600 text-white h-10 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex justify-center items-center">
                  {loading ? 'Sending...' : 'Confirm'}
                </button>
              </div>
            </div>
          )}

          {(step === 'verify' || step === 'forgot_verify') && (
            <form onSubmit={step === 'verify' ? handleVerifyOtp : handleForgotVerifySubmit} className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                <p className="text-gray-600 text-sm mb-2">We sent a 6-digit verification code to</p>
                <p className="font-semibold text-gray-900 text-lg tracking-wide">{formattedPhone}</p>
              </div>
              <div>
                <input type="text" maxLength={6} placeholder="• • • • • •" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow text-center text-xl tracking-[0.5em] font-mono" autoFocus />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-serene-500 hover:bg-serene-600 text-white h-10 rounded-md text-sm font-medium disabled:opacity-50">
                {step === 'verify' ? 'Verify & Sign In' : 'Verify Code'}
              </button>
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setStep(step === 'verify' ? 'form' : 'forgot_phone')} className="text-serene-600 hover:text-serene-700 text-sm">
                  Back
                </button>
              </div>
            </form>
          )}

          {step === 'forgot_phone' && (
            <form onSubmit={handleForgotPhoneSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="text" placeholder="e.g., 0712345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+\s]/g, ''))} className="flex h-10 w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#020817]" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-serene-500 hover:bg-serene-600 text-white h-10 rounded-md text-sm font-medium disabled:opacity-50">
                {loading ? 'Processing...' : 'Send Recovery Code'}
              </button>
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setStep('form')} className="text-serene-600 hover:text-serene-700 text-sm">
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {step === 'forgot_reset' && (
            <form onSubmit={handleForgotResetSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="flex h-10 w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#020817]" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-serene-500 hover:bg-serene-600 text-white h-10 rounded-md text-sm font-medium disabled:opacity-50">
                {loading ? 'Processing...' : 'Reset Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;
