import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Phone, MessageCircle } from 'lucide-react';
import { formatPatientName, getPatientAvatar, formatUgandanNumber } from '../utils/formatters';
import JournalTimeline from '../components/JournalTimeline';
import toast from 'react-hot-toast';

import { ASSESSMENTS_DATA, getScoreInterpretation } from '../utils/screeningUtils';

export default function PatientNotes() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');
  const [revealedContact, setRevealedContact] = useState(null);
  const [expandedScreeningId, setExpandedScreeningId] = useState(null);

  const toggleScreening = (id) => setExpandedScreeningId(prev => prev === id ? null : id);

  const handleRevealContact = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/therapists/patient/${patientId}/reveal-contact`, {}, { withCredentials: true });
      setRevealedContact(res.data.phone_number);
      toast.success('Emergency contact revealed');
    } catch (err) {
      toast.error('Failed to reveal contact');
    }
  };

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

  const groupedScreenings = (patientData?.screenings || []).reduce((acc, screening) => {
    const dateStr = new Date(screening.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(screening);
    return acc;
  }, {});

  const groupedStressScores = (patientData?.stressScores || []).reduce((acc, score) => {
    const dateStr = new Date(score.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(score);
    return acc;
  }, {});

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
            
            <div className="ml-auto flex items-center gap-6">
              <div className="flex flex-col items-end justify-center text-right">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Direct Line</span>
                <span className="text-[10px] text-slate-400 mb-2">(Access is audit-logged)</span>
                {revealedContact ? (
                  <a href={`tel:+${revealedContact}`} className="text-lg font-mono font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {formatUgandanNumber(revealedContact)}
                  </a>
                ) : (
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-400 font-mono text-sm tracking-wider">📞 (***) ***-****</span>
                    <button 
                      onClick={handleRevealContact} 
                      className="border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 text-sm font-medium transition-colors"
                    >
                      Reveal
                    </button>
                  </div>
                )}
              </div>
              <div className="h-12 border-l border-slate-200 hidden sm:block"></div>
              <button
                onClick={() => navigate(`/messages?userId=${patientId}&firstName=${encodeURIComponent(patientData.first_name || '')}&lastName=${encodeURIComponent(patientData.last_name || '')}`)}
                className="flex items-center justify-center gap-2 bg-[#e87a5d] hover:bg-[#d6694c] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4"/>
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 mb-8 overflow-x-auto">
          {['journal', 'cbt', 'stress', 'screenings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab === 'journal' ? 'Journal' : tab === 'cbt' ? 'CBT Thought Records' : tab === 'stress' ? 'Stress Assessments' : 'Mental Health Screenings'}
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
          <div className="space-y-8">
            {Object.keys(groupedStressScores).length === 0 ? (
              <p className="text-slate-500 text-center py-8">No stress assessments found.</p>
            ) : (
              Object.entries(groupedStressScores).map(([date, dayScores]) => (
                <div key={date} className="mb-6">
                  {/* Date Header */}
                  <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">{date}</h3>
                  
                  {/* Stress Assessments for this Date */}
                  <div className="space-y-4">
                    {dayScores.map(score => {
                      const testQuestions = ASSESSMENTS_DATA["STRESS"];
                      const classification = getScoreInterpretation('STRESS', Number(score.score));

                      // Dynamically derive the legend from the first question's options
                      const legendOptions = testQuestions && testQuestions[0] && testQuestions[0].options 
                        ? testQuestions[0].options.join(' • ') 
                        : null;

                      return (
                        <div key={score.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                          {/* Card Header */}
                          <div 
                            onClick={() => toggleScreening(score.id)}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-4"
                          >
                            {/* LEFT SIDE: Title, Classification, and Scale Legend */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-800 text-base">Perceived Stress Scale</h4>
                              
                              <div className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-3 mt-1">
                                {classification && (
                                  <span className={`text-sm font-medium whitespace-nowrap ${classification.colorClass || 'text-indigo-600'}`}>
                                    {classification.severity}
                                  </span>
                                )}
                                
                                {/* Desktop Legend (Inline with pipe separator) */}
                                {legendOptions && (
                                  <span className="text-xs text-slate-400 hidden xl:inline-block truncate" title={legendOptions}>
                                    <span className="mr-3 text-slate-300">|</span> 
                                    Scale: {legendOptions}
                                  </span>
                                )}
                              </div>

                              {/* Mobile/Tablet Legend (Stacked) */}
                              {legendOptions && (
                                <p className="text-xs text-slate-400 mt-1 xl:hidden">
                                  Scale: {legendOptions}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                                Score: {score.score} / {score.max_score || 15}
                              </span>
                              <span className="text-slate-400">
                                {expandedScreeningId === score.id ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Answers (Accordion Body) */}
                          {expandedScreeningId === score.id && (
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                              {score.answers ? (
                                <>
                                  <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-sm font-bold text-slate-700">Detailed Responses</h5>
                                  </div>
                                  <div className="space-y-2">
                                    {Object.entries(
                                      typeof score.answers === 'string' ? JSON.parse(score.answers) : score.answers
                                    ).map(([key, value], index) => {
                                      const questionData = testQuestions ? testQuestions[key] : null;
                                      const questionText = questionData ? questionData.question : `Question ${Number(key) + 1}`;
                                      
                                      let answerText = value;
                                      if (questionData && questionData.options) {
                                        if (questionData.options[value] !== undefined) {
                                          answerText = questionData.options[value];
                                        } else if (questionData.options[value - 1] !== undefined) {
                                          answerText = questionData.options[value - 1];
                                        }
                                      }

                                      return (
                                        <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm bg-white p-3 rounded border border-slate-200 shadow-sm gap-2 sm:gap-4">
                                          <span className="font-medium text-slate-700 flex-1">{index + 1}. {questionText}</span>
                                          <span className="text-slate-900 font-bold text-right bg-slate-100 px-3 py-1 rounded w-full sm:w-auto">
                                            {answerText}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-slate-500 italic text-center py-4">
                                  Detailed responses were not recorded for legacy assessments.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'screenings' && (
          <div className="space-y-8">
            {Object.keys(groupedScreenings).length === 0 ? (
              <p className="text-slate-500 text-center py-8">No screenings found.</p>
            ) : (
              Object.entries(groupedScreenings).map(([date, dayScreenings]) => (
                <div key={date} className="mb-6">
                  {/* Date Header */}
                  <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">{date}</h3>
                  
                  {/* Screenings for this Date */}
                  <div className="space-y-4">
                    {dayScreenings.map(screening => {
                      const testKey = screening.screening_type.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                      const testQuestions = ASSESSMENTS_DATA[testKey];
                      const classification = getScoreInterpretation(screening.screening_type, Number(screening.score));

                      // Dynamically derive the legend from the first question's options
                      const legendOptions = testQuestions && testQuestions[0] && testQuestions[0].options 
                        ? (testKey === 'NSSI' ? 'Options vary by question' : testQuestions[0].options.join(' • ')) 
                        : null;

                      return (
                        <div key={screening.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                          {/* Card Header */}
                          <div 
                            onClick={() => toggleScreening(screening.id)}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-4"
                          >
                            {/* LEFT SIDE: Title, Classification, and Scale Legend */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-800 text-base">{screening.screening_type}</h4>
                              
                              <div className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-3 mt-1">
                                {classification && (
                                  <span className={`text-sm font-medium whitespace-nowrap ${classification.colorClass || 'text-indigo-600'}`}>
                                    {classification.severity}
                                  </span>
                                )}
                                
                                {/* Desktop Legend (Inline with pipe separator) */}
                                {legendOptions && (
                                  <span className="text-xs text-slate-400 hidden xl:inline-block truncate" title={legendOptions}>
                                    <span className="mr-3 text-slate-300">|</span> 
                                    Scale: {legendOptions}
                                  </span>
                                )}
                              </div>

                              {/* Mobile/Tablet Legend (Stacked) */}
                              {legendOptions && (
                                <p className="text-xs text-slate-400 mt-1 xl:hidden">
                                  Scale: {legendOptions}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                                Score: {screening.score}
                              </span>
                              <span className="text-slate-400">
                                {expandedScreeningId === screening.id ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Answers (Accordion Body) */}
                          {expandedScreeningId === screening.id && screening.answers && (
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="text-sm font-bold text-slate-700">Detailed Responses</h5>
                              </div>
                              <div className="space-y-2">
                                {Object.entries(
                                  typeof screening.answers === 'string' ? JSON.parse(screening.answers) : screening.answers
                                ).map(([key, value], index) => {
                                  const questionData = testQuestions ? testQuestions[key] : null;

                                  const questionText = questionData ? questionData.question : `Question ${Number(key) + 1}`;
                                  
                                  let answerText = value; // Default fallback to raw value
                                  
                                  if (questionData && questionData.options) {
                                    if (questionData.options[value] !== undefined) {
                                      // Standard 0-indexed match (e.g., GAD-7, PHQ-9)
                                      answerText = questionData.options[value];
                                    } else if (questionData.options[value - 1] !== undefined) {
                                      // 1-indexed match (e.g., Agreeableness 1-5 scale)
                                      answerText = questionData.options[value - 1];
                                    }
                                  }

                                  return (
                                    <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm bg-white p-3 rounded border border-slate-200 shadow-sm gap-2 sm:gap-4">
                                      <span className="font-medium text-slate-700 flex-1">{index + 1}. {questionText}</span>
                                      <span className="text-slate-900 font-bold text-right bg-slate-100 px-3 py-1 rounded w-full sm:w-auto">
                                        {answerText}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
