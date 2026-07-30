import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post('/api/auth/therapist/login', { identifier: identifier.trim(), password: password.trim() });
      login(res.data.user, res.data.token);
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
    <div className="min-h-screen bg-slate-50 py-20 pt-32">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white/60 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/40 relative">
          
          <div className="absolute -top-4 -right-4 bg-warm-100 text-warm-700 text-xs font-bold px-3 py-1 rounded-full border border-warm-200 uppercase tracking-wider shadow-sm">
            Staff Portal
          </div>

          <div className="flex justify-center mb-6">
            <img src="/butabika.png" alt="Butabika Logo" className="h-16 w-auto object-contain" />
          </div>
          
          <h1 className="text-3xl font-display font-medium mb-2 text-center text-slate-900">
            {step === 'login' && 'Therapist Login'}
            {step === 'forgot' && 'Account Recovery'}
            {step === 'verify' && 'Enter Code'}
            {step === 'reset' && 'New Password'}
          </h1>
          <p className="text-center text-slate-500 text-sm mb-6">
            {step === 'login' && 'Secure access for authorized clinical staff.'}
            {step !== 'login' && 'Follow the steps to recover your secure access.'}
          </p>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{error}</div>}
          {successMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">{successMessage}</div>}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email or Phone Number</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-warm-500 bg-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-warm-500 bg-white" required />
              </div>
              <div className="flex justify-end mt-1 mb-2">
                <button type="button" onClick={() => { setStep('forgot'); setError(''); setSuccessMessage(''); }} className="text-sm font-medium text-warm-600 hover:text-warm-700">Forgot password?</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-warm-600 hover:bg-warm-700 text-white h-12 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex justify-center items-center">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Secure Sign In'}
              </button>
            </form>
          )}

          {step === 'forgot' && (
            <form onSubmit={handleForgotSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registered Email or Phone</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-warm-500 bg-white" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-warm-600 hover:bg-warm-700 text-white h-12 rounded-xl text-sm font-medium shadow-md transition-all disabled:opacity-50 flex justify-center items-center">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Recovery Code'}
              </button>
              <button type="button" onClick={() => setStep('login')} className="w-full text-sm text-slate-500 flex items-center justify-center mt-2 hover:text-slate-700">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={(e) => { e.preventDefault(); if (otp.length === 6) setStep('reset'); else setError('Enter a 6-digit code'); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit Code</label>
                <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full h-12 rounded-xl border border-slate-200 px-4 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-warm-500 bg-white" required autoFocus />
              </div>
              <button type="submit" className="w-full bg-warm-600 hover:bg-warm-700 text-white h-12 rounded-xl text-sm font-medium shadow-md transition-all">Verify Code</button>
              <button type="button" onClick={() => setStep('forgot')} className="w-full text-sm text-slate-500 flex items-center justify-center mt-2 hover:text-slate-700">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-warm-500 bg-white" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-warm-600 hover:bg-warm-700 text-white h-12 rounded-xl text-sm font-medium shadow-md transition-all disabled:opacity-50 flex justify-center items-center">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Set New Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
