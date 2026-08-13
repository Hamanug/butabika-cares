import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Introduction</h2>
            <p>Welcome to Butabika Cares. We are committed to protecting your personal health information. This Privacy Policy outlines how we collect, use, and encrypt your data in compliance with clinical health standards.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Data Collection & Encryption</h2>
            <p>All sensitive health data, clinical notes, and active session teletherapy streams are secured with end-to-end encryption. Your information is strictly accessible only to your assigned, licensed therapist and our authorized administrative team.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Confidentiality & Sharing</h2>
            <p>Your therapy sessions remain fully confidential. We do not sell or share your data with third parties. In emergency situations, following standard clinical protocol, we may contact relevant authorities or emergency contacts to ensure patient safety.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Emergency Protocol</h2>
            <p>If our screening tools detect an immediate risk of harm, our crisis alert system flags the administration for immediate intervention. You consent to these protective measures by using the Butabika Cares platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Contact Us</h2>
            <p>If you have questions regarding this policy or your data rights, please contact our support team at privacy@butabikacares.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
