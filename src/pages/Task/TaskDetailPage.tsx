import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    type SelectChangeEvent,
} from "@mui/material";
import {
    ArrowLeft,
    CheckCircle2,
    ClipboardCheck,
    Edit2,
    ExternalLink,
    FileUp,
    Loader2,
    Trash2,
    XCircle,
} from "lucide-react";
import {
    completeTask,
    deleteTask,
    getTaskHistory,
    getTaskById,
    processTaskExtension,
    rejectTask,
    requestTaskExtension,
    submitTask,
    updateTask,
    updateTaskProgress,
} from "../../api/task.api";
import { getUsers } from "../../api/user.api";
import { useToastify } from "../../hooks/useToastify";
import { hasTaskAuthority } from "../../lib/permissions";
import { useAuthStore } from "../../stores/auth.store";
import type { Task, TaskHistoryEntry, TaskPriority, TaskStatus, UpdateTaskRequest } from "../../interfaces/task.types";
import type { ManagedUser } from "../../interfaces/user.types";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, semantic, spacing, typography } = desginToken;

const taskStatuses: TaskStatus[] = ["ASSIGNED", "IN_PROGRESS", "PENDING_REVIEW", "COMPLETED", "OVERDUE"];
const taskPriorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

type TaskForm = {
    title: string;
    description: string;
    assigneeId: string;
    deadline: string;
    priority: TaskPriority;
    tags: string;
};

type ProgressForm = {
    status: TaskStatus;
    progress: string;
};

const emptyForm: TaskForm = {
    title: "",
    description: "",
    assigneeId: "",
    deadline: "",
    priority: "MEDIUM",
    tags: "",
};

const inputSx = {
    "& .MuiInputBase-root": {
        borderRadius: radius.button,
        backgroundColor: components.input.background,
        fontFamily: typography.bodyBase.fontFamily,
        fontSize: typography.bodyBase.fontSize,
    },
};

const getErrorMessage = (err: unknown, fallback: string) => {
    const errorWithResponse = err as {
        response?: { data?: { error?: { message?: string; details?: string }; message?: string; details?: string } };
        message?: string;
    };

    return (
        errorWithResponse.response?.data?.error?.message ||
        errorWithResponse.response?.data?.error?.details ||
        errorWithResponse.response?.data?.message ||
        errorWithResponse.response?.data?.details ||
        (err instanceof Error ? err.message : errorWithResponse.message) ||
        fallback
    );
};

const getStatusLabel = (status: TaskStatus) => {
    const labels: Record<TaskStatus, string> = {
        ASSIGNED: "Đã giao",
        IN_PROGRESS: "Đang làm",
        PENDING_REVIEW: "Chờ duyệt",
        COMPLETED: "Hoàn thành",
        OVERDUE: "Quá hạn",
    };

    return labels[status];
};

const getPriorityLabel = (priority: TaskPriority) => {
    const labels: Record<TaskPriority, string> = {
        LOW: "Thấp",
        MEDIUM: "Trung bình",
        HIGH: "Cao",
    };

    return labels[priority];
};

const getStatusColor = (status: TaskStatus) => {
    const statusColor: Record<TaskStatus, { bg: string; fg: string }> = {
        ASSIGNED: { bg: colors.primaryFixed, fg: colors.onPrimaryFixedVariant },
        IN_PROGRESS: { bg: semantic.info.container, fg: semantic.info.onContainer },
        PENDING_REVIEW: { bg: semantic.warning.container, fg: semantic.warning.onContainer },
        COMPLETED: { bg: semantic.success.container, fg: semantic.success.onContainer },
        OVERDUE: { bg: semantic.danger.container, fg: semantic.danger.onContainer },
    };

    return statusColor[status];
};

const getPriorityColor = (priority: TaskPriority) => {
    if (priority === "HIGH") return { bg: semantic.danger.container, fg: semantic.danger.onContainer };
    if (priority === "MEDIUM") return { bg: semantic.warning.container, fg: semantic.warning.onContainer };
    return { bg: colors.surfaceContainerHigh, fg: colors.onSurfaceVariant };
};

const toDateTimeLocal = (value?: string | null) => {
    if (!value) return "";
    return value.slice(0, 16);
};

const fromDateTimeLocal = (value: string) => {
    if (!value) return "";
    return value.length === 16 ? `${value}:00` : value;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const parseTags = (value: string) => {
    return value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
};

const buildFormFromTask = (task: Task): TaskForm => ({
    title: task.title ?? "",
    description: task.description ?? "",
    assigneeId: String(task.assigneeId ?? ""),
    deadline: toDateTimeLocal(task.deadline),
    priority: task.priority,
    tags: task.tags?.join(", ") ?? "",
});

const TaskDetailPage = () => {
    const navigate = useNavigate();
    const params = useParams();
    const taskId = Number(params.id);
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [task, setTask] = useState<Task | null>(null);
    const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignees, setAssignees] = useState<ManagedUser[]>([]);
    const [editOpen, setEditOpen] = useState(false);
    const [form, setForm] = useState<TaskForm>(emptyForm);
    const [progressOpen, setProgressOpen] = useState(false);
    const [progressForm, setProgressForm] = useState<ProgressForm>({ status: "IN_PROGRESS", progress: "0" });
    const [submitOpen, setSubmitOpen] = useState(false);
    const [evidence, setEvidence] = useState("");
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [extensionOpen, setExtensionOpen] = useState(false);
    const [requestedDeadline, setRequestedDeadline] = useState("");
    const [extensionReason, setExtensionReason] = useState("");
    const [processExtensionOpen, setProcessExtensionOpen] = useState(false);
    const [extensionApproved, setExtensionApproved] = useState("true");
    const [managerNote, setManagerNote] = useState("");
    const taskPermissions = {
        update: hasTaskAuthority(currentUser, permissions, "UPDATE"),
        delete: hasTaskAuthority(currentUser, permissions, "DELETE"),
        approve: hasTaskAuthority(currentUser, permissions, "APPROVE"),
        reject: hasTaskAuthority(currentUser, permissions, "REJECT"),
        updateProgress: hasTaskAuthority(currentUser, permissions, "UPDATE_PROGRESS"),
        submit: hasTaskAuthority(currentUser, permissions, "SUBMIT"),
        extend: hasTaskAuthority(currentUser, permissions, "EXTEND"),
        approveExtension: hasTaskAuthority(currentUser, permissions, "APPROVE_EXTENSION"),
    };

    const loadTask = useCallback(async () => {
        if (!taskId) return;

        try {
            setIsLoading(true);
            const response = await getTaskById(taskId);
            setTask(response);
        } catch (err) {
            error("Không tải được chi tiết task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsLoading(false);
        }
    }, [error, taskId]);

    const loadAssignees = useCallback(async () => {
        try {
            setIsUsersLoading(true);
            const response = await getUsers({ page: 1, limit: 100, status: "ACTIVE" });
            setAssignees(response.data);
        } catch (err) {
            error("Không tải được danh sách người dùng", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsUsersLoading(false);
        }
    }, [error]);

    const loadHistory = useCallback(async () => {
        if (!taskId) return;

        try {
            setIsHistoryLoading(true);
            const response = await getTaskHistory(taskId);
            setHistory(response);
        } catch (err) {
            error("Không tải được lịch sử task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsHistoryLoading(false);
        }
    }, [error, taskId]);

    useEffect(() => {
        void loadTask();
    }, [loadTask]);

    useEffect(() => {
        void loadAssignees();
    }, [loadAssignees]);

    useEffect(() => {
        void loadHistory();
    }, [loadHistory]);

    const handleFormChange = <K extends keyof TaskForm>(field: K, value: TaskForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const openEditDialog = () => {
        if (!task) return;
        setForm(buildFormFromTask(task));
        setEditOpen(true);
    };

    const submitEditForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!task) return;

        const title = form.title.trim();
        const description = form.description.trim();
        const assigneeId = Number(form.assigneeId);
        const deadline = fromDateTimeLocal(form.deadline);

        if (!title || !description || !assigneeId || !deadline) {
            error("Thiếu thông tin", "Vui lòng nhập tiêu đề, mô tả, người nhận và deadline");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload: UpdateTaskRequest = {
                title,
                description,
                assigneeId,
                deadline,
                priority: form.priority,
                tags: parseTags(form.tags),
            };
            await updateTask(task.id, payload);
            success("Đã cập nhật task", task.title);
            setEditOpen(false);
            await loadTask();
            await loadHistory();
        } catch (err) {
            error("Không cập nhật được task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openProgressDialog = () => {
        if (!task) return;
        setProgressForm({ status: task.status, progress: String(task.progress ?? 0) });
        setProgressOpen(true);
    };

    const confirmUpdateProgress = async () => {
        if (!task) return;
        const progress = Number(progressForm.progress);

        if (Number.isNaN(progress) || progress < 0 || progress > 100) {
            error("Tiến độ không hợp lệ", "Vui lòng nhập giá trị từ 0 đến 100");
            return;
        }

        try {
            setIsSubmitting(true);
            await updateTaskProgress(task.id, { status: progressForm.status, progress });
            success("Đã cập nhật tiến độ", task.title);
            setProgressOpen(false);
            await loadTask();
            await loadHistory();
        } catch (err) {
            error("Không cập nhật được tiến độ", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openSubmitDialog = () => {
        if (!task) return;
        setEvidence(task.evidence ?? "");
        setSubmitOpen(true);
    };

    const confirmSubmitTask = async () => {
        if (!task) return;

        try {
            setIsSubmitting(true);
            await submitTask(task.id, { evidence: evidence.trim() || undefined });
            success("Đã nộp báo cáo", task.title);
            setSubmitOpen(false);
            await loadTask();
            await loadHistory();
        } catch (err) {
            error("Không nộp được báo cáo", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmCompleteTask = async () => {
        if (!task) return;

        try {
            setIsSubmitting(true);
            await completeTask(task.id);
            success("Đã duyệt hoàn thành", task.title);
            await loadTask();
            await loadHistory();
        } catch (err) {
            error("Không duyệt được task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmRejectTask = async () => {
        if (!task) return;
        const note = rejectNote.trim();

        if (!note) {
            error("Thiếu ghi chú", "Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            setIsSubmitting(true);
            await rejectTask(task.id, { note });
            success("Đã từ chối task", task.title);
            setRejectOpen(false);
            setRejectNote("");
            await loadTask();
            await loadHistory();
        } catch (err) {
            error("Không từ chối được task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteTask = async () => {
        if (!task) return;

        try {
            setIsSubmitting(true);
            await deleteTask(task.id);
            success("Đã xóa task", task.title);
            navigate("/tasks");
        } catch (err) {
            error("Không xóa được task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openExtensionDialog = () => {
        if (!task) return;
        setRequestedDeadline(toDateTimeLocal(task.deadline));
        setExtensionReason("");
        setExtensionOpen(true);
    };

    const confirmRequestExtension = async () => {
        if (!task) return;
        const deadline = fromDateTimeLocal(requestedDeadline);
        const reason = extensionReason.trim();

        if (!deadline || !reason) {
            error("Thiếu thông tin", "Vui lòng nhập deadline mới và lý do gia hạn");
            return;
        }

        try {
            setIsSubmitting(true);
            await requestTaskExtension(task.id, { requestedDeadline: deadline, reason });
            success("Đã gửi yêu cầu gia hạn", task.title);
            setExtensionOpen(false);
            await loadHistory();
        } catch (err) {
            error("Không gửi được yêu cầu gia hạn", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openProcessExtensionDialog = (approved: boolean) => {
        setExtensionApproved(String(approved));
        setManagerNote("");
        setProcessExtensionOpen(true);
    };

    const confirmProcessExtension = async () => {
        if (!task) return;
        const note = managerNote.trim();

        if (!note) {
            error("Thiếu ghi chú", "Vui lòng nhập ghi chú xử lý gia hạn");
            return;
        }

        try {
            setIsSubmitting(true);
            await processTaskExtension(task.id, { approved: extensionApproved === "true", managerNote: note });
            success("Đã xử lý yêu cầu gia hạn", task.title);
            setProcessExtensionOpen(false);
            await Promise.all([loadTask(), loadHistory()]);
        } catch (err) {
            error("Không xử lý được yêu cầu gia hạn", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Stack sx={{ py: 8, alignItems: "center" }}>
                <CircularProgress size={30} />
            </Stack>
        );
    }

    if (!task) {
        return (
            <Paper sx={{ p: 4, borderRadius: radius.card, border: elevation.level1.border }}>
                <Typography color="text.secondary">Không tìm thấy task.</Typography>
                <Button sx={{ mt: 2 }} startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/tasks")}>
                    Quay lại danh sách
                </Button>
            </Paper>
        );
    }

    const statusTone = getStatusColor(task.status);
    const priorityTone = getPriorityColor(task.priority);

    return (
        <Stack spacing={spacing.lg}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "flex-start" } }}>
                <Stack spacing={1}>
                    <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/tasks")} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
                        Danh sách task
                    </Button>
                    <Box>
                        <Typography sx={{ ...typography.h1, color: colors.onSurface }}>{task.title}</Typography>
                        <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>Task #{task.id}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                        <Chip label={getStatusLabel(task.status)} sx={{ bgcolor: statusTone.bg, color: statusTone.fg, fontWeight: 700 }} />
                        <Chip label={getPriorityLabel(task.priority)} sx={{ bgcolor: priorityTone.bg, color: priorityTone.fg, fontWeight: 700 }} />
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                    <Button startIcon={<Edit2 size={16} />} onClick={openEditDialog} variant="outlined" disabled={!taskPermissions.update} sx={{ textTransform: "none" }}>Sửa</Button>
                    <Button startIcon={<ClipboardCheck size={16} />} onClick={openProgressDialog} variant="outlined" disabled={!taskPermissions.updateProgress} sx={{ textTransform: "none" }}>Tiến độ</Button>
                    <Button startIcon={<FileUp size={16} />} onClick={openSubmitDialog} variant="outlined" disabled={!taskPermissions.submit} sx={{ textTransform: "none" }}>Nộp báo cáo</Button>
                    <Button onClick={openExtensionDialog} variant="outlined" disabled={!taskPermissions.extend} sx={{ textTransform: "none" }}>Xin gia hạn</Button>
                    <Button startIcon={<CheckCircle2 size={16} />} onClick={() => void confirmCompleteTask()} variant="contained" disabled={isSubmitting || !taskPermissions.approve} sx={{ textTransform: "none" }}>Duyệt</Button>
                </Stack>
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: spacing.lg }}>
                <Paper elevation={0} sx={{ p: spacing.lg, borderRadius: radius.card, border: elevation.level1.border, bgcolor: colors.surfaceContainerLowest }}>
                    <Stack spacing={spacing.lg}>
                        <Box>
                            <Typography sx={{ ...typography.labelCaps, color: colors.outline, mb: 1 }}>Mô tả</Typography>
                            <Typography sx={{ ...typography.bodyBase, color: colors.onSurface, whiteSpace: "pre-wrap" }}>{task.description}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                                <Typography sx={{ ...typography.labelCaps, color: colors.outline }}>Tiến độ</Typography>
                                <Typography sx={{ ...typography.bodyBase, fontWeight: 700 }}>{task.progress}%</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={Math.min(Math.max(task.progress, 0), 100)} sx={{ height: 8, borderRadius: radius.full }} />
                        </Box>
                        <Divider />
                        <Box>
                            <Typography sx={{ ...typography.labelCaps, color: colors.outline, mb: 1 }}>Tags</Typography>
                            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                                {task.tags?.length ? task.tags.map((tag) => <Chip key={tag} label={tag} size="small" />) : <Typography color="text.secondary">Chưa có tag</Typography>}
                            </Stack>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography sx={{ ...typography.labelCaps, color: colors.outline, mb: 1 }}>Evidence</Typography>
                            {task.evidence ? (
                                <Button href={task.evidence} target="_blank" rel="noreferrer" startIcon={<ExternalLink size={16} />} sx={{ textTransform: "none" }}>
                                    Mở minh chứng
                                </Button>
                            ) : (
                                <Typography color="text.secondary">Chưa nộp minh chứng</Typography>
                            )}
                        </Box>
                    </Stack>
                </Paper>

                <Stack spacing={spacing.md}>
                    <Paper elevation={0} sx={{ p: spacing.lg, borderRadius: radius.card, border: elevation.level1.border, bgcolor: colors.surfaceContainerLowest }}>
                        <Typography sx={{ ...typography.labelCaps, color: colors.outline, mb: 2 }}>Thông tin phân công</Typography>
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Manager</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{task.managerName}</Typography>
                                <Typography variant="caption" color="text.secondary">ID {task.managerId}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Assignee</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{task.assigneeName}</Typography>
                                <Typography variant="caption" color="text.secondary">ID {task.assigneeId}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Deadline</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{formatDateTime(task.deadline)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Cập nhật</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{formatDateTime(task.updatedAt)}</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper elevation={0} sx={{ p: spacing.lg, borderRadius: radius.card, border: elevation.level1.border, bgcolor: colors.surfaceContainerLowest }}>
                        <Typography sx={{ ...typography.labelCaps, color: colors.outline, mb: 2 }}>Thao tác khác</Typography>
                        <Stack spacing={1}>
                            <Button variant="outlined" onClick={() => openProcessExtensionDialog(true)} disabled={isSubmitting || !taskPermissions.approveExtension} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
                                Duyệt gia hạn
                            </Button>
                            <Button color="warning" variant="outlined" onClick={() => openProcessExtensionDialog(false)} disabled={isSubmitting || !taskPermissions.approveExtension} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
                                Bác gia hạn
                            </Button>
                            <Button startIcon={<XCircle size={16} />} color="warning" variant="outlined" onClick={() => setRejectOpen(true)} disabled={isSubmitting || !taskPermissions.reject} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
                                Từ chối hoàn thành
                            </Button>
                            <Button startIcon={<Trash2 size={16} />} color="error" variant="outlined" onClick={() => setDeleteOpen(true)} disabled={isSubmitting || !taskPermissions.delete} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
                                Xóa task
                            </Button>
                        </Stack>
                    </Paper>
                </Stack>
            </Box>

            <Paper elevation={0} sx={{ p: spacing.lg, borderRadius: radius.card, border: elevation.level1.border, bgcolor: colors.surfaceContainerLowest }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography sx={{ ...typography.labelCaps, color: colors.outline }}>Lịch sử thay đổi</Typography>
                    {isHistoryLoading && <CircularProgress size={18} />}
                </Stack>
                <Stack spacing={2}>
                    {history.length ? (
                        history.map((entry, index) => {
                            const entryTone = getStatusColor(entry.status);
                            return (
                                <Box key={`${entry.createdAt}-${index}`} sx={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 1.5 }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: entryTone.fg, mt: "6px" }} />
                                        {index < history.length - 1 && <Box sx={{ width: 1, flex: 1, bgcolor: colors.surfaceContainerHighest, mt: 1 }} />}
                                    </Box>
                                    <Box>
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                                                <Chip size="small" label={getStatusLabel(entry.status)} sx={{ bgcolor: entryTone.bg, color: entryTone.fg, fontWeight: 700 }} />
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.progress}%</Typography>
                                                <Typography variant="body2" color="text.secondary">bởi {entry.changedByName}</Typography>
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">{formatDateTime(entry.createdAt)}</Typography>
                                        </Stack>
                                        {entry.note && (
                                            <Typography sx={{ mt: 0.75, ...typography.bodyBase, color: colors.onSurfaceVariant }}>
                                                {entry.note}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })
                    ) : (
                        <Typography color="text.secondary">Chưa có lịch sử thay đổi</Typography>
                    )}
                </Stack>
            </Paper>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={submitEditForm}>
                    <DialogTitle>Chỉnh sửa task</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField label="Tiêu đề" value={form.title} onChange={(event) => handleFormChange("title", event.target.value)} required fullWidth sx={inputSx} />
                            <TextField label="Mô tả" value={form.description} onChange={(event) => handleFormChange("description", event.target.value)} required fullWidth multiline minRows={3} sx={inputSx} />
                            <FormControl fullWidth required>
                                <InputLabel>Người phụ trách</InputLabel>
                                <Select
                                    value={form.assigneeId}
                                    label="Người phụ trách"
                                    disabled={isUsersLoading}
                                    onChange={(event: SelectChangeEvent) => handleFormChange("assigneeId", event.target.value)}
                                >
                                    {assignees.map((user) => (
                                        <MenuItem key={user.id} value={String(user.id)}>
                                            {user.displayName} ({user.email})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField label="Deadline" type="datetime-local" value={form.deadline} onChange={(event) => handleFormChange("deadline", event.target.value)} required fullWidth sx={inputSx} slotProps={{ inputLabel: { shrink: true } }} />
                            <FormControl fullWidth>
                                <InputLabel>Ưu tiên</InputLabel>
                                <Select value={form.priority} label="Ưu tiên" onChange={(event: SelectChangeEvent) => handleFormChange("priority", event.target.value as TaskPriority)}>
                                    {taskPriorities.map((priority) => <MenuItem key={priority} value={priority}>{getPriorityLabel(priority)}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField label="Tags" placeholder="Database, KPI" value={form.tags} onChange={(event) => handleFormChange("tags", event.target.value)} fullWidth sx={inputSx} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setEditOpen(false)} disabled={isSubmitting}>Hủy</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <Loader2 size={16} /> : undefined}>Lưu</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={progressOpen} onClose={() => setProgressOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Cập nhật tiến độ</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select value={progressForm.status} label="Trạng thái" onChange={(event: SelectChangeEvent) => setProgressForm((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}>
                                {taskStatuses.map((status) => <MenuItem key={status} value={status}>{getStatusLabel(status)}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="Tiến độ (%)" type="number" value={progressForm.progress} onChange={(event) => setProgressForm((prev) => ({ ...prev, progress: event.target.value }))} fullWidth sx={inputSx} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setProgressOpen(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="contained" onClick={() => void confirmUpdateProgress()} disabled={isSubmitting}>Cập nhật</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={submitOpen} onClose={() => setSubmitOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Nộp báo cáo</DialogTitle>
                <DialogContent>
                    <TextField label="Evidence URL" value={evidence} onChange={(event) => setEvidence(event.target.value)} fullWidth sx={{ ...inputSx, mt: 1 }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setSubmitOpen(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="contained" onClick={() => void confirmSubmitTask()} disabled={isSubmitting}>Nộp</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Từ chối task</DialogTitle>
                <DialogContent>
                    <TextField label="Lý do" value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} fullWidth multiline minRows={3} sx={{ ...inputSx, mt: 1 }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setRejectOpen(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button color="warning" variant="contained" onClick={() => void confirmRejectTask()} disabled={isSubmitting}>Từ chối</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={extensionOpen} onClose={() => setExtensionOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Xin gia hạn task</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Deadline mới"
                            type="datetime-local"
                            value={requestedDeadline}
                            onChange={(event) => setRequestedDeadline(event.target.value)}
                            fullWidth
                            required
                            sx={inputSx}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            label="Lý do gia hạn"
                            value={extensionReason}
                            onChange={(event) => setExtensionReason(event.target.value)}
                            fullWidth
                            required
                            multiline
                            minRows={3}
                            sx={inputSx}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setExtensionOpen(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="contained" onClick={() => void confirmRequestExtension()} disabled={isSubmitting}>Gửi yêu cầu</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={processExtensionOpen} onClose={() => setProcessExtensionOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>{extensionApproved === "true" ? "Duyệt gia hạn" : "Bác gia hạn"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Kết quả</InputLabel>
                            <Select value={extensionApproved} label="Kết quả" onChange={(event: SelectChangeEvent) => setExtensionApproved(event.target.value)}>
                                <MenuItem value="true">Chấp nhận gia hạn</MenuItem>
                                <MenuItem value="false">Bác yêu cầu</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Ghi chú quản lý"
                            value={managerNote}
                            onChange={(event) => setManagerNote(event.target.value)}
                            fullWidth
                            required
                            multiline
                            minRows={3}
                            sx={inputSx}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setProcessExtensionOpen(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="contained" onClick={() => void confirmProcessExtension()} disabled={isSubmitting}>Xử lý</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Xóa task</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc muốn xóa task {task.title}?</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteOpen(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button color="error" variant="contained" onClick={() => void confirmDeleteTask()} disabled={isSubmitting}>Xóa</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default TaskDetailPage;
