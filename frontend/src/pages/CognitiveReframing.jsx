import React, { useState } from 'react';

export default function CognitiveReframing() {
  const [situation, setSituation] = useState('');
  const [emotion, setEmotion] = useState('');
  const [thought, setThought] = useState('');
  const [counterThought, setCounterThought] = useState('');

  const handleSave = () => {
    console.log("Thought Record Saved:", { situation, emotion, thought, counterThought });
    alert("Thought record saved to your journal (simulated).");
    setSituation('');
    setEmotion('');
    setThought('');
    setCounterThought('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Cognitive Reframing</h1>
        <p className="text-slate-600 mb-8">A standard CBT Thought Record to help identify and challenge automatic negative thoughts.</p>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Situation</label>
            <p className="text-xs text-slate-500 mb-2">What triggered this thought?</p>
            <textarea value={situation} onChange={e => setSituation(e.target.value)} rows="2" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Emotion</label>
            <p className="text-xs text-slate-500 mb-2">What did you feel? (Rate intensity 1-10)</p>
            <textarea value={emotion} onChange={e => setEmotion(e.target.value)} rows="1" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Automatic Thought</label>
            <p className="text-xs text-slate-500 mb-2">What went through your mind?</p>
            <textarea value={thought} onChange={e => setThought(e.target.value)} rows="2" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Rational Counter-Thought</label>
            <p className="text-xs text-slate-500 mb-2">What is a more balanced way to look at this?</p>
            <textarea value={counterThought} onChange={e => setCounterThought(e.target.value)} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
          
          <button onClick={handleSave} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            Save Thought Record
          </button>
        </div>
      </div>
    </div>
  );
}
