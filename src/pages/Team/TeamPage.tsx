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
import { Building2, Edit2, Eye, Loader2, Plus, Search, Trash2, UserMinus, UserPlus, Users, X } from "lucide-react";
import { addTeamMember, createTeam, deleteTeam, getTeamById, getTeams, removeTeamMember, updateTeam } from "../../api/team.api";
import { getUsers } from "../../api/user.api";
import { useToastify } from "../../hooks/useToastify";
import { hasAuthority } from "../../lib/permissions";
import { useAuthStore } from "../../stores/auth.store";
import desginToken from "../../theme/desginToken";
import type { CreateTeamRequest, Team, TeamDetail, TeamPagination, UpdateTeamRequest } from "../../interfaces/team.types";
import type { ManagedUser } from "../../interfaces/user.types";

const { colors, components, elevation, radius, spacing, typography } = desginToken;

const pageSizes = [10, 20, 50];

type TeamForm = {
    name: string;
    code: string;
    description: string;
    managerId: string;
};

const emptyForm: TeamForm = {
    name: "",
    code: "",
    description: "",
    managerId: "",
};

const emptyPagination: TeamPagination = {
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

const formatDateTime = (value?: string | null) => {
    if (!value) return "Not updated";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const buildFormFromTeam = (team: Team): TeamForm => ({
    name: team.name ?? "",
    code: team.code ?? "",
    description: team.description ?? "",
    managerId: team.managerId ? String(team.managerId) : "",
});

const TeamPage = () => {
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [teams, setTeams] = useState<Team[]>([]);
    const [pagination, setPagination] = useState<TeamPagination>(emptyPagination);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [teamDialogMode, setTeamDialogMode] = useState<"create" | "edit" | null>(null);
    const [form, setForm] = useState<TeamForm>(emptyForm);
    const [actionTeam, setActionTeam] = useState<Team | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
    const [detailTeam, setDetailTeam] = useState<TeamDetail | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [managerOptions, setManagerOptions] = useState<ManagedUser[]>([]);
    const [isManagersLoading, setIsManagersLoading] = useState(false);
    const [memberOptions, setMemberOptions] = useState<ManagedUser[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [memberCounts, setMemberCounts] = useState<Record<number, number>>({});

    const canView = useMemo(
        () => hasAuthority(currentUser, permissions, "TEAM:VIEW"),
        [currentUser, permissions]
    );

    const canCreate = useMemo(
        () => hasAuthority(currentUser, permissions, "TEAM:CREATE"),
        [currentUser, permissions]
    );

    const canUpdate = useMemo(
        () => hasAuthority(currentUser, permissions, "TEAM:UPDATE"),
        [currentUser, permissions]
    );

    const canDelete = useMemo(
        () => hasAuthority(currentUser, permissions, "TEAM:DELETE"),
        [currentUser, permissions]
    );

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    const loadTeams = useCallback(async () => {
        if (!canView) {
            setTeams([]);
            setPagination(emptyPagination);
            return;
        }

        try {
            setIsLoading(true);
            const keyword = debouncedSearch.trim();
            const response = await getTeams({
                page,
                limit,
                search: keyword || undefined,
            });

            setTeams(response.data);
            setPagination(response.pagination);
        } catch (err) {
            error("Cannot load teams", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsLoading(false);
        }
    }, [canView, debouncedSearch, error, limit, page]);

    useEffect(() => {
        void loadTeams();
    }, [loadTeams]);

    const loadManagerOptions = useCallback(async () => {
        try {
            setIsManagersLoading(true);
            const response = await getUsers({ page: 1, limit: 100, status: "active" });
            setManagerOptions(response.data);
        } catch (err) {
            error("Cannot load manager list", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsManagersLoading(false);
        }
    }, [error]);

    const loadMemberOptions = useCallback(async () => {
        try {
            const response = await getUsers({ page: 1, limit: 100, status: "active" });
            setMemberOptions(response.data);
        } catch (err) {
            error("Cannot load user list", getErrorMessage(err, "Please try again later"));
        }
    }, [error]);

    const openCreateDialog = async () => {
        setForm(emptyForm);
        setActionTeam(null);
        setTeamDialogMode("create");
        await loadManagerOptions();
    };

    const openEditDialog = async (team: Team) => {
        if (!canUpdate) return;

        try {
            setIsSubmitting(true);
            const [detail] = await Promise.all([getTeamById(team.id), loadManagerOptions()]);
            setForm(buildFormFromTeam(detail));
            setActionTeam(detail);
            setTeamDialogMode("edit");
            setMemberCounts((prev) => ({ ...prev, [detail.id]: detail.members.length }));
        } catch (err) {
            error("Cannot load team detail", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeTeamDialog = () => {
        setTeamDialogMode(null);
        setForm(emptyForm);
        setActionTeam(null);
    };

    const handleFormChange = <K extends keyof TeamForm>(field: K, value: TeamForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const buildCreatePayload = (): CreateTeamRequest => ({
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim() || undefined,
        managerId: form.managerId ? Number(form.managerId) : undefined,
    });

    const buildUpdatePayload = (): UpdateTeamRequest => ({
            name: form.name.trim(),
            code: form.code.trim(),
            description: form.description.trim() || undefined,
        managerId: form.managerId ? Number(form.managerId) : null,
    });

    const submitTeamForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const name = form.name.trim();
        const code = form.code.trim();

        if (!name || !code) {
            error("Missing information", "Team name and code are required");
            return;
        }

        try {
            setIsSubmitting(true);

            if (teamDialogMode === "create") {
                if (!canCreate) {
                    error("Missing permission", "Requires TEAM:CREATE or ADMIN");
                    return;
                }

                await createTeam(buildCreatePayload());
                success("Team created", "The team list has been updated");
            } else if (actionTeam) {
                if (!canUpdate) {
                    error("Missing permission", "Requires TEAM:UPDATE or ADMIN");
                    return;
                }

                await updateTeam(actionTeam.id, buildUpdatePayload());
                success("Team updated", "Team information has been saved");
            }

            closeTeamDialog();
            await loadTeams();
        } catch (err) {
            error("Team action failed", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDetailDialog = async (team: Team) => {
        try {
            setIsDetailLoading(true);
            setDetailTeam(null);
            const [detail] = await Promise.all([getTeamById(team.id), loadMemberOptions()]);
            setDetailTeam(detail);
            setMemberCounts((prev) => ({ ...prev, [detail.id]: detail.members.length }));
            setSelectedMemberId("");
        } catch (err) {
            error("Cannot load team detail", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsDetailLoading(false);
        }
    };

    const refreshDetailTeam = async (teamId: number) => {
        const detail = await getTeamById(teamId);
        setDetailTeam(detail);
        setMemberCounts((prev) => ({ ...prev, [detail.id]: detail.members.length }));
    };

    const addMember = async () => {
        if (!detailTeam || !selectedMemberId) return;

        try {
            setIsSubmitting(true);
            const response = await addTeamMember(detailTeam.id, { userId: Number(selectedMemberId) });
            success("Member added", response.message || detailTeam.name);
            setSelectedMemberId("");
            await refreshDetailTeam(detailTeam.id);
            await loadTeams();
        } catch (err) {
            error("Cannot add member", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeMember = async (user: ManagedUser) => {
        if (!detailTeam) return;

        try {
            setIsSubmitting(true);
            const response = await removeTeamMember(detailTeam.id, user.id);
            success("Member removed", response.message || user.displayName);
            await refreshDetailTeam(detailTeam.id);
            await loadTeams();
        } catch (err) {
            error("Cannot remove member", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteTeam = async () => {
        if (!deleteTarget) return;

        try {
            setIsSubmitting(true);
            const response = await deleteTeam(deleteTarget.id);
            success("Team deleted", response.message || deleteTarget.name);
            setDeleteTarget(null);
            await loadTeams();
        } catch (err) {
            error("Cannot delete team", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack spacing={spacing.lg} sx={{ flex: 1 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                <Box>
                    <Typography sx={{ ...typography.h1, color: colors.onSurface, letterSpacing: 0 }}>
                        Team Management
                    </Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Manage departments, team codes, managers, and membership visibility.
                    </Typography>
                </Box>
                {canCreate && (
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => void openCreateDialog()}
                        sx={{ borderRadius: radius.lg, textTransform: "none", px: 3, py: 1.2, fontWeight: 700, boxShadow: "none" }}
                    >
                        Add team
                    </Button>
                )}
            </Stack>

            <Paper sx={{ borderRadius: radius.xl, overflow: "hidden", border: elevation.level1.border, boxShadow: elevation.level2.boxShadow }}>
                <Box sx={{ p: 2.5, bgcolor: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "center" }}>
                        <TextField
                            placeholder="Search by team name or code..."
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            disabled={!canView}
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
                        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 120 } }}>
                            <InputLabel>Display</InputLabel>
                            <Select
                                value={String(limit)}
                                label="Display"
                                onChange={(event: SelectChangeEvent) => {
                                    setLimit(Number(event.target.value));
                                    setPage(1);
                                }}
                                disabled={!canView}
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
                                {["Team", "Code", "Description", "Manager", "Members", "Updated", "Actions"].map((label, index) => (
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
                            {!canView ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">Requires TEAM:VIEW or ADMIN to view team data.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : teams.length > 0 ? (
                                teams.map((team) => (
                                    <TableRow key={team.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                                <Box sx={{ width: 38, height: 38, borderRadius: radius.base, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: colors.primaryFixed, color: colors.onPrimaryFixedVariant }}>
                                                    <Building2 size={18} />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{team.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">ID {team.id}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Box component="code" sx={{ fontFamily: "monospace", fontSize: 12, bgcolor: colors.surfaceContainerHighest, color: colors.onSurfaceVariant, px: 1, py: 0.5, borderRadius: radius.base }}>
                                                {team.code}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 260 }}>
                                            <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {team.description || "No description"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {team.managerName || "Unassigned"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<Users size={14} />}
                                                label={memberCounts[team.id] === undefined ? "View detail" : `${memberCounts[team.id]} members`}
                                                size="small"
                                                sx={{ borderRadius: radius.chip, fontWeight: 700 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{formatDateTime(team.updatedAt)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View detail">
                                                <IconButton size="small" onClick={() => void openDetailDialog(team)} disabled={isDetailLoading}>
                                                    <Eye size={16} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={canUpdate ? "Edit team" : "Requires TEAM:UPDATE or ADMIN"}>
                                                <span>
                                                    <IconButton size="small" onClick={() => void openEditDialog(team)} disabled={!canUpdate || isSubmitting}>
                                                        <Edit2 size={16} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title={canDelete ? "Delete team" : "Requires TEAM:DELETE or ADMIN"}>
                                                <span>
                                                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(team)} disabled={!canDelete || isSubmitting}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">No teams found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ p: 2.5, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Typography variant="caption" color="text.secondary">
                        Showing {teams.length} of {pagination.totalElements} teams
                    </Typography>
                    <Pagination
                        count={Math.max(pagination.totalPages, 1)}
                        page={page}
                        onChange={(_event, value) => setPage(value)}
                        shape="rounded"
                        size="small"
                        color="primary"
                        disabled={!canView}
                    />
                </Box>
            </Paper>

            <Dialog open={Boolean(teamDialogMode)} onClose={closeTeamDialog} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={submitTeamForm}>
                    <DialogTitle>{teamDialogMode === "create" ? "Add team" : "Edit team"}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField label="Team name" value={form.name} onChange={(event) => handleFormChange("name", event.target.value)} required fullWidth sx={inputSx} />
                            <TextField label="Team code" value={form.code} onChange={(event) => handleFormChange("code", event.target.value)} required fullWidth sx={inputSx} />
                            <TextField label="Description" value={form.description} onChange={(event) => handleFormChange("description", event.target.value)} fullWidth multiline minRows={3} sx={inputSx} />
                            <FormControl fullWidth>
                                <InputLabel>Manager</InputLabel>
                                <Select
                                    value={form.managerId}
                                    label="Manager"
                                    onChange={(event: SelectChangeEvent) => handleFormChange("managerId", event.target.value)}
                                    disabled={isManagersLoading}
                                >
                                    <MenuItem value="">No manager</MenuItem>
                                    {managerOptions.map((user) => (
                                        <MenuItem key={user.id} value={String(user.id)}>
                                            {user.displayName} ({user.username})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={closeTeamDialog} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting || isManagersLoading} startIcon={isSubmitting ? <Loader2 size={16} /> : undefined}>
                            Save
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={isDetailLoading || Boolean(detailTeam)} onClose={() => setDetailTeam(null)} fullWidth maxWidth="md">
                <DialogTitle>
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="h6">Team detail</Typography>
                        <IconButton size="small" onClick={() => setDetailTeam(null)} disabled={isDetailLoading}><X size={18} /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {isDetailLoading ? (
                        <Stack sx={{ py: 6, alignItems: "center" }}>
                            <CircularProgress size={28} />
                        </Stack>
                    ) : detailTeam ? (
                        <Stack spacing={3} sx={{ pt: 1 }}>
                            <Paper elevation={0} sx={{ p: spacing.md, borderRadius: radius.card, border: elevation.level1.border, boxShadow: "none" }}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                                    <Box>
                                        <Typography sx={{ ...typography.h2, color: colors.onSurface }}>{detailTeam.name}</Typography>
                                        <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>{detailTeam.description || "No description"}</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", flexWrap: "wrap" }}>
                                        <Chip label={detailTeam.code} sx={{ borderRadius: radius.chip, fontWeight: 700 }} />
                                        <Chip label={detailTeam.managerName || "No manager"} variant="outlined" sx={{ borderRadius: radius.chip, fontWeight: 700 }} />
                                    </Stack>
                                </Stack>
                            </Paper>

                            <Box>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" }, mb: 1 }}>
                                    <Typography sx={{ ...typography.labelCaps, color: colors.outline }}>
                                        Members ({detailTeam.members.length})
                                    </Typography>
                                    {canUpdate && (
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ minWidth: { md: 360 } }}>
                                            <FormControl size="small" fullWidth>
                                                <InputLabel>Add member</InputLabel>
                                                <Select
                                                    value={selectedMemberId}
                                                    label="Add member"
                                                    onChange={(event: SelectChangeEvent) => setSelectedMemberId(event.target.value)}
                                                    disabled={isSubmitting}
                                                >
                                                    {memberOptions
                                                        .filter((user) => !detailTeam.members.some((member) => member.id === user.id))
                                                        .map((user) => (
                                                            <MenuItem key={user.id} value={String(user.id)}>
                                                                {user.displayName} ({user.username})
                                                            </MenuItem>
                                                        ))}
                                                </Select>
                                            </FormControl>
                                            <Button
                                                variant="contained"
                                                startIcon={<UserPlus size={16} />}
                                                disabled={!selectedMemberId || isSubmitting}
                                                onClick={() => void addMember()}
                                                sx={{ minWidth: 110, textTransform: "none" }}
                                            >
                                                Add
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                                <TableContainer component={Paper} elevation={0} sx={{ border: elevation.level1.border, borderRadius: radius.card }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                                            <TableRow>
                                                <TableCell>User</TableCell>
                                                <TableCell>Position</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Status</TableCell>
                                                {canUpdate && <TableCell align="right">Actions</TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detailTeam.members.length ? detailTeam.members.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                                            <Avatar src={member.avatarUrl ?? undefined} sx={{ width: 32, height: 32 }}>
                                                                {member.displayName?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{member.displayName}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{member.email}</Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>{member.position || "Not updated"}</TableCell>
                                                    <TableCell>{member.type}</TableCell>
                                                    <TableCell>{member.status}</TableCell>
                                                    {canUpdate && (
                                                        <TableCell align="right">
                                                            <Tooltip title="Remove member">
                                                                <span>
                                                                    <IconButton size="small" color="error" disabled={isSubmitting} onClick={() => void removeMember(member)}>
                                                                        <UserMinus size={16} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={canUpdate ? 5 : 4} align="center" sx={{ py: 4 }}>
                                                        <Typography color="text.secondary">No members in this team</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Stack>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Delete team</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to soft delete {deleteTarget?.name}?</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={() => void confirmDeleteTeam()} disabled={isSubmitting}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default TeamPage;
