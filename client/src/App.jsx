import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/Dashboard';
import ResumeUpload from './pages/candidate/ResumeUpload';
import JobBrowse from './pages/candidate/JobBrowse';
import TestRunner from './pages/candidate/TestRunner';
import Applications from './pages/candidate/Applications';
import ChatWidget from './pages/candidate/ChatWidget';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import JobForm from './pages/recruiter/JobForm';
import ApplicantList from './pages/recruiter/ApplicantList';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';



function MainApp() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Candidate Protected Routes */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/resume"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <ResumeUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <JobBrowse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/tests/:testId"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <TestRunner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/chat"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <ChatWidget />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Protected Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/new"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:id"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <ApplicantList />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}
