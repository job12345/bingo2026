import { create } from 'zustand';
import { User } from '@/types';
import { AuthService } from '@/services';

/**
 * Auth Store State
 */
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

/**
 * Auth Store
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login (Google OAuth)
  login: () => {
    AuthService.loginWithGoogle();
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await AuthService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Check Authentication (Auto-login if token exists)
  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');

    // ถ้าไม่มี token → ไม่ได้ login
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // ถ้ามี token → ดึงข้อมูล user
    try {
      set({ isLoading: true, error: null });
      const user = await AuthService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      // Token หมดอายุหรือไม่ valid → ล้าง token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null // ไม่แสดง error เพราะเป็น auto-check
      });
    }
  },

  // Fetch Current User
  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await AuthService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false, isAuthenticated: false });
    }
  },

  // Update User
  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } });
    }
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },
}));
