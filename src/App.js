// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Billpay from './pages/Billpay';
import MoneyMover from './pages/MoneyMover';
import Login from './pages/Login';
import Signup from './components/Signup';
import SignupVerification from './components/SignupVerification';
import OnboardingVerification from './components/OnboardingVerification';
import Dashboard from './pages/Dashboard.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms';
import Fees from './pages/Fees';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/billpay" element={<Billpay />} />
            <Route path="/moneymover" element={<MoneyMover />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<SignupVerification />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/fees" element={<Fees />} />
            
            {/* Onboarding Routes */}
            <Route path="/onboarding/verify" element={
              <ProtectedRoute>
                <OnboardingVerification />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;