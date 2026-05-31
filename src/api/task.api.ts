import apiClient from "./api.client";
import type {
    CreateTaskRequest,
    ProcessTaskExtensionRequest,
    RejectTaskRequest,
    RequestTaskExtensionRequest,
    SubmitTaskRequest,
    Task,
    TaskHistoryEntry,
    TaskListQuery,
    TaskListResponse,
    TaskMessageResponse,
    TaskSummary,
    UpdateTaskProgressRequest,
    UpdateTaskRequest,
} from "../interfaces/task.types";

export const getTasks = (params: TaskListQuery) => {
    return apiClient.get<TaskListResponse>("/tasks", { params }).then((res) => res.data);
};

export const getTaskById = (id: number) => {
    return apiClient.get<Task>(`/tasks/${id}`).then((res) => res.data);
};

export const createTask = (body: CreateTaskRequest) => {
    return apiClient.post<Task>("/tasks", body).then((res) => res.data);
};

export const updateTask = (id: number, body: UpdateTaskRequest) => {
    return apiClient.put<Task>(`/tasks/${id}`, body).then((res) => res.data);
};

export const deleteTask = (id: number) => {
    return apiClient.delete<TaskMessageResponse>(`/tasks/${id}`).then((res) => res.data);
};

export const getTaskSummary = () => {
    return apiClient.get<TaskSummary>("/tasks/summary").then((res) => res.data);
};

export const completeTask = (id: number) => {
    return apiClient.patch<TaskMessageResponse>(`/tasks/${id}/complete`).then((res) => res.data);
};

export const rejectTask = (id: number, body: RejectTaskRequest) => {
    return apiClient.patch<TaskMessageResponse>(`/tasks/${id}/reject`, body).then((res) => res.data);
};

export const updateTaskProgress = (id: number, body: UpdateTaskProgressRequest) => {
    return apiClient.patch<Task>(`/tasks/${id}/progress`, body).then((res) => res.data);
};

export const submitTask = (id: number, body: SubmitTaskRequest) => {
    return apiClient.post<TaskMessageResponse>(`/tasks/${id}/submit`, body).then((res) => res.data);
};

export const requestTaskExtension = (id: number, body: RequestTaskExtensionRequest) => {
    return apiClient.post<TaskMessageResponse>(`/tasks/${id}/extension`, body).then((res) => res.data);
};

export const processTaskExtension = (id: number, body: ProcessTaskExtensionRequest) => {
    return apiClient.patch<TaskMessageResponse>(`/tasks/${id}/extension/approve`, body).then((res) => res.data);
};

export const getTaskHistory = (id: number) => {
    return apiClient.get<TaskHistoryEntry[]>(`/tasks/${id}/history`).then((res) => res.data);
};
