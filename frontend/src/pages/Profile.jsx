import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Briefcase, FileText, Camera, CheckCircle2, Loader2, Edit2 } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', occupation: '', bio: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile');
        const data = res.data;
        setFormData({
          first_name: data.first_name || '', last_name: data.last_name || '',
          email: data.email || '', occupation: data.occupation || '', bio: data.bio || ''
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
      const res = await axios.post('/api/profile/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
      const res = await axios.put('/api/profile', formData);
      setUser(prev => ({ ...prev, ...res.data.user }));
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-serene-500 w-8 h-8" /></div>;

  const displayInitials = (formData.first_name?.[0] || '') + (formData.last_name?.[0] || '');
  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-medium text-slate-900">My Profile</h1>
            <p className="text-slate-500 mt-1">Manage your personal information and account settings.</p>
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-serene-600 hover:bg-serene-700 shadow-sm transition-colors disabled:opacity-50 flex items-center">
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
          <div className="p-8 border-b border-slate-100 flex items-center gap-6 bg-gradient-to-r from-serene-50/50 to-transparent relative">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-serene-700 text-3xl font-medium border-4 border-serene-100 shadow-sm overflow-hidden">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-serene-500" />
                ) : user?.profile_picture ? (
                  <img src={`http://localhost:3000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  displayInitials || <User className="w-10 h-10 text-serene-300" />
                )}
              </div>
              {isEditing && (
                <>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-serene-600 transition-colors cursor-pointer">
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-medium text-slate-900">{fullName || 'Welcome to Butabika Cares'}</h2>
              <p className="text-slate-500">{formData.occupation || 'Patient Account'}</p>
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
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Phone Number</p>
                    <p className="text-slate-900 font-medium">{user?.phone_number || 'N/A'}</p>
                    <p className="text-sm text-gray-500 mt-2">Your phone number is linked via OTP and cannot be changed here. For changes of contact details, please contact the administrator.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2 gap-2">
                  <User className="w-4 h-4 text-slate-400" /> First Name
                </label>
                {isEditing ? (
                  <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-white border border-slate-300 focus:border-serene-500 focus:ring-2 focus:ring-serene-100 rounded-lg px-4 py-2.5 outline-none transition-all text-slate-900" placeholder="Enter your first name" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-transparent">{formData.first_name || <span className="text-slate-400 italic">Not specified</span>}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2 gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Last Name
                </label>
                {isEditing ? (
                  <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-white border border-slate-300 focus:border-serene-500 focus:ring-2 focus:ring-serene-100 rounded-lg px-4 py-2.5 outline-none transition-all text-slate-900" placeholder="Enter your last name" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-transparent">{formData.last_name || <span className="text-slate-400 italic">Not specified</span>}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2 gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Email Address
                </label>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-slate-300 focus:border-serene-500 focus:ring-2 focus:ring-serene-100 rounded-lg px-4 py-2.5 outline-none transition-all text-slate-900" placeholder="yourname@example.com" />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-transparent">{formData.email || <span className="text-slate-400 italic">No email provided</span>}</p>
                )}
              </div>

              {/* Occupation */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2 gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" /> Occupation
                </label>
                {isEditing ? (
                  <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full bg-white border border-slate-300 focus:border-serene-500 focus:ring-2 focus:ring-serene-100 rounded-lg px-4 py-2.5 outline-none transition-all text-slate-900" placeholder="e.g., Clinical Psychologist, Teacher..." />
                ) : (
                  <p className="px-4 py-2.5 text-slate-900 bg-transparent">{formData.occupation || <span className="text-slate-400 italic">Not specified</span>}</p>
                )}
              </div>

              {/* Bio */}
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2 gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> About Me
                </label>
                {isEditing ? (
                  <textarea rows="4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-white border border-slate-300 focus:border-serene-500 focus:ring-2 focus:ring-serene-100 rounded-lg px-4 py-3 outline-none transition-all text-slate-900 resize-none" placeholder="Tell us a bit about yourself..." />
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
