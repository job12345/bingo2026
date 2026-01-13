import { apiClient } from './api';
import { User, LoginResponse } from '@/types';

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Login with Phone & Password
   */
  static async login(phoneNumber: string, password: string): Promise<void> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      phoneNumber,
      password,
    });
    this.saveTokens(response.accessToken, response.refreshToken);
  }

  /**
   * Register with Phone & Password
   */
  static async register(
    phoneNumber: string,
    password: string,
    confirmPassword: string,
    displayName: string
  ): Promise<void> {
    const response = await apiClient.post<LoginResponse>('/auth/register', {
      phoneNumber,
      password,
      confirmPassword,
      displayName,
    });
    this.saveTokens(response.accessToken, response.refreshToken);
  }

  /**
   * เริ่ม Google OAuth Login (Optional - สำหรับอนาคต)
   */
  static loginWithGoogle() {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
    window.location.href = `${apiUrl}/auth/google`;
  }

  /**
   * ดึงข้อมูลผู้ใช้ปัจจุบัน
   */
  static async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  /**
   * Refresh Access Token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * ตรวจสอบว่าล็อกอินอยู่หรือไม่
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * บันทึก Tokens
   */
  static saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
}
