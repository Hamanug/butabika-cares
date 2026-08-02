import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import CognitiveReframing from './pages/CognitiveReframing';
import SleepHygiene from './pages/SleepHygiene';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RoleRoute from './components/RoleRoute';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/therapist/auth" element={<TherapistAuth />} />
              <Route path="/admin/login" element={<AdminAuth />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/therapists" element={<Therapists />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/screenings"
                element={
                  <ProtectedRoute>
                    <Screenings />
                  </ProtectedRoute>
                }
              />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/cognitive-reframing" element={<CognitiveReframing />} />
              <Route path="/sleep-hygiene" element={<SleepHygiene />} />
              <Route
                path="/therapist/dashboard"
                element={
                  <RoleRoute allowedRole="therapist" redirectTo="/therapist/auth">
                    <TherapistDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
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
