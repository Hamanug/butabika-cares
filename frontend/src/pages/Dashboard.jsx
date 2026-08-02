import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookSessionModal from '../components/BookSessionModal';
import VideoRoomModal from '../components/VideoRoomModal';
import { useAuth } from '../context/AuthContext';
import {
  Heart, ClipboardList, PenLine, Activity,
  BookOpen, Brain, PhoneCall, Calendar
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [breathingStats, setBreathingStats] = useState({ cycles: 0, lastSession: '—' });
  const [dashboardStats, setDashboardStats] = useState({ assessmentsCompleted: 0, avgMood: 0, journalEntries: 0 });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/patient/dashboard-stats', { withCredentials: true });
        setDashboardStats(res.data);
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

  const checkSessionActive = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    try {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

      const sessionStart = new Date(`${dateStr.split('T')[0]}T${hours.toString().padStart(2, '0')}:${minutes}:00`);
      const now = new Date();
      const diffMins = (now - sessionStart) / 1000 / 60;

      // Session is active 5 mins before and expires 60 mins after
      return diffMins >= -5 && diffMins <= 60;
    } catch (e) { return false; }
  };

  // Wire up the breathing stats from our earlier exercise module
  useEffect(() => {
    const stats = localStorage.getItem('breathingStats');
    if (stats) {
      setBreathingStats(JSON.parse(stats));
    }
  }, []);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/appointments/my-sessions', { withCredentials: true });
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const displayName = user?.first_name || user?.name || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-serene-50 to-white pt-32 pb-20">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header & Main CTA */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-medium mb-3 text-slate-900">
              Welcome back{displayName ? `, ${displayName}` : ''}!
            </h1>
            <p className="text-slate-600 text-lg">
              Track your journey to mental wellbeing with these tools and resources.
            </p>
          </div>
          <button onClick={() => navigate('/therapists')} className="flex items-center gap-2 bg-[#e87a5d] hover:bg-[#d6694c] text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm w-full md:w-auto">
            <PhoneCall className="h-4 w-4" /> Speak to a Therapist
          </button>
        </div>

        {/* 4-Card Wellness Metrics */}
        <div className="mb-12">
          <h3 className="text-xl font-medium mb-6 text-slate-900">Your Wellness Journey</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Mood Tracker */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-serene-300"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-700">Mood Tracker</h4>
                <Heart className="h-5 w-5 text-serene-500" />
              </div>
              <p className="text-3xl font-semibold text-slate-900">{dashboardStats.avgMood}/5</p>
              <p className="text-sm text-slate-500 mt-1">Average mood • Not enough data</p>
            </div>

            {/* Assessments */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-sage-300"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-700">Assessments</h4>
                <ClipboardList className="h-5 w-5 text-sage-500" />
              </div>
              <p className="text-3xl font-semibold text-slate-900">{dashboardStats.assessmentsCompleted}/6</p>
              <p className="text-sm text-slate-500 mt-1">Completed • 0 total assessments</p>
            </div>

            {/* Journal Entries */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-warm-300"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-700">Journal Entries</h4>
                <PenLine className="h-5 w-5 text-warm-500" />
              </div>
              <p className="text-3xl font-semibold text-slate-900">{dashboardStats.journalEntries}</p>
              <p className="text-sm text-slate-500 mt-1">Total entries</p>
            </div>

            {/* Breathing Exercises (Wired) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-300"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-700">Breathing</h4>
                <Activity className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-semibold text-slate-900">{breathingStats.cycles}</p>
              <p className="text-sm text-slate-500 mt-1">Total cycles completed</p>
            </div>

          </div>
        </div>

        {/* Upcoming Sessions */}
        {sessions.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-medium mb-6 text-slate-900">Upcoming Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map(session => (
                <div key={session.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/60 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-[#e07a5f]" />
                      <span className="font-medium text-slate-900">{formatDisplayDate(session.appointment_date)} at {session.appointment_time}</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {session.status === 'pending' ? 'Waiting for a therapist to accept...' : `with Dr. ${session.other_first} ${session.other_last}`}
                    </p>
                  </div>
                  {session.status === 'scheduled' && (
                    checkSessionActive(session.appointment_date, session.appointment_time) ? (
                      <button
                        onClick={() => { setActiveSession(session); setIsVideoOpen(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Join Video Call
                      </button>
                    ) : (
                      <button disabled className="bg-slate-200 text-slate-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                        Locked (Starts at {session.appointment_time})
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

        {/* 6-Card Action Grid */}
        <div>
          <h3 className="text-xl font-medium mb-6 text-slate-900">Continue your journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Breathing Exercises */}
            <Link to="/exercises" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Breathing Exercises</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Practice guided breathing techniques to reduce anxiety and promote relaxation.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Start Exercise
              </div>
            </Link>

            {/* Mood Tracker */}
            <Link to="/journal" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-serene-50 flex items-center justify-center mb-4 group-hover:bg-serene-100 transition-colors">
                <Heart className="h-6 w-6 text-serene-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Mood Tracker</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Record your daily moods and identify patterns to gain mental health insights.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Track Mood
              </div>
            </Link>

            {/* Mental Health Screening */}
            <Link to="/screenings" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-sage-50 flex items-center justify-center mb-4 group-hover:bg-sage-100 transition-colors">
                <ClipboardList className="h-6 w-6 text-sage-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Health Screening</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Evidence-based screening tools to better understand your wellbeing.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Take Assessment
              </div>
            </Link>

            {/* Journal */}
            <Link to="/journal" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <PenLine className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Journal</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Express your thoughts and feelings securely through guided journaling prompts.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Write Entry
              </div>
            </Link>

            {/* Resources */}
            <Link to="/resources" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-warm-50 flex items-center justify-center mb-4 group-hover:bg-warm-100 transition-colors">
                <BookOpen className="h-6 w-6 text-warm-600" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Resources</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">Access our collection of mental health resources, articles, and helpful techniques.</p>
              <div className="inline-flex items-center text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-full px-4 py-1.5 group-hover:bg-white transition-colors">
                Explore Resources
              </div>
            </Link>

            {/* Mind Exercises */}
            <Link to="/resources" className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <Brain className="h-6 w-6 text-purple-600" />
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
