import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SleepHygiene() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  const calculateScore = () => {
    let score = 0;
    let total = 0;
    if (caffeine !== null) { total++; if (caffeine === false) score++; }
    if (screens !== null) { total++; if (screens === false) score++; }
    if (environment !== null) { total++; if (environment === true) score++; }
    if (consistent !== null) { total++; if (consistent === true) score++; }
    if (exercise !== null) { total++; if (exercise === true) score++; }
    
    if (total === 5) {
      return Math.round((score / 5) * 100);
    }
    return null;
  };
  
  const score = calculateScore();

  const handleSave = async () => {
    if (score === null) return;

    if (!user) {
      const pendingSleepScore = { score, date: new Date().toISOString() };
      sessionStorage.setItem('pendingSleepScore', JSON.stringify(pendingSleepScore));
      navigate('/auth');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sleep-tracking`, { score, date: new Date().toISOString() }, { withCredentials: true });
      toast.success("Score saved successfully!");
    } catch (error) {
      console.error("Failed to save sleep score:", error);
      toast.error("Failed to save score. Please try again.");
    }
  };

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

          {score !== null && (
            <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-xl text-center shadow-sm">
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Your Sleep Hygiene Score: {score}%</h2>
              <p className="text-indigo-700 mb-6">Great job evaluating your habits! Tracking your choices can lead to better sleep over time.</p>
              <button 
                onClick={handleSave}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Score to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
