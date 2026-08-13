import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const STEPS = [
  { area: "Feet and Toes", desc: "Curl your toes tightly. Hold for 5 seconds, then completely release and feel the tension melt away." },
  { area: "Legs and Thighs", desc: "Tense the muscles in your calves and thighs. Hold firmly, then let them go completely limp." },
  { area: "Core and Stomach", desc: "Tighten your abdominal muscles as if bracing. Hold, then release and take a deep, belly breath." },
  { area: "Hands and Arms", desc: "Clench your fists and flex your arms. Hold the tension, then let your arms drop heavily to your sides." },
  { area: "Shoulders and Neck", desc: "Pull your shoulders up to your ears. Hold them tightly, then let them drop down and relax completely." },
  { area: "Face and Jaw", desc: "Squeeze your eyes shut and clench your jaw. Hold, then release and let your entire face soften." }
];

export default function BodyScan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleSave = async () => {
    if (!user) {
      sessionStorage.setItem('pendingMindfulness', JSON.stringify({ type: 'body_scan', date: new Date().toISOString() }));
      navigate('/auth');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/mindfulness`, { type: 'body_scan', date: new Date().toISOString() }, { withCredentials: true });
      toast.success("Body Scan session saved successfully!");
      navigate('/mindfulness');
    } catch (error) {
      console.error("Failed to save body scan session:", error);
      toast.error("Failed to save. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full px-4">
        {!completed ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-indigo-100 text-center transition-all">
            <h1 className="text-4xl font-bold text-indigo-900 mb-6">{STEPS[currentStep].area}</h1>
            <p className="text-slate-600 mb-10 text-lg">{STEPS[currentStep].desc}</p>
            <button 
              onClick={handleNext}
              className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium py-3 rounded-xl transition-colors shadow-sm"
            >
              Release Tension &rarr; {currentStep < STEPS.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-indigo-100 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Body Scan Complete</h2>
            <p className="text-slate-600 mb-10 text-lg">Your progressive muscle relaxation is complete. Enjoy this state of deep physical relaxation.</p>
            <button 
              onClick={handleSave}
              className="w-full bg-[#e87a5d] hover:bg-[#d6694c] text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
            >
              Save Body Scan Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
