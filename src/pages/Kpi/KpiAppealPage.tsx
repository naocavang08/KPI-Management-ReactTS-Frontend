import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Pagination,
    Paper,
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
} from "@mui/material";
import { CheckCircle2, ExternalLink, Loader2, Plus, RefreshCw, XCircle } from "lucide-react";
import { createKpiAppeal, getKpiAppealHistory, getMyKpiAppeals, getPendingKpiAppeals, resolveKpiAppeal } from "../../api/kpi.api";
import { getTeams } from "../../api/team.api";
import { useToastify } from "../../hooks/useToastify";
import type { KpiAppeal, KpiAppealHistoryQuery, KpiAppealPagination, KpiAppealStatus, ResolveKpiAppealRequest } from "../../interfaces/kpi.types";
import type { Team } from "../../interfaces/team.types";
import { hasKpiAuthority } from "../../lib/permissions";
import { useAuthStore } from "../../stores/auth.store";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, semantic, spacing, typography } = desginToken;

type AppealForm = {
    kpiReviewId: string;
    reason: string;
    evidenceLink: string;
};

type ResolveForm = {
    status: ResolveKpiAppealRequest["status"];
    resolutionComment: string;
};

const emptyAppealForm: AppealForm = {
    kpiReviewId: "",
    reason: "",
    evidenceLink: "",
};

const emptyPagination: KpiAppealPagination = {
    page: 1,
    limit: 10,
    totalElements: 0,
    totalPages: 1,
};

const appealStatuses: KpiAppealStatus[] = ["PENDING", "APPROVED", "REJECTED"];

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
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const getAppealStatusTone = (status: KpiAppealStatus) => {
    if (status === "APPROVED") return { bg: semantic.success.container, fg: semantic.success.onContainer };
    if (status === "REJECTED") return { bg: semantic.danger.container, fg: semantic.danger.onContainer };
    return { bg: semantic.warning.container, fg: semantic.warning.onContainer };
};

const KpiAppealPage = () => {
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [appeals, setAppeals] = useState<KpiAppeal[]>([]);
    const [myAppeals, setMyAppeals] = useState<KpiAppeal[]>([]);
    const [historyAppeals, setHistoryAppeals] = useState<KpiAppeal[]>([]);
    const [historyPagination, setHistoryPagination] = useState<KpiAppealPagination>(emptyPagination);
    const [myStatusFilter, setMyStatusFilter] = useState<"ALL" | KpiAppealStatus>("ALL");
    const [historyStatusFilter, setHistoryStatusFilter] = useState<KpiAppealHistoryQuery["status"]>("ALL");
    const [historyTeamId, setHistoryTeamId] = useState("");
    const [teamOptions, setTeamOptions] = useState<Team[]>([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isMyLoading, setIsMyLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [appealForm, setAppealForm] = useState<AppealForm>(emptyAppealForm);
    const [resolveTarget, setResolveTarget] = useState<KpiAppeal | null>(null);
    const [resolveForm, setResolveForm] = useState<ResolveForm>({
        status: "APPROVED",
        resolutionComment: "",
    });

    const canCreate = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI/APPEAL:CREATE"),
        [currentUser, permissions]
    );
    const canResolve = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI/APPEAL:RESOLVE"),
        [currentUser, permissions]
    );

    const loadTeamOptions = useCallback(async () => {
        if (!canResolve) {
            setTeamOptions([]);
            return;
        }

        try {
            const response = await getTeams({ page: 1, limit: 100 });
            setTeamOptions(response.data);
        } catch (err) {
            error("Cannot load teams", getErrorMessage(err, "Please try again later"));
        }
    }, [canResolve, error]);

    useEffect(() => {
        void loadTeamOptions();
    }, [loadTeamOptions]);

    const hasCurrentUserTeamOption = useMemo(
        () => currentUser?.teamId !== null && currentUser?.teamId !== undefined && !teamOptions.some((team) => team.id === currentUser.teamId),
        [currentUser?.teamId, teamOptions]
    );

    const loadAppeals = useCallback(async () => {
        if (!canResolve) {
            setAppeals([]);
            return;
        }

        try {
            setIsLoading(true);
            const response = await getPendingKpiAppeals();
            setAppeals(response);
        } catch (err) {
            error("Cannot load pending appeals", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsLoading(false);
        }
    }, [canResolve, error]);

    const loadMyAppeals = useCallback(async () => {
        if (!canCreate) {
            setMyAppeals([]);
            return;
        }

        try {
            setIsMyLoading(true);
            const response = await getMyKpiAppeals({
                status: myStatusFilter === "ALL" ? undefined : myStatusFilter,
            });
            setMyAppeals(response);
        } catch (err) {
            error("Cannot load my appeals", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsMyLoading(false);
        }
    }, [canCreate, error, myStatusFilter]);

    const loadAppealHistory = useCallback(async () => {
        if (!canResolve) {
            setHistoryAppeals([]);
            setHistoryPagination(emptyPagination);
            return;
        }

        try {
            setIsHistoryLoading(true);
            const normalizedTeamId = historyTeamId.trim();
            const parsedTeamId = normalizedTeamId ? Number(normalizedTeamId) : undefined;
            if (parsedTeamId !== undefined && (!Number.isInteger(parsedTeamId) || parsedTeamId <= 0)) {
                error("Invalid team", "Please choose a valid team");
                return;
            }
            const response = await getKpiAppealHistory({
                page: historyPage,
                limit: 10,
                status: historyStatusFilter,
                teamId: parsedTeamId,
            });
            setHistoryAppeals(response.data);
            setHistoryPagination(response.pagination);
        } catch (err) {
            error("Cannot load appeal history", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsHistoryLoading(false);
        }
    }, [canResolve, error, historyPage, historyStatusFilter, historyTeamId]);

    useEffect(() => {
        void loadAppeals();
    }, [loadAppeals]);

    useEffect(() => {
        void loadMyAppeals();
    }, [loadMyAppeals]);

    useEffect(() => {
        void loadAppealHistory();
    }, [loadAppealHistory]);

    const updateAppealForm = <K extends keyof AppealForm>(field: K, value: AppealForm[K]) => {
        setAppealForm((prev) => ({ ...prev, [field]: value }));
    };

    const submitAppeal = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const kpiReviewId = Number(appealForm.kpiReviewId);
        const reason = appealForm.reason.trim();
        const evidenceLink = appealForm.evidenceLink.trim();

        if (!canCreate) {
            error("Missing permission", "Requires KPI/APPEAL:CREATE or ADMIN");
            return;
        }

        if (!kpiReviewId || !reason || !evidenceLink) {
            error("Invalid appeal", "Review ID, reason, and evidence link are required");
            return;
        }

        try {
            setIsSubmitting(true);
            await createKpiAppeal({
                kpiReviewId,
                reason,
                evidenceLink,
            });
            success("Appeal submitted", `Review ID ${kpiReviewId}`);
            setCreateOpen(false);
            setAppealForm(emptyAppealForm);
            await loadAppeals();
            await loadMyAppeals();
        } catch (err) {
            error("Cannot submit appeal", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openResolveDialog = (appeal: KpiAppeal, status: ResolveForm["status"]) => {
        if (!canResolve) {
            error("Missing permission", "Requires KPI/APPEAL:RESOLVE or ADMIN");
            return;
        }

        setResolveTarget(appeal);
        setResolveForm({ status, resolutionComment: "" });
    };

    const submitResolution = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!resolveTarget) return;

        const resolutionComment = resolveForm.resolutionComment.trim();
        if (!resolutionComment) {
            error("Invalid resolution", "Resolution comment is required");
            return;
        }

        try {
            setIsSubmitting(true);
            await resolveKpiAppeal(resolveTarget.id, {
                status: resolveForm.status,
                resolutionComment,
            });
            success("Appeal resolved", `Appeal ID ${resolveTarget.id}`);
            setResolveTarget(null);
            await loadAppeals();
            await loadMyAppeals();
            await loadAppealHistory();
        } catch (err) {
            error("Cannot resolve appeal", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack spacing={spacing.lg}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                <Box>
                    <Typography sx={{ ...typography.h1, color: colors.onSurface, letterSpacing: 0 }}>KPI Appeals</Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Submit review appeals and resolve pending team requests.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Tooltip title={canResolve ? "Refresh pending appeals" : "Requires KPI/APPEAL:RESOLVE or ADMIN"}>
                        <span>
                            <IconButton
                                onClick={() => {
                                    void loadAppeals();
                                    void loadMyAppeals();
                                    void loadAppealHistory();
                                }}
                                disabled={isLoading || isMyLoading || isHistoryLoading}
                            >
                                <RefreshCw size={18} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={canCreate ? "Create appeal" : "Requires KPI/APPEAL:CREATE or ADMIN"}>
                        <span>
                            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setCreateOpen(true)} disabled={!canCreate}>
                                New appeal
                            </Button>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>

            <Paper sx={{ borderRadius: radius.card, overflow: "hidden", border: elevation.level1.border, boxShadow: "none" }}>
                <TableContainer>
                    <Table sx={{ minWidth: 1040 }}>
                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                            <TableRow>
                                {["Complainant", "Review", "Reason", "Evidence", "Status", "Created", "Actions"].map((label, index) => (
                                    <TableCell key={label} align={index === 6 ? "right" : "left"} sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>
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
                            ) : appeals.length ? (
                                appeals.map((appeal) => (
                                    <TableRow key={appeal.id} hover>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 700 }}>{appeal.complainantDisplayName}</Typography>
                                            <Typography variant="caption" color="text.secondary">@{appeal.complainantUsername} / ID {appeal.userId}</Typography>
                                        </TableCell>
                                        <TableCell>ID {appeal.kpiReviewId}</TableCell>
                                        <TableCell sx={{ maxWidth: 360 }}>
                                            <Typography variant="body2">{appeal.reason}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {appeal.evidenceLink ? (
                                                <Button
                                                    size="small"
                                                    component="a"
                                                    href={appeal.evidenceLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    endIcon={<ExternalLink size={14} />}
                                                >
                                                    Open
                                                </Button>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={appeal.status}
                                                size="small"
                                                sx={{
                                                    borderRadius: radius.chip,
                                                    bgcolor: semantic.warning.container,
                                                    color: semantic.warning.onContainer,
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{formatDateTime(appeal.createdAt)}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={canResolve ? "Approve appeal" : "Requires KPI/APPEAL:RESOLVE or ADMIN"}>
                                                <span>
                                                    <IconButton size="small" color="success" onClick={() => openResolveDialog(appeal, "APPROVED")} disabled={!canResolve || isSubmitting}>
                                                        <CheckCircle2 size={16} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title={canResolve ? "Reject appeal" : "Requires KPI/APPEAL:RESOLVE or ADMIN"}>
                                                <span>
                                                    <IconButton size="small" color="error" onClick={() => openResolveDialog(appeal, "REJECTED")} disabled={!canResolve || isSubmitting}>
                                                        <XCircle size={16} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            {canResolve ? "No pending appeals" : "You can submit an appeal, but pending appeals require resolver permission"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Paper sx={{ borderRadius: radius.card, overflow: "hidden", border: elevation.level1.border, boxShadow: "none" }}>
                <Box sx={{ p: 2, borderBottom: elevation.level1.border, bgcolor: colors.surfaceContainerLowest }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                        <Box>
                            <Typography sx={{ ...typography.h2, color: colors.onSurface }}>My appeals</Typography>
                            <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>Appeals submitted by the current account.</Typography>
                        </Box>
                        <TextField
                            select
                            label="Status"
                            size="small"
                            value={myStatusFilter}
                            onChange={(event) => setMyStatusFilter(event.target.value as "ALL" | KpiAppealStatus)}
                            sx={{ ...inputSx, minWidth: 180 }}
                            disabled={!canCreate || isMyLoading}
                        >
                            <MenuItem value="ALL">All</MenuItem>
                            {appealStatuses.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </Box>
                <TableContainer>
                    <Table sx={{ minWidth: 920 }}>
                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                            <TableRow>
                                {["Review", "Reason", "Evidence", "Status", "Resolved by", "Updated"].map((label) => (
                                    <TableCell key={label} sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>
                                        {label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isMyLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : myAppeals.length ? (
                                myAppeals.map((appeal) => {
                                    const tone = getAppealStatusTone(appeal.status);
                                    return (
                                        <TableRow key={appeal.id} hover>
                                            <TableCell>ID {appeal.kpiReviewId}</TableCell>
                                            <TableCell sx={{ maxWidth: 360 }}>{appeal.reason}</TableCell>
                                            <TableCell>
                                                <Button size="small" component="a" href={appeal.evidenceLink ?? "#"} target="_blank" rel="noreferrer" disabled={!appeal.evidenceLink} endIcon={<ExternalLink size={14} />}>
                                                    Open
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={appeal.status} size="small" sx={{ borderRadius: radius.chip, bgcolor: tone.bg, color: tone.fg, fontWeight: 700 }} />
                                            </TableCell>
                                            <TableCell>{appeal.resolverDisplayName || appeal.resolvedBy || "-"}</TableCell>
                                            <TableCell>{formatDateTime(appeal.updatedAt)}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">{canCreate ? "No appeals found" : "Requires KPI/APPEAL:CREATE or ADMIN"}</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Paper sx={{ borderRadius: radius.card, overflow: "hidden", border: elevation.level1.border, boxShadow: "none" }}>
                <Box sx={{ p: 2, borderBottom: elevation.level1.border, bgcolor: colors.surfaceContainerLowest }}>
                    <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { lg: "center" } }}>
                        <Box>
                            <Typography sx={{ ...typography.h2, color: colors.onSurface }}>Appeal history</Typography>
                            <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>Resolved appeals for your team scope or the company.</Typography>
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <TextField
                                select
                                label="Status"
                                size="small"
                                value={historyStatusFilter}
                                onChange={(event) => {
                                    setHistoryStatusFilter(event.target.value as KpiAppealHistoryQuery["status"]);
                                    setHistoryPage(1);
                                }}
                                sx={{ ...inputSx, minWidth: 170 }}
                                disabled={!canResolve || isHistoryLoading}
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                {appealStatuses.map((status) => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Team"
                                size="small"
                                value={historyTeamId}
                                onChange={(event) => {
                                    setHistoryTeamId(event.target.value);
                                    setHistoryPage(1);
                                }}
                                sx={{ ...inputSx, minWidth: 220 }}
                                disabled={!canResolve || isHistoryLoading}
                            >
                                <MenuItem value="">All teams</MenuItem>
                                {teamOptions.map((team) => (
                                    <MenuItem key={team.id} value={String(team.id)}>
                                        {team.name} ({team.code})
                                    </MenuItem>
                                ))}
                                {hasCurrentUserTeamOption && (
                                    <MenuItem value={String(currentUser?.teamId)}>
                                        Team #{currentUser?.teamId}
                                    </MenuItem>
                                )}
                            </TextField>
                        </Stack>
                    </Stack>
                </Box>
                <TableContainer>
                    <Table sx={{ minWidth: 1040 }}>
                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                            <TableRow>
                                {["Complainant", "Review", "Status", "Resolver", "Comment", "Updated"].map((label) => (
                                    <TableCell key={label} sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>
                                        {label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isHistoryLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : historyAppeals.length ? (
                                historyAppeals.map((appeal) => {
                                    const tone = getAppealStatusTone(appeal.status);
                                    return (
                                        <TableRow key={appeal.id} hover>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 700 }}>{appeal.complainantDisplayName}</Typography>
                                                <Typography variant="caption" color="text.secondary">@{appeal.complainantUsername} / ID {appeal.userId}</Typography>
                                            </TableCell>
                                            <TableCell>ID {appeal.kpiReviewId}</TableCell>
                                            <TableCell>
                                                <Chip label={appeal.status} size="small" sx={{ borderRadius: radius.chip, bgcolor: tone.bg, color: tone.fg, fontWeight: 700 }} />
                                            </TableCell>
                                            <TableCell>{appeal.resolverDisplayName || appeal.resolverUsername || appeal.resolvedBy || "-"}</TableCell>
                                            <TableCell sx={{ maxWidth: 360 }}>{appeal.resolutionComment || "-"}</TableCell>
                                            <TableCell>{formatDateTime(appeal.updatedAt)}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">{canResolve ? "No appeal history found" : "Requires KPI/APPEAL:RESOLVE or ADMIN"}</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: elevation.level1.border }}>
                    <Typography variant="caption" color="text.secondary">
                        Showing {historyAppeals.length} of {historyPagination.totalElements} appeals
                    </Typography>
                    <Pagination
                        count={Math.max(historyPagination.totalPages, 1)}
                        page={historyPage}
                        onChange={(_event, value) => setHistoryPage(value)}
                        size="small"
                        shape="rounded"
                        color="primary"
                        disabled={!canResolve || isHistoryLoading}
                    />
                </Box>
            </Paper>

            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={submitAppeal}>
                    <DialogTitle>Create KPI appeal</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField label="KPI review ID" type="number" value={appealForm.kpiReviewId} onChange={(event) => updateAppealForm("kpiReviewId", event.target.value)} required fullWidth sx={inputSx} />
                            <TextField label="Evidence link" value={appealForm.evidenceLink} onChange={(event) => updateAppealForm("evidenceLink", event.target.value)} required fullWidth sx={inputSx} />
                            <TextField label="Reason" value={appealForm.reason} onChange={(event) => updateAppealForm("reason", event.target.value)} required fullWidth multiline minRows={4} sx={inputSx} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <Loader2 size={16} /> : undefined}>
                            Submit
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={Boolean(resolveTarget)} onClose={() => setResolveTarget(null)} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={submitResolution}>
                    <DialogTitle>Resolve appeal ID {resolveTarget?.id}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField
                                select
                                label="Resolution"
                                value={resolveForm.status}
                                onChange={(event) => setResolveForm((prev) => ({ ...prev, status: event.target.value as ResolveForm["status"] }))}
                                fullWidth
                                sx={inputSx}
                            >
                                <MenuItem value="APPROVED">Approved</MenuItem>
                                <MenuItem value="REJECTED">Rejected</MenuItem>
                            </TextField>
                            <TextField
                                label="Resolution comment"
                                value={resolveForm.resolutionComment}
                                onChange={(event) => setResolveForm((prev) => ({ ...prev, resolutionComment: event.target.value }))}
                                required
                                fullWidth
                                multiline
                                minRows={4}
                                sx={inputSx}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setResolveTarget(null)} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <Loader2 size={16} /> : undefined}>
                            Save resolution
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Stack>
    );
};

export default KpiAppealPage;
