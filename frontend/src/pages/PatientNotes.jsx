import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Phone, MessageCircle, ChevronDown, ChevronUp, AlertTriangle, MonitorSmartphone, Users, FileText } from 'lucide-react';
import { formatPatientName, getPatientAvatar, formatUgandanNumber } from '../utils/formatters';
import JournalTimeline from '../components/JournalTimeline';
import toast from 'react-hot-toast';

import { ASSESSMENTS_DATA, getScoreInterpretation } from '../utils/screeningUtils';
import { scoreAdultDSM5, scoreChildDSM5 } from '../utils/dsm5Scoring';

export default function PatientNotes() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');
  const [revealedContact, setRevealedContact] = useState(null);
  const [expandedScreeningId, setExpandedScreeningId] = useState(null);
  const [isIntakeExpanded, setIsIntakeExpanded] = useState(false);

  const toggleScreening = (id) => setExpandedScreeningId(prev => prev === id ? null : id);

  const handleRevealContact = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/therapists/patient/${patientId}/reveal-contact`, {}, { withCredentials: true });
      setRevealedContact(res.data.phone_number);
      toast.success('Emergency contact revealed');
    } catch {
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
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex justify-center items-center font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-sans">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 font-medium">Patient record not found or access denied.</p>
          <button onClick={() => navigate('/therapist/dashboard')} className="mt-4 text-[#0F766E] hover:underline font-bold">
            Return to Clinical Dashboard
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

  // Clinical Tagging System
  const getSeverityTag = (severity) => {
    if (!severity) return 'bg-slate-100 text-slate-700 border-slate-200';
    const s = severity.toLowerCase();
    if (s.includes('severe') || s.includes('high') || s.includes('crisis') || s.includes('danger')) {
      return 'bg-red-50 text-red-700 border-red-100';
    }
    if (s.includes('minimal') || s.includes('normal') || s.includes('mild') || s.includes('low')) {
      return 'bg-teal-50 text-[#0F766E] border-teal-100';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-sans">
      <div className="container max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate('/therapist/dashboard')}
          className="flex items-center text-slate-500 hover:text-[#0F766E] font-medium transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        {/* EMR Patient Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold text-xl border border-slate-200">
              {getPatientAvatar(patientData)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{formatPatientName(patientData)}</h1>
              <p className="text-slate-500 font-mono text-sm tracking-wider mt-1">EMR-ID: {patientData.display_id}</p>
            </div>
            
            <div className="ml-auto flex items-center gap-6">
              <div className="flex flex-col items-end justify-center text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Emergency Contact</span>
                <span className="text-[10px] text-slate-400 mb-2 font-mono">(Audit Logged)</span>
                {revealedContact ? (
                  <a href={`tel:+${revealedContact}`} className="text-lg font-mono font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {formatUgandanNumber(revealedContact)}
                  </a>
                ) : (
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-400 font-mono text-sm tracking-wider">📞 (***) ***-****</span>
                    <button 
                      onClick={handleRevealContact} 
                      className="rounded-full border border-red-600 text-red-600 px-4 py-1.5 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Reveal
                    </button>
                  </div>
                )}
              </div>
              <div className="h-12 border-l border-slate-200 hidden sm:block"></div>
              <button
                onClick={() => navigate(`/messages?userId=${patientId}&firstName=${encodeURIComponent(patientData.first_name || '')}&lastName=${encodeURIComponent(patientData.last_name || '')}`)}
                className="flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#115E59] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4"/>
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Intake Summary */}
        {patientData.intakeData && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
            <button 
              onClick={() => setIsIntakeExpanded(!isIntakeExpanded)}
              className="w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0F766E]" />
                <h2 className="text-xl font-bold text-slate-900">Clinical Intake Summary</h2>
                {patientData.intakeData.dsm_5_assessment && Object.keys(patientData.intakeData.dsm_5_assessment).length > 0 && (
                  <span className="bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-rose-100 flex items-center gap-1.5 ml-4">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> DSM-5-TR Attached
                  </span>
                )}
              </div>
              {isIntakeExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {isIntakeExpanded && (
              <div className="px-6 pb-6 border-t border-slate-100 pt-6">
                {(() => {
                  const intake = patientData.intakeData;
                  const dsm5 = intake.dsm_5_assessment || {};
                  const isChild = intake.therapy_type === 'Child';
                  const scoring = Object.keys(dsm5).length > 0 ? (isChild ? scoreChildDSM5(dsm5) : scoreAdultDSM5(dsm5)) : null;

                  return (
                    <div className="space-y-8">
                      {/* High-Risk Banners */}
                      {scoring?.criticalAlerts?.map((alert, idx) => (
                        <div key={`alert-${idx}`} className="bg-rose-50 border-l-4 border-rose-600 p-4 mb-4 rounded-r-xl shadow-sm">
                          <p className="text-rose-900 font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                            CRITICAL ALERT: {alert.domain} Triggered (Score: {alert.score}{alert.label ? ` - ${alert.label}` : ''})
                          </p>
                        </div>
                      ))}

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          {intake.therapy_type || 'Individual'} Therapy
                        </span>
                        {intake.device_count > 1 && (
                          <span className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                            <MonitorSmartphone className="w-3.5 h-3.5" /> {intake.device_count} Devices
                          </span>
                        )}
                        {intake.prior_therapy && (
                          <span className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                            Returning Client
                          </span>
                        )}
                      </div>

                      {/* DSM-5 Domain Breakdown Grid */}
                      {scoring?.results && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">DSM-5-TR Level 1 Domain Breakdown</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {scoring.results.map((res, idx) => (
                              <div key={`domain-${idx}`} className={`p-4 rounded-xl border ${res.triggered ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                <p className="font-bold text-slate-900">{res.domain}</p>
                                <div className="mt-2 flex justify-between items-center">
                                  <span className="text-sm font-medium text-slate-500">Score: {res.score}</span>
                                  {res.triggered ? (
                                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md">Requires Inquiry</span>
                                  ) : (
                                    <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md">Normal</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes Summary */}
                      {intake.notes && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Patient Notes</h3>
                          <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {intake.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* EMR Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 mb-8 overflow-x-auto">
          {['journal', 'cbt', 'stress', 'screenings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap uppercase tracking-wider ${
                activeTab === tab 
                  ? 'border-[#0F766E] text-[#0F766E]' 
                  : 'border-transparent text-slate-500 hover:text-[#0F766E] hover:border-slate-300'
              }`}
            >
              {tab === 'journal' ? 'Clinical Journal' : tab === 'cbt' ? 'CBT Thought Records' : tab === 'stress' ? 'Stress Analysis' : 'Diagnostic Screenings'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'journal' && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Clinical History (Journal)</h3>
            {(!patientData.entries || patientData.entries.length === 0) ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-500 font-medium">No clinical journal entries found for this patient.</p>
              </div>
            ) : (
              <JournalTimeline entries={patientData.entries} readOnly={true} />
            )}
          </div>
        )}

        {activeTab === 'cbt' && (
          <div className="mb-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">CBT Thought Records</h3>
            {(!patientData.thoughtRecords || patientData.thoughtRecords.length === 0) ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-500 font-medium">No CBT thought records logged.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patientData.thoughtRecords.map(record => (
                  <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <p className="text-xs font-mono font-bold text-slate-400 mb-5 border-b border-slate-100 pb-3 uppercase tracking-wider">
                      Log Date: {new Date(record.created_at).toLocaleDateString()}
                    </p>
                    <div className="space-y-5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Situation / Trigger</span>
                        <p className="text-slate-800 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">{record.situation}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Identified Emotion</span>
                        <p className="text-slate-800 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">{record.emotion}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Automatic Negative Thought (ANT)</span>
                        <p className="text-slate-800 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">{record.automatic_thought}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Clinical Reframing (Rational Thought)</span>
                        <p className="text-[#0F766E] text-sm bg-teal-50/50 p-3 rounded-lg border border-teal-100 leading-relaxed font-bold">{record.rational_thought}</p>
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
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-500 font-medium">No stress assessments logged.</p>
              </div>
            ) : (
              Object.entries(groupedStressScores).map(([date, dayScores]) => (
                <div key={date} className="mb-6">
                  {/* Date Header */}
                  <h3 className="text-sm font-mono font-bold text-slate-500 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">{date}</h3>
                  
                  {/* Stress Assessments for this Date */}
                  <div className="space-y-4">
                    {dayScores.map(score => {
                      const testQuestions = ASSESSMENTS_DATA["STRESS"];
                      const classification = getScoreInterpretation('STRESS', Number(score.score));
                      const severityClass = getSeverityTag(classification?.severity);

                      const legendOptions = testQuestions && testQuestions[0] && testQuestions[0].options 
                        ? testQuestions[0].options.join(' • ') 
                        : null;

                      return (
                        <div key={score.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                          {/* Card Header */}
                          <div 
                            onClick={() => toggleScreening(score.id)}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-base tracking-tight">Perceived Stress Scale (PSS)</h4>
                              
                              <div className="flex flex-col xl:flex-row xl:items-center gap-2 mt-2">
                                {classification && (
                                  <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${severityClass}`}>
                                    {classification.severity}
                                  </span>
                                )}
                                
                                {legendOptions && (
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest hidden xl:inline-block truncate" title={legendOptions}>
                                    <span className="mr-3 text-slate-300">|</span> 
                                    SCALE: {legendOptions}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-sm font-mono font-bold rounded-md">
                                Score: {score.score} / {score.max_score || 15}
                              </span>
                              <span className="text-slate-400 font-mono text-xs font-bold">
                                {expandedScreeningId === score.id ? '[ COLLAPSE ]' : '[ EXPAND ]'}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Answers */}
                          {expandedScreeningId === score.id && (
                            <div className="p-5 bg-slate-50 border-t border-slate-200">
                              {score.answers ? (
                                <>
                                  <div className="mb-4 pb-2 border-b border-slate-200">
                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed Item Responses</h5>
                                  </div>
                                  <div className="space-y-2">
                                    {Object.entries(
                                      typeof score.answers === 'string' ? JSON.parse(score.answers) : score.answers
                                    ).map(([key, value], index) => {
                                      const questionData = testQuestions ? testQuestions[key] : null;
                                      const questionText = questionData ? questionData.question : `Item ${Number(key) + 1}`;
                                      
                                      let answerText = value;
                                      if (questionData && questionData.options) {
                                        if (questionData.options[value] !== undefined) {
                                          answerText = questionData.options[value];
                                        } else if (questionData.options[value - 1] !== undefined) {
                                          answerText = questionData.options[value - 1];
                                        }
                                      }

                                      return (
                                        <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm bg-white p-3 rounded-md border border-slate-200 shadow-sm gap-2 sm:gap-4">
                                          <span className="font-medium text-slate-700 flex-1">{index + 1}. {questionText}</span>
                                          <span className="text-slate-900 font-bold text-right bg-slate-100 px-3 py-1 rounded-md w-full sm:w-auto text-xs uppercase tracking-wider">
                                            {answerText}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-slate-400 italic text-center py-4 font-medium">
                                  Line-item data unavailable for legacy records.
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
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-500 font-medium">No diagnostic screenings logged.</p>
              </div>
            ) : (
              Object.entries(groupedScreenings).map(([date, dayScreenings]) => (
                <div key={date} className="mb-6">
                  {/* Date Header */}
                  <h3 className="text-sm font-mono font-bold text-slate-500 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">{date}</h3>
                  
                  {/* Screenings for this Date */}
                  <div className="space-y-4">
                    {dayScreenings.map(screening => {
                      const testKey = screening.screening_type.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                      const testQuestions = ASSESSMENTS_DATA[testKey];
                      const classification = getScoreInterpretation(screening.screening_type, Number(screening.score));
                      const severityClass = getSeverityTag(classification?.severity);

                      const legendOptions = testQuestions && testQuestions[0] && testQuestions[0].options 
                        ? (testKey === 'NSSI' ? 'Options vary by question' : testQuestions[0].options.join(' • ')) 
                        : null;

                      return (
                        <div key={screening.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                          {/* Card Header */}
                          <div 
                            onClick={() => toggleScreening(screening.id)}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-base tracking-tight">{screening.screening_type}</h4>
                              
                              <div className="flex flex-col xl:flex-row xl:items-center gap-2 mt-2">
                                {classification && (
                                  <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${severityClass}`}>
                                    {classification.severity}
                                  </span>
                                )}
                                
                                {legendOptions && (
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest hidden xl:inline-block truncate" title={legendOptions}>
                                    <span className="mr-3 text-slate-300">|</span> 
                                    SCALE: {legendOptions}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-sm font-mono font-bold rounded-md">
                                Score: {screening.score}
                              </span>
                              <span className="text-slate-400 font-mono text-xs font-bold">
                                {expandedScreeningId === screening.id ? '[ COLLAPSE ]' : '[ EXPAND ]'}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Answers */}
                          {expandedScreeningId === screening.id && screening.answers && (
                            <div className="p-5 bg-slate-50 border-t border-slate-200">
                              <div className="mb-4 pb-2 border-b border-slate-200">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed Item Responses</h5>
                              </div>
                              <div className="space-y-2">
                                {Object.entries(
                                  typeof screening.answers === 'string' ? JSON.parse(screening.answers) : screening.answers
                                ).map(([key, value], index) => {
                                  const questionData = testQuestions ? testQuestions[key] : null;
                                  const questionText = questionData ? questionData.question : `Item ${Number(key) + 1}`;
                                  
                                  let answerText = value; 
                                  if (questionData && questionData.options) {
                                    if (questionData.options[value] !== undefined) {
                                      answerText = questionData.options[value];
                                    } else if (questionData.options[value - 1] !== undefined) {
                                      answerText = questionData.options[value - 1];
                                    }
                                  }

                                  return (
                                    <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm bg-white p-3 rounded-md border border-slate-200 shadow-sm gap-2 sm:gap-4">
                                      <span className="font-medium text-slate-700 flex-1">{index + 1}. {questionText}</span>
                                      <span className="text-slate-900 font-bold text-right bg-slate-100 px-3 py-1 rounded-md w-full sm:w-auto text-xs uppercase tracking-wider">
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
