import type { ApiMessageResponse } from "./auth.types";

export type KpiRating = "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
export type KpiAppealStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface KpiMonthlyScore {
    id: number;
    userId: number;
    month: number;
    year: number;
    taskCompletionRate: number;
    reviewScore: number;
    finalScore: number;
    rating: KpiRating;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface UserKpiResponse {
    userId: number;
    username: string;
    displayName: string;
    department?: string | null;
    year: number;
    monthlyScores: KpiMonthlyScore[];
}

export interface TeamKpiMember {
    userId: number;
    username: string;
    displayName: string;
    taskCompletionRate: number;
    reviewScore: number;
    finalScore: number;
    rating: KpiRating;
}

export interface TeamKpiResponse {
    teamId: string;
    averageScore: number;
    members: TeamKpiMember[];
}

export interface GetUserKpiQuery {
    year?: number;
}

export interface GetTeamKpiQuery {
    month?: number;
    year?: number;
}

export interface KpiReview {
    id: number;
    userId: number;
    reviewerId: number;
    month: number;
    year: number;
    reviewScore: number;
    feedback?: string | null;
    isLocked: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface CreateKpiReviewRequest {
    userId: number;
    month: number;
    year: number;
    reviewScore: number;
    feedback: string;
}

export interface UpdateKpiReviewRequest {
    reviewScore: number;
    feedback: string;
}

export interface KpiAppeal {
    id: number;
    userId: number;
    complainantUsername: string;
    complainantDisplayName: string;
    kpiReviewId: number;
    reason: string;
    evidenceLink?: string | null;
    status: KpiAppealStatus;
    resolvedBy?: number | null;
    resolutionComment?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface CreateKpiAppealRequest {
    kpiReviewId: number;
    reason: string;
    evidenceLink?: string;
}

export interface ResolveKpiAppealRequest {
    status: Exclude<KpiAppealStatus, "PENDING">;
    resolutionComment: string;
}

export interface KpiWeights {
    taskWeight: number;
    reviewWeight: number;
}

export interface ExportKpiReportQuery {
    month: number;
    year: number;
    department?: string;
}

export type KpiMessageResponse = ApiMessageResponse;
