import React from 'react';
import { Trash2, Frown, Meh, Smile, Star, AlertTriangle } from 'lucide-react';

const MOODS = [
  { value: 1, label: 'Very Sad', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-blue-100 text-blue-600', active: 'ring-4 ring-blue-300 bg-blue-200' },
  { value: 2, label: 'Sad', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8 opacity-75" />, color: 'bg-indigo-100 text-indigo-600', active: 'ring-4 ring-indigo-300 bg-indigo-200' },
  { value: 3, label: 'Neutral', icon: <Meh className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-slate-100 text-slate-600', active: 'ring-4 ring-slate-300 bg-slate-200' },
  { value: 4, label: 'Happy', icon: <Smile className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-green-100 text-green-600', active: 'ring-4 ring-green-300 bg-green-200' },
  { value: 5, label: 'Great', icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-amber-100 text-amber-600', active: 'ring-4 ring-amber-300 bg-amber-200' },
];

export default function JournalTimeline({ entries, onDelete, readOnly = false }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">
        No entries available.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      {entries.map(entry => {
        const entryMood = MOODS.find(m => m.value === entry.mood_rating) || MOODS[2];
        return (
          <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 md:ml-0 md:mx-auto z-10 shrink-0">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${entryMood.color}`}>
                {React.cloneElement(entryMood.icon, { className: 'w-5 h-5' })}
              </div>
            </div>
            
            {/* The main journal entry card */}
            <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ml-4 md:ml-0 md:group-odd:mr-auto md:group-even:ml-auto relative">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${entryMood.color}`}>
                    {entry.mood_label}
                  </span>
                  {readOnly && entry.isDissonant && (
                    <AlertTriangle className="w-4 h-4 text-red-500" title="Dissonance detected between rated mood and journal text" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <time className="text-xs text-slate-500 font-medium">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric'
                    })}
                  </time>
                  {!readOnly && onDelete && (
                    <button onClick={() => onDelete(entry.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete entry">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                {entry.entry_text}
              </p>
            </div>

            {/* Analysis Badge for the alternate side (hidden on mobile, visible on desktop) */}
            {entry.analysisTag && (
              <div className="hidden md:flex w-[calc(50%-2.5rem)] items-center group-odd:justify-start group-even:justify-end px-8">
                <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-sm
                  ${entry.analysisTag === 'Dissonant' ? 'bg-red-50 border-red-100 text-red-700' : 
                    entry.analysisTag === 'Neutral Trend' ? 'bg-slate-50 border-slate-200 text-slate-600' : 
                    'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                  {entry.analysisTag === 'Dissonant' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Star className="w-5 h-5 opacity-75" />}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-0.5">NLP Sentiment</p>
                    <p className="text-sm font-medium">{entry.analysisTag} ({entry.nlpScore})</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
