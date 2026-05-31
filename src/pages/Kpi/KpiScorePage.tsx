import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
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
import { BarChart3, RefreshCw, Search, Target, Users } from "lucide-react";
import { getTeamKpi, getUserKpi } from "../../api/kpi.api";
import { useToastify } from "../../hooks/useToastify";
import type { KpiRating, TeamKpiResponse, UserKpiResponse } from "../../interfaces/kpi.types";
import { hasKpiAuthority } from "../../lib/permissions";
import { useAuthStore } from "../../stores/auth.store";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, semantic, spacing, typography } = desginToken;

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

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

const getRatingTone = (rating: KpiRating) => {
    if (rating === "EXCELLENT") return { bg: semantic.success.container, fg: semantic.success.onContainer };
    if (rating === "GOOD") return { bg: semantic.info.container, fg: semantic.info.onContainer };
    if (rating === "AVERAGE") return { bg: semantic.warning.container, fg: semantic.warning.onContainer };
    return { bg: semantic.danger.container, fg: semantic.danger.onContainer };
};

const formatNumber = (value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "-";
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
};

const formatPercent = (value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "-";
    return `${formatNumber(value)}%`;
};

const StatCard = ({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
}) => (
    <Paper
        elevation={0}
        sx={{
            p: spacing.lg,
            borderRadius: radius.card,
            border: elevation.level1.border,
            backgroundColor: colors.surfaceContainerLowest,
            boxShadow: "none",
        }}
    >
        <Stack direction="row" spacing={spacing.md} sx={{ alignItems: "center" }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.base,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.primaryFixed,
                    color: colors.onPrimaryFixedVariant,
                }}
            >
                <Icon size={20} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>
                    {label}
                </Typography>
                <Typography sx={{ ...typography.h2, color: colors.onSurface, letterSpacing: 0 }}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    </Paper>
);

const KpiScorePage = () => {
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [userId, setUserId] = useState("");
    const [userYear, setUserYear] = useState(String(currentYear));
    const [teamId, setTeamId] = useState("");
    const [teamMonth, setTeamMonth] = useState(String(currentMonth));
    const [teamYear, setTeamYear] = useState(String(currentYear));
    const [userKpi, setUserKpi] = useState<UserKpiResponse | null>(null);
    const [teamKpi, setTeamKpi] = useState<TeamKpiResponse | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isTeamLoading, setIsTeamLoading] = useState(false);

    const canViewSelf = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI:VIEW_SELF"),
        [currentUser, permissions]
    );
    const canViewTeam = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI:VIEW_TEAM"),
        [currentUser, permissions]
    );
    const canViewAnyKpi = canViewSelf || canViewTeam;

    useEffect(() => {
        if (!userId && currentUser?.id) {
            setUserId(String(currentUser.id));
        }
    }, [currentUser?.id, userId]);

    const loadUserKpi = useCallback(async () => {
        if (!canViewAnyKpi) {
            error("Missing permission", "Requires KPI:VIEW_SELF, KPI:VIEW_TEAM, or ADMIN");
            return;
        }

        const parsedUserId = Number(userId);
        const parsedYear = Number(userYear);

        if (!parsedUserId || !parsedYear) {
            error("Invalid filters", "User ID and year are required");
            return;
        }

        try {
            setIsUserLoading(true);
            const response = await getUserKpi(parsedUserId, { year: parsedYear });
            setUserKpi(response);
            success("KPI loaded", response.displayName);
        } catch (err) {
            error("Cannot load user KPI", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsUserLoading(false);
        }
    }, [canViewAnyKpi, error, success, userId, userYear]);

    const loadTeamKpi = useCallback(async () => {
        if (!canViewTeam) {
            error("Missing permission", "Requires KPI:VIEW_TEAM or ADMIN");
            return;
        }

        const parsedMonth = Number(teamMonth);
        const parsedYear = Number(teamYear);
        const parsedTeamId = Number(teamId);

        if (!Number.isInteger(parsedTeamId) || parsedTeamId <= 0 || parsedMonth < 1 || parsedMonth > 12 || !parsedYear) {
            error("Invalid filters", "Numeric Team ID, month 1-12, and year are required");
            return;
        }

        try {
            setIsTeamLoading(true);
            const response = await getTeamKpi(parsedTeamId, { month: parsedMonth, year: parsedYear });
            setTeamKpi(response);
            success("Team KPI loaded", response.teamId);
        } catch (err) {
            error("Cannot load team KPI", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsTeamLoading(false);
        }
    }, [canViewTeam, error, success, teamId, teamMonth, teamYear]);

    useEffect(() => {
        if (userId && canViewAnyKpi) {
            void loadUserKpi();
        }
    }, [canViewAnyKpi, loadUserKpi, userId]);

    const userAverage = useMemo(() => {
        if (!userKpi?.monthlyScores.length) return "-";
        const total = userKpi.monthlyScores.reduce((sum, score) => sum + score.finalScore, 0);
        return formatNumber(total / userKpi.monthlyScores.length);
    }, [userKpi]);

    const latestScore = userKpi?.monthlyScores.at(-1);

    const refreshAll = async () => {
        const requests: Promise<void>[] = [];
        if (userId) requests.push(loadUserKpi());
        if (teamId.trim()) requests.push(loadTeamKpi());
        await Promise.all(requests);
    };

    return (
        <Stack spacing={spacing.lg}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                <Box>
                    <Typography sx={{ ...typography.h1, color: colors.onSurface, letterSpacing: 0 }}>KPI Scores</Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Review personal KPI by year and team KPI by month.
                    </Typography>
                </Box>
                <Tooltip title="Refresh loaded KPI data">
                    <span>
                        <IconButton onClick={() => void refreshAll()} disabled={isUserLoading || isTeamLoading || !canViewAnyKpi}>
                            <RefreshCw size={18} />
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard label="User average" value={userAverage} icon={Target} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard label="Latest score" value={latestScore ? formatNumber(latestScore.finalScore) : "-"} icon={BarChart3} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard label="Team average" value={teamKpi ? formatNumber(teamKpi.averageScore) : "-"} icon={Users} />
                </Grid>
            </Grid>

            <Paper sx={{ borderRadius: radius.card, overflow: "hidden", border: elevation.level1.border, boxShadow: "none" }}>
                <Box component="form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void loadUserKpi(); }} sx={{ p: 2.5, bgcolor: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" } }}>
                        <TextField label="User ID" size="small" value={userId} onChange={(event) => setUserId(event.target.value)} sx={{ ...inputSx, minWidth: { md: 160 } }} />
                        <TextField label="Year" size="small" type="number" value={userYear} onChange={(event) => setUserYear(event.target.value)} sx={{ ...inputSx, minWidth: { md: 140 } }} />
                        <Button type="submit" variant="contained" startIcon={isUserLoading ? <CircularProgress size={16} color="inherit" /> : <Search size={16} />} disabled={isUserLoading || !canViewAnyKpi}>
                            Load user KPI
                        </Button>
                    </Stack>
                </Box>
                <TableContainer>
                    <Table sx={{ minWidth: 920 }}>
                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                            <TableRow>
                                {["Month", "Task completion", "Review score", "Final score", "Rating", "Updated"].map((label) => (
                                    <TableCell key={label} sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>{label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isUserLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : userKpi?.monthlyScores.length ? (
                                userKpi.monthlyScores.map((score) => {
                                    const tone = getRatingTone(score.rating);
                                    return (
                                        <TableRow key={score.id} hover>
                                            <TableCell>{score.month}/{score.year}</TableCell>
                                            <TableCell>{formatPercent(score.taskCompletionRate)}</TableCell>
                                            <TableCell>{formatNumber(score.reviewScore)}</TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 700 }}>{formatNumber(score.finalScore)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={score.rating} size="small" sx={{ borderRadius: radius.chip, bgcolor: tone.bg, color: tone.fg, fontWeight: 700 }} />
                                            </TableCell>
                                            <TableCell>{score.updatedAt ?? score.createdAt ?? "-"}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                                        <Typography color="text.secondary">No user KPI data loaded</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Paper sx={{ borderRadius: radius.card, overflow: "hidden", border: elevation.level1.border, boxShadow: "none" }}>
                <Box component="form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void loadTeamKpi(); }} sx={{ p: 2.5, bgcolor: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" } }}>
                        <TextField label="Team ID" size="small" type="number" value={teamId} onChange={(event) => setTeamId(event.target.value)} sx={{ ...inputSx, minWidth: { md: 180 } }} />
                        <TextField label="Month" size="small" type="number" value={teamMonth} onChange={(event) => setTeamMonth(event.target.value)} sx={{ ...inputSx, minWidth: { md: 120 } }} />
                        <TextField label="Year" size="small" type="number" value={teamYear} onChange={(event) => setTeamYear(event.target.value)} sx={{ ...inputSx, minWidth: { md: 140 } }} />
                        <Button type="submit" variant="contained" startIcon={isTeamLoading ? <CircularProgress size={16} color="inherit" /> : <Search size={16} />} disabled={isTeamLoading || !canViewTeam}>
                            Load team KPI
                        </Button>
                    </Stack>
                </Box>
                <TableContainer>
                    <Table sx={{ minWidth: 920 }}>
                        <TableHead sx={{ bgcolor: colors.surfaceContainerLow }}>
                            <TableRow>
                                {["Member", "Task completion", "Review score", "Final score", "Rating"].map((label) => (
                                    <TableCell key={label} sx={{ ...typography.labelCaps, color: colors.outline, letterSpacing: 0 }}>{label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isTeamLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : teamKpi?.members.length ? (
                                teamKpi.members.map((member) => {
                                    const tone = getRatingTone(member.rating);
                                    return (
                                        <TableRow key={member.userId} hover>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 700 }}>{member.displayName}</Typography>
                                                <Typography variant="caption" color="text.secondary">@{member.username} / ID {member.userId}</Typography>
                                            </TableCell>
                                            <TableCell>{formatPercent(member.taskCompletionRate)}</TableCell>
                                            <TableCell>{formatNumber(member.reviewScore)}</TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 700 }}>{formatNumber(member.finalScore)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={member.rating} size="small" sx={{ borderRadius: radius.chip, bgcolor: tone.bg, color: tone.fg, fontWeight: 700 }} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <Typography color="text.secondary">No team KPI data loaded</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Stack>
    );
};

export default KpiScorePage;
