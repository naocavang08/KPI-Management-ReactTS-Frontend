import { create } from 'zustand';
import { login } from '../api/auth.api';
import {
    getTokenAccess,
    setTokenAccess,
    removeTokenAccess,
    setUserInfo,
    getUserInfo,
    removeUserInfo,
} from '../lib/localStorage';
import type { LoginResponse } from '../interfaces/auth.types';
import type { LoginRequest } from '../interfaces/auth.types';

interface AuthState {
    auth: LoginResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (payload: LoginRequest) => Promise<void>;
    logout: () => void;
    loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    auth: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    loadFromStorage: () => {
        const userStr = getUserInfo();
        if (userStr) {
            try {
                const auth = JSON.parse(userStr) as LoginResponse;
                if (auth?.accessToken && getTokenAccess()) {
                    set({
                        auth,
                        isAuthenticated: true,
                    });
                } else {
                    removeUserInfo();
                    removeTokenAccess();
                }
            } catch {
                removeUserInfo();
                removeTokenAccess();
            }
        }
    },

    login: async (payload) => {
        try {
            set({ isLoading: true, error: null });

            const response = await login(payload);

            if (!response?.accessToken) {
                throw new Error('Invalid response from server');
            }

            const auth = response;

            if (auth) {
                setUserInfo(JSON.stringify(auth));
                setTokenAccess(auth.accessToken);
            }

            set({
                auth,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (err: unknown) {
            const errorWithResponse = err as {
                response?: {
                    data?: { error?: { message?: string; details?: string } };
                };
                message?: string;
            };

            const message =
                errorWithResponse?.response?.data?.error?.message ||
                errorWithResponse?.response?.data?.error?.details ||
                (err instanceof Error ? err.message : errorWithResponse?.message) ||
                'Login failed';

            set({
                error: message,
                isLoading: false,
            });
            throw err;
        }
    },

    logout: () => {
        removeUserInfo();
        removeTokenAccess();
        set({
            auth: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },
}));
