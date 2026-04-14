import apiClient from "./api.client";
import { setTokenAccess } from "../lib/localStorage";
import type {
    LoginRequest,
    LoginResponse,
    MeResponse
} from "../interfaces/auth.types";

export const login = (body: LoginRequest) => {
    return apiClient
        .post<LoginResponse>('/api/auth/login', body)
        .then((res) => {
            const token = res.data?.accessToken;
            if (token) setTokenAccess(token);
            return res.data;
        });
};

export const me = () => {
    return apiClient
        .get<MeResponse>('/api/auth/me')
        .then((res) => res.data);
};
