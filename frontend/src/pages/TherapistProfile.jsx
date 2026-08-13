import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Briefcase, FileText, Camera, CheckCircle2, Loader2, Edit2, BadgeInfo, Stethoscope, Clock } from 'lucide-react';
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
    first_name: '', last_name: '', email: '', specialization: '', license_number: '', bio: '', hourly_rate: ''
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
          hourly_rate: data.hourly_rate || ''
        });
        setUser(prev => ({ ...prev, ...data }));
      } catch (err) {
        setError('Failed to load profile data.');
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
    } catch (err) {
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
      toast.success('Professional profile updated successfully!');
    } catch (err) {
      setError('Failed to save profile.');
      toast.error('Failed to save profile.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-warm-500 w-8 h-8" /></div>;

  const displayInitials = (formData.first_name?.[0] || '') + (formData.last_name?.[0] || '');
  const displayName = formatUserName({ ...user, ...formData, role: 'therapist' });

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-medium text-slate-900">Professional Profile</h1>
            <p className="text-slate-500 mt-1">Manage your clinical credentials and practice details.</p>
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-warm-600 hover:bg-warm-700 shadow-sm transition-colors disabled:opacity-50 flex items-center">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors flex items-center">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{error}</div>}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Avatar Area */}
          <div className="p-8 border-b border-slate-100 flex items-center gap-6 bg-gradient-to-r from-warm-50/50 to-transparent relative">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-warm-700 text-3xl font-medium border-4 border-warm-100 shadow-sm overflow-hidden">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-warm-500" />
                ) : user?.profile_picture ? (
                  <img src={`${import.meta.env.VITE_API_URL}${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  displayInitials || <Stethoscope className="w-10 h-10 text-warm-300" />
                )}
              </div>
              {isEditing && (
                <>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-warm-600 transition-colors cursor-pointer">
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-medium text-slate-900">{displayName}</h2>
              <p className="text-slate-500">{formData.specialization || 'Clinical Provider'}</p>
            </div>
          </div>

          {/* Data Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Phone (Always Read-Only Block) */}
              <div className="col-span-1 md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Contact Number</p>
                    <p className="text-slate-900 font-medium">{user?.phone_number || 'N/A'}</p>
                    <p className="text-sm text-gray-500 mt-2">Your phone number is linked via OTP and cannot be changed here. Contact administration for updates.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </div>
              </div>

              {/* Name (Always Read-Only Block) */}
              <div className="col-span-1 md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Legal Name</p>
                    <p className="text-slate-900 font-medium">{displayName}</p>
                    <p className="text-sm text-gray-500 mt-2">Your legal name is verified for clinical integrity and cannot be changed here. Contact system administration for updates.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2 gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Professional Email
                </label>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-slate-300 focus:border-warm-500 focus:ring-2 focus:ring-warm-100 rounded-lg px-4 py-2.5 outline-none transition-all text-slate-900" placeholder="yourname@example.com" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-transparent">{formData.email || <span className="text-slate-400 italic">No email provided</span>}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2 gap-2">
                  <Stethoscope className="w-4 h-4 text-slate-400" /> Professional credentials
                </label>
                {isEditing ? (
                  <input type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full bg-white border border-slate-300 focus:border-warm-500 focus:ring-2 focus:ring-warm-100 rounded-lg px-4 py-2.5 outline-none transition-all text-slate-900" placeholder="Professional credentials" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-transparent">{formData.specialization || <span className="text-slate-400 italic">Not specified</span>}</p>
                )}
              </div>



              {/* Bio */}
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2 gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Specialisation and professional bio
                </label>
                {isEditing ? (
                  <textarea rows="4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-white border border-slate-300 focus:border-warm-500 focus:ring-2 focus:ring-warm-100 rounded-lg px-4 py-3 outline-none transition-all text-slate-900 resize-none" placeholder="Specialisation and professional bio" />
                ) : (
                  <p className="px-4 py-3 text-slate-900 bg-transparent whitespace-pre-wrap">{formData.bio || <span className="text-slate-400 italic">No bio provided.</span>}</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
