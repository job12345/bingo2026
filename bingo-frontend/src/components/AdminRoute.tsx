import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin, Result } from 'antd';
import { useAuthStore } from '@/stores';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Admin Route Component (ต้องเป็น Admin)
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="กำลังโหลด..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <Result
        status="403"
        title="403 - ไม่มีสิทธิ์เข้าถึง"
        subTitle="ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
      />
    );
  }

  return <>{children}</>;
}
