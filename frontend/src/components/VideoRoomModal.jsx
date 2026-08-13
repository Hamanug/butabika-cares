import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VideoRoomModal({ appointment, isOpen, onClose, isTherapist, onSessionEnded }) {
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [ending, setEnding] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  useEffect(() => {
    if (isOpen && appointment && isTherapist) {
      setNotes(appointment.notes || '');
    }
  }, [isOpen, appointment, isTherapist]);

  useEffect(() => {
    if (isOpen && appointment && isTherapist) {
      const timer = setTimeout(() => {
        if (notes !== (appointment.notes || '')) {
          axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/notes`, { notes }, { withCredentials: true }).catch(err => console.error('Failed to auto-save notes'));
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notes, isOpen, appointment, isTherapist]);

  useEffect(() => {
    let interval;
    if (isOpen) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleComplete = async () => {
    setEnding(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/complete`, { notes }, { withCredentials: true });
      if (onSessionEnded) onSessionEnded();
      onClose();
    } catch (err) {
      toast.error('Failed to save session notes');
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center ${isTheaterMode ? 'p-0' : 'p-4'}`}>
      <div className={`bg-slate-900 shadow-2xl border border-slate-800 flex flex-col transition-all duration-300 ${isTheaterMode ? 'w-screen h-screen max-w-none m-0 rounded-none' : 'rounded-2xl max-w-5xl w-full p-6 h-[85vh]'}`}>

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-medium text-white">Butabika Cares Live Session</h3>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsTheaterMode(!isTheaterMode)} 
              className="text-slate-400 hover:text-white text-sm border border-slate-700 px-3 py-1.5 rounded-full"
            >
              {isTheaterMode ? 'Exit Theater' : 'Theater Mode'}
            </button>
            <div className="flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full text-sm font-mono border border-slate-700">
              <Clock className="w-4 h-4 text-emerald-400" /> {formatTime(seconds)}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Video Frame */}
        <div className="flex-1 my-4 rounded-xl overflow-hidden bg-black relative border border-slate-800">
          <iframe
            src={appointment.meeting_link}
            title="Butabika Teletherapy Session"
            allow="camera; microphone; display-capture; autoplay; encrypted-media;"
            className="w-full h-full border-0"
          />
        </div>

        {/* Therapist Controls & Notes Drawer */}
        {isTherapist ? (
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 items-center">
            <textarea
              rows="2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add private clinical session notes here..."
              className="flex-1 bg-slate-900 text-white border border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-warm-500"
            />
            <button
              onClick={handleComplete}
              disabled={ending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Complete & Save Notes
            </button>
          </div>
        ) : (
          <div className="text-center text-slate-400 text-xs py-1">
            Session encrypted & powered by Butabika Cares Telehealth Framework
          </div>
        )}
      </div>
    </div>
  );
}
