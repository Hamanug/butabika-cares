import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Activity, Video, ArrowRight, Lock, Globe } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user?.role === 'patient') navigate('/dashboard');
    else if (user?.role === 'therapist') navigate('/therapist/dashboard');
    else if (user?.role === 'admin') navigate('/admin/dashboard');
    else navigate('/auth');
  };

  return (
    <div className="font-sans flex flex-col relative bg-white">
      
      {/* 1. HERO SECTION: Institutional Authority */}
      <main className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-slate-50/50 -z-20"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-50/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Primary Content */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-teal-50 border border-teal-100 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-widest">
                  Healthcare-Grade Encryption
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-heading font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                A Centre of Excellence. <br/>
                <span className="text-[#0F766E]">Uncompromising Privacy.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed font-medium max-w-2xl">
                Butabika National Referral Mental Hospital brings the highest standard of clinical care directly to you. Distance is no longer a barrier to accessing the region's top professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={handleCTA}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg px-8 py-4 font-bold text-base transition-all shadow-md group"
                >
                  {user ? 'Go to Dashboard' : 'Access Patient Portal'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {!user && (
                  <button 
                    onClick={() => navigate('/therapist/auth')}
                    className="w-full sm:w-auto flex items-center justify-center bg-white border-2 border-slate-200 text-slate-600 hover:border-[#0F766E] hover:text-[#0F766E] font-bold px-8 py-4 rounded-lg transition-all shadow-sm"
                  >
                    Provider Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Desktop Institutional Branding */}
            <div className="hidden lg:flex relative items-center justify-center h-full translate-x-12 translate-y-12">
              {/* Subtle ambient glow behind the crest */}
              <div className="absolute inset-0 bg-teal-400/10 blur-[100px] rounded-full w-3/4 h-3/4 m-auto z-0"></div>
              
              <img 
                src="/butabika.png" 
                alt="Butabika National Referral Mental Hospital Crest" 
                className="relative z-10 w-full max-w-lg object-contain drop-shadow-2xl animate-fade-in-up hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

          </div>
        </div>
      </main>

      {/* 2. TRUST BAR: Clinical Validation */}
      <div className="border-b border-slate-100 bg-white py-8">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="py-2">
              <p className="text-3xl font-black text-slate-900">18+</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Age Verification Required</p>
            </div>
            <div className="py-2">
              <p className="text-3xl font-black text-slate-900">256-Bit</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">End-to-End Encryption</p>
            </div>
            <div className="py-2">
              <p className="text-3xl font-black text-slate-900">7</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Validated Clinical Instruments</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE FEATURES: The Clinical Engine */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-slate-900 mb-4 tracking-tight">
              Evidence-Based Digital Care
            </h2>
            <p className="text-base text-slate-500 font-medium">
              A comprehensive clinical suite designed to track, manage, and improve your mental wellbeing securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                <Activity className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Dynamic Clinical Scoring</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Access globally recognized assessments (PHQ-9, GAD-7, PCL-5) with immediate severity classification and historical tracking saved directly to your private profile.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Encrypted Telehealth</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Connect with certified specialists via time-locked, embedded HD video rooms. Supported by strict clinical hour enforcement and anonymous display IDs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-fuchsia-50 rounded-xl flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-fuchsia-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Cognitive Behavioral Tools</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Utilize structured CBT thought records, sleep hygiene tracking, and guided mindfulness pacers designed to manage panic and acute anxiety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLOSING CTA */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-6 tracking-tight">Ready to prioritize your wellbeing?</h2>
          <p className="text-lg text-slate-500 mb-8 font-medium">Join the thousands of Ugandans accessing secure, professional mental health support through Butabika Cares.</p>
          <button 
            onClick={handleCTA} 
            className="bg-[#0F766E] hover:bg-[#115E59] text-white font-bold px-10 py-4 rounded-lg shadow-md transition-all inline-flex items-center gap-2 group"
          >
            Create Your Secure Account
            <Lock className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;
