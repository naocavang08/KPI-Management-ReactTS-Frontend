import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
    Avatar,
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
    Ban,
    Edit2,
    KeyRound,
    Loader2,
    LockOpen,
    MoreVertical,
    Search,
    Trash2,
    UserCog,
    UserPlus,
    X,
} from "lucide-react";
import {
    assignUserRole,
    createUser,
    deleteUser,
    getUserById,
    getUserRoles,
    getUsers,
    lockUser,
    removeUserRole,
    unlockUser,
    updateUser,
} from "../../api/user.api";
import { getRoles } from "../../api/role.api";
import { useToastify } from "../../hooks/useToastify";
import type { AuthRole, UserStatus, UserType } from "../../interfaces/auth.types";
import type { CreateUserRequest, ManagedUser, UpdateUserRequest, UserPagination } from "../../interfaces/user.types";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, typography } = desginToken;

const userTypes: UserType[] = ["STAFF", "INTERNSHIP", "COLLABORATOR"];
const userStatuses: UserStatus[] = ["ACTIVE", "INACTIVE", "LOCKED"];
const pageSizes = [10, 20, 50];

type UserForm = {
    username: string;
    fullName: string;
    email: string;
    position: string;
    type: UserType;
    avatar: string;
    status: UserStatus;
    lockedUntil: string;
};

const emptyForm: UserForm = {
    username: "",
    fullName: "",
    email: "",
    position: "",
    type: "STAFF",
    avatar: "",
    status: "ACTIVE",
    lockedUntil: "",
};

const emptyPagination: UserPagination = {
    page: 1,
    limit: 20,
    totalElements: 0,
    totalPages: 1,
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

const getStatusLabel = (status: UserStatus) => {
    const labels: Record<UserStatus, string> = {
        ACTIVE: "Đang hoạt động",
        INACTIVE: "Không hoạt động",
        LOCKED: "Đã khóa",
    };

    return labels[status];
};

const getTypeLabel = (type: UserType) => {
    const labels: Record<UserType, string> = {
        STAFF: "Nhân viên",
        INTERNSHIP: "Thực tập",
        COLLABORATOR: "Cộng tác viên",
    };

    return labels[type];
};

const buildFormFromUser = (user: ManagedUser): UserForm => ({
    username: user.username ?? "",
    fullName: user.displayName ?? "",
    email: user.email ?? "",
    position: user.position ?? "",
    type: user.type,
    avatar: user.avatarUrl ?? "",
    status: user.status,
    lockedUntil: user.lockedUntil ?? "",
});

const UserPage = () => {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [pagination, setPagination] = useState<UserPagination>(emptyPagination);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionUser, setActionUser] = useState<ManagedUser | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [userDialogMode, setUserDialogMode] = useState<"create" | "edit" | null>(null);
    const [form, setForm] = useState<UserForm>(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
    const [lockTarget, setLockTarget] = useState<ManagedUser | null>(null);
    const [lockReason, setLockReason] = useState("");
    const [roleTarget, setRoleTarget] = useState<ManagedUser | null>(null);
    const [availableRoles, setAvailableRoles] = useState<AuthRole[]>([]);
    const [userRoles, setUserRoles] = useState<AuthRole[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const { success, error } = useToastify();

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const keyword = debouncedSearch.trim();
            const response = await getUsers({
                page,
                limit,
                name: keyword || undefined,
                email: keyword.includes("@") ? keyword : undefined,
                status: statusFilter === "ALL" ? undefined : statusFilter.toLowerCase() as Lowercase<UserStatus>,
            });

            setUsers(response.data);
            setPagination(response.pagination);
        } catch (err) {
            error("Không tải được người dùng", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, error, limit, page, statusFilter]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const roleNames = useCallback((roles: AuthRole[]) => {
        if (!roles.length) return "Chưa có vai trò";

        return roles.map((role) => role.displayName || role.name).join(", ");
    }, []);

    const rolesAvailableForAssign = useMemo(() => {
        const assignedIds = new Set(userRoles.map((role) => role.id));
        return availableRoles.filter((role) => !assignedIds.has(role.id));
    }, [availableRoles, userRoles]);

    const closeActionMenu = () => {
        setAnchorEl(null);
        setActionUser(null);
    };

    const openCreateDialog = () => {
        setForm(emptyForm);
        setUserDialogMode("create");
    };

    const openEditDialog = async (user: ManagedUser) => {
        closeActionMenu();
        try {
            setIsSubmitting(true);
            const detail = await getUserById(user.id);
            setForm(buildFormFromUser(detail));
            setActionUser(detail);
            setUserDialogMode("edit");
        } catch (err) {
            error("Không tải được chi tiết", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeUserDialog = () => {
        setUserDialogMode(null);
        setForm(emptyForm);
        setActionUser(null);
    };

    const handleFormChange = <K extends keyof UserForm>(field: K, value: UserForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const submitUserForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fullName = form.fullName.trim();
        const username = form.username.trim();
        const email = form.email.trim();
        const position = form.position.trim();
        const avatar = form.avatar.trim();

        if (!fullName || !position || (userDialogMode === "create" && (!username || !email))) {
            error("Thiếu thông tin", "Vui lòng nhập username, tên, email và vị trí");
            return;
        }

        try {
            setIsSubmitting(true);
            if (userDialogMode === "create") {
                const payload: CreateUserRequest = {
                    username,
                    fullName,
                    email,
                    position,
                    type: form.type,
                    avatar: avatar || undefined,
                };
                await createUser(payload);
                success("Đã tạo người dùng", "Danh sách người dùng đã được cập nhật");
            } else if (actionUser) {
                const payload: UpdateUserRequest = {
                    fullName,
                    position,
                    type: form.type,
                    avatar: avatar || undefined,
                    status: form.status,
                    lockedUntil: form.lockedUntil.trim() || null,
                };
                await updateUser(actionUser.id, payload);
                success("Đã cập nhật người dùng", "Thông tin người dùng đã được lưu");
            }

            closeUserDialog();
            await loadUsers();
        } catch (err) {
            error("Thao tác thất bại", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteUser = async () => {
        if (!deleteTarget) return;

        try {
            setIsSubmitting(true);
            await deleteUser(deleteTarget.id);
            success("Đã xóa người dùng", deleteTarget.displayName);
            setDeleteTarget(null);
            await loadUsers();
        } catch (err) {
            error("Không xóa được người dùng", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openLockDialog = (user: ManagedUser) => {
        closeActionMenu();
        setLockReason("");
        setLockTarget(user);
    };

    const confirmLockUser = async () => {
        if (!lockTarget) return;

        try {
            setIsSubmitting(true);
            await lockUser(lockTarget.id, { reason: lockReason.trim() || undefined });
            success("Đã khóa tài khoản", lockTarget.displayName);
            setLockTarget(null);
            await loadUsers();
        } catch (err) {
            error("Không khóa được tài khoản", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmUnlockUser = async (user: ManagedUser) => {
        closeActionMenu();
        try {
            setIsSubmitting(true);
            await unlockUser(user.id);
            success("Đã mở khóa tài khoản", user.displayName);
            await loadUsers();
        } catch (err) {
            error("Không mở khóa được tài khoản", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadRoleDialogData = async (user: ManagedUser) => {
        try {
            setIsRoleLoading(true);
            const [roles, assignedRoles] = await Promise.all([getRoles(), getUserRoles(user.id)]);
            setAvailableRoles(roles);
            setUserRoles(assignedRoles);
            setSelectedRoleId("");
        } catch (err) {
            error("Không tải được vai trò", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsRoleLoading(false);
        }
    };

    const openRoleDialog = async (user: ManagedUser) => {
        closeActionMenu();
        setRoleTarget(user);
        await loadRoleDialogData(user);
    };

    const assignRole = async () => {
        if (!roleTarget || !selectedRoleId) return;

        try {
            setIsSubmitting(true);
            await assignUserRole(roleTarget.id, { roleId: Number(selectedRoleId) });
            success("Đã gán vai trò", roleTarget.displayName);
            await loadRoleDialogData(roleTarget);
            await loadUsers();
        } catch (err) {
            error("Không gán được vai trò", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeRole = async (roleId: number) => {
        if (!roleTarget) return;

        try {
            setIsSubmitting(true);
            await removeUserRole(roleTarget.id, roleId);
            success("Đã gỡ vai trò", roleTarget.displayName);
            await loadRoleDialogData(roleTarget);
            await loadUsers();
        } catch (err) {
            error("Không gỡ được vai trò", getErrorMessage(err, "Vui lòng thử lại sau"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusColor = (status: UserStatus) => {
        if (status === "ACTIVE") return colors.secondary;
        if (status === "LOCKED") return colors.error;
        return colors.tertiaryContainer;
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: colors.background, minHeight: "100vh" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}>
                <Box>
                    <Typography sx={{ ...typography.h1, color: colors.onSurface, mb: 0.5 }}>
                        Quản lý người dùng
                    </Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Có tổng cộng {pagination.totalElements} người dùng trong hệ thống
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<UserPlus size={18} />}
                    onClick={openCreateDialog}
                    sx={{
                        borderRadius: radius.lg,
                        textTransform: "none",
                        px: 3,
                        py: 1.2,
                        fontWeight: 700,
                        boxShadow: "none",
                    }}
                >
                    Thêm người dùng
                </Button>
            </Stack>

            <Paper sx={{ borderRadius: radius.xl, overflow: "hidden", border: elevation.level1.border, boxShadow: elevation.level2.boxShadow }}>
                <Box sx={{ p: 2.5, bgcolor: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "center" }}>
                        <TextField
                            placeholder="Tìm kiếm theo tên hoặc email..."
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
                        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 170 } }}>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Trạng thái"
                                onChange={(event: SelectChangeEvent) => {
                                    setStatusFilter(event.target.value as "ALL" | UserStatus);
                                    setPage(1);
                                }}
                                sx={{ borderRadius: radius.button, bgcolor: components.input.background }}
                            >
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                {userStatuses.map((status) => (
                                    <MenuItem key={status} value={status}>{getStatusLabel(status)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 120 } }}>
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
                                {pageSizes.map((size) => (
                                    <MenuItem key={size} value={String(size)}>{size}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                <TableContainer>
                    <Table sx={{ minWidth: 980 }}>
                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                            <TableRow>
                                {["Người dùng", "Tài khoản", "Vị trí", "Loại", "Vai trò", "Trạng thái", "Thao tác"].map((label, index) => (
                                    <TableCell
                                        key={label}
                                        align={index === 6 ? "right" : "left"}
                                        sx={{ ...typography.labelCaps, color: colors.outline, py: 2, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}
                                    >
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
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                                <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 38, height: 38 }}>
                                                    {user.displayName?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.displayName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: "monospace", color: colors.onSurfaceVariant }}>
                                                @{user.username}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.position || "Chưa cập nhật"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={getTypeLabel(user.type)} size="small" sx={{ borderRadius: radius.md, fontWeight: 700 }} />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 220 }}>
                                            <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {roleNames(user.roles)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: statusColor(user.status) }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{getStatusLabel(user.status)}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Chỉnh sửa">
                                                <IconButton size="small" onClick={() => void openEditDialog(user)} disabled={isSubmitting}>
                                                    <Edit2 size={16} />
                                                </IconButton>
                                            </Tooltip>
                                            <IconButton
                                                size="small"
                                                disabled={isSubmitting}
                                                onClick={(event) => {
                                                    setAnchorEl(event.currentTarget);
                                                    setActionUser(user);
                                                }}
                                            >
                                                <MoreVertical size={16} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">Không tìm thấy người dùng nào</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ p: 2.5, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Typography variant="caption" color="text.secondary">
                        Hiển thị {users.length} trên {pagination.totalElements} người dùng
                    </Typography>
                    <Pagination
                        count={Math.max(pagination.totalPages, 1)}
                        page={page}
                        onChange={(_event, value) => setPage(value)}
                        shape="rounded"
                        size="small"
                        color="primary"
                    />
                </Box>
            </Paper>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeActionMenu}>
                <MenuItem onClick={() => actionUser && void openEditDialog(actionUser)}>
                    <Edit2 size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Chỉnh sửa</Typography>
                </MenuItem>
                <MenuItem onClick={() => actionUser && void openRoleDialog(actionUser)}>
                    <UserCog size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Quản lý vai trò</Typography>
                </MenuItem>
                {actionUser?.status === "LOCKED" ? (
                    <MenuItem onClick={() => actionUser && void confirmUnlockUser(actionUser)}>
                        <LockOpen size={16} />
                        <Typography sx={{ ml: 1.5 }} variant="body2">Mở khóa</Typography>
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => actionUser && openLockDialog(actionUser)}>
                        <Ban size={16} />
                        <Typography sx={{ ml: 1.5 }} variant="body2">Khóa tài khoản</Typography>
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => {
                        if (actionUser) setDeleteTarget(actionUser);
                        closeActionMenu();
                    }}
                    sx={{ color: "error.main" }}
                >
                    <Trash2 size={16} />
                    <Typography sx={{ ml: 1.5 }} variant="body2">Xóa người dùng</Typography>
                </MenuItem>
            </Menu>

            <Dialog open={Boolean(userDialogMode)} onClose={closeUserDialog} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={submitUserForm}>
                    <DialogTitle>{userDialogMode === "create" ? "Thêm người dùng" : "Chỉnh sửa người dùng"}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField label="Username" value={form.username} onChange={(event) => handleFormChange("username", event.target.value)} required={userDialogMode === "create"} disabled={userDialogMode === "edit"} fullWidth sx={inputSx} />
                            <TextField label="Họ và tên" value={form.fullName} onChange={(event) => handleFormChange("fullName", event.target.value)} required fullWidth sx={inputSx} />
                            <TextField label="Email" type="email" value={form.email} onChange={(event) => handleFormChange("email", event.target.value)} required={userDialogMode === "create"} disabled={userDialogMode === "edit"} fullWidth sx={inputSx} />
                            <TextField label="Vị trí" value={form.position} onChange={(event) => handleFormChange("position", event.target.value)} required fullWidth sx={inputSx} />
                            <FormControl fullWidth>
                                <InputLabel>Loại người dùng</InputLabel>
                                <Select value={form.type} label="Loại người dùng" onChange={(event: SelectChangeEvent) => handleFormChange("type", event.target.value as UserType)}>
                                    {userTypes.map((type) => <MenuItem key={type} value={type}>{getTypeLabel(type)}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField label="Avatar URL" value={form.avatar} onChange={(event) => handleFormChange("avatar", event.target.value)} fullWidth sx={inputSx} />
                            {userDialogMode === "edit" && (
                                <>
                                    <FormControl fullWidth>
                                        <InputLabel>Trạng thái</InputLabel>
                                        <Select value={form.status} label="Trạng thái" onChange={(event: SelectChangeEvent) => handleFormChange("status", event.target.value as UserStatus)}>
                                            {userStatuses.map((status) => <MenuItem key={status} value={status}>{getStatusLabel(status)}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <TextField label="Khóa đến" placeholder="2026-05-30T08:00:00" value={form.lockedUntil} onChange={(event) => handleFormChange("lockedUntil", event.target.value)} fullWidth sx={inputSx} />
                                </>
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={closeUserDialog} disabled={isSubmitting}>Hủy</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <Loader2 size={16} /> : undefined}>
                            Lưu
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Xóa người dùng</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc muốn xóa mềm tài khoản {deleteTarget?.displayName}?</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>Hủy</Button>
                    <Button color="error" variant="contained" onClick={() => void confirmDeleteUser()} disabled={isSubmitting}>Xóa</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(lockTarget)} onClose={() => setLockTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Khóa tài khoản</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography>Nhập lý do khóa tài khoản {lockTarget?.displayName} nếu cần.</Typography>
                        <TextField label="Lý do" value={lockReason} onChange={(event) => setLockReason(event.target.value)} fullWidth multiline minRows={3} sx={inputSx} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setLockTarget(null)} disabled={isSubmitting}>Hủy</Button>
                    <Button color="warning" variant="contained" onClick={() => void confirmLockUser()} disabled={isSubmitting}>Khóa</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(roleTarget)} onClose={() => setRoleTarget(null)} fullWidth maxWidth="sm">
                <DialogTitle>
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="h6">Quản lý vai trò</Typography>
                        <IconButton size="small" onClick={() => setRoleTarget(null)}><X size={18} /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {isRoleLoading ? (
                        <Stack sx={{ py: 5, alignItems: "center" }}>
                            <CircularProgress size={28} />
                        </Stack>
                    ) : (
                        <Stack spacing={3} sx={{ pt: 1 }}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Vai trò hiện tại</Typography>
                                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                                    {userRoles.length ? userRoles.map((role) => (
                                        <Chip
                                            key={role.id}
                                            label={role.displayName || role.name}
                                            onDelete={() => void removeRole(role.id)}
                                            disabled={isSubmitting}
                                            deleteIcon={<X size={14} />}
                                        />
                                    )) : <Typography color="text.secondary">Người dùng chưa có vai trò</Typography>}
                                </Stack>
                            </Box>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Vai trò</InputLabel>
                                    <Select value={selectedRoleId} label="Vai trò" onChange={(event: SelectChangeEvent) => setSelectedRoleId(event.target.value)}>
                                        {rolesAvailableForAssign.map((role) => (
                                            <MenuItem key={role.id} value={String(role.id)}>{role.displayName || role.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button variant="contained" startIcon={<KeyRound size={16} />} disabled={!selectedRoleId || isSubmitting} onClick={() => void assignRole()} sx={{ minWidth: 120 }}>
                                    Gán
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default UserPage;
