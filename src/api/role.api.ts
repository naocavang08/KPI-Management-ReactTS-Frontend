import apiClient from "./api.client";
import type {
    AssignRolePermissionRequest,
    CreateRoleRequest,
    Permission,
    Role,
    UpdateRoleRequest,
} from "../interfaces/role.types";

export const getRoles = () => {
    return apiClient.get<Role[]>("/roles").then((res) => res.data);
};

export const getRoleById = (id: number) => {
    return apiClient.get<Role>(`/roles/${id}`).then((res) => res.data);
};

export const createRole = (body: CreateRoleRequest) => {
    return apiClient.post<Role>("/roles", body).then((res) => res.data);
};

export const updateRole = (id: number, body: UpdateRoleRequest) => {
    return apiClient.put<Role>(`/roles/${id}`, body).then((res) => res.data);
};

export const deleteRole = (id: number) => {
    return apiClient.delete<void>(`/roles/${id}`).then((res) => res.data);
};

export const getAllPermissions = () => {
    return apiClient.get<Permission[]>("/permissions").then((res) => res.data);
};

export const getRolePermissions = (id: number) => {
    return apiClient.get<Permission[]>(`/roles/${id}/permissions`).then((res) => res.data);
};

export const assignRolePermission = (id: number, body: AssignRolePermissionRequest) => {
    return apiClient.post<void>(`/roles/${id}/permissions`, body).then((res) => res.data);
};

export const removeRolePermission = (id: number, permissionId: number) => {
    return apiClient.delete<void>(`/roles/${id}/permissions/${permissionId}`).then((res) => res.data);
};
