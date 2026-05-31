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
import { Edit2, Loader2, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { createKpiReview, deleteKpiReview, getKpiReviewHistory, updateKpiReview } from "../../api/kpi.api";
import { useToastify } from "../../hooks/useToastify";
import type { CreateKpiReviewRequest, KpiReview, UpdateKpiReviewRequest } from "../../interfaces/kpi.types";
import { hasKpiAuthority } from "../../lib/permissions";
import { useAuthStore } from "../../stores/auth.store";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, semantic, spacing, typography } = desginToken;

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

type ReviewForm = {
    userId: string;
    month: string;
    year: string;
    reviewScore: string;
    feedback: string;
};

const emptyForm: ReviewForm = {
    userId: "",
    month: String(currentMonth),
    year: String(currentYear),
    reviewScore: "",
    feedback: "",
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

const buildFormFromReview = (review: KpiReview): ReviewForm => ({
    userId: String(review.userId),
    month: String(review.month),
    year: String(review.year),
    reviewScore: String(review.reviewScore),
    feedback: review.feedback ?? "",
});

const KpiReviewPage = () => {
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [filterUserId, setFilterUserId] = useState("");
    const [reviews, setReviews] = useState<KpiReview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
    const [form, setForm] = useState<ReviewForm>(emptyForm);
    const [editingReview, setEditingReview] = useState<KpiReview | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<KpiReview | null>(null);

    const canCreate = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI/REVIEW:CREATE"),
        [currentUser, permissions]
    );
    const canUpdate = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI/REVIEW:UPDATE"),
        [currentUser, permissions]
    );
    const canDelete = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI/REVIEW:DELETE"),
        [currentUser, permissions]
    );

    useEffect(() => {
        if (!filterUserId && currentUser?.id) {
            setFilterUserId(String(currentUser.id));
        }
    }, [currentUser?.id, filterUserId]);

    const loadReviews = useCallback(async () => {
        const parsedUserId = Number(filterUserId);
        if (!parsedUserId) {
            error("Invalid filter", "User ID is required");
            return;
        }

        try {
            setIsLoading(true);
            const response = await getKpiReviewHistory(parsedUserId);
            setReviews(response);
        } catch (err) {
            error("Cannot load KPI reviews", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsLoading(false);
        }
    }, [error, filterUserId]);

    useEffect(() => {
        if (filterUserId) {
            void loadReviews();
        }
    }, [filterUserId, loadReviews]);

    const handleFormChange = <K extends keyof ReviewForm>(field: K, value: ReviewForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const userId = Number(form.userId);
        const month = Number(form.month);
        const year = Number(form.year);
        const reviewScore = Number(form.reviewScore);
        const feedback = form.feedback.trim();

        if (!userId) {
            error("Invalid review", "User ID is required");
            return null;
        }

        if (month < 1 || month > 12) {
            error("Invalid review", "Month must be from 1 to 12");
            return null;
        }

        if (!year || year < 2020 || year > 2100) {
            error("Invalid review", "Year must be from 2020 to 2100");
            return null;
        }

        if (Number.isNaN(reviewScore) || reviewScore < 1 || reviewScore > 10) {
            error("Invalid review", "Review score must be from 1.0 to 10.0");
            return null;
        }

        if (!feedback) {
            error("Invalid review", "Feedback is required");
            return null;
        }

        return { userId, month, year, reviewScore, feedback };
    };

    const openCreateDialog = () => {
        if (!canCreate) {
            error("Missing permission", "Requires KPI/REVIEW:CREATE or ADMIN");
            return;
        }

        setEditingReview(null);
        setForm({ ...emptyForm, userId: filterUserId || String(currentUser?.id ?? "") });
        setDialogMode("create");
    };

    const openEditDialog = (review: KpiReview) => {
        if (!canUpdate) {
            error("Missing permission", "Requires KPI/REVIEW:UPDATE or ADMIN");
            return;
        }

        if (review.isLocked) {
            error("Review is locked", "Locked reviews cannot be updated");
            return;
        }

        setEditingReview(review);
        setForm(buildFormFromReview(review));
        setDialogMode("edit");
    };

    const closeDialog = () => {
        setDialogMode(null);
        setEditingReview(null);
        setForm(emptyForm);
    };

    const submitReviewForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const values = validateForm();
        if (!values) return;

        try {
            setIsSubmitting(true);

            if (dialogMode === "create") {
                const payload: CreateKpiReviewRequest = values;
                await createKpiReview(payload);
                success("Review created", `User ID ${values.userId}`);
                setFilterUserId(String(values.userId));
            } else if (editingReview) {
                const payload: UpdateKpiReviewRequest = {
                    reviewScore: values.reviewScore,
                    feedback: values.feedback,
                };
                await updateKpiReview(editingReview.id, payload);
                success("Review updated", `Review ID ${editingReview.id}`);
            }

            closeDialog();
            await loadReviews();
        } catch (err) {
            error("Review action failed", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteDialog = (review: KpiReview) => {
        if (!canDelete) {
            error("Missing permission", "Requires KPI/REVIEW:DELETE or ADMIN");
            return;
        }

        if (review.isLocked) {
            error("Review is locked", "Locked reviews cannot be deleted");
            return;
        }

        setDeleteTarget(review);
    };

    const confirmDeleteReview = async () => {
        if (!deleteTarget) return;

        try {
            setIsSubmitting(true);
            await deleteKpiReview(deleteTarget.id);
            success("Review deleted", `Review ID ${deleteTarget.id}`);
            setDeleteTarget(null);
            await loadReviews();
        } catch (err) {
            error("Cannot delete review", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack spacing={spacing.lg}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                <Box>
                    <Typography sx={{ ...typography.h1, color: colors.onSurface, letterSpacing: 0 }}>KPI Reviews</Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Create monthly manager reviews and inspect the latest review history.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh reviews">
                        <span>
                            <IconButton onClick={() => void loadReviews()} disabled={isLoading}>
                                <RefreshCw size={18} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={canCreate ? "Create review" : "Requires KPI/REVIEW:CREATE or ADMIN"}>
                        <span>
                            <Button variant="contained" startIcon={<Plus size={18} />} onClick={openCreateDialog} disabled={!canCreate}>
                                New review
                            </Button>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>

            <Paper sx={{ borderRadius: radius.card, overflow: "hidden", border: elevation.level1.border, boxShadow: "none" }}>
                <Box component="form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void loadReviews(); }} sx={{ p: 2.5, bgcolor: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" } }}>
                        <TextField
                            label="User ID"
                            size="small"
                            value={filterUserId}
                            onChange={(event) => setFilterUserId(event.target.value)}
                            sx={{ ...inputSx, minWidth: { md: 180 } }}
                        />
                        <Button type="submit" variant="contained" startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Search size={16} />} disabled={isLoading}>
                            Load history
                        </Button>
                    </Stack>
                </Box>

                <TableContainer>
                    <Table sx={{ minWidth: 980 }}>
                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                            <TableRow>
                                {["Period", "User", "Reviewer", "Score", "Feedback", "State", "Updated", "Actions"].map((label, index) => (
                                    <TableCell key={label} align={index === 7 ? "right" : "left"} sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>
                                        {label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : reviews.length ? (
                                reviews.map((review) => (
                                    <TableRow key={review.id} hover>
                                        <TableCell>{review.month}/{review.year}</TableCell>
                                        <TableCell>ID {review.userId}</TableCell>
                                        <TableCell>ID {review.reviewerId}</TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 700 }}>{review.reviewScore.toFixed(1)}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 320 }}>
                                            <Typography variant="body2" noWrap>{review.feedback || "-"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={review.isLocked ? "Locked" : "Open"}
                                                size="small"
                                                sx={{
                                                    borderRadius: radius.chip,
                                                    bgcolor: review.isLocked ? semantic.warning.container : semantic.success.container,
                                                    color: review.isLocked ? semantic.warning.onContainer : semantic.success.onContainer,
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{formatDateTime(review.updatedAt ?? review.createdAt)}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={review.isLocked ? "Locked reviews cannot be updated" : canUpdate ? "Edit review" : "Requires KPI/REVIEW:UPDATE or ADMIN"}>
                                                <span>
                                                    <IconButton size="small" onClick={() => openEditDialog(review)} disabled={review.isLocked || !canUpdate || isSubmitting}>
                                                        <Edit2 size={16} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title={review.isLocked ? "Locked reviews cannot be deleted" : canDelete ? "Delete review" : "Requires KPI/REVIEW:DELETE or ADMIN"}>
                                                <span>
                                                    <IconButton size="small" color="error" onClick={() => openDeleteDialog(review)} disabled={review.isLocked || !canDelete || isSubmitting}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">No review history loaded</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={Boolean(dialogMode)} onClose={closeDialog} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={submitReviewForm}>
                    <DialogTitle>{dialogMode === "create" ? "Create KPI review" : "Update KPI review"}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField label="User ID" value={form.userId} onChange={(event) => handleFormChange("userId", event.target.value)} disabled={dialogMode === "edit"} required fullWidth sx={inputSx} />
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField label="Month" type="number" value={form.month} onChange={(event) => handleFormChange("month", event.target.value)} disabled={dialogMode === "edit"} required fullWidth sx={inputSx} />
                                <TextField label="Year" type="number" value={form.year} onChange={(event) => handleFormChange("year", event.target.value)} disabled={dialogMode === "edit"} required fullWidth sx={inputSx} />
                                <TextField label="Score" type="number" value={form.reviewScore} onChange={(event) => handleFormChange("reviewScore", event.target.value)} required fullWidth sx={inputSx} />
                            </Stack>
                            <TextField label="Feedback" value={form.feedback} onChange={(event) => handleFormChange("feedback", event.target.value)} required fullWidth multiline minRows={4} sx={inputSx} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={closeDialog} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <Loader2 size={16} /> : undefined}>
                            Save
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Delete KPI review</DialogTitle>
                <DialogContent>
                    <Typography>
                        Delete review ID {deleteTarget?.id}? Backend will recalculate the employee KPI after deletion.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={() => void confirmDeleteReview()} disabled={isSubmitting}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default KpiReviewPage;
