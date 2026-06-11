import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PatientLayout from './components/layout/PatientLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import SymptomCheck from './pages/patient/SymptomCheck';
import HospitalSuggestions from './pages/patient/HospitalSuggestions';
import FamilyProfiles from './pages/patient/FamilyProfiles';
import MedicalHistory from './pages/patient/MedicalHistory';
import Alerts from './pages/patient/Alerts';
import Feedback from './pages/patient/Feedback';
import Profile from './pages/patient/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import LiveQueue from './pages/admin/LiveQueue';
import PatientDetails from './pages/admin/PatientDetails';
import AdminAlerts from './pages/admin/AdminAlerts';
import SOSRequests from './pages/admin/SOSRequests';
import HospitalProfile from './pages/admin/HospitalProfile';
// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Patient Routes */}
        <Route path="/patient" element={<ProtectedRoute allowedRole="PATIENT"><PatientLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="symptoms" element={<SymptomCheck />} />
          <Route path="hospitals" element={<HospitalSuggestions />} />
          <Route path="family" element={<FamilyProfiles />} />
          <Route path="history" element={<MedicalHistory />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="queue" element={<LiveQueue />} />
          <Route path="queue/:caseId" element={<PatientDetails />} />
          <Route path="sos" element={<SOSRequests />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="profile" element={<HospitalProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
