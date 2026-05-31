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
import { createKpiAppeal, getPendingKpiAppeals, resolveKpiAppeal } from "../../api/kpi.api";
import { useToastify } from "../../hooks/useToastify";
import type { KpiAppeal, ResolveKpiAppealRequest } from "../../interfaces/kpi.types";
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

const KpiAppealPage = () => {
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [appeals, setAppeals] = useState<KpiAppeal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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

    useEffect(() => {
        void loadAppeals();
    }, [loadAppeals]);

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
                            <IconButton onClick={() => void loadAppeals()} disabled={isLoading || !canResolve}>
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
