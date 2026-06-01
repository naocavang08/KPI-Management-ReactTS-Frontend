export interface Team {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    managerId?: number | null;
    managerName?: string | null;
    isDeleted: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export type TeamDetail = Team;

export interface TeamPagination {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
}

export interface TeamListResponse {
    data: Team[];
    pagination: TeamPagination;
}

export interface TeamListQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface CreateTeamRequest {
    name: string;
    code: string;
    description?: string;
    managerId?: number;
}

export interface UpdateTeamRequest {
    name: string;
    code: string;
    description?: string;
    managerId?: number | null;
}

export interface TeamMemberListQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface TeamMemberListResponse {
    data: import("./user.types").ManagedUser[];
    pagination: TeamPagination;
}

export interface AddTeamMemberRequest {
    userId: number;
}
