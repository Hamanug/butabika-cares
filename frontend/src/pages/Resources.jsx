import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Moon, Brain, Leaf, PhoneCall, Phone } from 'lucide-react';

export default function Resources() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Top Hero Section */}
        <div className="mb-12 text-center flex flex-col items-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Mental Health Resources</h1>
          <p className="text-slate-600 text-lg max-w-2xl mb-8">
            Explore tools, techniques, and crisis support designed to help you build resilience and maintain your mental wellbeing.
          </p>
          <button 
            onClick={() => navigate('/therapists')} 
            className="flex items-center justify-center gap-2 bg-[#e87a5d] hover:bg-[#d6694c] text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm mx-auto"
          >
            <PhoneCall className="h-4 w-4"/> Speak to a Therapist
          </button>
        </div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Mindfulness Practices */}
          <div onClick={() => navigate('/mindfulness')} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Mindfulness Practices</h3>
            <p className="text-slate-600 mb-4">
              Learn grounding exercises, breathing techniques, and meditation to help anchor you in the present moment.
            </p>
            <button className="text-amber-600 font-medium hover:text-amber-700 transition-colors">
              Explore Practices &rarr;
            </button>
          </div>

          {/* Therapeutic Journaling */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Therapeutic Journaling</h3>
            <p className="text-slate-600 mb-4">
              Write down your thoughts and track your emotional states over time to identify triggers and patterns.
            </p>
            <button onClick={() => navigate('/journal')} className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
              Open Journal &rarr;
            </button>
          </div>

          {/* Sleep Hygiene */}
          <div onClick={() => navigate('/sleep-hygiene')} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <Moon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Sleep Hygiene</h3>
            <p className="text-slate-600 mb-4">
              Discover tips for establishing a healthy sleep routine to improve your overall energy and mood.
            </p>
            <button className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              Improve Sleep &rarr;
            </button>
          </div>

          {/* Cognitive Reframing */}
          <div onClick={() => navigate('/cognitive-reframing')} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Cognitive Reframing</h3>
            <p className="text-slate-600 mb-4">
              Learn how to identify and challenge negative thought patterns to foster a more balanced perspective.
            </p>
            <button className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
              Learn More &rarr;
            </button>
          </div>

          {/* Stress Management */}
          <div onClick={() => navigate('/stress-management')} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Stress Management</h3>
            <p className="text-slate-600 mb-4">
              Practical strategies and habits to reduce daily stress, manage overwhelm, and prevent burnout.
            </p>
            <button className="text-green-600 font-medium hover:text-green-700 transition-colors">
              Assess Stress &rarr;
            </button>
          </div>

          {/* Crisis Resources */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-colors">
              <PhoneCall className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Crisis Resources</h3>
            <p className="text-slate-600 mb-4">
              If you or someone you know is in immediate danger, please reach out for professional support immediately.
            </p>
            <div className="bg-white p-2 rounded-lg flex flex-col gap-1 mt-4 border border-rose-100 shadow-sm">
              <a 
                href="tel:999" 
                className="flex items-center justify-between text-rose-700 hover:text-rose-900 transition-colors p-2 hover:bg-rose-50 rounded-md"
              >
                <span className="font-medium text-sm">Uganda Emergency: 999</span>
                <Phone className="w-4 h-4" />
              </a>
              <a 
                href="tel:0800211306" 
                className="flex items-center justify-between text-rose-700 hover:text-rose-900 transition-colors p-2 hover:bg-rose-50 rounded-md"
              >
                <span className="font-medium text-sm">Mental Health Helpline: 0800 211 306</span>
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
