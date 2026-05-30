import type { AuthRole, UserStatus, UserType } from "./auth.types";

export interface ManagedUser {
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

export interface UserPagination {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
}

export interface UserListResponse {
    data: ManagedUser[];
    pagination: UserPagination;
}

export interface UserListQuery {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
    status?: UserStatus;
}

export interface CreateUserRequest {
    fullName: string;
    email: string;
    position: string;
    type: UserType;
    avatar?: string;
}

export interface UpdateUserRequest {
    fullName?: string;
    position?: string;
    type?: UserType;
    avatar?: string;
    status?: UserStatus;
    lockedUntil?: string | null;
}

export interface LockUserRequest {
    reason?: string;
}

export interface AssignUserRoleRequest {
    roleId: number;
}
