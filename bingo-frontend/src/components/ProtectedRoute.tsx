import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores';
import { useWebSocketStore } from '@/stores';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected Route Component
 * ป้องกันไม่ให้เข้าหน้าที่ต้อง Login ถ้ายังไม่ได้ Login
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
  const { connect, isConnected, connectionState } = useWebSocketStore();

  // Auto-check authentication on mount
  useEffect(() => {
    if (!user && !isLoading) {
      checkAuth();
    }
  }, [user, isLoading, checkAuth]);

  // Auto-connect WebSocket once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isConnected || connectionState === 'connected') return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    connect(token);
  }, [isAuthenticated, isConnected, connectionState, connect]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}
