import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Eye, Activity } from 'lucide-react';

export default function MindfulnessHub() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Guided Breathing",
      description: "Follow a visual pacing guide to regulate your nervous system.",
      icon: Wind,
      route: "/breathing", // Navigates to the existing route (we will map it to Exercises)
      colorTheme: "bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100 hover:border-teal-300",
      iconTheme: "bg-teal-200 text-teal-700",
      linkText: "text-teal-700"
    },
    {
      title: "5-4-3-2-1 Grounding",
      description: "A sensory checklist to quickly anchor yourself during moments of high anxiety.",
      icon: Eye,
      route: "/grounding",
      colorTheme: "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300",
      iconTheme: "bg-amber-200 text-amber-700",
      linkText: "text-amber-700"
    },
    {
      title: "Body Scan (PMR)",
      description: "Systematically release physical tension stored in your muscle groups.",
      icon: Activity,
      route: "/body-scan",
      colorTheme: "bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300",
      iconTheme: "bg-indigo-200 text-indigo-700",
      linkText: "text-indigo-700"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Mindfulness Hub</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Explore grounding exercises, breathing techniques, and meditation tools to help anchor you in the present moment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx}
                onClick={() => navigate(card.route)}
                className={`rounded-2xl p-6 shadow-sm border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${card.colorTheme}`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors ${card.iconTheme}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="opacity-80 mb-6 text-sm leading-relaxed">{card.description}</p>
                <div className={`font-medium flex items-center ${card.linkText}`}>
                  Start Practice &rarr;
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
