import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginAPI } from '@/api/api';

interface AuthState {
    token: string | null;
    username: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            username: null,
            isAuthenticated: false,
            login: async (username: string, password: string) => {
                const result = await LoginAPI({ username, password });
                if (result.code === 200 || result.code === 0) {
                    set({
                        token: result.data.token,
                        username: result.data.username,
                        isAuthenticated: true,
                    });
                } else {
                    throw new Error(result.msg || '登录失败');
                }
            },
            logout: () => {
                set({ token: null, username: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
