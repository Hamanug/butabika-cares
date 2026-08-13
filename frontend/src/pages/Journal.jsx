import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Frown, Meh, Smile, Heart, Star, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import JournalTimeline from '../components/JournalTimeline';
const MOODS = [
  { value: 1, label: 'Very Sad', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-blue-100 text-blue-600', active: 'ring-4 ring-blue-300 bg-blue-200' },
  { value: 2, label: 'Sad', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8 opacity-75" />, color: 'bg-indigo-100 text-indigo-600', active: 'ring-4 ring-indigo-300 bg-indigo-200' },
  { value: 3, label: 'Neutral', icon: <Meh className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-slate-100 text-slate-600', active: 'ring-4 ring-slate-300 bg-slate-200' },
  { value: 4, label: 'Happy', icon: <Smile className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-green-100 text-green-600', active: 'ring-4 ring-green-300 bg-green-200' },
  { value: 5, label: 'Great', icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-amber-100 text-amber-600', active: 'ring-4 ring-amber-300 bg-amber-200' },
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
    
    const selectedMood = MOODS.find(m => m.value === mood);

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
        <p className="text-sm font-medium text-slate-800">Are you sure you want to delete this entry?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await axios.delete(`${import.meta.env.VITE_API_URL}/api/journal/entries/${id}`, { withCredentials: true });
              setEntries(prev => prev.filter(e => e.id !== id));
              toast.success('Entry deleted');
            } catch (err) {
              console.error('Failed to delete entry', err);
              toast.error('Failed to delete entry');
            }
          }} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">Delete</button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="container max-w-3xl mx-auto px-4">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Daily Journal</h1>
          <p className="text-slate-600 text-lg">Track your feelings, reflect on your day, and watch yourself grow.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-10">
          <h2 className="text-xl font-medium text-slate-800 mb-6">How are you feeling today?</h2>
          
          <div className="flex justify-between items-center mb-8 px-1 md:px-8">
            {MOODS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-2 transition-all p-2 sm:p-3 rounded-xl ${mood === m.value ? m.active : m.color} hover:-translate-y-1`}
              >
                {m.icon}
                <span className="text-[10px] sm:text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Write down your thoughts
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 min-h-[150px] outline-none transition-shadow"
              placeholder="What's on your mind? Did anything specific trigger this mood?"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !mood || !text.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Journal Entry'}
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-6">Past Entries</h3>
          <JournalTimeline entries={entries} onDelete={handleDelete} />
        </div>

      </div>
    </div>
  );
}
