import React from 'react';
import { Shield, Globe, Award } from 'lucide-react';

export default function About() { 
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-sans">
      
      {/* Hero Section */}
      <section className="pb-16 border-b border-slate-100">
        <div className="text-center max-w-4xl mx-auto px-4 relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 relative flex items-center justify-center">
            <img src="/butabika.png" alt="Butabika" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-6 tracking-tight">
            A Legacy of Care. <br/> A Future of Digital Health.
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
            Butabika National Referral Mental Hospital is the apex institution for mental health care in Uganda. We are extending our clinical excellence into the digital space to break down geographical barriers.
          </p>
        </div>
      </section>

      {/* Mandate & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 border border-slate-200">
                <Shield className="text-[#0F766E] h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mandate</h2>
              <p className="text-slate-600 leading-relaxed">
                As the national referral hospital, Butabika provides super-specialized psychiatric care, conducts cutting-edge mental health research, and trains the next generation of medical professionals across the continent.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 border border-slate-200">
                <Award className="text-[#0F766E] h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Clinical Standards</h2>
              <p className="text-slate-600 leading-relaxed">
                Every therapist and specialist on this platform is rigorously vetted and bound by strict patient-doctor confidentiality agreements. Your digital sessions are handled with the same care as our in-person consultations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Partners */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 mx-auto">
            <Globe className="text-[#0F766E] h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Global Partnerships</h2>
          <p className="text-slate-600 leading-relaxed mb-12">
            The Butabika Cares digital platform is made possible through the technical and financial support of our international development partners, working together to ensure mental health accessibility for all.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-70">
            <img src="/catalonia.png" alt="Catalonia" className="h-12 w-auto object-contain grayscale" />
            <img src="/aha.png" alt="AHA" className="h-10 w-auto object-contain grayscale" />
            <img src="/famamundi.jpeg" alt="Farmamundi" className="h-10 w-auto object-contain grayscale" />
          </div>
        </div>
      </section>
      
    </div>
  ); 
}
