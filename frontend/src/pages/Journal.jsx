import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Frown, Meh, Smile, Heart, Star, Sparkles } from 'lucide-react';

const MOODS = [
  { value: 1, label: 'Very Sad', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-blue-100 text-blue-600', active: 'ring-4 ring-blue-300 bg-blue-200' },
  { value: 2, label: 'Sad', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8 opacity-75" />, color: 'bg-indigo-100 text-indigo-600', active: 'ring-4 ring-indigo-300 bg-indigo-200' },
  { value: 3, label: 'Neutral', icon: <Meh className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-slate-100 text-slate-600', active: 'ring-4 ring-slate-300 bg-slate-200' },
  { value: 4, label: 'Happy', icon: <Smile className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-green-100 text-green-600', active: 'ring-4 ring-green-300 bg-green-200' },
  { value: 5, label: 'Great', icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-amber-100 text-amber-600', active: 'ring-4 ring-amber-300 bg-amber-200' },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState(null);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/journal/entries', { withCredentials: true });
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch entries', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mood || !text.trim()) return;
    
    setIsSubmitting(true);
    try {
      const selectedMood = MOODS.find(m => m.value === mood);
      await axios.post('http://localhost:3000/api/journal/entries', {
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
          {entries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">
              No entries yet. Start writing your first one!
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {entries.map(entry => {
                const entryMood = MOODS.find(m => m.value === entry.mood_rating) || MOODS[2];
                return (
                  <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 md:ml-0 md:mx-auto z-10">
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${entryMood.color}`}>
                        {React.cloneElement(entryMood.icon, { className: 'w-5 h-5' })}
                      </div>
                    </div>
                    
                    <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ml-4 md:ml-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${entryMood.color}`}>
                          {entry.mood_label}
                        </span>
                        <time className="text-xs text-slate-500 font-medium">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </time>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {entry.entry_text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
