import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, MessageSquare, Video, Loader2, Clock } from 'lucide-react';
import VideoRoomModal from '../components/VideoRoomModal';

export default function TherapistDashboard() {
  const { user } = useAuth();
  const displayName = user?.first_name || user?.name || user?.email?.split('@')[0] || 'Therapist';

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

  const [pendingRequests, setPendingRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchData = async () => {
    try {
      const pendingRes = await axios.get('http://localhost:3000/api/appointments/pending', { withCredentials: true });
      setPendingRequests(pendingRes.data);
      
      const sessionsRes = await axios.get('http://localhost:3000/api/appointments/my-sessions', { withCredentials: true });
      // Filter out pending from my-sessions since we show it in pending requests
      setSessions(sessionsRes.data.filter(s => s.status === 'scheduled'));
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleAccept = async (id) => {
    setAcceptingId(id);
    try {
      await axios.post(`http://localhost:3000/api/appointments/accept/${id}`, {}, { withCredentials: true });
      await fetchData();
    } catch (err) {
      alert('Failed to accept appointment');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white pt-32 pb-20">
      <div className="container max-w-5xl mx-auto px-4">
        
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2 text-slate-900">Dr. {displayName}'s Dashboard</h1>
          <p className="text-slate-600">Manage your patients, appointments, and secure messaging.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-warm-100 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-warm-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Appointments</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">Manage your upcoming therapy sessions.</p>
            <Link className="mt-auto w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 rounded-lg text-sm font-medium transition-colors text-center block" to="/therapist/appointments">View Calendar</Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-serene-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-serene-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">My Patients</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">Review patient profiles, notes, and screening results.</p>
            <Link className="mt-auto w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 rounded-lg text-sm font-medium transition-colors text-center block" to="/therapist/patients">View Patients</Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Messages</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">Respond to secure patient inquiries.</p>
            <Link className="mt-auto w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 rounded-lg text-sm font-medium transition-colors text-center block" to="/therapist/messages">Open Inbox</Link>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-medium mb-6 text-slate-900">Pending Session Requests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{req.first_name} {req.last_name}</span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">Requested: <span className="font-medium">{req.appointment_date} at {req.appointment_time}</span></p>
                  </div>
                  <button 
                    onClick={() => handleAccept(req.id)}
                    disabled={acceptingId === req.id}
                    className="w-full bg-warm-500 hover:bg-warm-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center"
                  >
                    {acceptingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept & Notify Patient'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Sessions */}
        {sessions.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-medium mb-6 text-slate-900">Upcoming Scheduled Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map(session => (
                <div key={session.id} className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{session.other_first} {session.other_last}</span>
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      {session.appointment_date} at {session.appointment_time}
                    </p>
                  </div>
                  {checkSessionActive(session.appointment_date, session.appointment_time) ? (
                    <button 
                      onClick={() => { setActiveSession(session); setIsVideoOpen(true); }}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Video className="w-4 h-4" /> Join Session
                    </button>
                  ) : (
                    <button disabled className="bg-slate-200 text-slate-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                      Locked (Starts at {session.appointment_time})
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
      <VideoRoomModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
        appointment={activeSession} 
        isTherapist={true}
        onSessionEnded={fetchData}
      />
    </div>
  );
}
