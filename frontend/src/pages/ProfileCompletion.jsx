import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Loader2, Search, Check, ChevronDown } from 'lucide-react';

// Exhaustive global countries list
const GLOBAL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function ProfileCompletion() {
  const [gender, setGender] = useState('');
  const [nationalityType, setNationalityType] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  
  // Custom Dropdown States
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const genderRef = useRef(null);
  const nationalityRef = useRef(null);
  const searchRef = useRef(null);

  // Click outside handler to close custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderRef.current && !genderRef.current.contains(event.target)) setIsGenderOpen(false);
      if (nationalityRef.current && !nationalityRef.current.contains(event.target)) setIsNationalityOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchQuery(''); // Keeps it open but clears search context if needed, handled separately below
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = GLOBAL_COUNTRIES.filter(country => 
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalNationality = nationalityType === 'Other' ? customCountry : nationalityType;

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/profile/complete`, { 
        gender, 
        nationality: finalNationality 
      }, { withCredentials: true });
      
      window.location.href = '/dashboard'; 
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isFormValid = gender && (nationalityType === 'Ugandan' || (nationalityType === 'Other' && customCountry));

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 max-w-md w-full p-8 animate-fade-in-up transition-all">
        
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
          <ShieldAlert className="w-7 h-7 text-amber-500"/>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Update Required</h2>
        <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
          To provide the best clinical care, we have updated our platform requirements. Please complete your profile to continue to your dashboard.
        </p>
        
        <div className="space-y-6">
          {/* Custom Gender Dropdown */}
          <div ref={genderRef} className="relative">
            <label className="block text-sm font-bold text-slate-900 mb-2">Gender Identity</label>
            <div 
              onClick={() => setIsGenderOpen(!isGenderOpen)}
              className={`w-full h-14 px-4 flex items-center justify-between bg-slate-50 border-2 rounded-xl cursor-pointer transition-all ${isGenderOpen ? 'border-[#0F766E] bg-white ring-4 ring-[#0F766E]/10' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <span className={`font-semibold ${gender ? 'text-slate-800' : 'text-slate-400'}`}>
                {gender || 'Select gender...'}
              </span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isGenderOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isGenderOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                {['Male', 'Female'].map((option) => (
                  <div 
                    key={option}
                    onClick={() => { setGender(option); setIsGenderOpen(false); }}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span className={`font-semibold ${gender === option ? 'text-[#0F766E]' : 'text-slate-600'}`}>{option}</span>
                    {gender === option && <Check className="w-5 h-5 text-[#0F766E]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Primary Nationality Dropdown */}
          <div ref={nationalityRef} className="relative">
            <label className="block text-sm font-bold text-slate-900 mb-2">Nationality</label>
            <div 
              onClick={() => setIsNationalityOpen(!isNationalityOpen)}
              className={`w-full h-14 px-4 flex items-center justify-between bg-slate-50 border-2 rounded-xl cursor-pointer transition-all ${isNationalityOpen ? 'border-[#0F766E] bg-white ring-4 ring-[#0F766E]/10' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <span className={`font-semibold ${nationalityType ? 'text-slate-800' : 'text-slate-400'}`}>
                {nationalityType || 'Select primary origin...'}
              </span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isNationalityOpen ? 'rotate-180' : ''}`} />
            </div>

            {isNationalityOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                {['Ugandan', 'Other'].map((option) => (
                  <div 
                    key={option}
                    onClick={() => { 
                      setNationalityType(option); 
                      if (option !== 'Other') setCustomCountry('');
                      setIsNationalityOpen(false); 
                    }}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span className={`font-semibold ${nationalityType === option ? 'text-[#0F766E]' : 'text-slate-600'}`}>{option}</span>
                    {nationalityType === option && <Check className="w-5 h-5 text-[#0F766E]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conditional Smart Search Dropdown (for 'Other') */}
          {nationalityType === 'Other' && (
            <div ref={searchRef} className="relative animate-in slide-in-from-top-2 fade-in duration-200">
              <label className="block text-sm font-bold text-slate-900 mb-2">Search Global Regions</label>
              <div className="relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type a country name..."
                  value={customCountry && !searchQuery ? customCountry : searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCustomCountry(''); // Reset selection while typing
                  }}
                  className="w-full h-14 pl-12 pr-4 bg-white border-2 border-[#0F766E] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 font-semibold text-slate-800 shadow-sm transition-all"
                />
              </div>

              {/* Floating Autocomplete Results */}
              {searchQuery && !customCountry && (
                <div className="absolute z-30 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <div
                        key={country}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents input onBlur race condition
                          setCustomCountry(country);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between px-4 py-3 hover:bg-[#0F766E]/5 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <span className="font-semibold text-slate-700">{country}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm font-medium text-slate-400 text-center">
                      No countries found.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isSubmitting} 
            className="w-full bg-slate-900 hover:bg-slate-950 text-white h-14 rounded-xl font-black text-[15px] transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:bg-slate-900 mt-8 shadow-lg shadow-slate-900/10 active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin"/> : 'Secure Profile & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
