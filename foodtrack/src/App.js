import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';

import Dashboard from './pages/Dashboard';
import AddMeal from './pages/AddMeal';
import Diary from './pages/Diary';
import Analytics from './pages/Analytics';
import Tips from './pages/Tips';
import Recipes from './pages/Recipes';
import Progress from './pages/Progress';
import Groups from './pages/Groups';
import Settings from './pages/Settings';

import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';

// Публичный роут — если уже авторизован, кидаем либо в приложение, либо в онбординг
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, onboardingCompleted } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isAuthenticated && onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Роут онбординга — только для авторизованных, и только если онбординг не завершён
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, loading, onboardingCompleted } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Защищённая часть приложения — только если авторизован + онбординг завершён
const RequireReady = ({ children }) => {
  const { isAuthenticated, loading, onboardingCompleted } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Основной layout приложения
const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex overflow-x-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-x-hidden">
        <Header />

        <main className="flex-1 pb-20 lg:pb-8 overflow-x-hidden">
          <div className="w-full px-4 py-6 lg:px-8 lg:py-8 lg:max-w-7xl lg:mx-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-meal" element={<AddMeal />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/tips" element={<Tips />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <OnboardingProvider>
          <Routes>
            {/* Auth */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <OnboardingRoute>
                  <Onboarding />
                </OnboardingRoute>
              }
            />

            {/* App */}
            <Route
              path="/*"
              element={
                <RequireReady>
                  <AppLayout />
                </RequireReady>
              }
            />
          </Routes>
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
