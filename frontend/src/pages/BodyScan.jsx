import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity, Check, ChevronRight, SkipForward } from 'lucide-react';

const ZONES = [
  { id: 'feet', area: "Feet and Toes", desc: "Curl your toes tightly. Hold for 5 seconds, then completely release and observe localized sensations." },
  { id: 'legs', area: "Legs and Thighs", desc: "Tense the muscle groups in your calves and thighs. Hold firmly, then release completely." },
  { id: 'core', area: "Core and Stomach", desc: "Tighten your abdominal wall. Hold, then release and take a deep, diaphragmatic breath." },
  { id: 'arms', area: "Hands and Arms", desc: "Clench your fists and flex your arms. Hold the tension, then let arms drop heavily to your sides." },
  { id: 'shoulders', area: "Shoulders and Neck", desc: "Elevate shoulders to ears. Hold tightly, then drop and allow cervical muscles to soften." },
  { id: 'face', area: "Face and Jaw", desc: "Squeeze eyes shut and clench the jaw. Hold, then release and soften facial musculature." }
];

const SEVERITY_LEVELS = [
  { value: 1, label: 'Low / Relaxed', style: 'bg-teal-50 text-[#0F766E] border-teal-200 hover:bg-teal-100', active: 'ring-2 ring-[#0F766E] bg-teal-100 border-[#0F766E]' },
  { value: 2, label: 'Moderate / Noticeable', style: 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100', active: 'ring-2 ring-slate-400 bg-slate-200 border-slate-400' },
  { value: 3, label: 'High / Pain', style: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', active: 'ring-2 ring-red-500 bg-red-100 border-red-500' }
];

export default function BodyScan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tensionLog, setTensionLog] = useState({});

  const handleNext = () => {
    if (currentStep < ZONES.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleSelectSeverity = (val) => {
    setTensionLog(prev => ({
      ...prev,
      [ZONES[currentStep].id]: val
    }));
  };

  const handleSave = async () => {
    if (!user) {
      sessionStorage.setItem('pendingMindfulness', JSON.stringify({ type: 'body_scan', date: new Date().toISOString() }));
      navigate('/auth');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/mindfulness`, { 
        type: 'body_scan', 
        date: new Date().toISOString(),
        notes: JSON.stringify(tensionLog) // Persist structural logs invisibly 
      }, { withCredentials: true });
      
      toast.success("Clinical assessment saved successfully.");
      navigate('/mindfulness');
    } catch {
      toast.error("Failed to save clinical record.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Somatic Assessment Module</h1>
          <p className="text-slate-500 font-medium mt-1">Progressive muscle relaxation and localized tension logging.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Somatic Map */}
          <div className="md:col-span-4 hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Somatic Map</h3>
            </div>
            <div className="flex flex-col">
              {ZONES.map((zone, idx) => {
                const isCurrent = currentStep === idx && !completed;
                const hasLog = tensionLog[zone.id] != null;
                
                return (
                  <div key={zone.id} className={`px-5 py-3.5 flex items-center justify-between border-l-4 border-b border-b-slate-100 last:border-b-0 transition-colors
                    ${isCurrent ? 'bg-teal-50 border-l-[#0F766E] text-[#0F766E]' : 'bg-white border-l-transparent text-slate-600'}
                  `}>
                    <span className={`text-sm font-bold ${isCurrent ? 'text-[#0F766E]' : 'text-slate-700'}`}>{zone.area}</span>
                    {hasLog && !isCurrent && <Check className="w-4 h-4 text-[#0F766E]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Assessment View */}
          <div className="md:col-span-8">
            {!completed ? (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-left flex flex-col h-full transition-all">
                
                {/* Mobile zone indicator */}
                <div className="md:hidden mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Zone {currentStep + 1} of {ZONES.length}
                </div>

                <div className="mb-8 border-b border-slate-100 pb-6">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Somatic Observation</h2>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{ZONES[currentStep].area}</h1>
                  <p className="text-slate-600 mt-3 text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{ZONES[currentStep].desc}</p>
                </div>

                <div className="mb-10 flex-grow">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Localized Tension Severity</h2>
                  <div className="flex flex-col gap-3">
                    {SEVERITY_LEVELS.map(level => {
                       const isActive = tensionLog[ZONES[currentStep].id] === level.value;
                       return (
                         <button 
                           key={level.value}
                           onClick={() => handleSelectSeverity(level.value)}
                           className={`px-5 py-3.5 rounded-xl border text-sm font-bold transition-all text-left flex justify-between items-center shadow-sm ${isActive ? level.active : level.style}`}
                         >
                           {level.label}
                           {isActive && <Check className="w-4 h-4" />}
                         </button>
                       );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto border-t border-slate-100 pt-6">
                  <button onClick={() => handleNext()} className="px-6 py-3 rounded-full border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <SkipForward className="w-4 h-4" />
                    Skip Zone
                  </button>
                  <button 
                    onClick={() => handleNext()}
                    disabled={!tensionLog[ZONES[currentStep].id]}
                    className="flex-1 bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3 px-6 rounded-full transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    {currentStep < ZONES.length - 1 ? 'Log Assessment & Continue' : 'Complete Assessment'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-100">
                  <Activity className="w-8 h-8 text-[#0F766E]" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Assessment Complete</h2>
                <p className="text-slate-600 mb-10 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                  PMR sequence finalized. Tension severity logs have been temporarily cached. 
                </p>
                <button 
                  onClick={handleSave}
                  className="w-full sm:w-auto px-8 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold py-3.5 rounded-full transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Save to Clinical Record
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
