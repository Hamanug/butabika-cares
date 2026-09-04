import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ShieldAlert, Power, Server, LogOut, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [smsBalance, setSmsBalance] = useState('--');
  const [logs, setLogs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [switches, setSwitches] = useState({
    intakeOpen: true,
    smsRouting: true,
    maintenanceMode: false
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [smsRes, logsRes, switchesRes, staffRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/system/sms-balance`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/system/logs`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/system/switches`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/system/staff`, { withCredentials: true })
      ]);
      setSmsBalance(smsRes.data.balance);
      setLogs(logsRes.data.logs);
      setSwitches(switchesRes.data.switches);
      setStaff(staffRes.data.staff);
    } catch (error) {
      console.error('Failed to load IT admin data', error);
      toast.error('Failed to sync with command center.');
    }
  };

  const triggerProvisioning = async (staffId) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/system/provision/${staffId}`, {}, { withCredentials: true });
      if (res.data.success) {
        alert(`Provisioning successful!\n\nTemporary Password: ${res.data.tempPassword}\n\nPlease copy this and provide it to the staff member securely.`);
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to provision staff member.');
    }
  };

  const toggleSwitch = async (key, currentState) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/system/switches`, {
        switchKey: key,
        state: !currentState
      }, { withCredentials: true });
      
      setSwitches(res.data.switches);
      toast.success(`${key} is now ${!currentState ? 'ON' : 'OFF'}`);
    } catch (error) {
      toast.error('Failed to toggle switch');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col font-mono">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/20 p-2 rounded text-teal-400 border border-teal-500/30">
              <Server className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">IT Command Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800 text-teal-400 px-3 py-1.5 rounded text-sm font-bold border border-slate-700 shadow-inner">
              <CreditCard className="h-4 w-4" /> UGX {smsBalance}
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Kill Switches */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Power className="h-5 w-5 text-teal-500" />
              System Overrides
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <div>
                  <p className="font-bold text-white">Concierge Intake</p>
                  <p className="text-xs text-slate-500">Route new patients to triage</p>
                </div>
                <button 
                  onClick={() => toggleSwitch('intakeOpen', switches.intakeOpen)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${switches.intakeOpen ? 'bg-teal-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${switches.intakeOpen ? 'transform translate-x-6' : ''}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <div>
                  <p className="font-bold text-white">EgoSMS Routing</p>
                  <p className="text-xs text-slate-500">Outbound notifications</p>
                </div>
                <button 
                  onClick={() => toggleSwitch('smsRouting', switches.smsRouting)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${switches.smsRouting ? 'bg-teal-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${switches.smsRouting ? 'transform translate-x-6' : ''}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-rose-950/20 rounded-lg border border-rose-900/30">
                <div>
                  <p className="font-bold text-rose-400">Maintenance Mode</p>
                  <p className="text-xs text-rose-500/70">Lock out all non-admins</p>
                </div>
                <button 
                  onClick={() => toggleSwitch('maintenanceMode', switches.maintenanceMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${switches.maintenanceMode ? 'bg-rose-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${switches.maintenanceMode ? 'transform translate-x-6' : ''}`}></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-full min-h-[500px]">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-500" />
              Security Audit Tail
            </h2>
            
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-sm text-center py-10">No recent logs available.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded bg-slate-950/50 border border-slate-800/50 text-sm">
                    <div className="pt-0.5">
                      {log.status === 'SUCCESS' ? 
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : 
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-200">{log.event}</span>
                        <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        SRC_IP: {log.ip} | STAT: <span className={log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>{log.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Full Width: Staff Provisioning */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server className="h-5 w-5 text-fuchsia-500" />
              Staff Provisioning
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
                    <th className="pb-3 px-4 font-bold">Staff Member</th>
                    <th className="pb-3 px-4 font-bold">Role</th>
                    <th className="pb-3 px-4 font-bold">Email</th>
                    <th className="pb-3 px-4 font-bold">Status</th>
                    <th className="pb-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {staff.map((s) => (
                    <tr key={s.id} className="text-sm">
                      <td className="py-4 px-4 font-medium text-slate-300">{s.name}</td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold border border-slate-700">
                          {s.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">{s.email || 'N/A'}</td>
                      <td className="py-4 px-4">
                        {s.requires_password_change ? (
                          <span className="text-amber-500 text-xs font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Needs Setup
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => triggerProvisioning(s.id)}
                          className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 px-3 py-1.5 rounded text-xs font-bold border border-teal-500/30 transition-colors"
                        >
                          Provision Access
                        </button>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">No staff records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
