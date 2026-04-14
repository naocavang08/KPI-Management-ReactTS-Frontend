const ACCESS_TOKEN_KEY = 'accessToken';

export const getTokenAccess = (): string | null => {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
};

export const setTokenAccess = (token: string): void => {
    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
        console.error('Error setting access token:', error);
    }
};

export const removeTokenAccess = (): void => {
    try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Error removing access token:', error);
    }
};

const REFRESH_TOKEN_KEY = 'refreshToken';

export const getTokenRefresh = (): string | null => {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
};

export const setTokenRefresh = (token: string): void => {
    try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
        console.error('Error setting refresh token:', error);
    }
};

export const removeTokenRefresh = (): void => {
    try {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Error removing refresh token:', error);
    }
};

const USER_INFO_KEY = 'userInfo';

export const getUserInfo = <T = string>(): T | null => {
    try {
        const userInfo = localStorage.getItem(USER_INFO_KEY);
        return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
};

export const setUserInfo = <T>(userInfo: T): void => {
    try {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
        console.error('Error setting user info:', error);
    }
};

export const removeUserInfo = (): void => {
    try {
        localStorage.removeItem(USER_INFO_KEY);
    } catch (error) {
        console.error('Error removing user info:', error);
    }
};