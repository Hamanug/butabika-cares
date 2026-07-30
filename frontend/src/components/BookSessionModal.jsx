import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, Loader2, X } from 'lucide-react';

export default function BookSessionModal({ isOpen, onClose, onSuccess }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post('/api/appointments/book', { appointment_date: date, appointment_time: time }, { withCredentials: true });
      onSuccess();
      onClose();
    } catch (err) {
      const backendError = err.response?.data?.details || err.message;
      console.error("🚨 EXPOSED BACKEND ERROR:", backendError);
      setError(`Server Error: ${backendError}`);
    } finally { setLoading(false); }
  };

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-medium text-slate-900 mb-2">Request Therapy Session</h2>
        <p className="text-sm text-slate-500 mb-6">Select your preferred date and time. An available therapist will accept your request.</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Preferred Date</label>
            <input type="date" required min={new Date().toISOString().split('T')[0]} value={date} onChange={e => setDate(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-serene-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Preferred Time</label>
            <select value={time} onChange={e => setTime(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-serene-300">
              {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#e07a5f] hover:bg-[#d36b51] text-white py-3 rounded-lg text-sm font-medium shadow-sm transition-colors flex justify-center items-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
