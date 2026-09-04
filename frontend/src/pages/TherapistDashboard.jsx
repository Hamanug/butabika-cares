import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, Video, Ban, User, FileText, Loader2, AlertTriangle, 
  Users, CheckCircle2, Inbox, LayoutDashboard, MessageSquare, Shield, Bell, Search, Activity, MonitorSmartphone
} from 'lucide-react';
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
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors">
            No, Keep it
          </button>
          <button onClick={async () => {
              toast.dismiss(t.id);
              setIsProcessing(id);
              try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/cancel/${id}`, {}, { withCredentials: true });
                await fetchData();
                toast.success('Session cancelled');
              } catch (err) {
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
    ), { duration: Infinity, id: 'cancel-confirm' });
  };

  const handleStartSession = (session) => {
    setActiveSession(session);
    setIsVideoOpen(true);
  };

  const clinicalAlertsCount = patients.filter(p => p.isDissonant).length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. PERSISTENT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col shadow-xl z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-white font-black tracking-widest text-sm uppercase">
            <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
               <Shield className="w-4 h-4 text-slate-900"/>
            </div>
            Clinical OS
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5"/> Workspace
          </button>
          <button onClick={() => setActiveTab('patients')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'patients' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5"/> Patient Roster
          </button>
          <button onClick={() => navigate('/messages')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:bg-slate-800 hover:text-white">
            <MessageSquare className="w-5 h-5"/> Secure Messages
            {pendingRequests.length > 0 && <span className="ml-auto bg-teal-500 text-slate-900 text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold border border-slate-700">
              {displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Dr. {displayName}</p>
              <p className="text-xs text-slate-500 truncate">Attending Provider</p>
            </div>
          </div>
        </div>
        {user?.role === 'clinical_admin' && (
          <div className="p-4 border-t border-slate-800 shrink-0">
            <button 
              onClick={() => navigate('/admin/clinical')}
              className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 py-2.5 rounded-lg text-sm font-black uppercase tracking-widest transition-colors border border-amber-500/20"
            >
              <Shield className="w-4 h-4"/> Admin OS
            </button>
          </div>
        )}
      </aside>

      {/* 2. MAIN CANVAS */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Global Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0 shadow-sm lg:shadow-none">
          <h2 className="text-xl font-black text-slate-900">
            {activeTab === 'appointments' && 'Clinical Workspace'}
            {activeTab === 'patients' && 'Patient Roster'}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 mr-2"/>
              <input type="text" placeholder="Search patients..." className="bg-transparent text-sm focus:outline-none text-slate-700 w-48" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5"/>
              {clinicalAlertsCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8 bg-slate-50">
          
          {/* TAB: APPOINTMENTS (WORKSPACE) */}
          {activeTab === 'appointments' && (
            <div className="max-w-6xl mx-auto">
              
              {/* Glance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</p>
                    <p className="text-2xl font-black text-slate-900">{pendingRequests.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Inbox className="w-5 h-5"/></div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scheduled</p>
                    <p className="text-2xl font-black text-slate-900">{sessions.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center"><Calendar className="w-5 h-5"/></div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Roster</p>
                    <p className="text-2xl font-black text-slate-900">{patients.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-5 h-5"/></div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alerts</p>
                    <p className="text-2xl font-black text-slate-900">{clinicalAlertsCount}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle className="w-5 h-5"/></div>
                </div>
              </div>

              {/* Split Triage View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Left: Pending Requests */}
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    Action Required <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{pendingRequests.length}</span>
                  </h3>
                  
                  {pendingRequests.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-6 text-center">
                      <p className="text-sm text-slate-500 font-medium">Inbox zero. No pending requests.</p>
                    </div>
                  ) : (
                    pendingRequests.map(req => (
                      <div key={req.id} className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-[#0F766E]/40 transition-all flex flex-col gap-5 cursor-default relative overflow-hidden">
                        
                        {/* Left Accent Border */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0F766E]/80 rounded-l-2xl"></div>

                        {/* Header: Patient Info & Badges */}
                        <div className="flex justify-between items-start pl-2">
                          <div className="flex flex-col">
                            <p className="font-black text-2xl text-slate-900 tracking-tight">
                              {formatPatientName({ first_name: req.other_first, last_name: req.other_last, display_id: req.other_display_id || req.patient_id })}
                            </p>
                            
                            {/* Clinical Metadata Tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg ${
                                req.therapy_type === 'Couples' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                req.therapy_type === 'Child' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                req.therapy_type === 'Group' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {req.therapy_type || 'Individual'} Therapy
                              </span>
                              
                              {req.device_count > 1 && (
                                <span className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                                  <MonitorSmartphone className="w-3.5 h-3.5" /> {req.device_count} Devices
                                </span>
                              )}
                              
                              {req.prior_therapy ? (
                                <span className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                                  Returning Client
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
                                  New Platform User
                                </span>
                              )}
                            </div>
                          </div>

                          {/* DSM-5 Status Indicator */}
                          {req.dsm_5_assessment && Object.keys(req.dsm_5_assessment).length > 0 && (
                             <div className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm" title="DSM-5-TR Completed">
                                <Activity className="w-4 h-4 animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-wide">DSM-5 Attached</span>
                             </div>
                          )}
                        </div>

                        {/* Schedule Info */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center gap-6 pl-3">
                          <div className="flex items-center text-sm text-slate-700 font-bold">
                            <Calendar className="w-4 h-4 mr-2 text-[#0F766E]"/> {req.appointment_date?.split('T')[0]}
                          </div>
                          <div className="flex items-center text-sm text-slate-700 font-bold">
                            <Clock className="w-4 h-4 mr-2 text-[#0F766E]"/> {req.appointment_time}
                          </div>
                        </div>

                        {/* Clinical Notes Preview */}
                        {req.notes && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                            <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400"/> Intake Summary</p>
                            <p className="text-slate-600 line-clamp-3 whitespace-pre-wrap font-medium leading-relaxed">{req.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-1 pl-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/therapist/patient/${req.patient_id}`); }}
                            className="flex-1 bg-white border-2 border-slate-200 hover:border-[#0F766E] text-slate-700 hover:text-[#0F766E] py-3.5 rounded-xl text-sm font-black transition-all"
                          >
                            Review Full Chart
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAcceptRequest(req.id); }}
                            disabled={isProcessing === req.id}
                            className="flex-1 bg-[#0F766E] hover:bg-[#115E59] text-white py-3.5 rounded-xl text-sm font-black transition-all shadow-md active:scale-95 flex justify-center items-center"
                          >
                            {isProcessing === req.id ? <Loader2 className="h-5 w-5 animate-spin"/> : 'Accept Session'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Right: Scheduled Sessions */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Today's Schedule</h3>
                  
                  {sessions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center justify-center">
                      <Calendar className="w-12 h-12 text-slate-300 mb-4"/>
                      <p className="text-lg text-slate-700 font-bold">Your schedule is clear</p>
                      <p className="text-sm text-slate-500">Accept requests to build your timeline.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="divide-y divide-slate-100">
                        {sessions.map(session => (
                          <div key={session.id} onClick={() => navigate(`/therapist/patient/${session.patient_id}`)} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex flex-col items-center justify-center shrink-0 border border-teal-100">
                                <span className="text-xs font-bold uppercase">{session.time?.split(' ')[1] || 'AM'}</span>
                                <span className="text-sm font-black leading-none">{session.time?.split(':')[0] || '12'}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-lg">
                                  {formatPatientName({ first_name: session.other_first, last_name: session.other_last, display_id: session.other_display_id })}
                                </h4>
                                <p className="text-sm text-slate-500 font-medium mt-0.5">
                                  {session.appointment_date?.split('T')[0]} • {session.time}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/therapist/patient/${session.patient_id}`); }} className="p-2 text-slate-400 hover:text-[#0F766E] hover:bg-teal-50 rounded-lg transition-colors" title="Clinical Chart">
                                <FileText className="w-5 h-5"/>
                              </button>
                              {session.is_joinable ? (
                                <button onClick={(e) => { e.stopPropagation(); handleStartSession(session); }} className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center">
                                  <Video className="w-4 h-4 mr-2"/> Start
                                </button>
                              ) : (
                                <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold flex items-center cursor-not-allowed">
                                  Locked
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); handleCancelSession(session.id); }} disabled={isProcessing === session.id} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1">
                                {isProcessing === session.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <Ban className="w-5 h-5"/>}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PATIENTS (ROSTER) */}
          {activeTab === 'patients' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {patients.length === 0 ? (
                  <div className="text-center py-16 bg-white">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4"/>
                    <p className="text-slate-900 font-bold text-lg">No active patients</p>
                    <p className="text-sm text-slate-500 mt-1">Your roster is currently empty.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Patient Identity</th>
                        <th className="px-6 py-4">Next Session</th>
                        <th className="px-6 py-4">Clinical Status</th>
                        <th className="px-6 py-4 text-right">Records</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patients.map(patient => (
                        <tr key={patient.id} onClick={() => navigate(`/therapist/patient/${patient.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 group-hover:bg-teal-50 group-hover:text-[#0F766E] transition-colors">
                                {patient.first_name?.[0] || 'P'}
                              </div>
                              <span className="font-bold text-slate-900 text-base">
                                {formatPatientName({ first_name: patient.first_name, last_name: patient.last_name, display_id: patient.display_id })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">
                            {patient.next_session ? new Date(patient.next_session).toLocaleDateString() : 'Unscheduled'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{patient.clinical_trend || 'Establishing Baseline'}</span>
                              {patient.isDissonant && (
                                <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100" title="Dissonance detected">
                                  <AlertTriangle className="w-3 h-3 mr-1"/> Flag
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#0F766E] font-bold text-sm hover:underline">View Chart</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV (Visible only on lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900 text-slate-400 border-t border-slate-800 pb-safe z-50 flex justify-around items-center h-16">
        <button onClick={() => setActiveTab('appointments')} className={`flex flex-col items-center justify-center w-20 h-full ${activeTab === 'appointments' ? 'text-teal-400' : 'hover:text-white'}`}>
          <LayoutDashboard className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-bold">Workspace</span>
        </button>
        <button onClick={() => setActiveTab('patients')} className={`flex flex-col items-center justify-center w-20 h-full ${activeTab === 'patients' ? 'text-teal-400' : 'hover:text-white'}`}>
          <Users className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-bold">Roster</span>
        </button>
        <button onClick={() => navigate('/messages')} className="flex flex-col items-center justify-center w-20 h-full hover:text-white relative">
          <MessageSquare className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-bold">Messages</span>
          {pendingRequests.length > 0 && <span className="absolute top-1 right-3 w-3 h-3 bg-teal-500 rounded-full border-2 border-slate-900"></span>}
        </button>
        {user?.role === 'clinical_admin' && (
          <button onClick={() => navigate('/admin/clinical')} className="flex flex-col items-center justify-center w-20 h-full text-amber-500 hover:text-amber-400">
            <Shield className="w-6 h-6 mb-1"/>
            <span className="text-[10px] font-bold uppercase">Admin</span>
          </button>
        )}
      </div>

      <VideoRoomModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} appointment={activeSession} isTherapist={true} onSessionEnded={fetchData} />
    </div>
  );
}
