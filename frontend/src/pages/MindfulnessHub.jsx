import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Eye, Activity, ChevronRight, Stethoscope } from 'lucide-react';

export default function MindfulnessHub() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Guided Breathing",
      tag: "Autonomic Regulation",
      description: "Follow a visual pacing guide to regulate your central nervous system.",
      icon: Wind,
      route: "/breathing",
      cta: "Initiate Module"
    },
    {
      title: "5-4-3-2-1 Grounding",
      tag: "Sensory Grounding",
      description: "A structured sensory checklist to anchor cognition during acute distress.",
      icon: Eye,
      route: "/grounding",
      cta: "Access Tool"
    },
    {
      title: "Body Scan (PMR)",
      tag: "Somatic Regulation",
      description: "Systematically identify and release physical tension stored in primary muscle groups.",
      icon: Activity,
      route: "/body-scan",
      cta: "Initiate Module"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
              <Stethoscope className="w-7 h-7 text-[#0F766E]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1">Clinical Tool Library</h1>
              <p className="text-slate-500 font-medium">Prescribed therapeutic modules and cognitive interventions.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow"
              >
                <div className="mb-6 flex justify-between items-start">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#0F766E]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-right">
                    {mod.tag}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{mod.title}</h3>
                <p className="text-slate-600 mb-8 text-sm leading-relaxed font-medium flex-grow">
                  {mod.description}
                </p>
                
                <button 
                  onClick={() => navigate(mod.route)}
                  className="w-full flex justify-between items-center px-5 py-3 rounded-full border border-slate-300 text-[#0F766E] font-bold text-sm hover:border-[#0F766E] hover:bg-teal-50 transition-all shadow-sm group"
                >
                  {mod.cta}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
