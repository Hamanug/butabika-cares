import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ASSESSMENTS_DATA, getScoreInterpretation } from '../utils/screeningUtils';

export default function StressManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const stressQuestions = ASSESSMENTS_DATA["STRESS"] || [];
  const [answers, setAnswers] = useState({});

  const handleAnswer = (qIndex, val) => {
    setAnswers(prev => ({ ...prev, [qIndex]: val }));
  };

  const calculateScore = () => {
    if (Object.keys(answers).length === stressQuestions.length && stressQuestions.length > 0) {
      return Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    }
    return null;
  };
  
  const score = calculateScore();

  const getTierAndFeedback = (score) => {
    const interpretation = getScoreInterpretation('STRESS', score);
    if (score <= 5) return { tier: interpretation.severity, color: "text-green-700 bg-green-50 border-green-200", feedback: "You're managing stress well. Continue your current healthy habits and remember to take breaks." };
    if (score <= 10) return { tier: interpretation.severity, color: "text-amber-700 bg-amber-50 border-amber-200", feedback: "You're experiencing moderate stress. Consider incorporating mindfulness or deep breathing exercises into your daily routine." };
    return { tier: interpretation.severity, color: "text-rose-700 bg-rose-50 border-rose-200", feedback: "Your stress levels are high. It is highly recommended to speak with a professional or try our cognitive reframing tools." };
  };

  const handleSave = async () => {
    if (score === null) return;

    const payload = { score, maxScore: 15, date: new Date().toISOString(), answers };

    if (!user) {
      sessionStorage.setItem('pendingStressScore', JSON.stringify(payload));
      navigate('/auth');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/stress-tracking`, payload, { withCredentials: true });
      toast.success('Saved successfully');
    } catch (error) {
      console.error("Failed to save stress score:", error);
      toast.error('Failed to save');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Perceived Stress Assessment</h1>
        <p className="text-slate-600 mb-8">Reflect on your feelings and thoughts during the last week. This tool helps quantify your stress level to recommend appropriate coping strategies.</p>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 mb-6">
          {stressQuestions.map((qItem, qIndex) => (
            <div key={qIndex} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-medium text-slate-700 mb-4">{qIndex + 1}. {qItem.question}</p>
              <div className="flex flex-wrap gap-3">
                {qItem.options.map((optLabel, optIndex) => {
                  const isSelected = answers[qIndex] === optIndex;
                  return (
                    <button 
                      key={optIndex}
                      onClick={() => handleAnswer(qIndex, optIndex)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                    >
                      {optLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {score !== null && (
            <div className={`mt-8 p-6 border rounded-xl text-center shadow-sm ${getTierAndFeedback(score).color}`}>
              <h2 className="text-2xl font-bold mb-2">Your Stress Level: {getTierAndFeedback(score).tier} ({score}/15)</h2>
              <p className="mb-6 font-medium">{getTierAndFeedback(score).feedback}</p>
              <button 
                onClick={handleSave}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Stress Score
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
