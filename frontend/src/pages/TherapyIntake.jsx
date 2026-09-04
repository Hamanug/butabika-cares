import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, CheckCircle2, User, Clock, PhoneCall, Users, Laptop, Activity } from 'lucide-react';
import { formatUserName } from '../utils/formatters';

// --- CONSTANTS & CLINICAL DATA ---

const FOCUS_OPTIONS = [
  'Stress Issues', 'Relationship Problems', 'Grief & Loss', 'Family Conflicts', 
  'Anxiety', 'Anger Issues', 'Financial Challenges', 'Addiction & Related Challenges', 
  'Mood Related Problems(depression, bipolar disorders, self esteem)', 
  'Psychosis/ Psychotic problems', 'Trauma Related problems(PTSD, Acute stress, prolonged grief etc)', 
  'Repetitive thoughts and Behaviours', 'Other'
];

const ADULT_DSM = [
  "Little interest or pleasure in doing things?", "Feeling down, depressed, or hopeless?",
  "Feeling more irritated, grouchy, or angry than usual?", "Sleeping less than usual, but still have a lot of energy?",
  "Starting lots more projects than usual or doing more risky things than usual?",
  "Feeling nervous, anxious, frightened, worried, or on edge?", "Feeling panic or being frightened?",
  "Avoiding situations that make you anxious?", "Unexplained aches and pains (e.g., head, back, joints, abdomen, legs)?",
  "Feeling that your illnesses are not being taken seriously enough?", "Thoughts of actually hurting yourself?",
  "Hearing things other people couldn't hear, such as voices even when no one was around?",
  "Feeling that someone could hear your thoughts, or that you could hear what another person was thinking?",
  "Problems with sleep that affected your sleep quality over all?",
  "Problems with memory (e.g., learning new information) or with location (e.g., finding your way home)?",
  "Unpleasant thoughts, urges, or images that repeatedly enter your mind?",
  "Feeling driven to perform certain behaviors or mental acts over and over again?",
  "Feeling detached or distant from yourself, your body, your physical surroundings, or your memories?",
  "Not knowing who you really are or what you want out of life?",
  "Not feeling close to other people or enjoying your relationships with them?",
  "Drinking at least 4 drinks of any kind of alcohol in a single day?",
  "Smoking any cigarettes, a cigar, or pipe, or using snuff or chewing tobacco?",
  "Using any medicines ON YOUR OWN (e.g., painkillers, stimulants, sedatives, marijuana, cocaine, etc.)?"
];

const CHILD_DSM = [
  "Been bothered by stomachaches, headaches, or other aches and pains?", "Worried about your health or about getting sick?",
  "Been bothered by not being able to fall asleep or stay asleep, or by waking up too early?",
  "Been bothered by not being able to pay attention when you were in class or doing homework or reading a book or playing a game?",
  "Had less fun doing things than you used to?", "Felt sad or depressed for several hours?",
  "Felt more irritated or easily annoyed than usual?", "Felt angry or lost your temper?",
  "Started lots more projects than usual or done more risky things than usual?", "Slept less than usual but still had a lot of energy?",
  "Felt nervous, anxious, or scared?", "Not been able to stop worrying?",
  "Not been able to do things you wanted to or should have done, because they made you feel nervous?",
  "Heard voices—when there was no one there—speaking about you or telling you what to do or saying bad things to you?",
  "Had visions when you were completely awake—that is, seen something or someone that no one else could see?",
  "Had thoughts that kept coming into your mind that you would do something bad or that something bad would happen to you or to someone else?",
  "Felt the need to check on certain things over and over again, like whether a door was locked or whether the stove was turned off?",
  "Worried a lot about things you touched being dirty or having germs or being poisoned?",
  "Felt you had to do things in a certain way, like counting or saying special things, to keep something bad from happening?",
  "Had an alcoholic beverage (beer, wine, liquor, etc.)?", "Smoked a cigarette, a cigar, or pipe, or used snuff or chewing tobacco?",
  "Used drugs like marijuana, cocaine, club drugs, hallucinogens, heroin, inhalants, or methamphetamine?",
  "Used any medicine without a doctor's prescription to get high or change the way you feel?",
  "In the last 2 weeks, have you thought about killing yourself or committing suicide?",
  "Have you EVER tried to kill yourself?"
];

export default function TherapyIntake() {
  const navigate = useNavigate();
  // Lazy initialize from sessionStorage or fallback to defaults
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('therapy_intake_step');
    return saved ? JSON.parse(saved) : 1;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('therapy_intake_data');
    return saved ? JSON.parse(saved) : {
      therapy_type: '',
      primary_focus: '',
      relationship_status: '',
      gender_preference: 'No Preference',
      mandatory_notes: '',
      therapist_id: null,
      requested_date: '',
      requested_time_block: '',
      partner_ids: '',
      group_member_ids: '',
      device_count: 1,
      child_name: '',
      child_age: '',
      dsm_5_assessment: {}
    };
  });

  // Sync to storage on every change
  useEffect(() => {
    sessionStorage.setItem('therapy_intake_step', JSON.stringify(step));
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem('therapy_intake_data', JSON.stringify(formData));
  }, [formData]);

  const [therapists, setTherapists] = useState([]);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
  const [selectedTherapistForModal, setSelectedTherapistForModal] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  // Dynamic Step Routing
  const handleNext = (immediateType = null) => {
    const activeType = immediateType || formData.therapy_type;
    if (step === 1 && activeType === 'Individual') setStep(3); // Skip config for individuals
    else setStep(prev => prev + 1);
  };
  
  const handlePrev = () => {
    if (step === 3 && formData.therapy_type === 'Individual') setStep(1);
    else setStep(prev => prev - 1);
  };

  // Fetch Therapists on Match Step
  useEffect(() => {
    if (step === 7 && therapists.length === 0) {
      setIsLoadingTherapists(true);
      axios.get(`${import.meta.env.VITE_API_URL}/api/therapists/active`)
        .then(res => setTherapists(res.data))
        .catch(err => console.error(err))
        .finally(() => setIsLoadingTherapists(false));
    }
  }, [step]);

  useEffect(() => {
    if (selectedTherapistForModal && formData.requested_date) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/booked-times`, {
        params: { therapist_id: selectedTherapistForModal.id, date: formData.requested_date },
        withCredentials: true
      }).then(res => setBookedSlots(res.data)).catch(() => setBookedSlots([]));
    }
  }, [selectedTherapistForModal, formData.requested_date]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Sanitizer: keeps only numbers and hyphens (removes "Patient ", spaces, etc.)
      const sanitizeId = (id) => id.replace(/[^0-9-]/g, '');
      
      const payload = {
        ...formData,
        partner_ids: formData.partner_ids 
          ? formData.partner_ids.split(',').map(sanitizeId).filter(Boolean) 
          : [],
        group_member_ids: formData.group_member_ids 
          ? formData.group_member_ids.split(',').map(sanitizeId).filter(Boolean) 
          : []
      };
      
      await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/concierge-intake`, payload, { withCredentials: true });
      setSelectedTherapistForModal(null);
      setStep(8);
      sessionStorage.removeItem('therapy_intake_step');
      sessionStorage.removeItem('therapy_intake_data');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const OptionBtn = ({ label, isSelected, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-lg transition-all border-2 mb-3 ${
        isSelected ? 'border-[#0F766E] bg-teal-50 text-[#0F766E] shadow-sm ring-4 ring-[#0F766E]/10' : 'border-slate-200 bg-white text-slate-700 hover:border-[#0F766E]/40 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );

  // DSM-5 Assessment Renderer
  // Upgraded DSM-5 Micro-Stepper
  const AssessmentRenderer = ({ isChild }) => {
    const questions = isChild ? CHILD_DSM : ADULT_DSM;
    const [currentQ, setCurrentQ] = useState(0);
    const isComplete = questions.every((_, i) => formData.dsm_5_assessment[i] !== undefined);

    const handleAnswer = (val) => {
      updateForm('dsm_5_assessment', { ...formData.dsm_5_assessment, [currentQ]: val });
      // Auto-advance with a slight delay for visual feedback
      if (currentQ < questions.length - 1) {
        setTimeout(() => setCurrentQ(prev => prev + 1), 250);
      }
    };

    const progressPercent = ((currentQ + 1) / questions.length) * 100;
    const isYesNo = isChild && currentQ >= 19;

    return (
      <div className="w-full h-full flex flex-col animate-in fade-in duration-300">
        <div className="bg-[#0F766E] p-6 rounded-3xl text-white mb-6 shadow-lg flex items-start gap-4 shrink-0">
          <Activity className="w-10 h-10 shrink-0" />
          <div>
            <h2 className="text-2xl font-black mb-2">Clinical Assessment (DSM-5-TR)</h2>
            <p className="text-teal-50 text-sm font-medium leading-relaxed">
              Question {currentQ + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden shrink-0">
          <div className="bg-[#0F766E] h-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
        </div>

        {/* Active Question Card */}
        <div className="flex-1 flex flex-col justify-center mb-6">
          <div key={currentQ} className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-100 shadow-sm animate-in slide-in-from-right-4 fade-in duration-300">
            <p className="font-black text-xl text-slate-900 mb-8 leading-relaxed">
              {currentQ + 1}. {questions[currentQ]}
            </p>
            <div className="flex flex-wrap gap-3">
              {isYesNo ? (
                ['Yes', 'No'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`flex-1 py-4 px-4 rounded-2xl font-black text-lg border-2 transition-all active:scale-95 ${
                      formData.dsm_5_assessment[currentQ] === opt ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#0F766E]/50'
                    }`}
                  >{opt}</button>
                ))
              ) : (
                [{val: 0, l: 'None'}, {val: 1, l: 'Slight'}, {val: 2, l: 'Mild'}, {val: 3, l: 'Moderate'}, {val: 4, l: 'Severe'}].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => handleAnswer(opt.val)}
                    className={`flex-1 min-w-[80px] py-4 px-2 rounded-2xl font-black text-lg border-2 transition-all flex flex-col items-center justify-center active:scale-95 ${
                      formData.dsm_5_assessment[currentQ] === opt.val ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-md scale-105' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#0F766E]/50 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{opt.val}</span>
                    <span className="text-xs uppercase tracking-widest opacity-80">{opt.l}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Micro-Stepper Controls */}
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} 
            disabled={currentQ === 0}
            className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-6 h-6"/>
          </button>
          
          {currentQ === questions.length - 1 ? (
            <button onClick={handleNext} disabled={!isComplete} className="flex-1 bg-slate-900 text-white h-14 rounded-xl font-black text-lg disabled:opacity-50 transition-all shadow-md active:scale-95">
              Complete Assessment
            </button>
          ) : (
            <button 
              onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex-1 bg-white border-2 border-slate-200 text-slate-700 h-14 rounded-xl font-bold text-lg hover:border-[#0F766E] transition-all"
            >
              Skip / Next
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sticky top-0 z-10 shrink-0">
        {step < 8 && (
          <button 
            onClick={() => step === 1 ? navigate(-1) : handlePrev()} 
            className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6"/>
          </button>
        )}
        <div className="flex-1 flex justify-center">
          {step < 8 && (
            <div className="flex items-center gap-1">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-6 bg-[#0F766E]' : 'w-2 bg-slate-200'}`} />
              ))}
            </div>
          )}
        </div>
        <div className="w-10" />
      </div>

      <div className={`flex-1 flex flex-col ${step === 7 || step === 4 ? 'items-stretch max-w-5xl mx-auto w-full' : 'items-center justify-center'} p-4`}>
        <div className={`w-full h-full flex flex-col ${step === 7 || step === 4 ? '' : 'max-w-lg bg-white sm:shadow-2xl sm:border border-slate-100 rounded-[2rem] p-6 sm:p-10'} animate-fade-in-up`}>
          
          {/* STEP 1: TYPE */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">What type of therapy are you looking for?</h2>
              <OptionBtn isSelected={formData.therapy_type === 'Individual'} label="Individual (for myself)" onClick={() => { updateForm('therapy_type', 'Individual'); handleNext('Individual'); }} />
              <OptionBtn isSelected={formData.therapy_type === 'Couples'} label="Couples (marriage) therapy or dating" onClick={() => { updateForm('therapy_type', 'Couples'); handleNext('Couples'); }} />
              <OptionBtn isSelected={formData.therapy_type === 'Child'} label="Child and adolescent therapy (Age 11-17)" onClick={() => { updateForm('therapy_type', 'Child'); handleNext('Child'); }} />
              <OptionBtn isSelected={formData.therapy_type === 'Group'} label="Group therapy" onClick={() => { updateForm('therapy_type', 'Group'); handleNext('Group'); }} />
            </div>
          )}

          {/* STEP 2: DYNAMIC CONFIGURATION */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              {formData.therapy_type === 'Couples' && (
                <>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Couples Configuration</h2>
                  <p className="text-slate-500 mb-6 font-medium">How will you and your partner connect?</p>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Device Setup</label>
                  <div className="flex gap-4 mb-6">
                    <button onClick={() => updateForm('device_count', 1)} className={`flex-1 p-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 ${formData.device_count === 1 ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-200 text-slate-600'}`}><Laptop className="w-6 h-6"/> Same Device</button>
                    <button onClick={() => updateForm('device_count', 2)} className={`flex-1 p-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 ${formData.device_count === 2 ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-200 text-slate-600'}`}><Users className="w-6 h-6"/> Multiple Devices</button>
                  </div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Partner's Platform ID (Optional)</label>
                  <input type="text" placeholder="e.g. 1049-0626" value={formData.partner_ids} onChange={(e) => updateForm('partner_ids', e.target.value)} className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl focus:border-[#0F766E] focus:outline-none font-medium mb-8"/>
                  <button onClick={handleNext} className="w-full bg-[#0F766E] text-white h-14 rounded-xl font-bold text-lg">Continue</button>
                </>
              )}
              
              {formData.therapy_type === 'Group' && (
                <>
                  <h2 className="text-3xl font-black text-slate-900 mb-6">Group Configuration</h2>
                  <label className="block text-sm font-bold text-slate-700 mb-3">How many devices will be connecting?</label>
                  <div className="flex gap-2 mb-6">
                    {[1,2,3,4,5].map(num => (
                      <button key={num} onClick={() => updateForm('device_count', num)} className={`flex-1 h-14 rounded-xl border-2 font-bold text-lg ${formData.device_count === num ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-200 text-slate-600'}`}>{num}</button>
                    ))}
                  </div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Member Platform IDs (Comma separated)</label>
                  <textarea placeholder="1049-0626, 4921-8832" value={formData.group_member_ids} onChange={(e) => updateForm('group_member_ids', e.target.value)} className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-[#0F766E] focus:outline-none font-medium mb-8 resize-none h-24"/>
                  <button onClick={handleNext} className="w-full bg-[#0F766E] text-white h-14 rounded-xl font-bold text-lg">Continue</button>
                </>
              )}

              {formData.therapy_type === 'Child' && (
                <>
                  <h2 className="text-3xl font-black text-slate-900 mb-6">Child Details & Consent</h2>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Child's Name</label>
                  <input type="text" value={formData.child_name} onChange={(e) => updateForm('child_name', e.target.value)} className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl focus:border-[#0F766E] focus:outline-none font-medium mb-4"/>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Child's Age (11-17)</label>
                  <select value={formData.child_age} onChange={(e) => updateForm('child_age', e.target.value)} className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl focus:border-[#0F766E] focus:outline-none font-medium mb-8 bg-white">
                    <option value="">Select Age...</option>
                    {[11,12,13,14,15,16,17].map(age => <option key={age} value={age}>{age} years old</option>)}
                  </select>
                  <button onClick={handleNext} disabled={!formData.child_name || !formData.child_age} className="w-full bg-[#0F766E] text-white h-14 rounded-xl font-bold text-lg disabled:opacity-50">Acknowledge & Continue</button>
                </>
              )}
            </div>
          )}

          {/* STEP 3: FOCUS */}
          {step === 3 && (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">What help are you trying to get?</h2>
              <p className="text-sm text-slate-500 mb-6 font-medium">Select the primary focus for your session.</p>
              <div className="overflow-y-auto max-h-[50vh] pr-2 pb-4 space-y-3 custom-scrollbar">
                {FOCUS_OPTIONS.map(focus => (
                  <OptionBtn isSelected={formData.primary_focus === focus} key={focus} label={focus} onClick={() => { updateForm('primary_focus', focus); handleNext(); }} />
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: DSM-5-TR CLINICAL ASSESSMENT */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 h-full">
              <AssessmentRenderer isChild={formData.therapy_type === 'Child'} />
            </div>
          )}

          {/* STEP 5: PREFERENCES */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Do you have a preference for your therapist's gender?</h2>
              <OptionBtn isSelected={formData.gender_preference === 'Male'} label="Male Therapist" onClick={() => { updateForm('gender_preference', 'Male'); handleNext(); }} />
              <OptionBtn isSelected={formData.gender_preference === 'Female'} label="Female Therapist" onClick={() => { updateForm('gender_preference', 'Female'); handleNext(); }} />
              <OptionBtn isSelected={formData.gender_preference === 'No Preference'} label="No Preference" onClick={() => { updateForm('gender_preference', 'No Preference'); handleNext(); }} />
            </div>
          )}

          {/* STEP 6: NOTES */}
          {step === 6 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">What else would you like your therapist to know?</h2>
              <p className="text-sm text-slate-500 mb-4 font-medium">This is securely transmitted to your matched therapist to help them prepare for your session. (Required)</p>
              <textarea 
                required
                value={formData.mandatory_notes}
                onChange={(e) => updateForm('mandatory_notes', e.target.value)}
                className="w-full flex-1 min-h-[200px] p-5 rounded-2xl border-2 border-slate-200 focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10 focus:outline-none text-lg font-medium resize-none bg-slate-50 shadow-inner"
                placeholder="Share a little bit about what you're going through..."
              />
              <button onClick={handleNext} disabled={formData.mandatory_notes.trim().length < 5} className="w-full mt-6 bg-slate-900 hover:bg-slate-950 text-white h-14 rounded-xl font-black text-lg transition-all disabled:opacity-50">
                Find My Therapist
              </button>
            </div>
          )}

          {/* STEP 7: MATCHING (No changes to layout, just logic handled) */}
          {step === 7 && (
            <div className="w-full pb-20 animate-in fade-in">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Your Matches</h2>
                <p className="text-slate-600 font-medium">Based on your clinical needs and preferences, here are your best matches.</p>
              </div>
              {isLoadingTherapists ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#0F766E]"/></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {therapists
                    .filter(t => formData.gender_preference === 'No Preference' || (t.gender && t.gender.toLowerCase() === formData.gender_preference.toLowerCase()))
                    .map(therapist => (
                    <div key={therapist.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col justify-between hover:border-[#0F766E]/30 hover:shadow-[0_8px_30px_rgb(15,118,110,0.1)] transition-all">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0F766E] font-black text-2xl border border-teal-100">
                            {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-slate-900 tracking-tight">{formatUserName(therapist)}</h3>
                            <p className="text-sm font-semibold text-[#0F766E]">{therapist.occupation}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-medium">{therapist.bio}</p>
                      </div>
                      <button onClick={() => { updateForm('therapist_id', therapist.id); setSelectedTherapistForModal(therapist); }} className="w-full bg-slate-900 hover:bg-slate-950 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center shadow-md active:scale-95">
                        <PhoneCall className="w-5 h-5 mr-2"/> Select & Schedule
                      </button>
                    </div>
                  ))}
                  
                  <div className="bg-slate-50 rounded-3xl border-2 border-slate-200 border-dashed p-6 flex flex-col justify-center items-center text-center hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer" onClick={() => { updateForm('therapist_id', null); setSelectedTherapistForModal({ id: 'triage', first_name: 'the Clinical Team' }); }}>
                    <div className="h-16 w-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 mb-4">
                      <User className="w-7 h-7"/>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">Not sure?</h3>
                    <p className="text-sm text-slate-500 mb-6 font-medium px-4">Let our clinical director review your assessment and assign the best fit.</p>
                    <button className="text-[#0F766E] font-black text-sm bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200">Assign for me</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: SUCCESS */}
          {step === 8 && (
            <div className="text-center py-10 animate-fade-in-up bg-white sm:shadow-2xl sm:border border-slate-100 rounded-[2rem] p-6 sm:p-10 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-teal-100 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-[#0F766E]"/>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Session Requested</h2>
              <p className="text-slate-500 font-medium mb-10 text-lg leading-relaxed">
                Your clinical intake and DSM-5-TR psychiatric assessment have been securely transmitted. You will be notified once confirmed.
              </p>
              <button onClick={() => navigate('/dashboard')} className="w-full bg-slate-900 hover:bg-slate-950 text-white h-14 rounded-xl font-black text-lg transition-all shadow-lg">
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scheduling Modal Overlay */}
      {selectedTherapistForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-slate-50 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Schedule with {selectedTherapistForModal.first_name}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Select an available time slot.</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={formData.requested_date}
                onChange={(e) => { updateForm('requested_date', e.target.value); updateForm('requested_time_block', ''); }}
                className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl focus:border-[#0F766E] focus:outline-none text-slate-700 font-bold mb-6 bg-white"
              />
              {formData.requested_date && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Time (EAT)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map((time) => {
                      const isBooked = bookedSlots.includes(`${time}:00`);
                      const now = new Date();
                      const isToday = new Date(formData.requested_date).toDateString() === now.toDateString();
                      const timeHour = parseInt(time.split(':')[0], 10);
                      if (isToday && now.getHours() >= timeHour) return null;
                      return (
                        <button
                          key={time} disabled={isBooked}
                          onClick={() => updateForm('requested_time_block', time)}
                          className={`py-3 text-sm font-black rounded-xl border-2 transition-all ${
                            isBooked ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed line-through' :
                            formData.requested_time_block === time ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-[#0F766E]/50 hover:bg-slate-50'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-5 font-bold flex items-center justify-center bg-slate-50 p-3 rounded-lg"><Clock className="w-4 h-4 mr-2 text-slate-400"/> Clinical hours are 8:00 AM - 4:00 PM (EAT).</p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-white flex gap-3">
              <button onClick={() => { setSelectedTherapistForModal(null); updateForm('requested_date', ''); updateForm('requested_time_block', ''); }} className="flex-1 py-4 text-slate-600 font-bold bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={!formData.requested_date || !formData.requested_time_block || isSubmitting} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-950 flex items-center justify-center disabled:opacity-50 transition-all shadow-md active:scale-95">
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin"/> : 'Confirm Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
