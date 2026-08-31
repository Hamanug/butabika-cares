import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Frown, Meh, Smile, Activity, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import JournalTimeline from '../components/JournalTimeline';

const CLINICAL_MOODS = [
  { value: 1, label: 'Severe Distress', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-red-50 text-red-700 border border-red-200', active: 'ring-2 ring-red-500 bg-red-100' },
  { value: 2, label: 'Moderate Distress', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8 opacity-75" />, color: 'bg-red-50 text-red-700 border border-red-200', active: 'ring-2 ring-red-500 bg-red-100' },
  { value: 3, label: 'Baseline / Neutral', icon: <Meh className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-slate-50 text-slate-700 border border-slate-300', active: 'ring-2 ring-slate-500 bg-slate-200' },
  { value: 4, label: 'Stable / Positive', icon: <Smile className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-teal-50 text-[#0F766E] border border-teal-200', active: 'ring-2 ring-[#0F766E] bg-teal-100' },
  { value: 5, label: 'Optimal', icon: <Smile className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-teal-50 text-[#0F766E] border border-teal-200', active: 'ring-2 ring-[#0F766E] bg-teal-100' },
];

export default function Journal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState(null);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/journal/entries`, { withCredentials: true });
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch entries', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mood || !text.trim()) return;
    
    const selectedMood = CLINICAL_MOODS.find(m => m.value === mood);

    if (!user) {
      sessionStorage.setItem('pendingJournal', JSON.stringify({
        mood_rating: mood,
        mood_label: selectedMood.label,
        entry_text: text
      }));
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/journal/entries`, {
        mood_rating: mood,
        mood_label: selectedMood.label,
        entry_text: text
      }, { withCredentials: true });
      
      setMood(null);
      setText('');
      fetchEntries();
    } catch (err) {
      console.error('Failed to save entry', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-900">Confirm deletion of clinical record?</p>
        <div className="flex gap-2 justify-end mt-1">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await axios.delete(`${import.meta.env.VITE_API_URL}/api/journal/entries/${id}`, { withCredentials: true });
              setEntries(prev => prev.filter(e => e.id !== id));
              toast.success('Record deleted');
            } catch (err) {
              console.error('Failed to delete entry', err);
              toast.error('Failed to delete record');
            }
          }} className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors">Delete</button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
      <div className="container max-w-3xl mx-auto px-4">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Clinical CBT Log</h1>
          <p className="text-slate-600 font-medium">Record mood states and identify cognitive triggers.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-10">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">1. Severity Assessment</h2>
            <p className="text-lg font-bold text-slate-900 mt-1">Current Mood State</p>
          </div>
          
          <div className="flex flex-wrap justify-between items-stretch gap-2 mb-8">
            {CLINICAL_MOODS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`flex-1 flex flex-col items-center justify-center gap-2 transition-all p-3 sm:p-4 rounded-xl ${mood === m.value ? m.active : m.color} hover:shadow-sm`}
              >
                {m.icon}
                <span className="text-[10px] sm:text-xs font-bold tracking-tight text-center leading-tight">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <div className="border-b border-slate-200 pb-2 mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                2. Clinical Note / Trigger Identification
              </label>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-4 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] min-h-[160px] outline-none transition-all text-slate-900 font-medium shadow-sm resize-y"
              placeholder="Document specific situations, thoughts, or somatic symptoms..."
            ></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !mood || !text.trim()}
              className="bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 text-white px-8 py-3 rounded-full font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Log Clinical Entry'}
              {!isSubmitting && <FileText className="w-4 h-4" />}
            </button>
          </div>
        </form>

        <div>
          <div className="border-b border-slate-200 pb-3 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Historical Data Feed</h3>
          </div>
          <JournalTimeline entries={entries} onDelete={handleDelete} />
        </div>

      </div>
    </div>
  );
}
