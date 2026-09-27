import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SensorProvider } from './context/SensorContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveRoverPage } from './pages/LiveRoverPage';
import { AIDetectionPage } from './pages/AIDetectionPage';
import { ValidationPage } from './pages/ValidationPage';
import { ReportsPage } from './pages/ReportsPage';
import { FieldMapPage } from './pages/FieldMapPage';
import { CropHealthPage } from './pages/CropHealthPage';
import { IrrigationPage } from './pages/IrrigationPage';
import { RiskMonitorPage } from './pages/RiskMonitorPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="rover" element={<LiveRoverPage />} />
        <Route path="ai-diagnostics" element={<AIDetectionPage />} />
        <Route path="validation" element={<ValidationPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="map" element={<FieldMapPage />} />
        <Route path="crop-health" element={<CropHealthPage />} />
        <Route path="irrigation" element={<IrrigationPage />} />
        <Route path="risks" element={<RiskMonitorPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SensorProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SensorProvider>
    </AuthProvider>
  );
}
