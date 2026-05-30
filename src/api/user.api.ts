import apiClient from "./api.client";
import type { AuthRole } from "../interfaces/auth.types";
import type {
    AssignUserRoleRequest,
    CreateUserRequest,
    LockUserRequest,
    ManagedUser,
    UpdateUserRequest,
    UserListQuery,
    UserListResponse,
} from "../interfaces/user.types";
import type { ApiMessageResponse } from "../interfaces/auth.types";

export const getUsers = (params: UserListQuery) => {
    return apiClient.get<UserListResponse>("/users", { params }).then((res) => res.data);
};

export const createUser = (body: CreateUserRequest) => {
    return apiClient.post<ManagedUser>("/users", body).then((res) => res.data);
};

export const getUserById = (id: number) => {
    return apiClient.get<ManagedUser>(`/users/${id}`).then((res) => res.data);
};

export const updateUser = (id: number, body: UpdateUserRequest) => {
    return apiClient.put<ManagedUser>(`/users/${id}`, body).then((res) => res.data);
};

export const deleteUser = (id: number) => {
    return apiClient.delete<ApiMessageResponse>(`/users/${id}`).then((res) => res.data);
};

export const lockUser = (id: number, body: LockUserRequest) => {
    return apiClient.put<ManagedUser>(`/users/${id}/lock`, body).then((res) => res.data);
};

export const unlockUser = (id: number) => {
    return apiClient.put<ManagedUser>(`/users/${id}/unlock`).then((res) => res.data);
};

export const assignUserRole = (id: number, body: AssignUserRoleRequest) => {
    return apiClient.post<void>(`/users/${id}/roles`, body).then((res) => res.data);
};

export const getUserRoles = (id: number) => {
    return apiClient.get<AuthRole[]>(`/users/${id}/roles`).then((res) => res.data);
};

export const removeUserRole = (id: number, roleId: number) => {
    return apiClient.delete<void>(`/users/${id}/roles/${roleId}`).then((res) => res.data);
};
