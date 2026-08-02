import React, { useState } from 'react';

export default function SleepHygiene() {
  const [caffeine, setCaffeine] = useState(null);
  const [screens, setScreens] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [consistent, setConsistent] = useState(null);
  const [exercise, setExercise] = useState(null);

  const renderToggle = (label, value, setter) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="flex gap-2">
        <button onClick={() => setter(true)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${value === true ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>Yes</button>
        <button onClick={() => setter(false)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${value === false ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>No</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Sleep Hygiene Assessment</h1>
        <p className="text-slate-600 mb-8">An interactive CBT-I checklist to help you identify areas for improving your sleep quality.</p>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
          {renderToggle("Did you consume caffeine after 2 PM?", caffeine, setCaffeine)}
          {caffeine === true && (
            <div className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              💡 Tip: Try switching to herbal tea in the afternoons to reduce sleep latency.
            </div>
          )}

          {renderToggle("Did you use electronic screens within 1 hour of bed?", screens, setScreens)}
          {screens === true && (
            <div className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              💡 Tip: The blue light from screens suppresses melatonin. Try reading a book instead.
            </div>
          )}

          {renderToggle("Is your bedroom cool, dark, and quiet?", environment, setEnvironment)}
          {environment === false && (
            <div className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              💡 Tip: A cool, pitch-dark room signals your body that it's time to rest. Consider blackout curtains or an eye mask.
            </div>
          )}

          {renderToggle("Did you go to bed and wake up at consistent times?", consistent, setConsistent)}
          {consistent === false && (
            <div className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              💡 Tip: A consistent sleep schedule anchors your circadian rhythm, making it easier to fall asleep and wake up naturally.
            </div>
          )}

          {renderToggle("Did you exercise today?", exercise, setExercise)}
          {exercise === false && (
            <div className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              💡 Tip: Regular physical activity, especially in the morning, promotes deeper and more restorative sleep.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
