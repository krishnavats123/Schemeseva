import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schemes from './pages/Schemes';
import SchemeDetail from './pages/SchemeDetail';
import Profile from './pages/Profile';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: { main: '#185FA5' },
    secondary: { main: '#639922' },
    background: { default: '#F5F7FA' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
      }
    }
  }
});

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Protected citizen routes */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="schemes" element={<Schemes />} />
              <Route path="schemes/:id" element={<SchemeDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="documents" element={<Documents />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<PrivateRoute adminOnly><Layout /></PrivateRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
