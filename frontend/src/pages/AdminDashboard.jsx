import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2 text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Placeholder layout for system administration.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <h3 className="text-lg font-medium text-slate-900">User Management</h3>
            <p className="text-slate-500 text-sm mt-1">Manage system users and access levels.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <h3 className="text-lg font-medium text-slate-900">Therapist Management</h3>
            <p className="text-slate-500 text-sm mt-1">Onboard and manage therapists.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <h3 className="text-lg font-medium text-slate-900">Screening Tools</h3>
            <p className="text-slate-500 text-sm mt-1">Configure assessments and modules.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
