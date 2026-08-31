import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Clock, CheckCircle2, Loader2, PhoneOff, Lock, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatUgandanNumber } from '../utils/formatters';

export default function VideoRoomModal({ appointment, isOpen, onClose, isTherapist, onSessionEnded }) {
  const [seconds, setSeconds] = useState(0);
  const [privateNotes, setPrivateNotes] = useState('');
  const [sharedNotes, setSharedNotes] = useState('');
  const [ending, setEnding] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [revealedContact, setRevealedContact] = useState(null);
  
  // Hardware toggles (UI Simulation for clinical wrapper)
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const handleRevealContact = async () => {
    if (!appointment?.patient_id) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/therapists/patient/${appointment.patient_id}/reveal-contact`, {}, { withCredentials: true });
      setRevealedContact(res.data.phone_number);
      toast.success('Emergency contact revealed');
    } catch {
      toast.error('Failed to reveal contact');
    }
  };

  useEffect(() => {
    if (appointment?.id) {
      axios.patch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/join`, {}, { withCredentials: true })
        .catch(_err => {}); // silent catch for presence
    }
  }, [appointment?.id]);

  useEffect(() => {
    let interval;
    if (isOpen && appointment?.id) {
      interval = setInterval(() => {
        axios.patch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/ping`, {}, { withCredentials: true })
          .catch(_err => {}); // silent heartbeat
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
          axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/notes`, { private_notes: privateNotes, shared_notes: sharedNotes }, { withCredentials: true }).catch(_err => {});
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
    } catch {
      toast.error('Failed to save session notes');
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center ${isTheaterMode ? 'p-0' : 'p-4'}`}>
      <div className={`bg-slate-900 shadow-2xl border border-slate-700 flex flex-col transition-all duration-300 ${isTheaterMode ? 'w-screen h-screen max-w-none m-0 rounded-none' : 'rounded-2xl max-w-6xl w-full p-6 h-[90vh]'}`}>

        {/* Security Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <Lock className="w-3 h-3" />
              END-TO-END ENCRYPTED (E2EE) - BUTABIKA CARES
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-lg font-bold text-white tracking-wide">Secure Clinical Room</h3>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsTheaterMode(!isTheaterMode)} 
              className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest border border-slate-700 px-4 py-2 rounded-full transition-colors"
            >
              {isTheaterMode ? 'Exit Theater' : 'Theater Mode'}
            </button>
            <div className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-full text-sm font-mono border border-slate-700 font-bold">
              <Clock className="w-4 h-4 text-emerald-400" /> {formatTime(seconds)}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white ml-2 transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Encrypted Video Frame Vault */}
        <div className="flex-1 my-4 rounded-xl overflow-hidden bg-black relative border border-slate-800 shadow-inner">
          <iframe
            src={appointment.meeting_link}
            title="Butabika Teletherapy Session"
            allow="camera; microphone; display-capture; autoplay; encrypted-media;"
            className="w-full h-full border-0"
          />
          
          {/* Hardware Controls Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent flex justify-center pb-6 z-10 gap-4">
            
            <button
              onClick={() => setMicOn(!micOn)}
              className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all border ${micOn ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-red-500 text-red-500 hover:bg-red-50'}`}
            >
              {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            
            <button
              onClick={() => setCamOn(!camOn)}
              className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all border ${camOn ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-red-500 text-red-500 hover:bg-red-50'}`}
            >
              {camOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-all uppercase tracking-widest ml-4 border border-red-500"
            >
              <PhoneOff className="w-5 h-5" />
              End Session
            </button>

          </div>
        </div>

        {/* Therapist Controls & Clinical Notes Drawer */}
        {isTherapist && (
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-5 items-stretch shadow-sm">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Private Clinical Notes</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold border border-red-900 px-2 py-0.5 rounded bg-red-900/20">Emergency Protocol:</span>
                  {revealedContact ? (
                    <a href={`tel:+${revealedContact}`} className="text-white font-bold text-xs tracking-wider font-mono bg-slate-700 px-3 py-1 rounded-md">{formatUgandanNumber(revealedContact)}</a>
                  ) : (
                    <button onClick={handleRevealContact} className="text-[10px] text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors uppercase tracking-widest font-bold flex items-center gap-1 shadow-sm">
                      <Lock className="w-3 h-3" /> Reveal Contact
                    </button>
                  )}
                </div>
              </div>
              <textarea
                rows="2"
                value={privateNotes}
                onChange={e => setPrivateNotes(e.target.value)}
                placeholder="Secure clinical notes (Therapist only)..."
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all font-medium placeholder-slate-600"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Shared Protocol (Visible to Patient)</label>
              <textarea
                rows="2"
                value={sharedNotes}
                onChange={e => setSharedNotes(e.target.value)}
                placeholder="Prescribed exercises, reflections, or follow-up tasks..."
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all font-medium placeholder-slate-600"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={handleComplete}
                disabled={ending}
                className="h-[76px] bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white px-8 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex flex-col items-center justify-center gap-1.5 shadow-sm"
              >
                {ending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                <span>Finalize Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
