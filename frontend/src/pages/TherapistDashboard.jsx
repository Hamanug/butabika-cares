import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Adjust path if necessary
import { Calendar, Clock, Video, Check, Ban, User, MessageSquare, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { formatPatientName, formatUserName } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import VideoRoomModal from '../components/VideoRoomModal'; // Adjust path if necessary
import toast from 'react-hot-toast';

export default function TherapistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = formatUserName(user);

  // Core State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
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
      const pendingRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/pending`, { withCredentials: true });
      setPendingRequests(pendingRes.data);
      
      const sessionsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/my-sessions`, { withCredentials: true });
      setSessions(sessionsRes.data.filter(s => s.status === 'scheduled'));

      const patientsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/therapists/roster`, { withCredentials: true });
      setPatients(patientsRes.data);
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/accept/${id}`, {}, { withCredentials: true });
      await fetchData(); // Refresh lists
    } catch (err) {
      console.error('Failed to accept request', err);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelSession = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-slate-800">Cancel Session?</span>
        <span className="text-sm text-slate-600">Are you sure you want to cancel this appointment?</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
          >
            No, Keep it
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              setIsProcessing(id);
              try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/cancel/${id}`, {}, { withCredentials: true });
                await fetchData();
                toast.success('Session cancelled');
              } catch (err) {
                console.error('Failed to cancel session', err);
                toast.error('Failed to cancel session');
              } finally {
                setIsProcessing(null);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors shadow-sm"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    ), 
    { 
      duration: Infinity, 
      id: 'cancel-confirm',
      style: {
        background: '#ffffff',
        color: '#334155',
        border: '1px solid #e2e8f0',
      }
    });
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
          <h1 className="text-3xl font-medium mb-2 text-slate-900">{displayName}'s Dashboard</h1>
          <p className="text-slate-600">Manage your patients, appointments, and secure messaging.</p>
        </div>

        {/* Native Tailwind Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 mb-8">
          {['appointments', 'patients', 'messages'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'messages') {
                  navigate('/messages');
                } else {
                  setActiveTab(tab);
                }
              }}
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
                        <div className="font-medium text-slate-900 mb-1">
                          {formatPatientName({ first_name: req.other_first, last_name: req.other_last, display_id: req.other_display_id })}
                        </div>
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
                      return (
                        <div 
                          key={session.id} 
                          onClick={() => navigate(`/therapist/patient/${session.patient_id}`)}
                          className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          
                          {/* Patient Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-warm-600" />
                              <span className="font-medium text-slate-900">
                                {formatPatientName({ first_name: session.other_first, last_name: session.other_last, display_id: session.other_display_id })}
                              </span>
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
                              onClick={(e) => { e.stopPropagation(); navigate(`/therapist/patient/${session.patient_id}`); }}
                              className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors bg-blue-50 hover:bg-blue-100 text-blue-700 shadow-sm"
                              title="View Clinical Profile"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Clinical Profile
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStartSession(session); }}
                              className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors bg-green-500 hover:bg-green-600 text-white shadow-sm"
                              title="Start Session"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Start Session
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCancelSession(session.id); }}
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-warm-600" />
                Patient Directory
              </h3>
            </div>
            
            {patients.length === 0 ? (
              <div className="text-center py-12 bg-slate-50">
                <User className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No patients yet</p>
                <p className="text-sm text-slate-500 mt-1">Accept requests to add patients to your roster.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Next Session</th>
                      <th className="px-6 py-4">Clinical Trend</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map(patient => (
                      <tr 
                        key={patient.id} 
                        onClick={() => navigate(`/therapist/patient/${patient.id}`)}
                        className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-700 font-medium text-sm">
                              {patient.first_name?.[0] || 'P'}
                            </div>
                            <span className="font-medium text-slate-900">
                              {formatPatientName(patient)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {patient.next_session ? new Date(patient.next_session).toLocaleDateString() : 'Unscheduled'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-700">{patient.clinical_trend}</span>
                            {patient.isDissonant && (
                              <AlertTriangle className="h-4 w-4 text-red-500" title="Dissonance detected between rated mood and journal text" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/therapist/patient/${patient.id}`); }}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
                          >
                            <FileText className="h-4 w-4 mr-2 text-slate-400" />
                            View Clinical Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
