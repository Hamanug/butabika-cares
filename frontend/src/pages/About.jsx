import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, Heart, MessageCircle, Shield, Phone } from 'lucide-react';

export default function About() { 
  return (
    <div className="min-h-screen bg-gradient-to-b from-serene-50 to-serene-100 pt-32 pb-20">
      
      {/* Section 1: Hero */}
      <section className="pb-20 relative overflow-hidden">
        {/* Absolute Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-100 to-cyan-50 -z-20"></div>
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-float mix-blend-multiply pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-fuchsia-200/40 rounded-full blur-3xl -z-10 animate-float mix-blend-multiply pointer-events-none animation-delay-200"></div>

        <div className="text-center max-w-4xl mx-auto px-4 z-10 relative">
          <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-8 relative flex flex-col items-center justify-center">
            <div className="w-4 h-6 bg-cyan-400 rounded-t-full rounded-b-full opacity-70 animate-teardrop mb-2"></div>
            <img src="/butabika.png" alt="Butabika" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-cyan-950 mb-6">
            Your journey to wellbeing starts here.
          </h1>
          <p className="text-lg text-cyan-800 mb-8 max-w-2xl mx-auto">
            We are dedicated to providing accessible, professional mental health support to help you navigate life's challenges and nurture your mind.
          </p>
          <Link to="/auth" className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-8 py-4 rounded-lg text-lg shadow-lg transition-all inline-block mt-4">
            Start Your Journey
          </Link>
          <div className="flex justify-center mt-6 w-full">
            <Link to="/therapists" className="flex items-center gap-2 bg-[#D97757] hover:bg-[#C26243] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all">
              <Phone className="w-5 h-5" /> Speak to a Therapist
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Features */}
      <section className="py-20 bg-serene-50 relative">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold font-serif text-serene-900 text-center mb-12">
            How We Support Your Mental Health Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6 text-cyan-600">
                <Brain size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Screening & Self-Assessment</h3>
              <p className="text-slate-600 leading-relaxed">Quick and clinically validated mental health checks.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-fuchsia-50 rounded-2xl flex items-center justify-center mb-6 text-fuchsia-600">
                <BookOpen size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Guided Therapy & Exercises</h3>
              <p className="text-slate-600 leading-relaxed">Science-backed techniques to help you manage stress and emotions.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Journaling & Reflection</h3>
              <p className="text-slate-600 leading-relaxed">A personal space to track your thoughts and progress.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                <MessageCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Live Therapy Sessions</h3>
              <p className="text-slate-600 leading-relaxed">Connect with trained mental health professionals.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-sage-100 rounded-2xl flex items-center justify-center mb-6 text-serene-700">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Secure & Confidential</h3>
              <p className="text-slate-600 leading-relaxed">Your privacy is our priority—your journey is yours alone.</p>
            </div>
            
            {/* 6th Tile: CTA */}
            <div className="bg-gradient-to-br from-[#FCEBE5] to-[#FADCD1] rounded-2xl p-8 shadow-sm border border-[#FADCD1] hover:scale-105 transition-transform flex flex-col justify-center items-center text-center">
              <h3 className="text-xl font-bold text-[#8A3C26] mb-3">Ready to Begin?</h3>
              <p className="text-[#8A3C26] text-sm mb-4 opacity-90">Start your path to better mental wellbeing today.</p>
              <Link to="/auth" className="mt-2 bg-[#D97757] hover:bg-[#C26243] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Start Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Testimonial/CTA */}
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-serene-100 to-sage-100 rounded-2xl p-10 md:p-16 relative overflow-hidden shadow-xl text-center">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-serene-900 mb-6 relative z-10">
              Begin Your Journey Today
            </h2>
            <p className="text-lg text-serene-800 mb-8 max-w-2xl mx-auto relative z-10">
              Take the first step toward better mental wellbeing. Our tools and resources are here to support you every step of the way.
            </p>
            <Link to="/auth" className="bg-serene-900 hover:bg-serene-800 text-white font-medium px-8 py-4 rounded-lg text-lg shadow-lg transition-all inline-block relative z-10">
              Get Started
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  ); 
}
