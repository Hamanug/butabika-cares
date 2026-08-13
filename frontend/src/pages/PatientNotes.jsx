import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { formatPatientName, getPatientAvatar } from '../utils/formatters';
import JournalTimeline from '../components/JournalTimeline';

export default function PatientNotes() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/therapists/patient/${patientId}`, { withCredentials: true });
        setPatientData(res.data);
      } catch (err) {
        console.error('Failed to fetch patient notes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500">Patient not found or unauthorized.</p>
          <button onClick={() => navigate('/therapist/dashboard')} className="mt-4 text-blue-600 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate('/therapist/dashboard')}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl border border-blue-100">
              {getPatientAvatar(patientData)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{formatPatientName(patientData)}</h1>
              <p className="text-slate-500">ID: {patientData.display_id}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 mb-8 overflow-x-auto">
          {['journal', 'cbt', 'stress'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab === 'journal' ? 'Journal' : tab === 'cbt' ? 'CBT Thought Records' : 'Stress Assessments'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'journal' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Clinical History (Journal)</h3>
            {(!patientData.entries || patientData.entries.length === 0) ? (
              <p className="text-slate-500">No journal entries found.</p>
            ) : (
              <JournalTimeline entries={patientData.entries} readOnly={true} />
            )}
          </div>
        )}

        {activeTab === 'cbt' && (
          <div className="mb-8 space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">CBT Thought Records</h3>
            {(!patientData.thoughtRecords || patientData.thoughtRecords.length === 0) ? (
              <p className="text-slate-500 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">No thought records found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patientData.thoughtRecords.map(record => (
                  <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <p className="text-sm font-medium text-slate-500 mb-4">{new Date(record.created_at).toLocaleDateString()}</p>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Situation</span>
                        <p className="text-slate-800 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">{record.situation}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Emotion</span>
                        <p className="text-slate-800 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">{record.emotion}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Automatic Thought</span>
                        <p className="text-slate-800 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">{record.automatic_thought}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Rational Thought</span>
                        <p className="text-slate-800 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">{record.rational_thought}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stress' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Stress Assessments</h3>
            {(!patientData.stressScores || patientData.stressScores.length === 0) ? (
              <p className="text-slate-500 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">No stress assessments found.</p>
            ) : (
              <div className="space-y-4">
                {patientData.stressScores.map(score => {
                  let badgeColor = 'bg-green-100 text-green-700';
                  if (score.score > 26) badgeColor = 'bg-red-100 text-red-700';
                  else if (score.score > 13) badgeColor = 'bg-yellow-100 text-yellow-700';
                  
                  return (
                    <div key={score.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:border-blue-200 transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-slate-900 font-medium">Perceived Stress Scale</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}>
                            {score.score > 26 ? 'High' : score.score > 13 ? 'Moderate' : 'Low'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{new Date(score.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <p className="text-2xl font-bold text-slate-900">{score.score} <span className="text-sm text-slate-500 font-normal">/ {score.max_score}</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
