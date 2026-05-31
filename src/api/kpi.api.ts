import apiClient from "./api.client";
import type {
    CreateKpiAppealRequest,
    CreateKpiReviewRequest,
    ExportKpiReportQuery,
    GetTeamKpiQuery,
    GetUserKpiQuery,
    KpiAppeal,
    KpiMessageResponse,
    KpiReview,
    KpiWeights,
    ResolveKpiAppealRequest,
    TeamKpiResponse,
    UpdateKpiReviewRequest,
    UserKpiResponse,
} from "../interfaces/kpi.types";

export const getUserKpi = (userId: number, params?: GetUserKpiQuery) => {
    return apiClient.get<UserKpiResponse>(`/kpi/user/${userId}`, { params }).then((res) => res.data);
};

export const getTeamKpi = (teamId: number | string, params?: GetTeamKpiQuery) => {
    return apiClient.get<TeamKpiResponse>(`/kpi/team/${teamId}`, { params }).then((res) => res.data);
};

export const createKpiReview = (body: CreateKpiReviewRequest) => {
    return apiClient.post<KpiReview>("/kpi/reviews", body).then((res) => res.data);
};

export const updateKpiReview = (id: number, body: UpdateKpiReviewRequest) => {
    return apiClient.put<KpiReview>(`/kpi/reviews/${id}`, body).then((res) => res.data);
};

export const deleteKpiReview = (id: number) => {
    return apiClient.delete<void>(`/kpi/reviews/${id}`).then((res) => res.data);
};

export const getKpiReviewHistory = (userId: number) => {
    return apiClient.get<KpiReview[]>(`/kpi/reviews/history/${userId}`).then((res) => res.data);
};

export const createKpiAppeal = (body: CreateKpiAppealRequest) => {
    return apiClient.post<KpiAppeal>("/kpi/appeals", body).then((res) => res.data);
};

export const getPendingKpiAppeals = () => {
    return apiClient.get<KpiAppeal[]>("/kpi/appeals/team").then((res) => res.data);
};

export const resolveKpiAppeal = (id: number, body: ResolveKpiAppealRequest) => {
    return apiClient.patch<KpiAppeal>(`/kpi/appeals/${id}/resolve`, body).then((res) => res.data);
};

export const getKpiWeights = () => {
    return apiClient.get<KpiWeights>("/kpi/weights").then((res) => res.data);
};

export const updateKpiWeights = (body: KpiWeights) => {
    return apiClient.put<KpiMessageResponse>("/kpi/weights", body).then((res) => res.data);
};

export const exportKpiReport = (params: ExportKpiReportQuery) => {
    return apiClient
        .get<Blob>("/kpi/export", { params, responseType: "blob" })
        .then((res) => res.data);
};
