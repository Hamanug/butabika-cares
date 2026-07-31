import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Adjust path if necessary
import { Calendar, Clock, Video, Check, Ban, User, MessageSquare, FileText, Loader2 } from 'lucide-react';
import VideoRoomModal from '../components/VideoRoomModal'; // Adjust path if necessary

export default function TherapistDashboard() {
  const { user } = useAuth();
  const displayName = user?.first_name || user?.name || user?.email?.split('@')[0] || 'Therapist';

  // Core State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Modal & Session State
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null); // Tracks ID of request being accepted/cancelled
  
  // Timer State to force UI re-renders for the "Start Session" time-gate
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch Data
  const fetchData = async () => {
    try {
      const pendingRes = await axios.get('http://localhost:3000/api/appointments/pending', { withCredentials: true });
      setPendingRequests(pendingRes.data);
      
      const sessionsRes = await axios.get('http://localhost:3000/api/appointments/my-sessions', { withCredentials: true });
      setSessions(sessionsRes.data.filter(s => s.status === 'scheduled'));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
    
    // Update current time every minute to evaluate session joinability
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [user]);

  // Time-Gate Logic: 5 minutes before, up to 60 minutes after
  const checkSessionActive = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    try {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      
      const sessionStart = new Date(`${dateStr.split('T')[0]}T${hours.toString().padStart(2, '0')}:${minutes}:00`);
      const diffMins = (currentTime - sessionStart) / 1000 / 60;
      
      return diffMins >= -5 && diffMins <= 60;
    } catch (e) { 
      return false; 
    }
  };

  // Actions
  const handleAcceptRequest = async (id) => {
    setIsProcessing(id);
    try {
      // Backend automatically generates the VDO Ninja link here
      await axios.post(`http://localhost:3000/api/appointments/accept/${id}`, {}, { withCredentials: true });
      await fetchData(); // Refresh lists
    } catch (err) {
      console.error('Failed to accept request', err);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelSession = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    setIsProcessing(id);
    try {
      await axios.post(`http://localhost:3000/api/appointments/cancel/${id}`, {}, { withCredentials: true });
      await fetchData();
    } catch (err) {
      console.error('Failed to cancel session', err);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleStartSession = (session) => {
    setActiveSession(session);
    setIsVideoOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white pt-32 pb-20">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2 text-slate-900">Dr. {displayName}'s Dashboard</h1>
          <p className="text-slate-600">Manage your patients, appointments, and secure messaging.</p>
        </div>

        {/* Native Tailwind Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 mb-8">
          {['appointments', 'patients', 'messages'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab 
                  ? 'border-warm-600 text-warm-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content: Appointments */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Pending & Calendar Sync */}
            <div className="space-y-8 lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-amber-500" />
                  Pending Requests
                </h3>
                
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg">No pending requests.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                        <div className="font-medium text-slate-900 mb-1">{req.patient_name || 'Unknown Patient'}</div>
                        <div className="text-sm text-slate-600 mb-3">
                          {req.appointment_date?.split('T')[0]} at {req.time}
                        </div>
                        <button 
                          onClick={() => handleAcceptRequest(req.id)}
                          disabled={isProcessing === req.id}
                          className="w-full flex items-center justify-center py-2 px-4 bg-warm-500 hover:bg-warm-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept Request'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Scheduled Sessions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-warm-600" />
                  Upcoming Sessions
                </h3>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No upcoming sessions</p>
                    <p className="text-sm text-slate-500 mt-1">Accept requests to build your schedule.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map(session => {
                      const isJoinable = checkSessionActive(session.appointment_date, session.time);
                      
                      return (
                        <div key={session.id} className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-warm-200">
                          
                          {/* Patient Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-warm-600" />
                              <span className="font-medium text-slate-900">{session.patient_name}</span>
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {session.appointment_date?.split('T')[0]}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.time}
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleStartSession(session)}
                              disabled={!isJoinable}
                              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isJoinable 
                                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                              title={!isJoinable ? 'Session opens 5 minutes before scheduled time' : 'Start Session'}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Start Session
                            </button>
                            <button 
                              onClick={() => handleCancelSession(session.id)}
                              disabled={isProcessing === session.id}
                              className="flex items-center px-3 py-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-md text-sm font-medium transition-colors"
                            >
                              {isProcessing === session.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}

        {/* Tab Content: Patients & Messages (Stubs for future expansion) */}
        {activeTab === 'patients' && (
          <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
            <User className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Patient Directory</h3>
            <p className="text-slate-500 mt-1">Patient management views will populate here.</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Secure Messaging</h3>
            <p className="text-slate-500 mt-1">Active patient conversations will appear here.</p>
          </div>
        )}

      </div>
      
      {/* Video Room Modal Passthrough */}
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
