import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const STEPS = [
  { count: 5, action: "Things you see around you.", desc: "Look for small details you wouldn't usually notice. Take your time." },
  { count: 4, action: "Things you can feel.", desc: "Pay attention to the texture, temperature, or weight of objects around you or your own body." },
  { count: 3, action: "Things you can hear.", desc: "Focus on external sounds, no matter how quiet or distant." },
  { count: 2, action: "Things you can smell.", desc: "Notice any subtle scents in the air, or smell a familiar object." },
  { count: 1, action: "Thing you can taste.", desc: "Focus on a lingering taste in your mouth, or take a sip of water." }
];

export default function Grounding() {
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
      sessionStorage.setItem('pendingMindfulness', JSON.stringify({ type: 'grounding', date: new Date().toISOString() }));
      navigate('/auth');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/mindfulness`, { type: 'grounding', date: new Date().toISOString() }, { withCredentials: true });
      toast.success("Grounding session saved successfully!");
      navigate('/mindfulness');
    } catch (error) {
      console.error("Failed to save grounding session:", error);
      toast.error("Failed to save. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 w-full h-full">
      <div className="max-w-xl w-full">
        {!completed ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center transition-all">
            <h1 className="text-8xl font-bold text-teal-600 mb-6">{STEPS[currentStep].count}</h1>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{STEPS[currentStep].action}</h2>
            <p className="text-slate-600 mb-10 text-lg">{STEPS[currentStep].desc}</p>
            <button 
              onClick={handleNext}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
            >
              {currentStep < STEPS.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-indigo-100 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Well Done.</h2>
            <p className="text-slate-600 mb-10 text-lg">You have completed the 5-4-3-2-1 Grounding exercise. Notice how you feel now compared to when you started.</p>
            <button 
              onClick={handleSave}
              className="w-full bg-[#e87a5d] hover:bg-[#d6694c] text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
            >
              Save Grounding Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
