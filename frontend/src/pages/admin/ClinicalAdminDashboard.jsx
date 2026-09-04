import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Inbox, LayoutDashboard, Search, Bell, Activity, Stethoscope, ArrowLeftRight, FileText } from 'lucide-react';
import { formatUserName } from '../../utils/formatters';

export default function ClinicalAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = formatUserName(user);
  
  const [activeTab, setActiveTab] = useState('triage');
  const [therapists, setTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [triageQueue, setTriageQueue] = useState([]);
  const [isAssigning, setIsAssigning] = useState(null);
  const [selectedTherapists, setSelectedTherapists] = useState({});

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [triageRes, therapistRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin-clinical/triage`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin-clinical/therapists`, { withCredentials: true })
        ]);
        setTriageQueue(triageRes.data);
        setTherapists(therapistRes.data);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      }
    };
    fetchAdminData();
  }, []);

  const handleAssign = async (appointmentId) => {
    const therapistId = selectedTherapists[appointmentId];
    if (!therapistId) return;
    setIsAssigning(appointmentId);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin-clinical/triage/assign`, 
        { appointment_id: appointmentId, therapist_id: therapistId }, 
        { withCredentials: true }
      );
      // Remove the assigned appointment from the local triage queue
      setTriageQueue(prev => prev.filter(app => app.id !== appointmentId));
    } catch (error) {
      alert('Failed to assign therapist.');
    } finally {
      setIsAssigning(null);
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* PERSISTENT SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col shadow-xl z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-white font-black tracking-widest text-sm uppercase">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
               <Shield className="w-4 h-4 text-slate-900"/>
            </div>
            Clinical Director
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveTab('triage')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'triage' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Inbox className="w-5 h-5"/> Triage Queue
          </button>
          <button onClick={() => setActiveTab('roster')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'roster' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Stethoscope className="w-5 h-5"/> Provider Roster
          </button>
          <button onClick={() => setActiveTab('patients')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'patients' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5"/> Patient Directory
          </button>
          <button onClick={() => setActiveTab('audit')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'audit' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FileText className="w-5 h-5"/> Security & Audit
          </button>
        </nav>

        {/* WORKSPACE TOGGLE: Back to Therapist Mode */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={() => navigate('/therapist/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 py-2.5 rounded-lg text-sm font-black uppercase tracking-widest transition-colors border border-teal-500/20"
          >
            <LayoutDashboard className="w-4 h-4"/> Therapist OS
          </button>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <h2 className="text-xl font-black text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5"/>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'triage' && (
              <div className="space-y-6 mt-6">
                {triageQueue.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center justify-center">
                    <Inbox className="w-12 h-12 text-slate-300 mb-4"/>
                    <p className="text-lg text-slate-700 font-bold">Inbox zero</p>
                    <p className="text-sm text-slate-500">No pending triage requests at this time.</p>
                  </div>
                ) : (
                  triageQueue.map(app => (
                    <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{app.first_name} {app.last_name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <span className="font-medium">{app.patient_gender || 'Unspecified'}</span> • 
                            <span className="font-medium">{app.nationality || 'Unspecified'}</span> • 
                            <span className="font-medium">Requested: {app.appointment_date?.split('T')[0]} ({app.appointment_time})</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap font-medium">
                          {app.notes || 'No clinical notes provided.'}
                        </div>
                      </div>
                      
                      <div className="lg:w-72 shrink-0 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assign Provider</label>
                        <select 
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-medium"
                          value={selectedTherapists[app.id] || ''}
                          onChange={(e) => setSelectedTherapists(prev => ({...prev, [app.id]: e.target.value}))}
                        >
                          <option value="">Select a Therapist...</option>
                          {therapists.map(t => (
                            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssign(app.id)}
                          disabled={!selectedTherapists[app.id] || isAssigning === app.id}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {isAssigning === app.id ? 'Assigning...' : 'Confirm Assignment'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'roster' && (
               <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center justify-center mt-10">
                 <Stethoscope className="w-12 h-12 text-slate-300 mb-4"/>
                 <p className="text-lg text-slate-700 font-bold">Provider Roster Wiring Pending</p>
                 <p className="text-sm text-slate-500">This will display therapist workloads and allow step-1 onboarding.</p>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
