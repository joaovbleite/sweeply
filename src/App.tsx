import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import ConnectionStatus from '@/components/ConnectionStatus';
import QualityAssurance from '@/components/QualityAssurance';

// Pages
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import AddClient from '@/pages/AddClient';
import EditClient from '@/pages/EditClient';
import Jobs from '@/pages/Jobs';
import AddJob from '@/pages/AddJob';
import Calendar from '@/pages/Calendar';
import Invoices from '@/pages/Invoices';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import PricingAssistant from '@/pages/PricingAssistant';

function App() {
  const [qaVisible, setQaVisible] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Global Connection Status */}
            <div className="fixed top-4 right-4 z-50">
              <ConnectionStatus />
            </div>
            
            {/* Quality Assurance Dashboard (Development only) */}
            {isDevelopment && (
              <QualityAssurance 
                isVisible={qaVisible} 
                onToggle={() => setQaVisible(!qaVisible)} 
              />
            )}
            
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/clients" element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              } />
              
              <Route path="/clients/new" element={
                <ProtectedRoute>
                  <AddClient />
                </ProtectedRoute>
              } />
              
              <Route path="/clients/:id/edit" element={
                <ProtectedRoute>
                  <EditClient />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs/new" element={
                <ProtectedRoute>
                  <AddJob />
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } />
              
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/pricing" element={
                <ProtectedRoute>
                  <PricingAssistant />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          
          {/* Global toast notifications */}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
            }}
          />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
