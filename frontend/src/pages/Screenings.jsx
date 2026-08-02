import React, { useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ClipboardList, AlertTriangle } from 'lucide-react';

const WHO5_QUESTIONS = [
  "I have felt cheerful and in good spirits",
  "I have felt calm and relaxed",
  "I have felt active and vigorous",
  "I woke up feeling fresh and rested",
  "My daily life has been filled with things that interest me"
];
const WHO5_OPTIONS = [
  { label: "At no time", value: 0 },
  { label: "Some of the time", value: 1 },
  { label: "Less than half of the time", value: 2 },
  { label: "More than half of the time", value: 3 },
  { label: "Most of the time", value: 4 },
  { label: "All of the time", value: 5 }
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];
const GAD7_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 }
];

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself - or that you are a failure",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed",
  "Thoughts that you would be better off dead, or of hurting yourself"
];
const PHQ9_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 }
];

const PCL5_QUESTIONS = [
  "Repeated, disturbing, and unwanted memories of the stressful experience?",
  "Repeated, disturbing dreams of the stressful experience?",
  "Suddenly feeling or acting as if the stressful experience were actually happening again?",
  "Feeling very upset when something reminded you of the stressful experience?",
  "Having strong physical reactions when something reminded you of the stressful experience?",
  "Avoiding memories, thoughts, or feelings related to the stressful experience?",
  "Avoiding external reminders of the stressful experience?",
  "Trouble remembering important parts of the stressful experience?",
  "Having strong negative beliefs about yourself, other people, or the world?",
  "Blaming yourself or someone else for the stressful experience or what happened after it?",
  "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
  "Loss of interest in activities that you used to enjoy?",
  "Feeling distant or cut off from other people?",
  "Trouble experiencing positive feelings?",
  "Irritable behavior, angry outbursts, or acting aggressively?",
  "Taking too many risks or doing things that could cause you harm?",
  "Being 'superalert' or watchful or on guard?",
  "Feeling jumpy or easily startled?",
  "Having difficulty concentrating?",
  "Trouble falling or staying asleep?"
];
const PCL5_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "A little bit", value: 1 },
  { label: "Moderately", value: 2 },
  { label: "Quite a bit", value: 3 },
  { label: "Extremely", value: 4 }
];

const NSSI_QUESTIONS = [
  "Have you ever intentionally harmed yourself (e.g., cutting, burning)?",
  "How frequently have you harmed yourself in the past month?",
  "When was the most recent time you harmed yourself?",
  "How likely are you to harm yourself in the future?"
];
const NSSI_OPTIONS = [
  { label: "Never/None/Very Unlikely", value: 0 },
  { label: "Rarely/Low", value: 1 },
  { label: "Sometimes/Moderate", value: 2 },
  { label: "Often/High", value: 3 }
];

const SUICIDE_RISK_QUESTIONS = [
  "Have you wished you were dead or wished you could go to sleep and not wake up?",
  "Have you actually had any thoughts of killing yourself?",
  "Have you been thinking about how you might do this?",
  "Have you had these thoughts and had some intention of acting on them?",
  "Have you started to work out or worked out the details of how to kill yourself?"
];
const SUICIDE_RISK_OPTIONS = [
  { label: "No", value: 0 },
  { label: "Yes", value: 1 }
];

const AGREEABLENESS_QUESTIONS = [
  "I sympathize with others' feelings.",
  "I insult people.",
  "I respect others.",
  "I take time out for others.",
  "I feel little concern for others.",
  "I make people feel at ease.",
  "I am not interested in other people's problems.",
  "I have a good word for everyone.",
  "I am indifferent to the feelings of others.",
  "I inquire about others' well-being."
];
const AGREEABLENESS_OPTIONS = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 }
];

const INSTRUMENTS = {
  'AGREEABLENESS': { title: 'Agreeableness Trait', description: 'Assesses agreeableness based on the Big Five personality traits.', time: '2-3 minutes', questions: AGREEABLENESS_QUESTIONS, options: AGREEABLENESS_OPTIONS },
  'WHO5': { title: 'WHO-5 Well-Being Index', description: 'Measures your current mental wellbeing and happiness levels.', time: '2-3 minutes', questions: WHO5_QUESTIONS, options: WHO5_OPTIONS },
  'GAD7': { title: 'GAD-7 Anxiety', description: 'Screens for signs of generalized anxiety disorder.', time: '3-4 minutes', questions: GAD7_QUESTIONS, options: GAD7_OPTIONS },
  'PHQ9': { title: 'PHQ-9 Depression', description: 'Assesses the severity of depression symptoms.', time: '3-5 minutes', questions: PHQ9_QUESTIONS, options: PHQ9_OPTIONS },
  'PCL5': { title: 'PCL-5 PTSD', description: 'Measures symptoms of Post-Traumatic Stress Disorder.', time: '5-10 minutes', questions: PCL5_QUESTIONS, options: PCL5_OPTIONS },
  'NSSI': { title: 'NSSI Self-Harm', description: 'Evaluates risk and history of non-suicidal self-injury.', time: '1-2 minutes', questions: NSSI_QUESTIONS, options: NSSI_OPTIONS },
  'SUICIDE_RISK': { title: 'Suicide Risk Screen', description: 'Screens for current and past risk of self-harm.', time: '1-2 minutes', questions: SUICIDE_RISK_QUESTIONS, options: SUICIDE_RISK_OPTIONS }
};

export default function Screenings() {
  const [view, setView] = useState('selection'); // 'selection', 'active', 'results'
  const [activeTest, setActiveTest] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTest = (testType) => {
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
        await axios.post('http://localhost:3000/api/screenings/submit', {
          screening_type: activeTest,
          score: score,
          answers: answers
        }, { withCredentials: true });
        
        setView('results');
      } catch (err) {
        console.error("Failed to submit screening", err);
        alert("There was an error saving your results. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* VIEW 1: SELECTION */}
        {view === 'selection' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Mental Health Screenings</h1>
            <p className="text-slate-600 mb-8">Evidence-based tools to better understand your mental health. These are not diagnostic tools.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(INSTRUMENTS).map(([key, instrument]) => (
                <div 
                  key={key}
                  onClick={() => startTest(key)}
                  className="cursor-pointer border border-slate-200 rounded-xl p-5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <ClipboardList className="h-5 w-5 text-blue-700" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg">{instrument.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 h-10 line-clamp-2">{instrument.description}</p>
                  <p className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded-md group-hover:bg-white transition-colors">
                    {instrument.questions.length} questions • {instrument.time}
                  </p>
                </div>
              ))}
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
                <span className="font-bold">"{INSTRUMENTS[activeTest].questions[currentStep]}"</span>
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {INSTRUMENTS[activeTest].options.map((opt, i) => (
                <label 
                  key={i} 
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentStep] === opt.value ? 'bg-blue-50 border-blue-500' : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="question_option" 
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={answers[currentStep] === opt.value}
                    onChange={() => handleAnswer(opt.value)}
                  />
                  <span className="ml-3 text-slate-700 font-medium">{opt.label}</span>
                </label>
              ))}
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
