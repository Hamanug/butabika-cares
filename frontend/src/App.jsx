import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import TherapistDashboard from './pages/TherapistDashboard';
import Auth from './pages/Auth';

import TherapistAuth from './pages/TherapistAuth';
import AdminAuth from './pages/admin/AdminAuth.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import About from './pages/About';
import Resources from './pages/Resources';
import Therapists from './pages/Therapists';
import Dashboard from './pages/Dashboard';
import Screenings from './pages/Screenings';
import Exercises from './pages/Exercises';
import Journal from './pages/Journal';
import PatientProfile from './pages/PatientProfile';
import TherapistProfile from './pages/TherapistProfile';
import Messages from './pages/Messages';
import CognitiveReframing from './pages/CognitiveReframing';
import SleepHygiene from './pages/SleepHygiene';
import StressManagement from './pages/StressManagement';
import MindfulnessHub from './pages/MindfulnessHub';
import Grounding from './pages/Grounding';
import BodyScan from './pages/BodyScan';
import PatientNotes from './pages/PatientNotes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RoleRoute from './components/RoleRoute';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const StrictRoleGuard = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role === 'therapist') {
    return <Navigate replace to="/therapist/dashboard" />;
  }
  if (user && user.role === 'admin') {
    return <Navigate replace to="/admin/dashboard" />;
  }
  return children;
};

const ProfileRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'therapist') {
    return <TherapistProfile />;
  }
  return <PatientProfile />;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50">
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#334155', color: '#fff', borderRadius: '12px' } }} />
            <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<StrictRoleGuard><Home /></StrictRoleGuard>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/therapist/auth" element={<TherapistAuth />} />
              <Route path="/admin/login" element={<AdminAuth />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/about" element={<StrictRoleGuard><About /></StrictRoleGuard>} />
              <Route path="/resources" element={<StrictRoleGuard><Resources /></StrictRoleGuard>} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/therapists" element={<StrictRoleGuard><Therapists /></StrictRoleGuard>} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/screenings" element={<Screenings />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/breathing" element={<Exercises />} />
              <Route path="/cognitive-reframing" element={<CognitiveReframing />} />
              <Route path="/sleep-hygiene" element={<SleepHygiene />} />
              <Route path="/stress-management" element={<StressManagement />} />
              <Route path="/mindfulness" element={<MindfulnessHub />} />
              <Route path="/grounding" element={<Grounding />} />
              <Route path="/body-scan" element={<BodyScan />} />
              <Route
                path="/therapist/dashboard"
                element={
                  <RoleRoute allowedRole="therapist" redirectTo="/therapist/auth">
                    <TherapistDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/therapist/patient/:patientId"
                element={
                  <RoleRoute allowedRole="therapist" redirectTo="/therapist/auth">
                    <PatientNotes />
                  </RoleRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileRouter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
