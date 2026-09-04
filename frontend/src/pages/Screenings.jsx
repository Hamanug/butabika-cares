import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ClipboardList, AlertTriangle, HeartHandshake, Sun, Wind, CloudRain, Shield, Activity, LifeBuoy } from 'lucide-react';
import { ASSESSMENTS_DATA, getScoreInterpretation } from '../utils/screeningUtils';

const INSTRUMENTS = {
  'AGREEABLENESS': { title: 'Agreeableness Trait', description: 'Assesses agreeableness based on the Big Five personality traits.', time: '2-3 minutes', questions: ASSESSMENTS_DATA['AGREEABLENESS'], icon: HeartHandshake, colorTheme: "bg-teal-50 text-teal-600" },
  'WHO5': { title: 'WHO-5 Well-Being Index', description: 'Measures your current mental wellbeing and happiness levels.', time: '2-3 minutes', questions: ASSESSMENTS_DATA['WHO5'], icon: Sun, colorTheme: "bg-amber-50 text-amber-500" },
  'GAD7': { title: 'GAD-7 Anxiety', description: 'Screens for signs of generalized anxiety disorder.', time: '3-4 minutes', questions: ASSESSMENTS_DATA['GAD7'], icon: Wind, colorTheme: "bg-indigo-50 text-indigo-500" },
  'PHQ9': { title: 'PHQ-9 Depression', description: 'Assesses the severity of depression symptoms.', time: '3-5 minutes', questions: ASSESSMENTS_DATA['PHQ9'], icon: CloudRain, colorTheme: "bg-blue-50 text-blue-500" },
  'PCL5': { title: 'PCL-5 PTSD', description: 'Measures symptoms of Post-Traumatic Stress Disorder.', time: '5-10 minutes', questions: ASSESSMENTS_DATA['PCL5'], icon: Shield, colorTheme: "bg-purple-50 text-purple-600" },
  'NSSI': { title: 'NSSI Self-Harm', description: 'Evaluates risk and history of non-suicidal self-injury.', time: '1-2 minutes', questions: ASSESSMENTS_DATA['NSSI'], icon: Activity, colorTheme: "bg-rose-50 text-rose-500" },
  'SUICIDE_RISK': { title: 'Suicide Risk Screen', description: 'Screens for current and past risk of self-harm.', time: '1-2 minutes', questions: ASSESSMENTS_DATA['SUICIDE_RISK'], icon: LifeBuoy, colorTheme: "bg-orange-50 text-orange-500" },
  'DSM5_ADULT': { title: 'DSM-5-TR Level 1 (Adult)', description: 'Comprehensive cross-cutting symptom measure assessing 13 psychiatric domains.', time: '5-10 minutes', questions: ASSESSMENTS_DATA['DSM5_ADULT'], icon: ClipboardList, colorTheme: "bg-indigo-50 text-indigo-600" }
};

export default function Screenings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState('selection'); // 'selection', 'active', 'results'
  const [activeTest, setActiveTest] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTest = (testType) => {
    if (!user) {
      sessionStorage.setItem('intendedRoute', '/screenings'); 
      navigate('/auth'); 
      return;
    }
    setActiveTest(testType);
    setCurrentStep(0);
    setAnswers({});
    setView('active');
  };

  const handleAnswer = (val) => {
    setAnswers(prev => ({ ...prev, [currentStep]: val }));
  };

  const handleNext = async () => {
    const currentInstrument = INSTRUMENTS[activeTest];
    if (currentStep < currentInstrument.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate Score
      let score = 0;
      if (activeTest === 'AGREEABLENESS') {
        const reverseIndices = [1, 4, 6, 8];
        Object.entries(answers).forEach(([idx, val]) => {
          if (reverseIndices.includes(parseInt(idx))) {
            score += (6 - val);
          } else {
            score += val;
          }
        });
      } else {
        score = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
        if (activeTest === 'WHO5') {
          score = score * 4;
        }
      }
      
      setFinalScore(score);
      setIsSubmitting(true);
      
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/screenings/submit`, {
          screening_type: activeTest,
          score: score,
          answers: answers
        }, { withCredentials: true });
        
        setView('results');
      } catch (err) {
        console.error("Failed to submit screening", err);
        toast.error("There was an error saving your results. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const interpretation = finalScore !== null ? getScoreInterpretation(activeTest, finalScore) : null;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* VIEW 1: SELECTION */}
        {view === 'selection' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Mental Health Screenings</h1>
            <p className="text-slate-600 mb-8">Evidence-based tools to better understand your mental health. These are not diagnostic tools.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(INSTRUMENTS).map(([key, instrument]) => {
                const IconComponent = instrument.icon;
                return (
                  <div 
                    key={key}
                    onClick={() => startTest(key)}
                    className="bg-white border border-slate-200 rounded-xl p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${instrument.colorTheme}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">{instrument.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 h-10 line-clamp-2">{instrument.description}</p>
                    <p className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded-md mt-auto w-max transition-colors">
                      {instrument.questions.length} questions • {instrument.time}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Important Note:</span> These assessments are for screening purposes only and are not a substitute for professional diagnosis or treatment. All responses are private and stored only on your device.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE TEST */}
        {view === 'active' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <button 
              onClick={() => setView('selection')}
              className="flex items-center text-sm text-slate-500 hover:text-slate-700 mb-6"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Selection
            </button>
            
            <div className="mb-8">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Question {currentStep + 1} of {INSTRUMENTS[activeTest].questions.length}
              </span>
              <h2 className="text-xl font-medium text-slate-800 mt-4 leading-relaxed">
                <span className="font-bold">"{INSTRUMENTS[activeTest].questions[currentStep].question}"</span>
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {INSTRUMENTS[activeTest].questions[currentStep].options.map((optLabel, i) => {
                let optValue = i;
                if (activeTest === 'AGREEABLENESS') optValue = i + 1;
                // Special case for NSSI question 1 where Yes should be 1 and No should be 0
                if (activeTest === 'NSSI' && currentStep === 0 && optLabel === 'Yes') optValue = 1;
                if (activeTest === 'NSSI' && currentStep === 0 && optLabel === 'No') optValue = 0;

                return (
                <label 
                  key={i} 
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentStep] === optValue ? 'bg-blue-50 border-blue-500' : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="question_option" 
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={answers[currentStep] === optValue}
                    onChange={() => handleAnswer(optValue)}
                  />
                  <span className="ml-3 text-slate-700 font-medium">{optLabel}</span>
                </label>
              )})}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={answers[currentStep] === undefined || isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (currentStep < INSTRUMENTS[activeTest].questions.length - 1 ? 'Next Question' : 'Finish & Score')}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: RESULTS */}
        {view === 'results' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <ClipboardList className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Assessment Complete</h2>
            <p className="text-slate-600 mb-6">Your responses have been securely saved to your clinical profile.</p>
            
            <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-100">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Your Score</p>
              <p className="text-4xl font-bold text-slate-800">{finalScore}</p>
              
              {interpretation && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full font-semibold text-sm ${interpretation.colorClass}`}>
                    {interpretation.severity}
                  </span>
                  <p className="text-slate-600 text-center max-w-md mt-2 text-sm leading-relaxed">
                    {interpretation.description}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setView('selection')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Return to Screenings
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
