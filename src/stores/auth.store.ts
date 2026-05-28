import { create } from "zustand";
import {
    changeMyPassword,
    getMe,
    login as loginApi,
    updateMyAvatar,
    updateMyFullname,
} from "../api/auth.api";
import {
    getTokenAccess,
    getUserInfo,
    removeTokenAccess,
    removeUserInfo,
    setTokenAccess,
    setUserInfo,
} from "../lib/localStorage";
import type {
    AuthPermission,
    AuthUser,
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
} from "../interfaces/auth.types";

type StoredAuth = {
    accessToken: string;
    type?: string;
    user?: AuthUser | null;
    permissions?: AuthPermission[];
};

interface AuthState {
    auth: LoginResponse | null;
    user: AuthUser | null;
    permissions: AuthPermission[];
    isAuthenticated: boolean;
    isLoading: boolean;
    isProfileLoading: boolean;
    error: string | null;

    login: (payload: LoginRequest) => Promise<void>;
    logout: () => void;
    loadFromStorage: () => void;
    fetchMe: () => Promise<AuthUser>;
    updateProfileName: (fullname: string) => Promise<void>;
    updateAvatar: (avatarUrl: string) => Promise<void>;
    changePassword: (payload: ChangePasswordRequest) => Promise<void>;
}

const extractErrorMessage = (err: unknown, fallback: string) => {
    const errorWithResponse = err as {
        response?: {
            data?: {
                error?: { message?: string; details?: string };
                message?: string;
                details?: string;
            };
        };
        message?: string;
    };

    return (
        errorWithResponse?.response?.data?.error?.message ||
        errorWithResponse?.response?.data?.error?.details ||
        errorWithResponse?.response?.data?.message ||
        errorWithResponse?.response?.data?.details ||
        (err instanceof Error ? err.message : errorWithResponse?.message) ||
        fallback
    );
};

const persistAuth = (storedAuth: StoredAuth) => {
    setUserInfo<StoredAuth>(storedAuth);
};

export const useAuthStore = create<AuthState>((set, get) => ({
    auth: null,
    user: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
    isProfileLoading: false,
    error: null,

    loadFromStorage: () => {
        const token = getTokenAccess();
        const storedAuth = getUserInfo<StoredAuth>();

        if (!token) {
            removeUserInfo();
            set({
                auth: null,
                user: null,
                permissions: [],
                isAuthenticated: false,
            });
            return;
        }

        set({
            auth: {
                accessToken: token,
                type: storedAuth?.type,
            },
            user: storedAuth?.user ?? null,
            permissions: storedAuth?.permissions ?? [],
            isAuthenticated: true,
        });
    },

    login: async (payload) => {
        try {
            set({ isLoading: true, error: null });

            const response = await loginApi(payload);
            if (!response?.accessToken) {
                throw new Error("Invalid response from server");
            }

            setTokenAccess(response.accessToken);
            persistAuth({
                accessToken: response.accessToken,
                type: response.type,
                user: null,
                permissions: [],
            });

            set({
                auth: response,
                user: null,
                permissions: [],
                isAuthenticated: true,
                isLoading: false,
            });

            await get().fetchMe();
        } catch (err: unknown) {
            const message = extractErrorMessage(err, "Login failed");
            set({
                error: message,
                isLoading: false,
            });
            throw err;
        }
    },

    fetchMe: async () => {
        try {
            set({ isProfileLoading: true, error: null });
            const response = await getMe();
            const token = getTokenAccess() ?? get().auth?.accessToken;

            if (token) {
                persistAuth({
                    accessToken: token,
                    type: get().auth?.type,
                    user: response.user,
                    permissions: response.permissions,
                });
            }

            set({
                user: response.user,
                permissions: response.permissions,
                isAuthenticated: Boolean(token),
                isProfileLoading: false,
            });

            return response.user;
        } catch (err: unknown) {
            const message = extractErrorMessage(err, "Failed to load profile");
            set({
                error: message,
                isProfileLoading: false,
            });
            throw err;
        }
    },

    updateProfileName: async (fullname) => {
        await updateMyFullname({ fullname });
        await get().fetchMe();
    },

    updateAvatar: async (avatarUrl) => {
        await updateMyAvatar({ avatarUrl });
        await get().fetchMe();
    },

    changePassword: async (payload) => {
        await changeMyPassword(payload);
    },

    logout: () => {
        removeUserInfo();
        removeTokenAccess();
        set({
            auth: null,
            user: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
            isProfileLoading: false,
            error: null,
        });
    },
}));
