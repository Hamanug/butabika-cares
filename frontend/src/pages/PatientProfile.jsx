import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Briefcase, FileText, CheckCircle2, Loader2, Edit2, Leaf, Sun, Mountain, Droplet, Compass } from 'lucide-react';
import { formatUserName } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', occupation: '', bio: '', profile_picture: 'icon:initials'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile', { withCredentials: true });
        const data = res.data;
        setFormData({
          first_name: data.first_name || '', 
          last_name: data.last_name || '',
          email: data.email || '', 
          occupation: data.occupation || '', 
          bio: data.bio || '',
          profile_picture: data.profile_picture || 'icon:initials'
        });
        setUser(prev => ({ ...prev, ...data }));
      } catch {
        setError('Failed to load clinical profile data.');
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, [setUser]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await axios.put('/api/profile', formData, { withCredentials: true });
      setUser(prev => ({ ...prev, ...res.data.user }));
      setIsEditing(false);
      toast.success('Clinical profile updated successfully!');
    } catch {
      setError('Failed to save clinical profile.');
      toast.error('Failed to save profile.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="animate-spin text-[#0F766E] w-8 h-8" /></div>;

  const displayInitials = (formData.first_name?.[0] || '') + (formData.last_name?.[0] || '');
  const displayName = formatUserName({ ...user, ...formData });

  const presetAvatars = [
    { id: 'icon:initials', label: 'Initials', icon: null },
    { id: 'icon:leaf', label: 'Leaf', icon: Leaf },
    { id: 'icon:sun', label: 'Sun', icon: Sun },
    { id: 'icon:mountain', label: 'Mountain', icon: Mountain },
    { id: 'icon:droplet', label: 'Droplet', icon: Droplet },
    { id: 'icon:compass', label: 'Compass', icon: Compass }
  ];

  const renderActiveAvatar = () => {
    const activeId = formData.profile_picture || 'icon:initials';
    
    // Legacy image fallback check
    if (!activeId.startsWith('icon:') && activeId.length > 10) {
      return <img src={`${import.meta.env.VITE_API_URL}${activeId}`} alt="Legacy Avatar" className="w-full h-full object-cover" />;
    }

    const selectedPreset = presetAvatars.find(p => p.id === activeId) || presetAvatars[0];
    const IconObj = selectedPreset.icon;

    if (!IconObj) {
      return <span className="text-[#0F766E] text-3xl font-black uppercase">{displayInitials || <User className="w-10 h-10 text-[#0F766E]/50" />}</span>;
    }
    return <IconObj className="w-10 h-10 text-[#0F766E]" />;
  };

  const inputClasses = "w-full bg-white border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 rounded-lg px-4 py-2.5 outline-none transition-all text-slate-900 font-medium shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12 font-sans">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Profile</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your secure EMR identifiers and personal information.</p>
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-full text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-full text-sm font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-sm transition-colors disabled:opacity-50 flex items-center uppercase tracking-widest">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Protocol
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-full text-sm font-bold text-[#0F766E] bg-white border border-[#0F766E] hover:bg-teal-50 shadow-sm transition-colors flex items-center uppercase tracking-widest">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-bold">{error}</div>}

        {/* Main EMR Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Identifiers</h3>
          </div>

          {/* Curated Avatar Area */}
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-8 bg-white">
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-full bg-teal-50 flex items-center justify-center border-[4px] border-slate-200 shadow-sm overflow-hidden">
                {renderActiveAvatar()}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-900">{displayName}</h2>
              <p className="text-slate-500 font-mono text-sm mt-1 mb-4 uppercase tracking-widest">EMR ID: {user?.id || 'PENDING'}</p>
              
              {isEditing && (
                <div className="mt-4 border-t border-slate-100 pt-5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Curated Avatar Library</label>
                  <div className="flex flex-wrap gap-4">
                    {presetAvatars.map((preset) => {
                      const isActive = formData.profile_picture === preset.id || (!formData.profile_picture && preset.id === 'icon:initials');
                      const IconObj = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, profile_picture: preset.id })}
                          title={preset.label}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm ${
                            isActive 
                              ? 'bg-teal-50 border-2 border-[#0F766E] text-[#0F766E]' 
                              : 'bg-slate-100 border-2 border-transparent text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                          }`}
                        >
                          {IconObj ? <IconObj className="w-6 h-6" /> : <span className="text-sm font-black uppercase">{displayInitials || 'IN'}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#0F766E]" /> Secured by Butabika System Admin</p>
                </div>
              )}
            </div>
          </div>

          {/* EMR Data Grid */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
            
            {/* Phone (Read-Only Anchor) */}
            <div className="col-span-1 md:col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Verified Contact</p>
                  <p className="text-slate-900 font-mono font-bold tracking-tight">{user?.phone_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[#0F766E] bg-teal-50 px-3 py-1.5 rounded-md text-xs font-bold border border-teal-100 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> System Verified
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                <User className="w-4 h-4 text-slate-400" /> First Name
              </label>
              {isEditing ? (
                <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className={inputClasses} placeholder="First name" />
              ) : (
                <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-bold">{formData.first_name || <span className="text-slate-400 italic font-normal">Not specified</span>}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                <User className="w-4 h-4 text-slate-400" /> Last Name
              </label>
              {isEditing ? (
                <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className={inputClasses} placeholder="Last name" />
              ) : (
                <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-bold">{formData.last_name || <span className="text-slate-400 italic font-normal">Not specified</span>}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email Address
              </label>
              {isEditing ? (
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses} placeholder="yourname@example.com" />
              ) : (
                <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-bold">{formData.email || <span className="text-slate-400 italic font-normal">No email provided</span>}</p>
              )}
            </div>

            {/* Occupation */}
            <div>
              <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Occupation / Status
              </label>
              {isEditing ? (
                <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className={inputClasses} placeholder="e.g., Student, Engineer" />
              ) : (
                <p className="px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg font-bold">{formData.occupation || <span className="text-slate-400 italic font-normal">Not specified</span>}</p>
              )}
            </div>

            {/* Bio */}
            <div className="col-span-1 md:col-span-2">
              <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Personal Background
              </label>
              {isEditing ? (
                <textarea rows="4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className={`${inputClasses} resize-none`} placeholder="Clinical background notes..." />
              ) : (
                <p className="px-4 py-4 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-medium leading-relaxed">{formData.bio || <span className="text-slate-400 italic font-normal">No background provided.</span>}</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
