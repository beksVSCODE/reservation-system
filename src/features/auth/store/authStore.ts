import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, LoginCredentials, RegisterData } from '@/shared/types/auth';
import { mockAuthApi } from '../api/mockAuthApi';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await mockAuthApi.login(credentials);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Ошибка входа', 
            isLoading: false 
          });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await mockAuthApi.register(data);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Ошибка регистрации', 
            isLoading: false 
          });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await mockAuthApi.logout();
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const { user } = get();
        if (user?.id) {
          set({ isLoading: true });
          try {
            const currentUser = await mockAuthApi.getCurrentUser(user.id);
            if (currentUser) {
              set({ user: currentUser, isAuthenticated: true, isLoading: false });
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user ? {
          ...state.user,
          createdAt: state.user.createdAt.toISOString(),
        } : null,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.createdAt) {
          state.user.createdAt = new Date(state.user.createdAt as unknown as string);
        }
      },
    }
  )
);
