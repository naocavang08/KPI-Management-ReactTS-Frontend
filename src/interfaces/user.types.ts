export interface User {
    id: number;
    name: string;
    email: string;
    roleId: number;
    roleName: string;
    status: string;
    teamId: number;
    teamName: string;
    createdAt: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    roleId: number;
    teamId: number;
}

export interface UpdateUserRequest {
    name?: string;
    roleId?: number;
    status?: string;
    teamId?: number;
}
