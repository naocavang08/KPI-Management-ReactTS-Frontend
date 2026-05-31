import { useMemo, useState, type FormEvent } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { Download } from "lucide-react";
import { exportKpiReport } from "../../api/kpi.api";
import { useToastify } from "../../hooks/useToastify";
import { hasKpiAuthority } from "../../lib/permissions";
import { useAuthStore } from "../../stores/auth.store";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, spacing, typography } = desginToken;

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

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

const KpiExportPage = () => {
    const { success, error } = useToastify();
    const currentUser = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const [month, setMonth] = useState(String(currentMonth));
    const [year, setYear] = useState(String(currentYear));
    const [department, setDepartment] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const canExport = useMemo(
        () => hasKpiAuthority(currentUser, permissions, "KPI/REPORT:EXPORT"),
        [currentUser, permissions]
    );

    const submitExport = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canExport) {
            error("Missing permission", "Requires KPI/REPORT:EXPORT or ADMIN");
            return;
        }

        const parsedMonth = Number(month);
        const parsedYear = Number(year);
        const normalizedDepartment = department.trim();

        if (parsedMonth < 1 || parsedMonth > 12 || parsedYear < 2020 || parsedYear > 2100) {
            error("Invalid export filters", "Month must be 1-12 and year must be 2020-2100");
            return;
        }

        try {
            setIsExporting(true);
            const blob = await exportKpiReport({
                month: parsedMonth,
                year: parsedYear,
                ...(normalizedDepartment ? { department: normalizedDepartment } : {}),
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Bao_cao_KPI_Thang_${parsedMonth}_Nam_${parsedYear}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            success("Report exported", link.download);
        } catch (err) {
            error("Cannot export KPI report", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Stack spacing={spacing.lg}>
            <Box>
                <Typography sx={{ ...typography.h1, color: colors.onSurface, letterSpacing: 0 }}>KPI Export</Typography>
                <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                    Download the consolidated KPI report as an Excel workbook.
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ p: spacing.lg, borderRadius: radius.card, border: elevation.level1.border, boxShadow: "none" }}>
                <Box component="form" onSubmit={submitExport}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField label="Month" type="number" value={month} onChange={(event) => setMonth(event.target.value)} required slotProps={{ htmlInput: { min: 1, max: 12 } }} sx={{ ...inputSx, minWidth: { md: 140 } }} />
                            <TextField label="Year" type="number" value={year} onChange={(event) => setYear(event.target.value)} required slotProps={{ htmlInput: { min: 2020, max: 2100 } }} sx={{ ...inputSx, minWidth: { md: 160 } }} />
                            <TextField label="Department" value={department} onChange={(event) => setDepartment(event.target.value)} sx={{ ...inputSx, minWidth: { md: 260 } }} />
                        </Stack>
                        <Tooltip title={canExport ? "Download Excel report" : "Requires KPI/REPORT:EXPORT or ADMIN"}>
                            <span>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />}
                                    disabled={!canExport || isExporting}
                                    sx={{ alignSelf: "flex-start" }}
                                >
                                    Export Excel
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>
            </Paper>
        </Stack>
    );
};

export default KpiExportPage;
