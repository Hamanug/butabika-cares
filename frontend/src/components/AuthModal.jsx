import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { setUser } = useAuth();
  
  // Patient flow states
  const [patientStep, setPatientStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // Generic states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Reset state when closing
  const handleClose = () => {
    setPatientStep(1);
    setPhone('');
    setOtp('');
    setError('');
    onClose();
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^0-9+]/g, '');
    setPhone(val);
    setError('');
  };

  // Helper to visually format it for the user before hitting API (optional, but matching backend rules loosely)
  // For the prompt: "Ensure the frontend confirmation modal displays this corrected 256... format before triggering the API."
  const formatPhoneClient = (rawPhone) => {
    let cleaned = rawPhone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+256')) return cleaned.slice(1);
    if (cleaned.startsWith('07')) return '256' + cleaned.slice(1);
    if (cleaned.startsWith('7')) return '256' + cleaned;
    if (cleaned.startsWith('256')) return cleaned;
    return cleaned.replace(/\+/g, '');
  };

  const formattedPhone = formatPhoneClient(phone);

  const handlePatientContinue = (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter a valid phone number');
      return;
    }
    setPatientStep(2);
  };

  const handlePatientSendCode = async () => {
    setLoading(true);
    setError('');
    try {
      // Backend formatPhone will also run on this, but we send the client-formatted one just in case
      await axios.post('/api/auth/patient/send-otp', { phone_number: formattedPhone });
      setPatientStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/patient/verify-otp', {
        phone_number: formattedPhone,
        otp_code: otp,
      });
      setUser(res.data.user);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-800">Patient Sign In / Sign Up</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            {patientStep === 1 && (
              <form onSubmit={handlePatientContinue} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="256700000000"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-shadow"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Continue with Phone
                </button>
              </form>
            )}

            {patientStep === 2 && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-600 text-sm mb-2">
                    We will send a 6-digit verification code to
                  </p>
                  <p className="font-semibold text-gray-900 text-lg tracking-wide">{formattedPhone}</p>
                  <p className="text-gray-600 text-sm mt-2">Is this correct?</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setPatientStep(1)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Edit Number
                  </button>
                  <button
                    onClick={handlePatientSendCode}
                    disabled={loading}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Send Code'
                    )}
                  </button>
                </div>
              </div>
            )}

            {patientStep === 3 && (
              <form onSubmit={handlePatientVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter 6-digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-shadow text-center text-xl tracking-[0.5em] font-mono"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
