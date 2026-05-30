export interface ApiError {
    error?: string;
    message?: string;
    field?: string;
    details?: string;
}

export interface ApiMessageResponse {
    success: boolean;
    message: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    type?: string;
}

export type UserType = "INTERNSHIP" | "STAFF" | "COLLABORATOR";
export type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE";

export interface AuthRole {
    id: number;
    name: string;
    displayName: string;
    description?: string | null;
    isSystem?: boolean;
}

export interface AuthPermission {
    resource: string;
    action: string;
    scope?: string | null;
}

export interface AuthUser {
    id: number;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    isActive: boolean;
    position?: string | null;
    type: UserType;
    status: UserStatus;
    lockReason?: string | null;
    lastLoginAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    lockedUntil?: string | null;
    isDeleted?: boolean;
    deletedAt?: string | null;
    roles: AuthRole[];
}

export interface MeResponse {
    user: AuthUser;
    permissions: AuthPermission[];
}

export interface UpdateFullnameRequest {
    fullname: string;
}

export interface UpdateAvatarRequest {
    avatarUrl: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}
