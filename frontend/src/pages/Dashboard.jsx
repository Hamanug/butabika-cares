import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatUserName } from '../utils/formatters';
import {
  Heart, Activity, PenLine, Calendar, ClipboardList, Home, Compass, User, Video, Clock, FileText
} from 'lucide-react';
import BookSessionModal from '../components/BookSessionModal';
import VideoRoomModal from '../components/VideoRoomModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sessionsRes, historyRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/patient/dashboard-stats`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/my-sessions`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/patient/history`, { withCredentials: true })
      ]);
      setStats(statsRes.data);
      setSessions(sessionsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Data fetch failed', err);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  // Determine context for Dynamic Hero
  const nextSession = sessions.find(s => ['pending', 'scheduled'].includes(s.status));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 lg:pb-12 pt-24 lg:pt-32">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. DYNAMIC HERO WIDGET */}
        <div className="mb-8 animate-fade-in-up">
          {nextSession?.status === 'scheduled' ? (
            <div className="w-full bg-[#0F766E] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-400/20 blur-3xl rounded-full pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
                  </span>
                  <p className="text-sm font-bold tracking-widest uppercase text-teal-200">Upcoming Session</p>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-1">Dr. {nextSession.other_first} {nextSession.other_last}</h1>
                <p className="text-teal-100 font-medium">{new Date(nextSession.appointment_date).toLocaleDateString()} at {nextSession.appointment_time}</p>
              </div>
              
              <div className="mt-6 md:mt-0 relative z-10 w-full md:w-auto">
                {nextSession.is_joinable ? (
                  <button onClick={() => { setActiveSession(nextSession); setIsVideoOpen(true); }} className="w-full md:w-auto bg-white text-[#0F766E] px-8 py-4 rounded-xl font-black shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
                    <Video className="w-5 h-5 mr-2"/> Join Video Room
                  </button>
                ) : (
                  <div className="w-full md:w-auto bg-teal-800/50 backdrop-blur-sm border border-teal-600 px-6 py-3 rounded-xl text-teal-100 font-medium text-center text-sm">
                    Room opens 15m before start
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Good morning, {formatUserName(user)}.</h1>
              <p className="text-slate-500 font-medium mb-6">How are you feeling today?</p>
              
              {/* Quick Mood Log */}
              <div className="flex flex-wrap gap-3">
                {['Great', 'Okay', 'Stressed', 'Down'].map(mood => (
                  <button key={mood} onClick={() => navigate('/journal')} className="flex-1 min-w-[100px] bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 text-slate-600 hover:text-[#0F766E] py-3 rounded-xl font-bold transition-colors">
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. THE REFINED BENTO BOX GRID */}
        <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Your Health OS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          
          {/* Double-span Journal & CBT Card */}
          <Link className="md:col-span-2 row-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden group shadow-md hover:shadow-xl transition-all min-h-[220px]" to="/journal">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-500">
              <PenLine className="w-32 h-32"/>
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="bg-slate-700/50 w-fit p-2 rounded-lg mb-4 backdrop-blur-md">
                  <PenLine className="w-6 h-6 text-teal-400"/>
                </div>
                <h3 className="text-2xl font-black mb-2">Therapeutic Journal</h3>
                <p className="text-slate-300 font-medium text-sm md:text-base max-w-[85%]">
                  {stats.moodStatus !== 'No recent data' ? `Recent trend: ${stats.moodStatus}. Continue logging to build insights.` : 'Start writing to unlock AI-driven insights and CBT pattern recognition.'}
                </p>
              </div>
              <div className="mt-6 flex items-center text-teal-400 font-bold text-sm uppercase tracking-widest">
                Write Entry &rarr;
              </div>
            </div>
          </Link>

          {/* Mindfulness Practices Tile */}
          <Link className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-[#0F766E] group transition-all shadow-sm flex flex-col justify-between aspect-square md:aspect-auto lg:aspect-square" to="/mindfulness">
            <div className="bg-teal-50 w-10 h-10 rounded-full flex items-center justify-center text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
              <Activity className="w-5 h-5"/>
            </div>
            <div className="mt-4">
              <p className="text-lg font-black text-slate-900 leading-tight">Mindfulness Practices</p>
              <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-2">Guided breathing, meditation, and stress tracking tools.</p>
            </div>
          </Link>

          {/* Health Screenings Tile */}
          <Link className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-[#0F766E] group transition-all shadow-sm flex flex-col justify-between aspect-square md:aspect-auto lg:aspect-square" to="/screenings">
            <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ClipboardList className="w-5 h-5"/>
            </div>
            <div className="mt-4">
              <p className="text-lg font-black text-slate-900 leading-tight">Clinical Screenings</p>
              <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-2">Self-assessments for depression, anxiety, and general wellness.</p>
            </div>
          </Link>
        </div>

        {/* 3. CLINICAL SESSIONS & RECORDS */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Appointments & Records</h2>
          <button onClick={() => navigate('/intake')} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm flex items-center">
            <Calendar className="w-4 h-4 mr-2"/> Book Session
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Pending & Scheduled Sessions */}
          {sessions.length === 0 && history.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-8 text-center shadow-sm">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
              <p className="text-slate-600 font-bold text-lg">No appointments yet</p>
              <p className="text-sm text-slate-500">Request a session with a therapist to begin your clinical care.</p>
            </div>
          ) : (
            <>
              {sessions.map(session => (
                <div key={session.id} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${session.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-[#0F766E]'}`}>
                      <Clock className="w-6 h-6"/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${session.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-[#0F766E]'}`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-lg">
                        {new Date(session.appointment_date).toLocaleDateString()} at {session.appointment_time}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        {session.status === 'pending' ? 'Awaiting provider confirmation' : `with Dr. ${session.other_first} ${session.other_last}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Past Sessions & Clinical Notes */}
              {history.map(session => (
                <div key={session.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-bold text-slate-700 text-lg">
                        {new Date(session.appointment_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        Completed with Dr. {session.other_first} {session.other_last}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-200 text-slate-600 self-start md:self-auto">
                      Completed
                    </span>
                  </div>
                  
                  {/* Therapist Notes Sub-box */}
                  {session.shared_notes ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mt-2 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-[#0F766E]">
                        <FileText className="w-4 h-4"/>
                        <h4 className="text-xs font-black uppercase tracking-widest">Therapist Notes</h4>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                        {session.shared_notes}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-100/50 border border-slate-200 border-dashed rounded-xl p-4 mt-2 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No clinical notes shared for this session</p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 4. MOBILE NATIVE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-2">
          <Link className="flex flex-col items-center justify-center w-16 h-full text-[#0F766E]" to="/dashboard">
            <Home className="w-6 h-6 mb-1"/>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link className="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-900" to="/resources">
            <Compass className="w-6 h-6 mb-1"/>
            <span className="text-[10px] font-bold">Tools</span>
          </Link>
          <Link className="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-900 cursor-pointer" to="/intake">
            <Calendar className="w-6 h-6 mb-1"/>
            <span className="text-[10px] font-bold">Book</span>
          </Link>
          <Link className="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-900" to="/profile">
            <User className="w-6 h-6 mb-1"/>
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </div>
      </div>

      <BookSessionModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} onSuccess={fetchDashboardData} />
      <VideoRoomModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} appointment={activeSession} isTherapist={false} onSessionEnded={fetchDashboardData} />
    </div>
  );
}
