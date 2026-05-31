import apiClient from "./api.client";
import type { ApiMessageResponse } from "../interfaces/auth.types";
import type {
    CreateTeamRequest,
    Team,
    TeamDetail,
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
