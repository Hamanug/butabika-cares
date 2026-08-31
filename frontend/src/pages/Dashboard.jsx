import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookSessionModal from '../components/BookSessionModal';
import VideoRoomModal from '../components/VideoRoomModal';
import { useAuth } from '../context/AuthContext';
import { formatUserName } from '../utils/formatters';
import {
  Heart, ClipboardList, PenLine, Activity,
  BookOpen, Brain, PhoneCall, Calendar, Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [dashboardStats, setDashboardStats] = useState({ assessmentsCompleted: 0, moodStatus: 'No recent data', journalEntries: 0 });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/patient/dashboard-stats`, { withCredentials: true });
        setDashboardStats(res.data);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };
    if (user) fetchDashboardStats();
  }, [user]);


  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-UG', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };





  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/my-sessions`, { withCredentials: true });
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/patient/history`, { withCredentials: true });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchHistory();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header & Main CTA */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-medium mb-3 text-slate-900">
              Welcome back, {formatUserName(user)}!
            </h1>
            <p className="text-slate-600 text-lg">
              Track your journey to mental wellbeing with these tools and resources.
            </p>
          </div>
        </div>

        {/* 4-Card Wellness Metrics */}
        <div className="mb-12">
          <h3 className="text-xl font-medium mb-6 text-slate-900">Your Wellness Journey</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* 1. Assessments */}
            <Link to="/screenings" className="block cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700">Assessments</h4>
                <ClipboardList className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900">{dashboardStats.assessmentsCompleted}<span className="text-lg text-slate-400 font-medium">/6</span></p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Completed</p>
            </Link>

            {/* 2. Therapeutic Journal */}
            <Link to="/journal" className="block cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700">Journal NLP</h4>
                <PenLine className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              {dashboardStats.moodStatus === 'No recent data' ? (
                <>
                  <p className="text-lg font-bold text-slate-900 leading-snug">Requires Data</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Log entry to update</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-[#0F766E] leading-snug truncate" title={dashboardStats.moodStatus}>{dashboardStats.moodStatus}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">7-Day Analysis</p>
                </>
              )}
            </Link>

            {/* 3. Breathing Exercises */}
            <Link to="/exercises" className="block cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-slate-700">Breathing Cycles</h4>
                <Activity className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              <h4 className="text-3xl font-black text-slate-900 mb-1">{stats.weeklyBreathingCycles || 0}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Weekly Log</p>
            </Link>

            {/* 4. Stress Tracking */}
            <Link to="/stress-management" className="block cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-slate-700">Stress Tracking</h4>
                <Activity className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              <h4 className="text-3xl font-black text-slate-900 mb-1">{stats.stressCount || 0}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Records Logged</p>
            </Link>

            {/* 5. CBT Thought Record */}
            <Link to="/cognitive-reframing" className="block cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-slate-700">CBT Records</h4>
                <Brain className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              <h4 className="text-3xl font-black text-slate-900 mb-1">{stats.cbtCount || 0}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Active Logs</p>
            </Link>
          </div>
        </div>

        {/* Upcoming Sessions */}
        {sessions?.filter(s => ['pending', 'scheduled'].includes(s.status)).length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-medium mb-6 text-slate-900">Upcoming Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(sessions || []).filter(s => ['pending', 'scheduled'].includes(s.status)).map(session => (
                <div key={session.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/60 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-[#0F766E]" />
                      <span className="font-medium text-slate-900">{formatDisplayDate(session.appointment_date)} at {formatTimeDisplay(session.appointment_time)}</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {session.status === 'pending' ? 'Waiting for a therapist to accept...' : `with Dr. ${session.other_first} ${session.other_last}`}
                    </p>
                  </div>
                  {session.status === 'scheduled' && (
                    session.is_joinable ? (
                      <button
                        onClick={() => { setActiveSession(session); setIsVideoOpen(true); }}
                        className="bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                      >
                        Join Video Call
                      </button>
                    ) : (
                      <button disabled className="bg-slate-200 text-slate-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                        Locked (Starts at {formatTimeDisplay(session.appointment_time)})
                      </button>
                    )
                  )}
                  {session.status === 'pending' && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session History */}
        {history?.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-medium mb-6 text-slate-900">Session History</h3>
            <div className="grid grid-cols-1 gap-6">
              {history.map(session => {
                let durationText = '';
                if (session.ended_at && session.appointment_date && session.appointment_time) {
                  try {
                    const start = new Date(session.appointment_date);
                    const [h, m] = session.appointment_time.split(':');
                    start.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
                    const end = new Date(session.ended_at);
                    const diffMins = Math.round((end - start) / 60000);
                    if (diffMins > 0) durationText = ` • ${diffMins} minutes`;
                  } catch (e) {}
                }
                return (
                  <div key={session.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-900">
                        {formatDisplayDate(session.appointment_date)} at {formatTimeDisplay(session.appointment_time)}{durationText}
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Session Summary / Notes from your Therapist</h4>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {session.shared_notes || "No summary provided for this session"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue your journey */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-slate-900">Continue your journey</h3>
            <button onClick={() => navigate('/therapists')} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
              <PhoneCall className="h-4 w-4" /> Speak to a Therapist
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Breathing Exercises */}
            <Link to="/exercises" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                <Activity className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Breathing Exercises</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Practice guided breathing techniques to reduce anxiety and promote relaxation.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Start Exercise
              </div>
            </Link>

            {/* Mood Tracker */}
            <Link to="/journal" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                <Heart className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Mood Tracker</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Record your daily moods and identify patterns to gain mental health insights.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Track Mood
              </div>
            </Link>

            {/* Mental Health Screening */}
            <Link to="/screenings" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                <ClipboardList className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Health Screening</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Evidence-based screening tools to better understand your wellbeing.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Take Assessment
              </div>
            </Link>

            {/* Journal */}
            <Link to="/journal" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                <PenLine className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Journal</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Express your thoughts and feelings securely through guided journaling prompts.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Write Entry
              </div>
            </Link>

            {/* Resources */}
            <Link to="/resources" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                <BookOpen className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Resources</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Access our collection of mental health resources, articles, and helpful techniques.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Explore Resources
              </div>
            </Link>

            {/* Mind Exercises */}
            <Link to="/mindfulness" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                <Brain className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Mind Exercises</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Guided meditation and mindfulness practices to help center your thoughts.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Begin Practice
              </div>
            </Link>

          </div>
        </div>

      </div>

      <BookSessionModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={fetchSessions}
      />

      <VideoRoomModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        appointment={activeSession}
        isTherapist={false}
        onSessionEnded={fetchSessions}
      />
    </div>
  );
}
