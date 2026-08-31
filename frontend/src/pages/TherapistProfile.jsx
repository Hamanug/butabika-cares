import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, FileText, Camera, CheckCircle2, Loader2, Edit2, BadgeInfo, Stethoscope, Hash, DollarSign, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatUserName } from '../utils/formatters';

export default function TherapistProfile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', specialization: '', license_number: '', bio: '', hourly_rate: '', title: '', accepting_patients: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/therapists/profile`, { withCredentials: true });
        const data = res.data;
        setFormData({
          first_name: data.first_name || '', last_name: data.last_name || '',
          email: data.email || '', specialization: data.specialization || '',
          license_number: data.license_number || '', bio: data.bio || '',
          hourly_rate: data.hourly_rate || '', title: data.title || '',
          accepting_patients: data.accepting_patients !== false
        });
        setUser(prev => ({ ...prev, ...data }));
      } catch {
        setError('Failed to load clinical profile data.');
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, [setUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    
    const formDataObj = new FormData();
    formDataObj.append('profile_picture', file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/therapists/profile/upload`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setUser(prev => ({ ...prev, ...res.data.user }));
    } catch {
      setError('Failed to upload image.');
    } finally { 
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/therapists/profile`, formData, { withCredentials: true });
      setUser(prev => ({ ...prev, ...res.data.user }));
      setIsEditing(false);
      toast.success('Clinical profile updated successfully!');
    } catch {
      setError('Failed to save profile modifications.');
      toast.error('Failed to save profile.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="animate-spin text-[#0F766E] w-8 h-8" /></div>;

  const displayInitials = (formData.first_name?.[0] || '') + (formData.last_name?.[0] || '');
  const displayName = formatUserName({ ...user, ...formData, role: 'therapist' });

  const inputClasses = "w-full bg-white border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 rounded-lg px-4 py-2.5 outline-none transition-all text-slate-900 font-medium shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12 font-sans">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Profile</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your professional credentials and scheduling availability.</p>
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-full text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-full text-sm font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-sm transition-colors disabled:opacity-50 flex items-center">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-full text-sm font-bold text-[#0F766E] bg-white border border-[#0F766E] hover:bg-teal-50 shadow-sm transition-colors flex items-center">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Credentials
            </button>
          )}
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-medium">{error}</div>}

        <div className="space-y-8">
          
          {/* Section 1: Clinical Identifiers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Identifiers</h3>
            </div>
            
            {/* Avatar Area */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-8 relative">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full bg-teal-50 flex items-center justify-center text-[#0F766E] text-4xl font-black border-[4px] border-slate-200 shadow-sm overflow-hidden relative">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
                  ) : user?.profile_picture ? (
                    <>
                      <img 
                        src={`${import.meta.env.VITE_API_URL}${user.profile_picture}`} 
                        alt="Profile" 
                        className={`w-full h-full object-cover transition-all ${user.avatar_status === 'pending' ? 'grayscale opacity-50' : ''}`} 
                      />
                      {user.avatar_status === 'pending' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                          <span className="bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 py-1 rounded shadow-sm text-center">
                            PENDING<br/>APPROVAL
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    displayInitials || <Stethoscope className="w-10 h-10 text-[#0F766E]/50" />
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-black text-slate-900">{displayName}</h2>
                <p className="text-slate-500 font-mono text-sm mt-1 mb-4">EMR Provider ID: {user?.id || 'PENDING'}</p>
                
                {isEditing && (
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-widest hover:border-[#0F766E] hover:text-[#0F766E] hover:bg-teal-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                      Upload Official ID Photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Phone (Read-Only) */}
              <div className="col-span-1 md:col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Primary Contact</p>
                    <p className="text-slate-900 font-mono font-bold tracking-tight">{user?.phone_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[#0F766E] bg-teal-50 px-3 py-1.5 rounded-md text-xs font-bold border border-teal-100 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> System Verified
                </div>
              </div>

              {/* Legal Name (Read-Only) */}
              <div className="col-span-1 md:col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Legal Name</p>
                    <p className="text-slate-900 font-bold">{displayName}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Verified for clinical integrity. Contact administration for updates.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[#0F766E] bg-teal-50 px-3 py-1.5 rounded-md text-xs font-bold border border-teal-100 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Identity Verified
                </div>
              </div>

              {/* Title Dropdown */}
              <div className="col-span-1">
                <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                  <BadgeInfo className="w-4 h-4 text-slate-400" /> Prefix / Title
                </label>
                {isEditing ? (
                  <select
                    name="title"
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className={inputClasses}
                  >
                    <option value="">None / Blank</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-bold">{formData.title || <span className="text-slate-400 italic font-normal">None</span>}</p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Professional Email
                </label>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses} placeholder="provider@hospital.org" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-bold">{formData.email || <span className="text-slate-400 italic font-normal">No email provided</span>}</p>
                )}
              </div>

              {/* License Number */}
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                  <Hash className="w-4 h-4 text-slate-400" /> Medical License Number
                </label>
                {isEditing ? (
                  <input type="text" value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})} className={inputClasses} placeholder="e.g. MD-12345678" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold tracking-tight">{formData.license_number || <span className="text-slate-400 italic font-sans font-normal">License number not on file</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Specializations */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Specializations</h3>
            </div>
            <div className="p-8 grid grid-cols-1 gap-8">
              
              <div>
                <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                  <Stethoscope className="w-4 h-4 text-slate-400" /> Primary Specialty
                </label>
                {isEditing ? (
                  <input type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className={inputClasses} placeholder="e.g. Clinical Psychology, Psychiatry" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-bold">{formData.specialization || <span className="text-slate-400 italic font-normal">Not specified</span>}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Professional Bio & Credentials
                </label>
                {isEditing ? (
                  <textarea rows="5" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className={`${inputClasses} resize-none`} placeholder="Detail your clinical background, modalities, and professional philosophy." />
                ) : (
                  <p className="px-4 py-4 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-medium leading-relaxed">{formData.bio || <span className="text-slate-400 italic font-normal">No bio provided.</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Schedule Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Schedule Management</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Hourly Rate */}
              <div>
                <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Session Rate (Optional)
                </label>
                {isEditing ? (
                  <input type="text" value={formData.hourly_rate} onChange={e => setFormData({...formData, hourly_rate: e.target.value})} className={inputClasses} placeholder="e.g. $150 / session" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold tracking-tight">{formData.hourly_rate || <span className="text-slate-400 italic font-sans font-normal">Not specified</span>}</p>
                )}
              </div>

              {/* Accepting Patients Toggle */}
              <div>
                <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 gap-2">
                  <CalendarCheck className="w-4 h-4 text-slate-400" /> Roster Status
                </label>
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Accepting New Patients</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Toggle your visibility in the public directory.</p>
                  </div>
                  {isEditing ? (
                    <button 
                      type="button"
                      role="switch"
                      aria-checked={formData.accepting_patients}
                      onClick={() => setFormData({...formData, accepting_patients: !formData.accepting_patients})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2 ${formData.accepting_patients ? 'bg-[#0F766E]' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.accepting_patients ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${formData.accepting_patients ? 'bg-teal-50 text-[#0F766E] border border-teal-100' : 'bg-slate-200 text-slate-600 border border-slate-300'}`}>
                      {formData.accepting_patients ? 'Active' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
