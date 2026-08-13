import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Exercises() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); 
  const [counter, setCounter] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [totalLifetimeCycles, setTotalLifetimeCycles] = useState(0);

  useEffect(() => {
    const stats = localStorage.getItem('breathingStats');
    if (stats) {
      setTotalLifetimeCycles(JSON.parse(stats).cycles || 0);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setCounter((prev) => {
          if (prev > 1) return prev - 1;
          
          let nextPhase = 'inhale';
          let nextCount = 4;
          
          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') { nextPhase = 'hold'; nextCount = 7; }
            else if (currentPhase === 'hold') { nextPhase = 'exhale'; nextCount = 8; }
            else { 
              nextPhase = 'inhale'; 
              nextCount = 4; 
              setCycles(c => c + 1); 
            }
            return nextPhase;
          });
          
          return nextCount;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleExercise = () => {
    if (!isActive) {
      setIsActive(true);
      setPhase('inhale');
      setCounter(4);
      setCycles(0);
    } else {
      setIsActive(false);
      setPhase('complete');
    }
  };

  const resetExercise = () => {
    setPhase('idle');
    setCycles(0);
    setCounter(4);
  };

  const handleSaveToDashboard = () => {
    if (!user) {
      sessionStorage.setItem('pendingExercise', JSON.stringify({ type: 'breathing', cycles }));
      navigate('/auth');
      return;
    }

    if (cycles > 0) {
      // Fetch existing stats to add to them, or start fresh
      const existingStats = JSON.parse(localStorage.getItem('breathingStats')) || { cycles: 0 };
      const newTotalCycles = (existingStats.cycles || 0) + cycles;
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      localStorage.setItem('breathingStats', JSON.stringify({ 
        cycles: newTotalCycles, 
        lastSession: today 
      }));
    }
    navigate('/dashboard');
  };

  const outerRing = phase === 'inhale' ? 'border-cyan-400 scale-100 opacity-100' : phase === 'hold' ? 'border-emerald-400 scale-110 opacity-100' : phase === 'exhale' ? 'border-orange-300 scale-90 opacity-70' : 'border-slate-200 scale-100 opacity-50';
  const innerDisk = phase === 'inhale' ? 'from-cyan-200 to-cyan-400 scale-110' : phase === 'hold' ? 'from-emerald-200 to-emerald-400 scale-125' : phase === 'exhale' ? 'from-orange-200 to-orange-400 scale-90' : 'from-slate-100 to-slate-200 scale-100';

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container max-w-3xl mx-auto px-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-cyan-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard
        </button>
      </div>

      <div className="container max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-slate-100">
          
          {phase === 'complete' ? (
            <div className="py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4"/>
              <h2 className="text-3xl font-medium text-slate-800 mb-2">Session Complete</h2>
              <p className="text-slate-600 mb-8">You completed <span className="font-bold text-cyan-600">{cycles}</span> breathing cycle{cycles !== 1 ? 's' : ''}.</p>
              
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <button onClick={handleSaveToDashboard} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 rounded-lg transition-colors">
                  Save to Dashboard
                </button>
                <button onClick={resetExercise} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-lg transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-medium mb-2 text-slate-800">Guided Breathing</h2>
              <div className="mb-10">
                <p className="text-slate-500 mb-3 text-sm">Follow the animation. Inhale, hold, and exhale slowly.</p>
                <span className="inline-block bg-cyan-50 text-cyan-700 border border-cyan-100 px-4 py-1.5 rounded-full text-sm font-medium">
                  You have completed {totalLifetimeCycles} cycles so far
                </span>
              </div>

              <div className="mb-12 relative w-64 h-64 mx-auto flex items-center justify-center">
                <div className={`absolute w-full h-full rounded-full transition-all duration-1000 border-2 ${outerRing}`} />
                <div className={`absolute w-40 h-40 rounded-full transition-all duration-1000 bg-gradient-to-br ${innerDisk}`} />
                <div className="relative z-10">
                  <div className="text-6xl font-light text-slate-800">{isActive ? counter : '4'}</div>
                  <div className="text-sm font-medium text-slate-600 capitalize mt-2">{phase === 'idle' ? 'Ready' : phase}</div>
                </div>
              </div>

              <div className="flex justify-center items-center gap-6 mb-8">
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cycles</div>
                  <div className="text-xl font-medium text-slate-700">{cycles}</div>
                </div>
              </div>

              <button onClick={toggleExercise} className={`w-full max-w-xs mx-auto block py-3 px-4 rounded-md font-medium text-white transition-colors duration-300 shadow-sm ${isActive ? 'bg-slate-400 hover:bg-slate-500' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                {isActive ? "End Session" : "Begin Exercise"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
