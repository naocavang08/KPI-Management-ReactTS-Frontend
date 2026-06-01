import axios from "axios";
import queryString from "query-string";
import { getTokenAccess, removeTokenAccess } from "../lib/localStorage";

const baseURL = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '',
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
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

    return request;
});

baseURL.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const requestUrl = error.config?.url || '';
            // Only redirect and clear tokens if the request is NOT the login request itself
            if (!requestUrl.includes('/auth/login')) {
                removeTokenAccess();
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default baseURL;
