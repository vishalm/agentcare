import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from './store/authStore';
import { getThemeByRole } from './theme/themes';

// Components
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !['admin', 'administrator', 'super_admin', 'system_admin'].includes(user?.role?.toLowerCase() || '')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, theme, getThemeForUser } = useAuthStore();
  
  // Get the current theme based on user role or selected theme
  const currentTheme = useMemo(() => {
    const themeKey = getThemeForUser();
    return getThemeByRole(themeKey);
  }, [getThemeForUser]);
  
  // Initialize app on mount
  useEffect(() => {
    // Any app initialization logic here
    console.log('🏥 AgentCare Frontend Initialized');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Router>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100vh', width: '100%' }}
            >
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected Routes */}
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
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="admin" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminPage />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Router>
        
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: currentTheme.palette.background.paper,
              color: currentTheme.palette.text.primary,
              border: `1px solid ${currentTheme.palette.divider}`,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: currentTheme.palette.success.main,
                secondary: currentTheme.palette.success.contrastText,
              },
            },
            error: {
              iconTheme: {
                primary: currentTheme.palette.error.main,
                secondary: currentTheme.palette.error.contrastText,
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 