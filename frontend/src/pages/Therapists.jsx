import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, User, Loader2 } from 'lucide-react';
// Import your Navbar and Footer if necessary

export default function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/therapists/active');
        setTherapists(response.data);
      } catch (error) {
        console.error('Failed to fetch therapists', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container max-w-4xl mx-auto px-4">
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Our Therapists</h1>
          <p className="text-slate-600">Browse our mental health professionals and request a therapy session.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : therapists.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No Therapists Available</h3>
            <p className="text-slate-500 mt-1">We are currently onboarding new professionals. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {therapists.map(therapist => (
              <div key={therapist.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md">
                
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {therapist.profile_picture ? (
                    <img src={therapist.profile_picture} alt="Profile" className="h-16 w-16 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xl border border-orange-200">
                      {getInitials(therapist.first_name, therapist.last_name)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {therapist.first_name} {therapist.last_name}
                      </h2>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <BookOpen className="h-4 w-4 mr-1 text-slate-400" />
                        {therapist.occupation || 'Licensed Therapist'}
                      </div>
                    </div>
                    <span className="hidden md:inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                      Available
                    </span>
                  </div>
                  
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100 whitespace-pre-wrap">
                    {therapist.bio || 'Professional credentials and specialization details.'}
                  </div>

                  <div className="mt-6">
                    <button 
                      onClick={() => alert(`Booking flow for ${therapist.first_name} will launch here.`)}
                      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      Request Session
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
