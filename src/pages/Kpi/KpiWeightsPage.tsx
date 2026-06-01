import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Paper,
    Slider,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { RefreshCw, Save, Scale } from "lucide-react";
import { getKpiWeights, updateKpiWeights } from "../../api/kpi.api";
import { useToastify } from "../../hooks/useToastify";
import { hasKpiAuthority } from "../../lib/permissions";
import { useAuthStore } from "../../stores/auth.store";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, spacing, typography } = desginToken;

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

const toPercent = (value: number) => Math.round(value * 100);
const toDecimal = (value: number) => Math.round(value) / 100;

const KpiWeightsPage = () => {
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [taskWeight, setTaskWeight] = useState(0.6);
    const [reviewWeight, setReviewWeight] = useState(0.4);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canUpdate = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI/WEIGHT:UPDATE"),
        [currentUser, permissions]
    );

    const loadWeights = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getKpiWeights();
            setTaskWeight(response.taskWeight);
            setReviewWeight(response.reviewWeight);
        } catch (err) {
            error("Cannot load KPI weights", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsLoading(false);
        }
    }, [error]);

    useEffect(() => {
        void loadWeights();
    }, [loadWeights]);

    const setTaskPercent = (percent: number) => {
        const task = toDecimal(percent);
        setTaskWeight(task);
        setReviewWeight(toDecimal(100 - percent));
    };

    const setReviewPercent = (percent: number) => {
        const review = toDecimal(percent);
        setReviewWeight(review);
        setTaskWeight(toDecimal(100 - percent));
    };

    const submitWeights = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canUpdate) {
            error("Missing permission", "Requires KPI/WEIGHT:UPDATE or ADMIN");
            return;
        }

        const total = Number((taskWeight + reviewWeight).toFixed(2));
        if (taskWeight < 0 || taskWeight > 1 || reviewWeight < 0 || reviewWeight > 1 || total !== 1) {
            error("Invalid weights", "Task weight and review weight must be between 0 and 1 and sum to 1.0");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await updateKpiWeights({ taskWeight, reviewWeight });
            success("Weights updated", response.message || "KPI weights saved");
            await loadWeights();
        } catch (err) {
            error("Cannot update KPI weights", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack spacing={spacing.lg}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                <Box>
                    <Typography sx={{ ...typography.h1, color: colors.onSurface, letterSpacing: 0 }}>KPI Weights</Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Configure how task completion and manager reviews contribute to KPI scores.
                    </Typography>
                </Box>
                <Tooltip title="Reload current weights">
                    <span>
                        <Button variant="outlined" startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshCw size={16} />} onClick={() => void loadWeights()} disabled={isLoading}>
                            Refresh
                        </Button>
                    </span>
                </Tooltip>
            </Stack>

            <Box component="form" onSubmit={submitWeights}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: spacing.lg, borderRadius: radius.card, border: elevation.level1.border, boxShadow: "none" }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={spacing.md} sx={{ alignItems: "center" }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: radius.base, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: colors.primaryFixed, color: colors.onPrimaryFixedVariant }}>
                                        <Scale size={20} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>Task completion</Typography>
                                        <Typography sx={{ ...typography.h2, color: colors.onSurface, letterSpacing: 0 }}>{toPercent(taskWeight)}%</Typography>
                                    </Box>
                                </Stack>
                                <Slider value={toPercent(taskWeight)} min={0} max={100} step={1} onChange={(_, value) => setTaskPercent(value as number)} disabled={!canUpdate || isSubmitting} />
                                <TextField label="Task weight" type="number" value={taskWeight} onChange={(event) => setTaskPercent(Number(event.target.value) * 100)} slotProps={{ htmlInput: { min: 0, max: 1, step: 0.01 } }} fullWidth sx={inputSx} disabled={!canUpdate || isSubmitting} />
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: spacing.lg, borderRadius: radius.card, border: elevation.level1.border, boxShadow: "none" }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={spacing.md} sx={{ alignItems: "center" }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: radius.base, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: colors.secondaryFixed, color: colors.onSecondaryFixedVariant }}>
                                        <Scale size={20} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>Manager review</Typography>
                                        <Typography sx={{ ...typography.h2, color: colors.onSurface, letterSpacing: 0 }}>{toPercent(reviewWeight)}%</Typography>
                                    </Box>
                                </Stack>
                                <Slider value={toPercent(reviewWeight)} min={0} max={100} step={1} onChange={(_, value) => setReviewPercent(value as number)} disabled={!canUpdate || isSubmitting} />
                                <TextField label="Review weight" type="number" value={reviewWeight} onChange={(event) => setReviewPercent(Number(event.target.value) * 100)} slotProps={{ htmlInput: { min: 0, max: 1, step: 0.01 } }} fullWidth sx={inputSx} disabled={!canUpdate || isSubmitting} />
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                <Paper elevation={0} sx={{ mt: 2, p: spacing.lg, borderRadius: radius.card, border: elevation.level1.border, boxShadow: "none" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                        <Box>
                            <Typography sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>Total weight</Typography>
                            <Typography sx={{ ...typography.h2, color: colors.onSurface, letterSpacing: 0 }}>
                                {(taskWeight + reviewWeight).toFixed(2)}
                            </Typography>
                        </Box>
                        <Tooltip title={canUpdate ? "Save KPI weights" : "Requires KPI/WEIGHT:UPDATE or ADMIN"}>
                            <span>
                                <Button type="submit" variant="contained" startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />} disabled={!canUpdate || isSubmitting || isLoading}>
                                    Save weights
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                </Paper>
            </Box>
        </Stack>
    );
};

export default KpiWeightsPage;
