import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, ChevronRight, CheckCircle2, Save, ShieldAlert } from 'lucide-react';

const PROTOCOL_STEPS = [
  { 
    count: 5, 
    clinicalTag: "VISUAL SENSORY ENGAGEMENT", 
    action: "Identify 5 visual anchors in your environment.", 
    desc: "Scan the room. Identify discrete objects, colors, or structural details. Tap each node below upon positive identification."
  },
  { 
    count: 4, 
    clinicalTag: "TACTILE SENSORY ENGAGEMENT", 
    action: "Acknowledge 4 physical/tactile inputs.", 
    desc: "Observe the texture, temperature, or physical resistance of surfaces contacting your body. Tap upon positive identification."
  },
  { 
    count: 3, 
    clinicalTag: "AUDITORY SENSORY ENGAGEMENT", 
    action: "Isolate 3 distinct ambient sounds.", 
    desc: "Focus on external auditory signals. Disregard internal thoughts. Tap upon positive identification."
  },
  { 
    count: 2, 
    clinicalTag: "OLFACTORY SENSORY ENGAGEMENT", 
    action: "Acknowledge 2 olfactory sensations.", 
    desc: "Identify any subtle scents in the immediate atmosphere. Tap upon positive identification."
  },
  { 
    count: 1, 
    clinicalTag: "GUSTATORY SENSORY ENGAGEMENT", 
    action: "Acknowledge 1 gustatory input.", 
    desc: "Focus on lingering taste or consume a sip of water. Tap upon positive identification."
  }
];

export default function Grounding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Array(PROTOCOL_STEPS[0].count).fill(false));

  const handleToggle = (idx) => {
    const newArr = [...checkedItems];
    newArr[idx] = !newArr[idx];
    setCheckedItems(newArr);
  };

  const handleNext = () => {
    if (currentStep < PROTOCOL_STEPS.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setCheckedItems(new Array(PROTOCOL_STEPS[nextStepIndex].count).fill(false));
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
      toast.success("Clinical log saved successfully.");
      navigate('/mindfulness');
    } catch {
      toast.error("Failed to save clinical record.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full px-4">
        
        {/* Header Branding for Acute State */}
        {!completed && (
          <div className="flex items-center justify-center gap-3 mb-8 opacity-80">
            <ShieldAlert className="w-5 h-5 text-[#0F766E]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Acute Intervention Protocol Active</span>
          </div>
        )}

        {!completed ? (
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 transition-all w-full">
            <div className="text-center mb-8 border-b border-slate-200 pb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                PROTOCOL STEP {currentStep + 1}/5: {PROTOCOL_STEPS[currentStep].clinicalTag}
              </h2>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {PROTOCOL_STEPS[currentStep].action}
              </h1>
            </div>

            <p className="text-slate-600 mb-8 text-sm font-medium leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100 text-center">
              {PROTOCOL_STEPS[currentStep].desc}
            </p>

            <div className="flex flex-col gap-3 mb-10">
              {checkedItems.map((isChecked, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleToggle(idx)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isChecked ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]' : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'}`}
                >
                  <span className="font-bold text-sm uppercase tracking-widest">Input {idx + 1} Acknowledged</span>
                  <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${isChecked ? 'bg-[#0F766E] border-[#0F766E]' : 'bg-white border-slate-300'}`}>
                    {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={handleNext}
              disabled={checkedItems.includes(false)}
              className="w-full bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-4 rounded-full transition-colors shadow-sm text-sm uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {currentStep < PROTOCOL_STEPS.length - 1 ? 'Acknowledge & Proceed' : 'Finalize Protocol'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="bg-white p-10 md:p-14 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-100">
              <CheckCircle2 className="w-10 h-10 text-[#0F766E]" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Protocol Concluded</h2>
            <p className="text-slate-600 mb-10 text-sm font-medium leading-relaxed max-w-md mx-auto">
              Sensory grounding protocol completed successfully. Autonomic regulation is stabilizing. Save the session to your clinical record.
            </p>
            <button 
              onClick={handleSave}
              className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white font-bold py-4 rounded-full transition-colors shadow-sm text-sm uppercase tracking-widest flex items-center justify-center gap-3"
            >
              Save Clinical Log
              <Save className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
