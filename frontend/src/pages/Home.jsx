import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="font-sans flex flex-col relative bg-slate-50">

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20 overflow-hidden relative flex flex-col items-center justify-center">
        {/* Absolute Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 -z-20"></div>
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-fuchsia-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 px-8 max-w-7xl mx-auto w-full z-10">
          {/* Left Column */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-cyan-100 border border-cyan-200">
              <span className="text-sm font-semibold text-cyan-800 uppercase tracking-wider">
                Your journey to wellbeing starts here
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-8">
              Nurture your mind, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600">
                find your elixir
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-xl mb-10 leading-relaxed">
              Access professional mental health support from anywhere in Uganda. Secure, confidential, and tailored to your needs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => {
                  if (user?.role === 'patient') navigate('/dashboard');
                  else if (user?.role === 'therapist') navigate('/therapist/dashboard');
                  else navigate('/auth', { state: { isSignUp: false } });
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
              >
                Start Your Journey
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="border-2 border-cyan-200 text-cyan-700 bg-cyan-50/50 hover:bg-cyan-100 font-medium px-6 py-3 rounded-full transition-all shadow-sm whitespace-nowrap"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column (Breathing Animation) */}
          <div className="flex-1 w-full max-w-md">
            <div className="glass aspect-square mx-auto relative rounded-3xl flex items-center justify-center p-8 overflow-hidden">
              {/* Watermark Logo */}
              <img 
                src="/butabika.png" 
                alt="Watermark" 
                className="absolute opacity-30 w-48 h-48 object-contain pointer-events-none"
              />
              {/* Breathing Circle */}
              <div className="absolute w-72 h-72 bg-cyan-400/40 rounded-full animate-breathe pointer-events-none"></div>
              {/* Text */}
              <span className="z-10 text-slate-700 text-2xl font-light tracking-wide pointer-events-none">
                Breathe
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Our Services Section */}
      <section className="py-20 bg-cyan-50">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-medium mb-4">Our Services</h2>
          <p className="text-slate-600">Explore the different tools and resources available to support your mental wellness journey.</p>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div onClick={() => navigate('/exercises')} className="rounded-xl p-6 transition-all duration-300 h-full bg-cyan-100 hover:bg-cyan-200 transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
              <div className="text-3xl mb-4">🧘</div>
              <h3 className="text-lg font-medium mb-2 text-cyan-700">Breathing Exercises</h3>
              <p className="text-slate-600 text-sm">Practice guided breathing techniques to reduce anxiety and promote relaxation.</p>
            </div>
            <div onClick={() => navigate('/journal')} className="rounded-xl p-6 transition-all duration-300 h-full bg-fuchsia-100 hover:bg-fuchsia-200 transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-medium mb-2 text-fuchsia-700">Mood Tracking</h3>
              <p className="text-slate-600 text-sm">Record your daily moods and journal your thoughts to identify patterns and gain insights.</p>
            </div>
            <div onClick={() => navigate('/screenings')} className="rounded-xl p-6 transition-all duration-300 h-full bg-indigo-100 hover:bg-indigo-200 transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2 text-indigo-700">Mental Health Screening</h3>
              <p className="text-slate-600 text-sm">Evidence-based screening tools to better understand your mental health and wellbeing.</p>
            </div>
            <div onClick={() => navigate('/resources')} className="rounded-xl p-6 transition-all duration-300 h-full bg-amber-100 hover:bg-amber-200 transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-medium mb-2 text-amber-700">Health Resources</h3>
              <p className="text-slate-600 text-sm">Access our collection of mental health resources, articles, and helpful techniques.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Begin Your Journey Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto glass rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-medium mb-4">Begin Your Journey Today</h2>
            <p className="text-slate-600 mb-6">Take the first step toward better mental wellbeing. Our tools and resources are here to support you.</p>
            <button onClick={() => navigate('/about')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 py-3 rounded-full transition-colors">Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
