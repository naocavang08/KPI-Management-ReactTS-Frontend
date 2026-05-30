import apiClient from "./api.client";
import { setTokenAccess } from "../lib/localStorage";
import type {
    ApiMessageResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    MeResponse,
    ResetPasswordRequest,
    UpdateAvatarRequest,
    UpdateFullnameRequest,
} from "../interfaces/auth.types";

export const login = (body: LoginRequest) => {
    return apiClient.post<LoginResponse>("/auth/login", body).then((res) => {
        const token = res.data?.accessToken;
        if (token) setTokenAccess(token);
        return res.data;
    });
};

export const getMe = () => {
    return apiClient.get<MeResponse>("/auth/me").then((res) => res.data);
};

export const updateMyFullname = (body: UpdateFullnameRequest) => {
    return apiClient
        .patch<ApiMessageResponse>("/auth/me/fullname", body)
        .then((res) => res.data);
};

export const updateMyAvatar = (body: UpdateAvatarRequest) => {
    return apiClient
        .patch<ApiMessageResponse>("/auth/me/avatar", body)
        .then((res) => res.data);
};

export const changeMyPassword = (body: ChangePasswordRequest) => {
    return apiClient
        .patch<ApiMessageResponse>("/auth/me/password", body)
        .then((res) => res.data);
};

export const forgotPassword = (body: ForgotPasswordRequest) => {
    return apiClient
        .post<ApiMessageResponse>("/auth/forgot-password", body)
        .then((res) => res.data);
};

export const resetPassword = (body: ResetPasswordRequest) => {
    return apiClient
        .post<ApiMessageResponse>("/auth/reset-password", body)
        .then((res) => res.data);
};
