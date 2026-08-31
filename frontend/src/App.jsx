import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import TherapistDashboard from './pages/TherapistDashboard';
import SessionHistory from './pages/SessionHistory';
import Auth from './pages/Auth';
import TherapistAuth from './pages/TherapistAuth';
import AdminAuth from './pages/admin/AdminAuth.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import About from './pages/About';
import Resources from './pages/Resources';
import Therapists from './pages/Therapists';
import Dashboard from './pages/Dashboard';
import Screenings from './pages/Screenings';
import GuidedBreathing from './pages/GuidedBreathing';
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
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Components
import RoleRoute from './components/RoleRoute';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-background text-muted">Loading session...</div>;
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const StrictRoleGuard = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role === 'therapist') return <Navigate replace to="/therapist/dashboard" />;
  if (user && user.role === 'admin') return <Navigate replace to="/admin/dashboard" />;
  return children;
};

const ProfileRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'therapist') return <TherapistProfile />;
  return <PatientProfile />;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1E293B', color: '#fff', borderRadius: '8px' } }} />
          <Routes>
            {/* Isolated Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/auth" element={<Auth />} />
              <Route path="/therapist/auth" element={<TherapistAuth />} />
              <Route path="/admin/login" element={<AdminAuth />} />
            </Route>

            {/* Public Marketing & Info Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<StrictRoleGuard><Home /></StrictRoleGuard>} />
              <Route path="/about" element={<StrictRoleGuard><About /></StrictRoleGuard>} />
              <Route path="/resources" element={<StrictRoleGuard><Resources /></StrictRoleGuard>} />
              <Route path="/therapists" element={<StrictRoleGuard><Therapists /></StrictRoleGuard>} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Route>

            {/* Patient Clinical Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/screenings" element={<ProtectedRoute><Screenings /></ProtectedRoute>} />
              <Route path="/breathing" element={<ProtectedRoute><GuidedBreathing /></ProtectedRoute>} />
              <Route path="/cognitive-reframing" element={<ProtectedRoute><CognitiveReframing /></ProtectedRoute>} />
              <Route path="/sleep-hygiene" element={<ProtectedRoute><SleepHygiene /></ProtectedRoute>} />
              <Route path="/stress-management" element={<ProtectedRoute><StressManagement /></ProtectedRoute>} />
              <Route path="/mindfulness" element={<ProtectedRoute><MindfulnessHub /></ProtectedRoute>} />
              <Route path="/grounding" element={<ProtectedRoute><Grounding /></ProtectedRoute>} />
              <Route path="/body-scan" element={<ProtectedRoute><BodyScan /></ProtectedRoute>} />
              <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileRouter /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            </Route>

            {/* Therapist & Admin Dashboards */}
            <Route element={<DashboardLayout />}>
              <Route path="/therapist/dashboard" element={<RoleRoute allowedRole="therapist" redirectTo="/therapist/auth"><TherapistDashboard /></RoleRoute>} />
              <Route path="/therapist/history" element={<RoleRoute allowedRole="therapist" redirectTo="/therapist/auth"><SessionHistory /></RoleRoute>} />
              <Route path="/therapist/patient/:patientId" element={<RoleRoute allowedRole="therapist" redirectTo="/therapist/auth"><PatientNotes /></RoleRoute>} />
              
              <Route path="/admin/dashboard" element={<RoleRoute allowedRole="admin" redirectTo="/admin/login"><AdminDashboard /></RoleRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
