import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { ProjectFlow } from './pages/ProjectFlow';
import { Dashboard } from './pages/Dashboard';
import { Messaging } from './pages/Messaging';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { BuilderDashboard } from './pages/BuilderDashboard';
import { BuilderProfileEdit } from './pages/BuilderProfileEdit';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile || profile.role !== 'admin') return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const DashboardRedirect: React.FC = () => {
  const { profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return <Navigate to="/auth" />;
  if (profile.role === 'builder') return <BuilderDashboard />;
  return <Dashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><BuilderProfileEdit /></ProtectedRoute>} />
            <Route path="/messages/:id" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute><ProjectFlow /></ProtectedRoute>} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
