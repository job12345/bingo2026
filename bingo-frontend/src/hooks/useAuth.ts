import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { AuthService } from '@/services';

/**
 * Custom Hook สำหรับ Authentication
 */
export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, fetchCurrentUser, logout } = useAuthStore();

  useEffect(() => {
    // ตรวจสอบว่ามี Token หรือไม่
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [user, fetchCurrentUser]);

  /**
   * Logout และ Redirect ไปหน้า Login
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /**
   * ตรวจสอบว่าต้อง Login หรือไม่
   */
  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
      return false;
    }
    return true;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    requireAuth,
  };
}
