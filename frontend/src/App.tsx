import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { useAuthStore, useThemeStore, useNotificationStore } from './store';
import { io } from 'socket.io-client';

// ── Lazy page imports ────────────────────────────────────────────────────
const Landing     = lazy(() => import('./pages/Landing'));
const Login       = lazy(() => import('./pages/auth/Login'));
const Register    = lazy(() => import('./pages/auth/Register'));
const ForgotPass  = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPass   = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Board       = lazy(() => import('./pages/Board'));
const ItemDetail  = lazy(() => import('./pages/ItemDetail'));
const ReportItem  = lazy(() => import('./pages/ReportItem'));
const Chat        = lazy(() => import('./pages/Chat'));
const Profile     = lazy(() => import('./pages/Profile'));
const AdminPage   = lazy(() => import('./pages/admin/AdminDashboard'));
const NotFound    = lazy(() => import('./pages/NotFound'));

// ── Query Client ─────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 2,   // 2 min
      gcTime:             1000 * 60 * 10,  // 10 min
      retry:              1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

// ── Page transition wrapper ───────────────────────────────────────────────
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

// ── Loading fallback ──────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[--color-bg]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center animate-pulse">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
        </svg>
      </div>
      <div className="w-32 h-1 bg-gray-200 dark:bg-navy-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-500 rounded-full"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  </div>
);

// ── Protected Route ────────────────────────────────────────────────────────
const Protected: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// ── Auth Route (redirect if already logged in) ────────────────────────────
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// ── Main Router with Navbar layout ────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const HIDE_NAV = ['/login', '/register', '/forgot-password', '/reset-password'];
  const showNav = !HIDE_NAV.includes(location.pathname);

  return (
    <>
      {showNav && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
          <Route path="/board" element={<PageWrapper><Board /></PageWrapper>} />
          <Route path="/browse" element={<Navigate to="/board" replace />} />
          <Route path="/items/:id" element={<PageWrapper><ItemDetail /></PageWrapper>} />

          {/* Auth */}
          <Route path="/login" element={<AuthRoute><PageWrapper><Login /></PageWrapper></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><PageWrapper><Register /></PageWrapper></AuthRoute>} />
          <Route path="/forgot-password" element={<AuthRoute><PageWrapper><ForgotPass /></PageWrapper></AuthRoute>} />
          <Route path="/reset-password" element={<PageWrapper><ResetPass /></PageWrapper>} />

          {/* Protected */}
          <Route path="/dashboard" element={<Protected><PageWrapper><Dashboard /></PageWrapper></Protected>} />
          <Route path="/report" element={<Protected><PageWrapper><ReportItem /></PageWrapper></Protected>} />
          <Route path="/chat" element={<Protected><PageWrapper><Chat /></PageWrapper></Protected>} />
          <Route path="/chat/:conversationId" element={<Protected><PageWrapper><Chat /></PageWrapper></Protected>} />
          <Route path="/profile/:id" element={<PageWrapper><Profile /></PageWrapper>} />

          {/* Admin */}
          <Route path="/admin" element={<Protected adminOnly><PageWrapper><AdminPage /></PageWrapper></Protected>} />
          <Route path="/admin/*" element={<Protected adminOnly><PageWrapper><AdminPage /></PageWrapper></Protected>} />

          {/* 404 */}
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

// ── App Root ──────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const { isDark } = useThemeStore();

  // Apply theme on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Global Socket.IO connection for notifications
  const { isAuthenticated, token } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('new_notification', (notification) => {
      addNotification(notification);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, addNotification]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#ffffff' },
              style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
              style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
            },
          }}
        />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
