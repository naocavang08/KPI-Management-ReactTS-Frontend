import type { ApiMessageResponse } from "./auth.types";

export type TaskStatus = "ASSIGNED" | "IN_PROGRESS" | "PENDING_REVIEW" | "COMPLETED" | "OVERDUE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
    id: number;
    title: string;
    description: string;
    managerId: number;
    managerName: string;
    assigneeId: number;
    assigneeName: string;
    deadline: string;
    status: TaskStatus;
    priority: TaskPriority;
    progress: number;
    tags?: string[] | null;
    evidence?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface TaskPagination {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
}

export interface TaskListResponse {
    data: Task[];
    pagination: TaskPagination;
}

export interface TaskListQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: number;
    teamId?: string;
}

export interface CreateTaskRequest {
    title: string;
    description: string;
    assigneeId: number;
    deadline: string;
    priority: TaskPriority;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    assigneeId?: number;
    deadline?: string;
    priority?: TaskPriority;
    tags?: string[];
}

export interface RejectTaskRequest {
    note: string;
}

export interface UpdateTaskProgressRequest {
    status: TaskStatus;
    progress: number;
}

export interface SubmitTaskRequest {
    evidence?: string;
}

export type TaskSummary = Record<TaskStatus, number>;

export type TaskMessageResponse = ApiMessageResponse;
