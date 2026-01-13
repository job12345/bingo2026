import { create } from 'zustand';
import { User } from '@/types';
import { AuthService, UserService } from '@/services';

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

  // Fetch Current User
  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await UserService.getCurrentUser();
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
