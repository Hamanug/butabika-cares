import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Loader2, X, Clock } from 'lucide-react';

export default function BookSessionModal({ isOpen, onClose, onSuccess }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!time) {
      setError('Please select a specific time slot.');
      return;
    }
    setLoading(true); setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/book`, { appointment_date: date, appointment_time: time }, { withCredentials: true });
      onSuccess();
      onClose();
    } catch (err) {
      const backendError = err.response?.data?.details || 'Unknown server error';
      setError(`Server Error: ${backendError}`);
    } finally { setLoading(false); }
  };

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl relative border border-slate-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-[#0F766E]" />
            <h2 className="text-xl font-bold text-slate-900">Clinical Scheduling Module</h2>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Secure Telehealth Appointment</p>
        </div>
        
        {error && (
          <div className="mb-5 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Select Date</label>
            <input 
              type="date" 
              required 
              min={new Date().toISOString().split('T')[0]} 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] text-slate-700 font-medium transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Available Time Slots</label>
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`py-2.5 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-2
                    ${time === t 
                      ? 'border-[#0F766E] bg-teal-50 text-[#0F766E] shadow-sm' 
                      : 'border-slate-300 text-slate-600 hover:border-[#0F766E] hover:bg-teal-50 hover:text-[#0F766E]'
                    }
                  `}
                >
                  <Clock className="w-4 h-4" />
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white py-3.5 rounded-full text-sm font-bold shadow-sm transition-colors flex justify-center items-center uppercase tracking-widest"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Clinical Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
