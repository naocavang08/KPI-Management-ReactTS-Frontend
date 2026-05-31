import apiClient from "./api.client";
import type { ApiMessageResponse } from "../interfaces/auth.types";
import type {
    AddTeamMemberRequest,
    CreateTeamRequest,
    Team,
    TeamDetail,
    TeamMemberListQuery,
    TeamMemberListResponse,
    TeamListQuery,
    TeamListResponse,
    UpdateTeamRequest,
} from "../interfaces/team.types";

export const getTeams = (params: TeamListQuery) => {
    return apiClient.get<TeamListResponse>("/teams", { params }).then((res) => res.data);
};

export const createTeam = (body: CreateTeamRequest) => {
    return apiClient.post<Team>("/teams", body).then((res) => res.data);
};

export const getTeamById = (id: number) => {
    return apiClient.get<TeamDetail>(`/teams/${id}`).then((res) => res.data);
};

export const updateTeam = (id: number, body: UpdateTeamRequest) => {
    return apiClient.put<Team>(`/teams/${id}`, body).then((res) => res.data);
};

export const deleteTeam = (id: number) => {
    return apiClient.delete<ApiMessageResponse>(`/teams/${id}`).then((res) => res.data);
};

export const addTeamMember = (id: number, body: AddTeamMemberRequest) => {
    return apiClient.post<ApiMessageResponse>(`/teams/${id}/members`, body).then((res) => res.data);
};

export const removeTeamMember = (id: number, userId: number) => {
    return apiClient.delete<ApiMessageResponse>(`/teams/${id}/members/${userId}`).then((res) => res.data);
};

export const getTeamMembers = (id: number, params?: TeamMemberListQuery) => {
    return apiClient.get<TeamMemberListResponse>(`/teams/${id}/members`, { params }).then((res) => res.data);
};
