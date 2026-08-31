import React from 'react';
import { Trash2, AlertTriangle, Activity, Frown, Meh, Smile } from 'lucide-react';

const CLINICAL_MOODS = [
  { value: 1, label: 'Severe Distress', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-red-50 text-red-700 border border-red-200', active: 'ring-2 ring-red-500 bg-red-100' },
  { value: 2, label: 'Moderate Distress', icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8 opacity-75" />, color: 'bg-red-50 text-red-700 border border-red-200', active: 'ring-2 ring-red-500 bg-red-100' },
  { value: 3, label: 'Baseline / Neutral', icon: <Meh className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-slate-50 text-slate-700 border border-slate-300', active: 'ring-2 ring-slate-500 bg-slate-200' },
  { value: 4, label: 'Stable / Positive', icon: <Smile className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-teal-50 text-[#0F766E] border border-teal-200', active: 'ring-2 ring-[#0F766E] bg-teal-100' },
  { value: 5, label: 'Optimal', icon: <Smile className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'bg-teal-50 text-[#0F766E] border border-teal-200', active: 'ring-2 ring-[#0F766E] bg-teal-100' },
];

export default function JournalTimeline({ entries, onDelete, readOnly = false }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500 font-medium">
        No clinical entries available.
      </div>
    );
  }

  // Helper to format strictly e.g. YYYY-MM-DD HH:MM
  const formatClinicalDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "INVALID DATE";
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} LT`;
  };

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
      {entries.map(entry => {
        const entryMood = CLINICAL_MOODS.find(m => m.value === entry.mood_rating) || CLINICAL_MOODS[2];
        
        // Define analysis badge logic mapping
        let badgeStyle = 'bg-teal-50 border-teal-200 text-[#0F766E]';
        let BadgeIcon = Activity;
        if (entry.analysisTag === 'Dissonant') {
          badgeStyle = 'bg-red-50 border-red-200 text-red-700';
          BadgeIcon = AlertTriangle;
        } else if (entry.analysisTag === 'Neutral Trend') {
          badgeStyle = 'bg-slate-100 border-slate-300 text-slate-700';
          BadgeIcon = Activity;
        }

        return (
          <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline Center Node */}
            <div className="flex items-center justify-center w-11 h-11 rounded-full border-[3px] border-white bg-slate-50 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 md:mx-auto z-10">
              <div className={`w-full h-full rounded-full flex items-center justify-center border ${entryMood.color.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('text-')).join(' ')} ${entryMood.color.match(/border-[a-z]+-\d+/)?.[0] || 'border-slate-200'}`}>
                {React.cloneElement(entryMood.icon, { className: 'w-4 h-4' })}
              </div>
            </div>
            
            {/* The main journal entry card */}
            <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm ml-4 md:ml-0 md:group-odd:mr-auto md:group-even:ml-auto relative hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider rounded-md border ${entryMood.color.match(/bg-[a-z]+-\d+/)?.[0]} ${entryMood.color.match(/text-\[[^\]]+\]|text-[a-z]+-\d+/)?.[0]} ${entryMood.color.match(/border-[a-z]+-\d+/)?.[0] || 'border-slate-200'}`}>
                    {entry.mood_label}
                  </span>
                  {readOnly && entry.isDissonant && (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" title="Dissonance detected between rated mood and journal text" />
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <time className="text-[11px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                    {formatClinicalDate(entry.created_at)}
                  </time>
                  {!readOnly && onDelete && (
                    <button onClick={() => onDelete(entry.id)} className="text-slate-300 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 p-1.5 rounded-md" title="Delete clinical record">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed font-medium">
                {entry.entry_text}
              </p>
            </div>

            {/* Analysis Badge for the alternate side (hidden on mobile, visible on desktop) */}
            {entry.analysisTag && (
              <div className="hidden md:flex w-[calc(50%-2.5rem)] items-center group-odd:justify-start group-even:justify-end px-8">
                <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm ${badgeStyle}`}>
                  <BadgeIcon className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-0.5">NLP Sentiment Marker</p>
                    <p className="text-sm font-bold">{entry.analysisTag} <span className="font-mono text-xs opacity-75 ml-1">[{entry.nlpScore}]</span></p>
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
