import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, User, Loader2, X, PhoneCall, Clock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { formatUserName } from '../utils/formatters';

export default function Therapists() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [bookingNote, setBookingNote] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');

  const { onlineUsers } = useSocket();
  const [genderPreference, setGenderPreference] = useState('All');
  const [bookedSlots, setBookedSlots] = useState([]);

  // Fetch booked slots when date or therapist changes
  useEffect(() => {
    if (!selectedTherapist || !sessionDate) {
      setBookedSlots([]);
      return;
    }
    const fetchBookedSlots = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/booked-times`, {
          params: { therapist_id: selectedTherapist.id, date: sessionDate },
          withCredentials: true
        });
        setBookedSlots(res.data);
      } catch (err) {
        console.error('Failed to fetch booked slots', err);
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [selectedTherapist, sessionDate]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/therapists/active`);
        setTherapists(response.data);
      } catch (error) {
        console.error('Failed to fetch therapists', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  const handleRequestSession = async () => {
    if (!selectedTherapist) return;
    if (!sessionDate || !sessionTime) return toast.error("Please select a date and time.");

    // Strict UI Time Validation
    const [hours, minutes] = sessionTime.split(':').map(Number);
    if (hours < 8 || hours > 16) {
      return toast.error("Please select a time between 8:00 AM and 4:00 PM.");
    }

    if (!user) {
      const pendingAppointment = {
        therapist_id: selectedTherapist.id,
        appointment_date: sessionDate,
        appointment_time: sessionTime,
        notes: bookingNote,
        status: 'pending'
      };
      sessionStorage.setItem('pendingAppointment', JSON.stringify(pendingAppointment));
      navigate('/auth');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/book`, {
        therapist_id: selectedTherapist.id,
        appointment_date: sessionDate,
        appointment_time: sessionTime,
        notes: bookingNote,
        status: 'pending'
      }, { withCredentials: true });
      toast.success('Session requested successfully!');
      setSelectedTherapist(null);
      setBookingNote('');
      setSessionDate('');
      setSessionTime('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to book session.");
    }
  };

  const sortLoadBalanced = (a, b) => {
    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
    
    // 1. VIP Shuffle (Grace and Ivan share Slot 1 & 2 dynamically)
    const isVipA = (nameA.includes('grace') && nameA.includes('bikumbi')) || nameA.includes('musenero');
    const isVipB = (nameB.includes('grace') && nameB.includes('bikumbi')) || nameB.includes('musenero');
    
    if (isVipA && isVipB) return Math.random() - 0.5;
    if (isVipA && !isVipB) return -1;
    if (!isVipA && isVipB) return 1;
    
    // 2. Availability Boost (Online users bubble up)
    const isAOnline = onlineUsers.includes(a.id);
    const isBOnline = onlineUsers.includes(b.id);
    if (isAOnline && !isBOnline) return -1;
    if (!isAOnline && isBOnline) return 1;
    
    // 3. Load Balance (Least sessions first)
    const countA = parseInt(a.session_count) || 0;
    const countB = parseInt(b.session_count) || 0;
    return countA - countB;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Our Therapists</h1>
          <p className="text-slate-600">Browse our mental health professionals and request a therapy session.</p>
        </div>

        {/* Matching Wizard Filter */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-slate-700 mb-3">Do you have a preference?</p>
          <div className="flex flex-wrap gap-3">
            {['All', 'Male', 'Female'].map(option => (
              <button
                key={option}
                onClick={() => setGenderPreference(option)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  genderPreference === option 
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {option === 'All' ? 'No Preference' : `${option} Therapist`}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (!therapists || therapists.length === 0) ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No Therapists Available</h3>
            <p className="text-slate-500 mt-1">We are currently onboarding new professionals. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[...(therapists || [])].filter(t => genderPreference === 'All' || (t.gender && t.gender.toLowerCase() === genderPreference.toLowerCase())).sort(sortLoadBalanced).map(therapist => {
              const isOnline = onlineUsers.includes(therapist.id);
              return (
                <div key={therapist.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md">
                  <div className="flex-shrink-0">
                    {therapist.profile_picture ? (
                      <img src={`${import.meta.env.VITE_API_URL}${therapist.profile_picture}`} alt="Profile" className="h-16 w-16 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center text-[#0F766E] font-bold text-xl border border-teal-100">
                        {getInitials(therapist.first_name || 'N', therapist.last_name || 'T')}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {formatUserName(therapist)}
                        </h2>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                          <BookOpen className="h-4 w-4 mr-1 text-slate-400" />
                          {therapist.occupation || 'Pending Assignment'}
                        </div>
                        {therapist.gender && (
                          <span className="inline-block bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-md mt-2 mb-2 border border-slate-200">
                            {therapist.gender}
                          </span>
                        )}
                      </div>
                      <span className={`hidden md:inline-block px-3 py-1 text-xs font-medium rounded-full border ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100 whitespace-pre-wrap">
                      {therapist.bio || 'Professional credentials and specialization details.'}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          if (user) {
                            setSelectedTherapist(therapist);
                          } else {
                            sessionStorage.setItem('intendedRoute', '/therapists');
                            navigate('/auth');
                          }
                        }}
                        className="flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#115E59] text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm w-max"
                      >
                        <PhoneCall className="h-4 w-4"/> Request Session
                      </button>
                      <button
                        onClick={() => {
                          if (user) {
                            navigate(`/messages?userId=${therapist.id}&firstName=${encodeURIComponent(therapist.first_name || '')}&lastName=${encodeURIComponent(therapist.last_name || '')}`);
                          } else {
                            sessionStorage.setItem('intendedRoute', `/messages?userId=${therapist.id}`);
                            navigate('/auth');
                          }
                        }}
                        className="flex items-center justify-center gap-2 bg-white text-[#0F766E] border border-[#0F766E] hover:bg-teal-50 px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm w-max"
                      >
                        <MessageCircle className="h-4 w-4"/> Send Message
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900">
                Book Session with {selectedTherapist.first_name || 'Therapist'}
              </h3>
              <button
                onClick={() => {
                  setSelectedTherapist(null);
                  setBookingNote('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={sessionDate} 
                    onChange={(e) => { setSessionDate(e.target.value); setSessionTime(''); }} 
                    min={new Date().toISOString().split('T')[0]} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500 text-sm" 
                    required 
                  />
                </div>
              </div>
              {sessionDate && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map((time) => {
                      const isBooked = bookedSlots.includes(`${time}:00`);
                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSessionTime(time)}
                          className={`py-2 px-3 text-sm rounded-md border text-center transition-colors ${
                            isBooked 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through' 
                              : sessionTime === time 
                                ? 'bg-[#0F766E] text-white border-[#0F766E]' 
                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0F766E]'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500 mb-4 mt-4 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Clinical hours are strictly 8:00 AM to 4:00 PM (EAT).
              </p>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What would you like to discuss? (Optional)
              </label>
              <textarea
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] text-sm"
                placeholder="Briefly describe what you're seeking help with..."
              />
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedTherapist(null);
                  setBookingNote('');
                  setSessionDate('');
                  setSessionTime('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestSession}
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
