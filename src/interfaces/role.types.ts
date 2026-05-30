export interface Role {
    id: number;
    name: string;
    displayName: string;
    description?: string | null;
    isSystem: boolean;
    createdAt?: string | null;
    createdBy?: number | null;
    updatedAt?: string | null;
    updatedBy?: number | null;
}

export interface Permission {
    id: number;
    resource: string;
    action: string;
    description?: string | null;
}

export interface CreateRoleRequest {
    name: string;
    displayName: string;
    description?: string;
    isSystem: boolean;
}

export type UpdateRoleRequest = CreateRoleRequest;

export interface AssignRolePermissionRequest {
    permissionId: number;
}
