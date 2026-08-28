import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, User, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPatientName } from '../utils/formatters';

export default function SessionHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/my-sessions`, { withCredentials: true });
        setSessions(res.data.filter(s => s.status === 'completed'));
      } catch (err) {
        console.error('Failed to fetch session history', err);
      }
    };
    fetchHistory();
  }, []);

  const filteredSessions = sessions.filter(s => {
    const first = (s.other_first || '').toLowerCase();
    const last = (s.other_last || '').toLowerCase();
    const displayId = (s.other_display_id || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return first.includes(term) || last.includes(term) || displayId.includes(term);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white pt-32 pb-20">
      <div className="container max-w-5xl mx-auto px-4">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/therapist/dashboard')} className="text-sm text-slate-500 hover:text-slate-800 mb-2 flex items-center transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-medium text-slate-900">Complete Session History</h1>
            <p className="text-slate-600 mt-1">Review your past completed sessions and patient records.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <label htmlFor="perPage">Show:</label>
              <select
                id="perPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-slate-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-warm-500 focus:border-warm-500 text-sm bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="p-5">
            {currentItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                <Clock className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">No sessions found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentItems.map(session => (
                  <div 
                    key={session.id}
                    onClick={() => navigate(`/therapist/patient/${session.patient_id}`)}
                    className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-900">
                          {formatPatientName({ first_name: session.other_first, last_name: session.other_last, display_id: session.other_display_id })}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {session.appointment_date?.split('T')[0]} at {session.time || session.appointment_time}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 mr-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration_minutes ? `${session.duration_minutes} mins` : 'Duration unavailable'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-600 font-medium">
              Showing {filteredSessions.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredSessions.length)} of {filteredSessions.length} results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={indexOfLastItem >= filteredSessions.length}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
