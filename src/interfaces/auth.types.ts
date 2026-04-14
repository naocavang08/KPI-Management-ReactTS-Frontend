/**
 * Auth API Types
 * Auto-generated from ApiContractv2/AuthApi.yml
 */

// ============================================
// Base Response Types
// ============================================

/**
 * Standard API response wrapper
 * Can wrap successful results or errors
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

/**
 * API Error structure matching ErrorResponse schema
 */
export interface ApiError {
    error: string;
    message: string;
    field?: string;
}

// ============================================
// Auth Types - Matching OpenAPI Schema
// ============================================

/**
 * Login request body
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Login response - only returns token
 * Client must call /api/auth/me to get user info
 */
export interface LoginResponse {
    accessToken: string;
}

/**
 * User info returned from /api/auth/me
 */
export interface UserInfo {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
    roleId: number;
    roleName: string;
    status: string;
    lockedUntil?: string;
}

/**
 * Permission scope levels
 */
export type PermissionScope = 'ALL' | 'TEAM' | 'SELF';

export type code = [
    'VIEW_DASHBOARD',
    'MANAGE_USERS',
    'VIEW_REPORTS',
    'EDIT_SETTINGS',
    'ACCESS_API'
]

/**
 * Permission structure
 */
export interface Permission {
    code: code[number];
    scope: PermissionScope;
}

/**
 * Response from /api/auth/me endpoint
 */
export interface MeResponse {
    user: UserInfo;
    permissions: Permission[];
}
