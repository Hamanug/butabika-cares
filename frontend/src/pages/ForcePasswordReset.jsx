import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function ForcePasswordReset() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('Passwords do not match!');
    
    setIsSubmitting(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/profile/update-password`, 
        { newPassword }, 
        { withCredentials: true }
      );
      // Force reload to update auth context
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to secure account.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-red-500"/>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Security Action Required</h2>
        <p className="text-slate-600 mb-8 font-medium text-sm">
          You are using a temporary or compromised password. You must set a new, secure password before accessing your workspace.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
            <input 
              type="password" 
              required
              minLength={8}
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:outline-none font-medium"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:outline-none font-medium"
            />
          </div>
          <button type="submit" disabled={!newPassword || newPassword !== confirmPassword || isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold transition-colors flex items-center justify-center disabled:opacity-50 mt-4">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Secure Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
