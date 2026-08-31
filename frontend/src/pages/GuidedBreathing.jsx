import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Activity, StopCircle, Play } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PROTOCOLS = {
  '4-7-8': [
    { id: 'inhale', name: 'INSPIRATION', duration: 4 },
    { id: 'hold', name: 'APNEA / RETENTION', duration: 7 },
    { id: 'exhale', name: 'EXPIRATION', duration: 8 }
  ],
  'box': [
    { id: 'inhale', name: 'INSPIRATION', duration: 4 },
    { id: 'hold1', name: 'APNEA / RETENTION', duration: 4 },
    { id: 'exhale', name: 'EXPIRATION', duration: 4 },
    { id: 'hold2', name: 'APNEA / RETENTION', duration: 4 }
  ]
};

export default function GuidedBreathing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [protocol, setProtocol] = useState('4-7-8');
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [counter, setCounter] = useState(PROTOCOLS['4-7-8'][0].duration);
  const [cycles, setCycles] = useState(0);
  
  const activeProtocolSteps = PROTOCOLS[protocol];
  const activePhase = activeProtocolSteps[currentPhaseIndex];

  // Handle Protocol Switch Reset
  useEffect(() => {
    if (!isActive) {
      setCurrentPhaseIndex(0);
      setCounter(PROTOCOLS[protocol][0].duration);
    }
  }, [protocol, isActive]);

  // Main Pacer Engine
  useEffect(() => {
    let timeoutId;
    if (isActive && !isComplete) {
      if (counter > 1) {
        timeoutId = setTimeout(() => setCounter(c => c - 1), 1000);
      } else {
        timeoutId = setTimeout(() => {
          const nextIndex = (currentPhaseIndex + 1) % activeProtocolSteps.length;
          setCurrentPhaseIndex(nextIndex);
          setCounter(activeProtocolSteps[nextIndex].duration);
          if (nextIndex === 0) setCycles(c => c + 1);
        }, 1000);
      }
    }
    return () => clearTimeout(timeoutId);
  }, [isActive, counter, currentPhaseIndex, protocol, isComplete, activeProtocolSteps]);

  const toggleProtocol = () => {
    if (!isActive) {
      setIsActive(true);
      setIsComplete(false);
    } else {
      setIsActive(false);
      setIsComplete(true);
    }
  };

  const handleSaveToDashboard = async () => {
    if (!user) {
      sessionStorage.setItem('pendingMindfulness', JSON.stringify({ type: 'guided_breathing', cycles }));
      navigate('/auth');
      return;
    }
    if (cycles > 0) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/mindfulness`, 
          { type: 'guided_breathing', date: new Date().toISOString(), cycles_completed: cycles }, 
          { withCredentials: true }
        );
        toast.success("Autonomic regulation metrics saved.");
      } catch {
        toast.error("Failed to sync clinical metrics.");
      }
    }
    navigate('/mindfulness');
  };

  const getRingScale = () => {
    if (!isActive) return 'scale(1)';
    // Inhale and Post-Inhale Hold push to maximum expansion
    if (activePhase.id === 'inhale' || activePhase.id === 'hold1' || activePhase.id === 'hold') return 'scale(1.5)';
    // Exhale and Post-Exhale Hold push to contraction
    return 'scale(0.85)';
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full px-4">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Clinical Pacer Module</h1>
          <p className="text-slate-500 font-medium mt-2">Structured respiratory modulation for nervous system stabilization.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-slate-200 text-center transition-all w-full">
          
          {isComplete ? (
            <div className="py-8">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-100">
                <Activity className="w-10 h-10 text-[#0F766E]" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Protocol Concluded</h2>
              <p className="text-slate-600 mb-10 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                You completed <span className="font-bold text-[#0F766E]">{cycles}</span> cycle{cycles !== 1 ? 's' : ''} of the {protocol === 'box' ? 'Box Breathing' : '4-7-8'} Protocol. Autonomic stabilization metrics cached.
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button 
                  onClick={handleSaveToDashboard} 
                  className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white font-bold py-4 rounded-full transition-colors shadow-sm text-sm uppercase tracking-widest flex justify-center items-center gap-3"
                >
                  Save to Clinical Record
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { setIsComplete(false); setCycles(0); }} 
                  className="w-full bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-full transition-colors shadow-sm text-sm uppercase tracking-widest"
                >
                  Re-Initiate Protocol
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Protocol Selectors */}
              <div className="flex justify-center gap-3 mb-10">
                <button 
                  onClick={() => !isActive && setProtocol('4-7-8')}
                  disabled={isActive}
                  className={`px-5 py-2.5 rounded-full border font-bold text-[10px] uppercase tracking-widest transition-all ${protocol === '4-7-8' ? 'border-[#0F766E] text-[#0F766E] bg-teal-50' : 'border-slate-300 text-slate-600 hover:border-slate-400 disabled:opacity-50'}`}
                >
                  4-7-8 Protocol
                </button>
                <button 
                  onClick={() => !isActive && setProtocol('box')}
                  disabled={isActive}
                  className={`px-5 py-2.5 rounded-full border font-bold text-[10px] uppercase tracking-widest transition-all ${protocol === 'box' ? 'border-[#0F766E] text-[#0F766E] bg-teal-50' : 'border-slate-300 text-slate-600 hover:border-slate-400 disabled:opacity-50'}`}
                >
                  Box Breathing
                </button>
              </div>

              {/* Clinical Typography Indicator */}
              <div className="mb-14">
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {isActive ? `PHASE: ${activePhase.name} (${activePhase.duration}.0s)` : 'SYSTEM IDLE: READY TO INITIATE'}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Total Cycles Completed: <span className="text-slate-700 ml-1">{cycles}</span>
                </div>
              </div>

              {/* Precision Pacing UI (The Instrument) */}
              <div className="relative w-64 h-64 mx-auto flex items-center justify-center mb-16">
                {/* Structural Geometric Ring */}
                <div 
                  className="absolute w-44 h-44 rounded-full border-[3px] border-[#0F766E] ease-in-out transition-transform"
                  style={{
                    transform: getRingScale(),
                    transitionDuration: isActive ? `${activePhase.duration}s` : '1s'
                  }}
                />
                
                {/* Central Anchor / Data Output */}
                <div className="relative z-10 w-24 h-24 bg-slate-50 rounded-full flex flex-col items-center justify-center border border-slate-200 shadow-sm">
                  <div className={`text-4xl font-mono font-black tracking-tighter ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                    {isActive ? counter : '-'}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="max-w-xs mx-auto">
                {!isActive ? (
                  <button 
                    onClick={toggleProtocol} 
                    className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white font-bold py-4 rounded-full transition-colors shadow-sm text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    Initiate Pacer
                    <Play className="w-5 h-5 fill-current" />
                  </button>
                ) : (
                  <button 
                    onClick={toggleProtocol} 
                    className="w-full bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-4 rounded-full transition-colors shadow-sm text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    Halt Protocol
                    <StopCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
