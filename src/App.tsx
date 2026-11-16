import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import {
  AdminDashboardPage,
  AdminLogsPage,
  AdminSettingsPage,
  AdminTraineesOverviewPage,
  AdminTrainersPage,
} from './pages/admin/AdminPages';
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { TrainerClients } from './pages/trainer/TrainerClients';
import { TrainerClientDetail } from './pages/trainer/TrainerClientDetail';
import {
  TrainerExerciseLibraryPage,
  TrainerNutritionBuilderPage,
  TrainerSettingsPage,
  TrainerSubscriptionsPage,
  TrainerTemplatesPage,
  TrainerWorkoutBuilderPage,
} from './pages/trainer/TrainerPlansAndLibrary';
import {
  TraineeDashboardPage,
  TraineeMeasurementsPage,
  TraineeNutritionPage,
  TraineeProgressPage,
  TraineeSubscriptionPage,
  TraineeWorkoutPage,
} from './pages/trainee/TraineePages';
import { ChatPage } from './pages/shared/ChatPage';
import { WhatsAppLinkCard } from './components/WhatsAppLinkCard';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OfflineSyncBanner />
      <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="trainers" element={<AdminTrainersPage />} />
            <Route path="trainees" element={<AdminTraineesOverviewPage />} />
            <Route path="logs" element={<AdminLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Trainer Routes */}
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TrainerDashboard />} />
            <Route path="clients" element={<TrainerClients />} />
            <Route path="clients/:clientId" element={<TrainerClientDetail />} />
            <Route path="workouts" element={<TrainerWorkoutBuilderPage />} />
            <Route path="templates" element={<TrainerTemplatesPage />} />
            <Route path="exercises" element={<TrainerExerciseLibraryPage />} />
            <Route path="nutrition" element={<TrainerNutritionBuilderPage />} />
            <Route path="subscriptions" element={<TrainerSubscriptionsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="settings" element={<div className="space-y-6"><TrainerSettingsPage /><WhatsAppLinkCard /></div>} />
          </Route>

          {/* Trainee Routes */}
          <Route
            path="/trainee"
            element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TraineeDashboardPage />} />
            <Route path="workout" element={<TraineeWorkoutPage />} />
            <Route path="nutrition" element={<TraineeNutritionPage />} />
            <Route path="measurements" element={<TraineeMeasurementsPage />} />
            <Route path="progress" element={<TraineeProgressPage />} />
            <Route path="subscription" element={<TraineeSubscriptionPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
