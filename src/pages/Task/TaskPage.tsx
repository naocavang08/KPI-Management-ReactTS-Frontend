import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    Menu,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    type SelectChangeEvent,
} from "@mui/material";
import {
    CheckCircle2,
    ClipboardCheck,
    Edit2,
    Eye,
    FileUp,
    Loader2,
    MoreVertical,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    XCircle,
} from "lucide-react";
import {
    completeTask,
    createTask,
    deleteTask,
    getTaskById,
    getTasks,
    getTaskSummary,
    rejectTask,
    submitTask,
    updateTask,
    updateTaskProgress,
} from "../../api/task.api";
import { getUsers } from "../../api/user.api";
import { useToastify } from "../../hooks/useToastify";
import { hasTaskAuthority } from "../../lib/permissions";
import { useAuthStore } from "../../stores/auth.store";
import type { ManagedUser } from "../../interfaces/user.types";
import type {
    CreateTaskRequest,
    Task,
    TaskPagination,
    TaskPriority,
    TaskStatus,
    TaskSummary,
    UpdateTaskRequest,
} from "../../interfaces/task.types";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, semantic, spacing, typography } = desginToken;

const taskStatuses: TaskStatus[] = ["ASSIGNED", "IN_PROGRESS", "PENDING_REVIEW", "COMPLETED", "OVERDUE"];
const taskPriorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
const pageSizes = [10, 20, 50];

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

const emptyPagination: TaskPagination = {
    page: 1,
    limit: 20,
    totalElements: 0,
    totalPages: 1,
};

const emptySummary: TaskSummary = {
    assigned: 0,
    inProgress: 0,
    pendingReview: 0,
    completed: 0,
    overdue: 0,
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

const getSummaryValue = (summary: TaskSummary, status: TaskStatus) => {
    const keys: Record<TaskStatus, keyof TaskSummary> = {
        ASSIGNED: "assigned",
        IN_PROGRESS: "inProgress",
        PENDING_REVIEW: "pendingReview",
        COMPLETED: "completed",
        OVERDUE: "overdue",
    };

    return summary[keys[status]] ?? 0;
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

const buildFormFromTask = (task: Task): TaskForm => ({
    title: task.title ?? "",
    description: task.description ?? "",
    assigneeId: String(task.assigneeId ?? ""),
    deadline: toDateTimeLocal(task.deadline),
    priority: task.priority,
    tags: task.tags?.join(", ") ?? "",
});

const parseTags = (value: string) => {
    return value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
};

const TaskPage = () => {
    const navigate = useNavigate();
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [summary, setSummary] = useState<TaskSummary>(emptySummary);
    const [pagination, setPagination] = useState<TaskPagination>(emptyPagination);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<"ALL" | TaskPriority>("ALL");
    const [assigneeIdFilter, setAssigneeIdFilter] = useState("");
    const [teamIdFilter, setTeamIdFilter] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignees, setAssignees] = useState<ManagedUser[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [actionTask, setActionTask] = useState<Task | null>(null);
    const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit" | null>(null);
    const [form, setForm] = useState<TaskForm>(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
    const [progressTarget, setProgressTarget] = useState<Task | null>(null);
    const [progressForm, setProgressForm] = useState<ProgressForm>({ status: "IN_PROGRESS", progress: "0" });
    const [submitTarget, setSubmitTarget] = useState<Task | null>(null);
    const [evidence, setEvidence] = useState("");
    const [rejectTarget, setRejectTarget] = useState<Task | null>(null);
    const [rejectNote, setRejectNote] = useState("");
    const taskPermissions = useMemo(
        () => ({
            create: hasTaskAuthority(currentUser, permissions, "CREATE"),
            update: hasTaskAuthority(currentUser, permissions, "UPDATE"),
            delete: hasTaskAuthority(currentUser, permissions, "DELETE"),
            approve: hasTaskAuthority(currentUser, permissions, "APPROVE"),
            reject: hasTaskAuthority(currentUser, permissions, "REJECT"),
            updateProgress: hasTaskAuthority(currentUser, permissions, "UPDATE_PROGRESS"),
            submit: hasTaskAuthority(currentUser, permissions, "SUBMIT"),
        }),
        [currentUser, permissions]
    );

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    const loadSummary = useCallback(async () => {
        try {
            setIsSummaryLoading(true);
            const response = await getTaskSummary();
            setSummary({ ...emptySummary, ...response });
        } catch (err) {
            error("Không tải được thống kê task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSummaryLoading(false);
        }
    }, [error]);

    const loadTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getTasks({
                page,
                limit,
                search: debouncedSearch || undefined,
                status: statusFilter === "ALL" ? undefined : statusFilter,
                priority: priorityFilter === "ALL" ? undefined : priorityFilter,
                assigneeId: assigneeIdFilter ? Number(assigneeIdFilter) : undefined,
                teamId: teamIdFilter.trim() || undefined,
            });

            setTasks(response.data);
            setPagination(response.pagination);
        } catch (err) {
            error("Không tải được danh sách task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsLoading(false);
        }
    }, [assigneeIdFilter, debouncedSearch, error, limit, page, priorityFilter, statusFilter, teamIdFilter]);

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

    useEffect(() => {
        void loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        void loadSummary();
    }, [loadSummary]);

    useEffect(() => {
        void loadAssignees();
    }, [loadAssignees]);

    const totalTasks = useMemo(() => taskStatuses.reduce((total, status) => total + getSummaryValue(summary, status), 0), [summary]);

    const closeActionMenu = () => {
        setAnchorEl(null);
        setActionTask(null);
    };

    const refreshData = async () => {
        await Promise.all([loadTasks(), loadSummary()]);
    };

    const openCreateDialog = () => {
        if (!taskPermissions.create) {
            error("Không có quyền tạo task", "Cần quyền KPI/TASK:CREATE hoặc vai trò ADMIN");
            return;
        }

        setForm(emptyForm);
        setTaskDialogMode("create");
    };

    const openEditDialog = async (task: Task) => {
        closeActionMenu();
        try {
            setIsSubmitting(true);
            const detail = await getTaskById(task.id);
            setActionTask(detail);
            setForm(buildFormFromTask(detail));
            setTaskDialogMode("edit");
        } catch (err) {
            error("Không tải được chi tiết task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeTaskDialog = () => {
        setTaskDialogMode(null);
        setActionTask(null);
        setForm(emptyForm);
    };

    const handleFormChange = <K extends keyof TaskForm>(field: K, value: TaskForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const submitTaskForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
            if (taskDialogMode === "create") {
                const payload: CreateTaskRequest = {
                    title,
                    description,
                    assigneeId,
                    deadline,
                    priority: form.priority,
                };
                await createTask(payload);
                success("Đã tạo task", "Danh sách task đã được cập nhật");
            } else if (actionTask) {
                const payload: UpdateTaskRequest = {
                    title,
                    description,
                    assigneeId,
                    deadline,
                    priority: form.priority,
                    tags: parseTags(form.tags),
                };
                await updateTask(actionTask.id, payload);
                success("Đã cập nhật task", actionTask.title);
            }

            closeTaskDialog();
            await refreshData();
        } catch (err) {
            error("Thao tác thất bại", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openProgressDialog = (task: Task) => {
        closeActionMenu();
        setProgressTarget(task);
        setProgressForm({ status: task.status, progress: String(task.progress ?? 0) });
    };

    const confirmUpdateProgress = async () => {
        if (!progressTarget) return;
        const progress = Number(progressForm.progress);

        if (Number.isNaN(progress) || progress < 0 || progress > 100) {
            error("Tiến độ không hợp lệ", "Vui lòng nhập giá trị từ 0 đến 100");
            return;
        }

        try {
            setIsSubmitting(true);
            await updateTaskProgress(progressTarget.id, { status: progressForm.status, progress });
            success("Đã cập nhật tiến độ", progressTarget.title);
            setProgressTarget(null);
            await refreshData();
        } catch (err) {
            error("Không cập nhật được tiến độ", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openSubmitDialog = (task: Task) => {
        closeActionMenu();
        setSubmitTarget(task);
        setEvidence(task.evidence ?? "");
    };

    const confirmSubmitTask = async () => {
        if (!submitTarget) return;

        try {
            setIsSubmitting(true);
            await submitTask(submitTarget.id, { evidence: evidence.trim() || undefined });
            success("Đã nộp báo cáo", submitTarget.title);
            setSubmitTarget(null);
            await refreshData();
        } catch (err) {
            error("Không nộp được báo cáo", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmCompleteTask = async (task: Task) => {
        closeActionMenu();
        try {
            setIsSubmitting(true);
            await completeTask(task.id);
            success("Đã duyệt hoàn thành", task.title);
            await refreshData();
        } catch (err) {
            error("Không duyệt được task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openRejectDialog = (task: Task) => {
        closeActionMenu();
        setRejectTarget(task);
        setRejectNote("");
    };

    const confirmRejectTask = async () => {
        if (!rejectTarget) return;
        const note = rejectNote.trim();

        if (!note) {
            error("Thiếu ghi chú", "Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            setIsSubmitting(true);
            await rejectTask(rejectTarget.id, { note });
            success("Đã từ chối task", rejectTarget.title);
            setRejectTarget(null);
            await refreshData();
        } catch (err) {
            error("Không từ chối được task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteTask = async () => {
        if (!deleteTarget) return;

        try {
            setIsSubmitting(true);
            await deleteTask(deleteTarget.id);
            success("Đã xóa task", deleteTarget.title);
            setDeleteTarget(null);
            await refreshData();
        } catch (err) {
            error("Không xóa được task", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack spacing={spacing.lg}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                <Box>
                    <Typography sx={{ ...typography.h1, color: colors.onSurface }}>Quản lý Task</Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Theo dõi {pagination.totalElements} task, {totalTasks} task trong thống kê hiện tại
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Tải lại">
                        <IconButton onClick={() => void refreshData()} disabled={isLoading || isSummaryLoading}>
                            <RefreshCw size={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={taskPermissions.create ? "Tạo task" : "Cần quyền KPI/TASK:CREATE hoặc vai trò ADMIN"}>
                        <span>
                            <Button
                                variant="contained"
                                startIcon={<Plus size={18} />}
                                onClick={openCreateDialog}
                                disabled={!taskPermissions.create}
                                sx={{ borderRadius: radius.lg, textTransform: "none", fontWeight: 700 }}
                            >
                                Tạo task
                            </Button>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }, gap: spacing.md }}>
                {taskStatuses.map((status) => {
                    const tone = getStatusColor(status);
                    return (
                        <Paper key={status} elevation={0} sx={{ p: 2, borderRadius: radius.card, border: elevation.level1.border, bgcolor: colors.surfaceContainerLowest }}>
                            <Typography sx={{ ...typography.labelCaps, color: colors.outline }}>{getStatusLabel(status)}</Typography>
                            <Stack direction="row" sx={{ mt: 1, alignItems: "center", justifyContent: "space-between" }}>
                                <Typography sx={{ ...typography.h1, color: colors.onSurface }}>{getSummaryValue(summary, status)}</Typography>
                                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: tone.fg }} />
                            </Stack>
                            {isSummaryLoading && <LinearProgress sx={{ mt: 1 }} />}
                        </Paper>
                    );
                })}
            </Box>

            <Paper sx={{ borderRadius: radius.xl, overflow: "hidden", border: elevation.level1.border, boxShadow: elevation.level2.boxShadow }}>
                <Box sx={{ p: 2.5, bgcolor: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ alignItems: "center" }}>
                        <TextField
                            placeholder="Tìm theo tiêu đề hoặc mô tả..."
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            sx={inputSx}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} color={colors.outline} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 160 } }}>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Trạng thái"
                                onChange={(event: SelectChangeEvent) => {
                                    setStatusFilter(event.target.value as "ALL" | TaskStatus);
                                    setPage(1);
                                }}
                                sx={{ borderRadius: radius.button, bgcolor: components.input.background }}
                            >
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                {taskStatuses.map((status) => <MenuItem key={status} value={status}>{getStatusLabel(status)}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 150 } }}>
                            <InputLabel>Ưu tiên</InputLabel>
                            <Select
                                value={priorityFilter}
                                label="Ưu tiên"
                                onChange={(event: SelectChangeEvent) => {
                                    setPriorityFilter(event.target.value as "ALL" | TaskPriority);
                                    setPage(1);
                                }}
                                sx={{ borderRadius: radius.button, bgcolor: components.input.background }}
                            >
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                {taskPriorities.map((priority) => <MenuItem key={priority} value={priority}>{getPriorityLabel(priority)}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 220 } }}>
                            <InputLabel>Người phụ trách</InputLabel>
                            <Select
                                value={assigneeIdFilter}
                                label="Người phụ trách"
                                disabled={isUsersLoading}
                                onChange={(event: SelectChangeEvent) => {
                                    setAssigneeIdFilter(event.target.value);
                                    setPage(1);
                                }}
                                sx={{ borderRadius: radius.button, bgcolor: components.input.background }}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                {assignees.map((user) => (
                                    <MenuItem key={user.id} value={String(user.id)}>
                                        {user.displayName} ({user.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Mã team/phòng ban"
                            size="small"
                            value={teamIdFilter}
                            onChange={(event) => {
                                setTeamIdFilter(event.target.value);
                                setPage(1);
                            }}
                            sx={{ ...inputSx, minWidth: { xs: "100%", lg: 120 } }}
                        />
                        <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 110 } }}>
                            <InputLabel>Hiển thị</InputLabel>
                            <Select
                                value={String(limit)}
                                label="Hiển thị"
                                onChange={(event: SelectChangeEvent) => {
                                    setLimit(Number(event.target.value));
                                    setPage(1);
                                }}
                                sx={{ borderRadius: radius.button, bgcolor: components.input.background }}
                            >
                                {pageSizes.map((size) => <MenuItem key={size} value={String(size)}>{size}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                <TableContainer>
                    <Table sx={{ minWidth: 1120 }}>
                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                            <TableRow>
                                {["Task", "Người phụ trách", "Deadline", "Trạng thái", "Ưu tiên", "Tiến độ", "Thao tác"].map((label, index) => (
                                    <TableCell key={label} align={index === 6 ? "right" : "left"} sx={{ ...typography.labelCaps, color: colors.outline, py: 2 }}>
                                        {label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : tasks.length ? (
                                tasks.map((task) => {
                                    const statusTone = getStatusColor(task.status);
                                    const priorityTone = getPriorityColor(task.priority);
                                    return (
                                        <TableRow key={task.id} hover>
                                            <TableCell sx={{ maxWidth: 360 }}>
                                                <Typography sx={{ fontWeight: 700, color: colors.onSurface }} noWrap>{task.title}</Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>{task.description}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{task.assigneeName}</Typography>
                                                <Typography variant="caption" color="text.secondary">ID {task.assigneeId}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{formatDateTime(task.deadline)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={getStatusLabel(task.status)} size="small" sx={{ borderRadius: radius.chip, bgcolor: statusTone.bg, color: statusTone.fg, fontWeight: 700 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={getPriorityLabel(task.priority)} size="small" sx={{ borderRadius: radius.chip, bgcolor: priorityTone.bg, color: priorityTone.fg, fontWeight: 700 }} />
                                            </TableCell>
                                            <TableCell sx={{ width: 160 }}>
                                                <Stack spacing={0.5}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{task.progress}%</Typography>
                                                    <LinearProgress variant="determinate" value={Math.min(Math.max(task.progress, 0), 100)} />
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Chi tiết">
                                                    <IconButton size="small" onClick={() => navigate(`/tasks/${task.id}`)}>
                                                        <Eye size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Chỉnh sửa">
                                                    <IconButton size="small" onClick={() => void openEditDialog(task)} disabled={isSubmitting || !taskPermissions.update}>
                                                        <Edit2 size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton
                                                    size="small"
                                                    disabled={isSubmitting}
                                                    onClick={(event) => {
                                                        setAnchorEl(event.currentTarget);
                                                        setActionTask(task);
                                                    }}
                                                >
                                                    <MoreVertical size={16} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">Không tìm thấy task nào</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ p: 2.5, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Typography variant="caption" color="text.secondary">
                        Hiển thị {tasks.length} trên {pagination.totalElements} task
                    </Typography>
                    <Pagination count={Math.max(pagination.totalPages, 1)} page={page} onChange={(_event, value) => setPage(value)} shape="rounded" size="small" color="primary" />
                </Box>
            </Paper>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeActionMenu}>
                <MenuItem onClick={() => actionTask && navigate(`/tasks/${actionTask.id}`)}>
                    <Eye size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Chi tiết</Typography>
                </MenuItem>
                <MenuItem disabled={!taskPermissions.update} onClick={() => actionTask && void openEditDialog(actionTask)}>
                    <Edit2 size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Chỉnh sửa</Typography>
                </MenuItem>
                <MenuItem disabled={!taskPermissions.updateProgress} onClick={() => actionTask && openProgressDialog(actionTask)}>
                    <ClipboardCheck size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Cập nhật tiến độ</Typography>
                </MenuItem>
                <MenuItem disabled={!taskPermissions.submit} onClick={() => actionTask && openSubmitDialog(actionTask)}>
                    <FileUp size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Nộp báo cáo</Typography>
                </MenuItem>
                <MenuItem disabled={!taskPermissions.approve} onClick={() => actionTask && void confirmCompleteTask(actionTask)}>
                    <CheckCircle2 size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Duyệt hoàn thành</Typography>
                </MenuItem>
                <MenuItem disabled={!taskPermissions.reject} onClick={() => actionTask && openRejectDialog(actionTask)}>
                    <XCircle size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Từ chối</Typography>
                </MenuItem>
                <MenuItem
                    disabled={!taskPermissions.delete}
                    onClick={() => {
                        if (actionTask) setDeleteTarget(actionTask);
                        closeActionMenu();
                    }}
                    sx={{ color: "error.main" }}
                >
                    <Trash2 size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Xóa task</Typography>
                </MenuItem>
            </Menu>

            <Dialog open={Boolean(taskDialogMode)} onClose={closeTaskDialog} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={submitTaskForm}>
                    <DialogTitle>{taskDialogMode === "create" ? "Tạo task" : "Chỉnh sửa task"}</DialogTitle>
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
                            {taskDialogMode === "edit" && (
                                <TextField label="Tags" placeholder="Database, KPI" value={form.tags} onChange={(event) => handleFormChange("tags", event.target.value)} fullWidth sx={inputSx} />
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={closeTaskDialog} disabled={isSubmitting}>Hủy</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <Loader2 size={16} /> : undefined}>Lưu</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={Boolean(progressTarget)} onClose={() => setProgressTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Cập nhật tiến độ</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="body2">{progressTarget?.title}</Typography>
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
                    <Button onClick={() => setProgressTarget(null)} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="contained" onClick={() => void confirmUpdateProgress()} disabled={isSubmitting}>Cập nhật</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(submitTarget)} onClose={() => setSubmitTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Nộp báo cáo</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="body2">{submitTarget?.title}</Typography>
                        <TextField label="Evidence URL" value={evidence} onChange={(event) => setEvidence(event.target.value)} fullWidth sx={inputSx} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setSubmitTarget(null)} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="contained" onClick={() => void confirmSubmitTask()} disabled={isSubmitting}>Nộp</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Từ chối task</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="body2">{rejectTarget?.title}</Typography>
                        <TextField label="Lý do" value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} fullWidth multiline minRows={3} sx={inputSx} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setRejectTarget(null)} disabled={isSubmitting}>Hủy</Button>
                    <Button color="warning" variant="contained" onClick={() => void confirmRejectTask()} disabled={isSubmitting}>Từ chối</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Xóa task</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc muốn xóa task {deleteTarget?.title}?</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>Hủy</Button>
                    <Button color="error" variant="contained" onClick={() => void confirmDeleteTask()} disabled={isSubmitting}>Xóa</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default TaskPage;
