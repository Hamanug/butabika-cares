import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Video, Ban, User, FileText, Loader2, AlertTriangle, Users, CheckCircle2, Inbox } from 'lucide-react';
import { formatPatientName, formatUserName } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import VideoRoomModal from '../components/VideoRoomModal';
import toast from 'react-hot-toast';

export default function TherapistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = formatUserName(user);

  // Core State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Modal & Session State
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null);
  
  // Fetch Data
  const fetchData = async () => {
    try {
      const pendingRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/pending`, { withCredentials: true });
      setPendingRequests(pendingRes.data);
      
      const sessionsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/my-sessions`, { withCredentials: true });
      setSessions(sessionsRes.data.filter(s => s.status === 'scheduled'));
      setPastSessions(sessionsRes.data.filter(s => s.status === 'completed'));

      const patientsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/therapists/roster`, { withCredentials: true });
      setPatients(patientsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Actions
  const handleAcceptRequest = async (id) => {
    setIsProcessing(id);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/accept/${id}`, {}, { withCredentials: true });
      await fetchData();
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

  const clinicalAlertsCount = patients.filter(p => p.isDissonant).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-sans">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900">{displayName}'s Workspace</h1>
          <p className="text-slate-600 font-medium">Manage your patients, appointments, and secure messaging.</p>
        </div>

        {/* 5-Card Metrics Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4 text-slate-900">Clinical Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            
            {/* 1. Pending Requests */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700">Pending</h4>
                <Inbox className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900">{pendingRequests.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Action Required</p>
            </div>

            {/* 2. Upcoming Sessions */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700">Scheduled</h4>
                <Calendar className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900">{sessions.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Upcoming</p>
            </div>

            {/* 3. Total Patients */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700">Roster</h4>
                <Users className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900">{patients.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Active Patients</p>
            </div>

            {/* 4. Completed Sessions */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#0F766E] transition-colors"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700">Completed</h4>
                <CheckCircle2 className="h-5 w-5 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900">{pastSessions.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Total Sessions</p>
            </div>

            {/* 5. Clinical Alerts */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-red-600 transition-colors"></div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700">Alerts</h4>
                <AlertTriangle className={`h-5 w-5 transition-colors ${clinicalAlertsCount > 0 ? 'text-red-500' : 'text-slate-400 group-hover:text-[#0F766E]'}`} />
              </div>
              <p className="text-3xl font-black text-slate-900">{clinicalAlertsCount}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Dissonance Flags</p>
            </div>

          </div>
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
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors capitalize ${
                activeTab === tab 
                  ? 'border-[#0F766E] text-[#0F766E]' 
                  : 'border-transparent text-slate-500 hover:text-[#0F766E] hover:border-slate-300'
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
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-[#0F766E]" />
                  Pending Requests
                </h3>
                
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg">No pending requests.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(req => (
                      <div 
                        key={req.id} 
                        onClick={() => navigate(`/therapist/patient/${req.patient_id}`)}
                        className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer hover:border-[#0F766E] transition-colors"
                      >
                        <div className="font-bold text-slate-900 mb-1">
                          {formatPatientName({ first_name: req.other_first, last_name: req.other_last, display_id: req.other_display_id || req.patient_id })}
                        </div>
                        <div className="text-sm text-slate-600 mt-2 space-y-1 mb-4 border-l-2 border-slate-100 pl-3">
                          <p><span className="font-bold text-slate-800">Scheduled for:</span> {req.appointment_date?.split('T')[0]} at {req.appointment_time}</p>
                          <p className="text-xs font-medium text-slate-400">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAcceptRequest(req.id); }}
                          disabled={isProcessing === req.id}
                          className="w-full flex items-center justify-center py-2 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-full text-sm font-bold transition-colors disabled:opacity-50"
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
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#0F766E]" />
                  Upcoming Sessions
                </h3>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-bold">No upcoming sessions</p>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Accept requests to build your schedule.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map(session => {
                      return (
                        <div 
                          key={session.id} 
                          onClick={() => navigate(`/therapist/patient/${session.patient_id}`)}
                          className="p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-[#0F766E] transition-colors"
                        >
                          
                          {/* Patient Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#0F766E]" />
                              <span className="font-bold text-slate-900">
                                {formatPatientName({ first_name: session.other_first, last_name: session.other_last, display_id: session.other_display_id })}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-slate-500 flex items-center gap-1 border-l-2 border-slate-100 pl-2 ml-1">
                              <Calendar className="h-3 w-3" />
                              {session.appointment_date?.split('T')[0]} <span className="mx-1">•</span> <Clock className="h-3 w-3" /> {session.time}
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/therapist/patient/${session.patient_id}`); }}
                              className="flex items-center px-4 py-2 rounded-full text-sm font-bold transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm"
                              title="View Clinical Profile"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Clinical Profile
                            </button>
                            {session.is_joinable ? (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleStartSession(session); }}
                                className="flex items-center px-4 py-2 rounded-full text-sm font-bold transition-colors bg-[#0F766E] hover:bg-[#115E59] text-white shadow-sm"
                                title="Start Session"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Start Session
                              </button>
                            ) : (
                              <button 
                                disabled
                                className="flex items-center px-4 py-2 rounded-full text-sm font-bold transition-colors bg-slate-200 text-slate-400 cursor-not-allowed shadow-sm"
                                title="Locked until 15m before session"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Locked
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCancelSession(session.id); }}
                              disabled={isProcessing === session.id}
                              className="flex items-center px-3 py-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-full text-sm font-medium transition-colors"
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

              {/* Session History */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-slate-600" />
                  Session History
                </h3>
                
                {pastSessions.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-600 font-medium">No past sessions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastSessions.slice(0, 5).map(session => (
                      <div 
                        key={session.id}
                        onClick={() => navigate(`/therapist/patient/${session.patient_id}`)}
                        className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-500" />
                            <span className="font-bold text-slate-900">
                              {formatPatientName({ first_name: session.other_first, last_name: session.other_last, display_id: session.other_display_id })}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-slate-500 flex items-center gap-1 border-l-2 border-slate-100 pl-2 ml-1">
                            <Calendar className="h-3 w-3" />
                            {session.appointment_date?.split('T')[0]} at {session.time || session.appointment_time}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.duration_minutes ? `${session.duration_minutes} mins` : 'Duration N/A'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                Completed
                            </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                  <button onClick={() => navigate('/therapist/history')} className="text-sm font-bold text-[#0F766E] hover:text-[#115E59]">View Full History &rarr;</button>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* Tab Content: Patients Directory */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-[#0F766E]" />
                Patient Directory
              </h3>
            </div>
            
            {patients.length === 0 ? (
              <div className="text-center py-12 bg-white">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-900 font-bold">No patients yet</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">Accept requests to add patients to your roster.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Patient Name</th>
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
                        className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0F766E] font-bold text-sm border border-teal-100">
                              {patient.first_name?.[0] || 'P'}
                            </div>
                            <span className="font-bold text-slate-900">
                              {formatPatientName({ first_name: patient.first_name, last_name: patient.last_name, display_id: patient.display_id })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {patient.next_session ? new Date(patient.next_session).toLocaleDateString() : 'Unscheduled'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">{patient.clinical_trend || 'Establishing Baseline'}</span>
                            {patient.isDissonant && (
                              <AlertTriangle className="h-4 w-4 text-red-500" title="Dissonance detected between rated mood and journal text" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/therapist/patient/${patient.id}`); }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-colors bg-white border border-slate-200 hover:border-[#0F766E] text-slate-700 shadow-sm"
                          >
                            <FileText className="h-3 w-3 mr-1.5 text-slate-400" />
                            Clinical Profile
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
