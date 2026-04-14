import axios from "axios";
import queryString from "query-string";
import { getAuthMockAdapter } from "@/mocks/auth.mock";
import { getTokenAccess, removeTokenAccess } from "../lib/localStorage";

const baseURL = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: (params) => queryString.stringify(params),
});

baseURL.interceptors.request.use((request) => {
    const accessToken = getTokenAccess();

    request.headers = request.headers ?? {};

    if (accessToken) {
        request.headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
        delete request.headers['Authorization'];
    }

    if (import.meta.env.DEV) {
        const mockAdapter = getAuthMockAdapter(request);
        if (mockAdapter) {
            request.adapter = mockAdapter;
        }
    }

    return request;
});

baseURL.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            removeTokenAccess();

            window.location.href = "/login";
            return;
        }
        return Promise.reject(error);
    }
);

export default baseURL;
