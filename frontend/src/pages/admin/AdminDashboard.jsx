import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, UserCog, Activity, Download, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Or use localStorage logic if AuthContext isn't globally wired for admins yet

  const [tFirstName, setTFirstName] = useState('');
  const [tLastName, setTLastName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tPassword, setTPassword] = useState('');
  const [tSpecialization, setTSpecialization] = useState('');
  const [tCredentials, setTCredentials] = useState('');
  const [tSuccess, setTSuccess] = useState('');
  const [tError, setTError] = useState('');

  const handleCreateTherapist = async (e) => {
    e.preventDefault();
    setTSuccess('');
    setTError('');
    try {
      await axios.post('http://localhost:3000/api/admin/therapists', {
        first_name: tFirstName,
        last_name: tLastName,
        email: tEmail,
        phone_number: tPhone,
        password: tPassword,
        specialization: tSpecialization,
        credentials: tCredentials
      }, { withCredentials: true });
      setTSuccess('Therapist profile created successfully.');
      setTFirstName(''); setTLastName(''); setTEmail(''); setTPhone(''); setTPassword(''); setTSpecialization(''); setTCredentials('');
    } catch (err) {
      setTError('Failed to create therapist profile.');
    }
  };

  // Basic route protection
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && (!user || user.role !== 'admin')) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    if (logout) logout();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const handleDownloadReport = () => {
    console.log('[STUB] Downloading CSV Sessions Report...');
    // Future API hook: window.open('http://localhost:3000/api/admin/reports/sessions', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Butabika Cares <span className="text-blue-600 font-medium">Admin</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Master Admin</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 mb-8">
          {[
            { id: 'overview', label: 'System Overview', icon: Activity },
            { id: 'users', label: 'Manage Users', icon: Users },
            { id: 'therapists', label: 'Manage Therapists', icon: UserCog }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">System Overview</h2>
                  <p className="text-sm text-slate-500">High-level metrics and system reporting.</p>
                </div>
                <button 
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  Download Sessions Report
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Metric Cards Stub */}
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-slate-800">--</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">Active Therapists</p>
                  <p className="text-3xl font-bold text-slate-800">--</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">Completed Sessions</p>
                  <p className="text-3xl font-bold text-slate-800">--</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">User Management</h3>
              <p className="text-slate-500 mt-1">Data table for user accounts will be injected here.</p>
            </div>
          )}

          {activeTab === 'therapists' && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Onboard New Therapist</h2>
              {tSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 border border-green-100">{tSuccess}</div>}
              {tError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{tError}</div>}
              
              <form onSubmit={handleCreateTherapist} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" required value={tFirstName} onChange={e => setTFirstName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" required value={tLastName} onChange={e => setTLastName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" required value={tEmail} onChange={e => setTEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="text" required value={tPhone} onChange={e => setTPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                  <input type="password" required value={tPassword} onChange={e => setTPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                  <input type="text" required value={tSpecialization} onChange={e => setTSpecialization(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Clinical Psychologist" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Professional Credentials</label>
                  <textarea required value={tCredentials} onChange={e => setTCredentials(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="License numbers, degrees, etc."></textarea>
                </div>
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Create Therapist Profile
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
