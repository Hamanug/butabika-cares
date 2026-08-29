import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Clock, CheckCircle2, Loader2, PhoneOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatUgandanNumber } from '../utils/formatters';

export default function VideoRoomModal({ appointment, isOpen, onClose, isTherapist, onSessionEnded }) {
  const [seconds, setSeconds] = useState(0);
  const [privateNotes, setPrivateNotes] = useState('');
  const [sharedNotes, setSharedNotes] = useState('');
  const [ending, setEnding] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [revealedContact, setRevealedContact] = useState(null);

  const handleRevealContact = async () => {
    if (!appointment?.patient_id) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/therapists/patient/${appointment.patient_id}/reveal-contact`, {}, { withCredentials: true });
      setRevealedContact(res.data.phone_number);
      toast.success('Emergency contact revealed');
    } catch (err) {
      toast.error('Failed to reveal contact');
    }
  };

  // Notify backend that this user has joined the room
  useEffect(() => {
    if (appointment?.id) {
      axios.patch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/join`, {}, { withCredentials: true })
        .catch(err => console.error('Failed to log presence:', err));
    }
  }, [appointment?.id]);

  // Heartbeat tracking
  useEffect(() => {
    let interval;
    if (isOpen && appointment?.id) {
      interval = setInterval(() => {
        axios.patch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/ping`, {}, { withCredentials: true })
          .catch(err => console.error('Heartbeat failed:', err));
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isOpen, appointment?.id]);

  useEffect(() => {
    if (isOpen && appointment && isTherapist) {
      setPrivateNotes(appointment.private_notes || '');
      setSharedNotes(appointment.shared_notes || '');
    }
  }, [isOpen, appointment, isTherapist]);

  useEffect(() => {
    if (isOpen && appointment && isTherapist) {
      const timer = setTimeout(() => {
        if (privateNotes !== (appointment.private_notes || '') || sharedNotes !== (appointment.shared_notes || '')) {
          axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/notes`, { private_notes: privateNotes, shared_notes: sharedNotes }, { withCredentials: true }).catch(err => console.error('Failed to auto-save notes'));
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [privateNotes, sharedNotes, isOpen, appointment, isTherapist]);

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
      await axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/complete`, { private_notes: privateNotes, shared_notes: sharedNotes }, { withCredentials: true });
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
            <button onClick={onClose} className="text-slate-400 hover:text-white ml-2"><X className="w-6 h-6" /></button>
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
          {/* Mobile-Optimized Patient Footer */}
          {!isTherapist && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent flex justify-center pb-6 z-10">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-transform active:scale-95"
              >
                <PhoneOff className="w-5 h-5" />
                Leave Session
              </button>
            </div>
          )}
        </div>

        {/* Therapist Controls & Notes Drawer */}
        {isTherapist ? (
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs text-slate-400 font-medium">Private Notes (Therapist Only)</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Emergency:</span>
                  {revealedContact ? (
                    <a href={`tel:+${revealedContact}`} className="text-blue-400 hover:text-blue-300 text-xs font-mono">{formatUgandanNumber(revealedContact)}</a>
                  ) : (
                    <button onClick={handleRevealContact} className="text-[10px] text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded transition-colors uppercase tracking-wide font-bold flex items-center gap-1">
                      📞 Reveal
                    </button>
                  )}
                </div>
              </div>
              <textarea
                rows="2"
                value={privateNotes}
                onChange={e => setPrivateNotes(e.target.value)}
                placeholder="Add private clinical session notes here..."
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-warm-500"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-medium px-1">Shared Notes (Visible to Patient)</label>
              <textarea
                rows="2"
                value={sharedNotes}
                onChange={e => setSharedNotes(e.target.value)}
                placeholder="Add notes that the patient can review later..."
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-warm-500"
              />
            </div>
            <div className="flex flex-col justify-end pb-[2px]">
              <button
                onClick={handleComplete}
                disabled={ending}
                className="h-[68px] bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center gap-1"
              >
                {ending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                <span>Complete</span>
              </button>
            </div>
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
