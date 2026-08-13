import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using the Butabika Cares platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Medical Disclaimer</h2>
            <p>Butabika Cares provides teletherapy and mental health resources. However, it is not a substitute for professional emergency medical care. If you are experiencing a medical emergency, please call your local emergency services immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. User Responsibilities</h2>
            <p>You agree to provide accurate and complete information during registration and teletherapy sessions. You are responsible for maintaining the confidentiality of your account credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Platform Analytics & Monitoring</h2>
            <p>We monitor platform usage and perform automated screenings to ensure quality of care and patient safety. An administrative team actively oversees platform operations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Termination</h2>
            <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
