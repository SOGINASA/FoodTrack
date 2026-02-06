import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { NotificationProvider, useNotificationContext } from './context/NotificationContext';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';
import NotificationsPanel from './components/notifications/NotificationsPanel';
import NotificationToast from './components/notifications/NotificationToast';

import Dashboard from './pages/Dashboard';
import AddMeal from './pages/AddMeal';
import Diary from './pages/Diary';
import Analytics from './pages/Analytics';
import Tips from './pages/Tips';
import Recipes from './pages/Recipes';
import Fridge from './pages/Fridge';
import Progress from './pages/Progress';
import Groups from './pages/Groups';
import Friends from './pages/Friends';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import OAuthCallback from './pages/OAuthCallback';

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

// Общий лейаут для гостей и авторизованных
const GuestAwareLayout = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return children;
};

// Основной layout приложения (для авторизованных и гостей)
const AppLayout = ({ guestMode = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, onboardingCompleted } = useAuth();
  const { unreadCount } = useNotificationContext();

  // Определяем, нужно ли редиректить на онбординг
  const needsOnboarding = isAuthenticated && !onboardingCompleted;

  return (
    <div className="min-h-screen bg-white flex overflow-x-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        guestMode={guestMode && !isAuthenticated}
      />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-x-hidden">
        <Header
          guestMode={guestMode && !isAuthenticated}
          onOpenNotifications={() => setShowNotifications(true)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 pb-safe-footer lg:pb-8 overflow-x-hidden">
          <div className="w-full px-4 py-6 lg:px-8 lg:py-8 lg:max-w-7xl lg:mx-auto overflow-x-hidden">
            <Routes>
              {/* Публичные страницы - доступны всем */}
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/fridge" element={<Fridge />} />
              <Route path="/add-meal" element={<AddMeal />} />

              {/* Приватные страницы - только авторизованным */}
              <Route path="/tips" element={
                !isAuthenticated ? <Navigate to="/auth" replace /> :
                <Tips />
              } />
              <Route path="/" element={
                needsOnboarding ? <Navigate to="/onboarding" replace /> :
                !isAuthenticated ? <Navigate to="/auth" replace /> :
                <Dashboard />
              } />
              <Route path="/diary" element={
                !isAuthenticated ? <Navigate to="/auth" replace /> :
                <Diary />
              } />
              <Route path="/analytics" element={
                !isAuthenticated ? <Navigate to="/auth" replace /> :
                <Analytics />
              } />
              <Route path="/progress" element={
                !isAuthenticated ? <Navigate to="/auth" replace /> :
                <Progress />
              } />
              <Route path="/groups" element={
                !isAuthenticated ? <Navigate to="/auth" replace /> :
                <Groups />
              } />
              <Route path="/friends" element={
                !isAuthenticated ? <Navigate to="/auth" replace /> :
                <Friends />
              } />
              <Route path="/settings" element={
                !isAuthenticated ? <Navigate to="/auth" replace /> :
                <Settings />
              } />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>

      {isAuthenticated && (
        <NotificationsPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Real-time notification toast */}
      <NotificationToast />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
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

              {/* OAuth Callback */}
              <Route path="/oauth/callback" element={<OAuthCallback />} />

              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <OnboardingRoute>
                    <Onboarding />
                  </OnboardingRoute>
                }
              />

              {/* App - доступно всем (с ограничениями внутри) */}
              <Route
                path="/*"
                element={
                  <GuestAwareLayout>
                    <AppLayout guestMode={true} />
                  </GuestAwareLayout>
                }
              />
            </Routes>
          </OnboardingProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
