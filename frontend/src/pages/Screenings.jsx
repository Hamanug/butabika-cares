import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ClipboardList, AlertTriangle, HeartHandshake, Sun, Wind, CloudRain, Shield, Activity, LifeBuoy } from 'lucide-react';
import { getScoreInterpretation } from '../utils/scoreInterpretation';
import toast from 'react-hot-toast';

const ASSESSMENTS_DATA = {
  "WHO5": [
    {
      "question": "I have felt cheerful and in good spirits",
      "options": [
        "At no time",
        "Some of the time",
        "Less than half of the time",
        "More than half of the time",
        "Most of the time",
        "All of the time"
      ]
    },
    {
      "question": "I have felt calm and relaxed",
      "options": [
        "At no time",
        "Some of the time",
        "Less than half of the time",
        "More than half of the time",
        "Most of the time",
        "All of the time"
      ]
    },
    {
      "question": "I have felt active and vigorous",
      "options": [
        "At no time",
        "Some of the time",
        "Less than half of the time",
        "More than half of the time",
        "Most of the time",
        "All of the time"
      ]
    },
    {
      "question": "I woke up feeling fresh and rested",
      "options": [
        "At no time",
        "Some of the time",
        "Less than half of the time",
        "More than half of the time",
        "Most of the time",
        "All of the time"
      ]
    },
    {
      "question": "My daily life has been filled with things that interest me",
      "options": [
        "At no time",
        "Some of the time",
        "Less than half of the time",
        "More than half of the time",
        "Most of the time",
        "All of the time"
      ]
    }
  ],
  "GAD7": [
    {
      "question": "Feeling nervous, anxious, or on edge",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Not being able to stop or control worrying",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Worrying too much about different things",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Trouble relaxing",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Being so restless that it is hard to sit still",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Becoming easily annoyed or irritable",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Feeling afraid, as if something awful might happen",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    }
  ],
  "PHQ9": [
    {
      "question": "Little interest or pleasure in doing things",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Feeling down, depressed, or hopeless",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Trouble falling or staying asleep, or sleeping too much",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Feeling tired or having little energy",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Poor appetite or overeating",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Feeling bad about yourself - or that you are a failure",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Trouble concentrating on things, such as reading the newspaper or watching television",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Moving or speaking so slowly that other people could have noticed",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    },
    {
      "question": "Thoughts that you would be better off dead, or of hurting yourself",
      "options": [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ]
    }
  ],
  "PCL5": [
    {
      "question": "Repeated, disturbing, and unwanted memories of the stressful experience?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Repeated, disturbing dreams of the stressful experience?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Suddenly feeling or acting as if the stressful experience were actually happening again?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Feeling very upset when something reminded you of the stressful experience?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Having strong physical reactions when something reminded you of the stressful experience?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Avoiding memories, thoughts, or feelings related to the stressful experience?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Avoiding external reminders of the stressful experience?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Trouble remembering important parts of the stressful experience?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Having strong negative beliefs about yourself, other people, or the world?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Blaming yourself or someone else for the stressful experience or what happened after it?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Loss of interest in activities that you used to enjoy?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Feeling distant or cut off from other people?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Trouble experiencing positive feelings?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Irritable behavior, angry outbursts, or acting aggressively?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Taking too many risks or doing things that could cause you harm?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Being 'superalert' or watchful or on guard?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Feeling jumpy or easily startled?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Having difficulty concentrating?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    },
    {
      "question": "Trouble falling or staying asleep?",
      "options": [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely"
      ]
    }
  ],
  "NSSI": [
    {
      "question": "Have you ever intentionally harmed yourself (e.g., cutting, burning)?",
      "options": [
        "Yes",
        "No"
      ]
    },
    {
      "question": "How frequently have you harmed yourself in the past month?",
      "options": [
        "0 times",
        "1-2 times",
        "3-5 times",
        "6-10 times",
        "More than 10 times"
      ]
    },
    {
      "question": "When was the most recent time you harmed yourself?",
      "options": [
        "Less than 1 week ago",
        "Between 1 week and 1 month ago",
        "Between 1 and 6 months ago",
        "Within the past year",
        "More than a year ago"
      ]
    },
    {
      "question": "How likely are you to harm yourself in the future?",
      "options": [
        "Not at all likely",
        "Slightly likely",
        "Moderately likely",
        "Very likely",
        "Extremely likely"
      ]
    }
  ],
  "SUICIDE_RISK": [
    {
      "question": "Have you wished you were dead or wished you could go to sleep and not wake up?",
      "options": [
        "No",
        "Yes"
      ]
    },
    {
      "question": "Have you actually had any thoughts of killing yourself?",
      "options": [
        "No",
        "Yes"
      ]
    },
    {
      "question": "Have you been thinking about how you might do this?",
      "options": [
        "No",
        "Yes"
      ]
    },
    {
      "question": "Have you had these thoughts and had some intention of acting on them?",
      "options": [
        "No",
        "Yes"
      ]
    },
    {
      "question": "Have you started to work out or worked out the details of how to kill yourself?",
      "options": [
        "No",
        "Yes"
      ]
    }
  ],
  "AGREEABLENESS": [
    {
      "question": "I sympathize with others' feelings.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I insult people.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I respect others.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I take time out for others.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I feel little concern for others.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I make people feel at ease.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I am not interested in other people's problems.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I have a good word for everyone.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I am indifferent to the feelings of others.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    },
    {
      "question": "I inquire about others' well-being.",
      "options": [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
      ]
    }
  ]
};

const INSTRUMENTS = {
  'AGREEABLENESS': { title: 'Agreeableness Trait', description: 'Assesses agreeableness based on the Big Five personality traits.', time: '2-3 minutes', questions: ASSESSMENTS_DATA['AGREEABLENESS'], icon: HeartHandshake, colorTheme: "bg-teal-50 text-teal-600" },
  'WHO5': { title: 'WHO-5 Well-Being Index', description: 'Measures your current mental wellbeing and happiness levels.', time: '2-3 minutes', questions: ASSESSMENTS_DATA['WHO5'], icon: Sun, colorTheme: "bg-amber-50 text-amber-500" },
  'GAD7': { title: 'GAD-7 Anxiety', description: 'Screens for signs of generalized anxiety disorder.', time: '3-4 minutes', questions: ASSESSMENTS_DATA['GAD7'], icon: Wind, colorTheme: "bg-indigo-50 text-indigo-500" },
  'PHQ9': { title: 'PHQ-9 Depression', description: 'Assesses the severity of depression symptoms.', time: '3-5 minutes', questions: ASSESSMENTS_DATA['PHQ9'], icon: CloudRain, colorTheme: "bg-blue-50 text-blue-500" },
  'PCL5': { title: 'PCL-5 PTSD', description: 'Measures symptoms of Post-Traumatic Stress Disorder.', time: '5-10 minutes', questions: ASSESSMENTS_DATA['PCL5'], icon: Shield, colorTheme: "bg-purple-50 text-purple-600" },
  'NSSI': { title: 'NSSI Self-Harm', description: 'Evaluates risk and history of non-suicidal self-injury.', time: '1-2 minutes', questions: ASSESSMENTS_DATA['NSSI'], icon: Activity, colorTheme: "bg-rose-50 text-rose-500" },
  'SUICIDE_RISK': { title: 'Suicide Risk Screen', description: 'Screens for current and past risk of self-harm.', time: '1-2 minutes', questions: ASSESSMENTS_DATA['SUICIDE_RISK'], icon: LifeBuoy, colorTheme: "bg-orange-50 text-orange-500" }
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
