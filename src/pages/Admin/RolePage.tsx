import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    Dialog,
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
    Typography,
    FormControlLabel,
    Switch,
} from "@mui/material";
import {
    ChevronRight,
    Download,
    Edit,
    Filter,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, spacing, typography } = desginToken;

const inputSx = {
    "& .MuiInputBase-root": {
        minHeight: 48,
        borderRadius: radius.button,
        backgroundColor: components.input.background,
        fontFamily: typography.bodyBase.fontFamily,
        fontSize: typography.bodyBase.fontSize,
        color: components.input.text,
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.outlineVariant,
    },
    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.outline,
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.primaryContainer,
        borderWidth: "1px",
    },
};

const labelSx = {
    display: "block",
    mb: spacing.base,
    fontFamily: typography.labelCaps.fontFamily,
    fontSize: typography.labelCaps.fontSize,
    fontWeight: typography.labelCaps.fontWeight,
    lineHeight: typography.labelCaps.lineHeight,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: colors.outline,
};

const cardSx = {
    p: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    border: elevation.level1.border,
    boxShadow: elevation.level2.boxShadow,
};

const RolePage = () => {
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);

    const roles = [
        {
            id: "admin",
            name: "Administrator",
            description: "Full access and system configuration, user management.",
            type: "True",
            typeColor: {
                bg: colors.primaryFixed,
                text: colors.onPrimaryFixedVariant,
            },
            isSystem: true,
        },
        {
            id: "manager_dept",
            name: "Department Manager",
            description: "Manage KPI and performance of specific departments.",
            type: "False",
            typeColor: {
                bg: colors.secondaryContainer,
                text: colors.onSecondaryContainer,
            },
            isSystem: false,
        },
        {
            id: "employee",
            name: "Employee",
            description: "View personal KPI and input periodic reports.",
            type: "False",
            typeColor: {
                bg: colors.secondaryContainer,
                text: colors.onSecondaryContainer,
            },
            isSystem: false,
        },
        {
            id: "viewer",
            name: "Report Viewer",
            description: "Only has the right to view consolidated reports, no editing rights.",
            type: "False",
            typeColor: {
                bg: colors.secondaryContainer,
                text: colors.onSecondaryContainer,
            },
            isSystem: false,
        },
        {
            id: "hr_audit",
            name: "HR Auditor",
            description: "Check the accuracy of KPI data for personnel evaluation.",
            type: "False",
            typeColor: {
                bg: colors.secondaryContainer,
                text: colors.onSecondaryContainer,
            },
            isSystem: false,
        },
    ];

    return (
        <Stack spacing={spacing.lg} sx={{ flex: 1 }}>
            {/* Breadcrumbs */}
            <Stack direction="row" sx={{ spacing: spacing.xs, alignItems: "center" }}>
                <Typography
                    sx={{ ...typography.bodySm, color: colors.outline }}
                >
                    Configuration
                </Typography>
                <ChevronRight size={16} color={colors.outline} />
                <Typography
                    sx={{
                        ...typography.bodySm,
                        color: colors.primaryContainer,
                        fontWeight: 600,
                    }}
                >
                    User Roles
                </Typography>
            </Stack>

            {/* Page Header */}
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Stack spacing={spacing.base}>
                    <Typography sx={{ ...typography.h1, color: colors.onSurface }}>
                        User Role Management
                    </Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Define and assign access rights for user groups in the KPI system.
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        backgroundColor: components.button.primary.background,
                        color: components.button.primary.color,
                        borderRadius: radius.lg,
                        px: spacing.md,
                        py: "10px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontFamily: typography.bodySm.fontFamily,
                        fontSize: typography.bodySm.fontSize,
                        boxShadow: "none",
                        "&:hover": {
                            backgroundColor: components.button.primary.hoverBackground,
                            boxShadow: "none",
                        },
                    }}
                >
                    Add Role
                </Button>
            </Stack>

            {/* Bento Layout Content */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(12, 1fr)",
                    gap: spacing.lg,
                }}
            >
                {/* Main Table Card */}
                <Paper
                    elevation={0}
                    sx={{
                        ...cardSx,
                        gridColumn: "span 12",
                        p: 0,
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            px: spacing.lg,
                            py: spacing.md,
                            borderBottom: `1px solid ${colors.surfaceContainerHighest}`,
                            backgroundColor: colors.surfaceContainerLow,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                ...typography.bodyBase,
                                fontWeight: 600,
                                color: colors.onSurface,
                            }}
                        >
                            Role List (8)
                        </Typography>
                        <Stack direction="row" spacing={spacing.sm}>
                            <Button
                                startIcon={<Filter size={16} />}
                                sx={{
                                    textTransform: "none",
                                    color: colors.outline,
                                    fontWeight: 700,
                                    fontSize: typography.bodySm.fontSize,
                                    "&:hover": { color: colors.primaryContainer },
                                }}
                            >
                                Filter
                            </Button>
                            <Button
                                startIcon={<Download size={16} />}
                                sx={{
                                    textTransform: "none",
                                    color: colors.outline,
                                    fontWeight: 700,
                                    fontSize: typography.bodySm.fontSize,
                                    "&:hover": { color: colors.primaryContainer },
                                }}
                            >
                                Export
                            </Button>
                        </Stack>
                    </Box>

                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                                <TableRow>
                                    <TableCell sx={{ ...typography.labelCaps, color: colors.outline, borderBottom: "none" }}>Role Name</TableCell>
                                    <TableCell sx={{ ...typography.labelCaps, color: colors.outline, borderBottom: "none" }}>Display Name</TableCell>
                                    <TableCell sx={{ ...typography.labelCaps, color: colors.outline, borderBottom: "none" }}>Description</TableCell>
                                    <TableCell sx={{ ...typography.labelCaps, color: colors.outline, borderBottom: "none" }}>System Role</TableCell>
                                    <TableCell align="right" sx={{ ...typography.labelCaps, color: colors.outline, borderBottom: "none" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow
                                        key={role.id}
                                        sx={{
                                            "&:hover": { backgroundColor: colors.surfaceContainerLow },
                                            transition: "background-color 0.2s",
                                        }}
                                    >
                                        <TableCell sx={{ borderBottom: `1px solid ${colors.surfaceContainerLow}` }}>
                                            <Box
                                                component="code"
                                                sx={{
                                                    fontFamily: "monospace",
                                                    fontSize: "12px",
                                                    backgroundColor: colors.surfaceContainerHighest,
                                                    color: colors.onSurfaceVariant,
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: radius.base,
                                                }}
                                            >
                                                {role.id}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: `1px solid ${colors.surfaceContainerLow}`, ...typography.bodyBase, fontWeight: 600, color: colors.onSurface }}>
                                            {role.name}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: `1px solid ${colors.surfaceContainerLow}`, ...typography.bodySm, color: colors.outline, maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {role.description}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: `1px solid ${colors.surfaceContainerLow}` }}>
                                            <Chip
                                                label={role.type}
                                                size="small"
                                                sx={{
                                                    backgroundColor: role.typeColor.bg,
                                                    color: role.typeColor.text,
                                                    ...typography.labelCaps,
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                    height: "20px",
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderBottom: `1px solid ${colors.surfaceContainerLow}` }}>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => navigate(`/admin/role/${role.id}`)}
                                                sx={{ color: colors.outlineVariant, "&:hover": { color: colors.primaryContainer } }}
                                            >
                                                <Edit size={20} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                disabled={role.isSystem}
                                                sx={{
                                                    color: colors.outlineVariant,
                                                    "&:hover": { color: colors.error },
                                                    "&.Mui-disabled": { color: colors.surfaceContainerHighest },
                                                }}
                                            >
                                                <Trash2 size={20} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box
                        sx={{
                            px: spacing.lg,
                            py: spacing.sm,
                            borderTop: `1px solid ${colors.surfaceContainerHighest}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography sx={{ ...typography.bodySm, color: colors.outline }}>
                            Showing 5 of 8 roles
                        </Typography>
                        <Stack direction="row" spacing={spacing.xs}>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: 0,
                                    borderColor: colors.surfaceContainerHighest,
                                    color: colors.onSurface,
                                    fontWeight: 600,
                                    px: 1.5,
                                    textTransform: "none",
                                }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    minWidth: 0,
                                    backgroundColor: colors.primaryContainer,
                                    color: colors.onPrimary,
                                    fontWeight: 600,
                                    px: 1.5,
                                    boxShadow: "none",
                                }}
                            >
                                1
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: 0,
                                    borderColor: colors.surfaceContainerHighest,
                                    color: colors.onSurface,
                                    fontWeight: 600,
                                    px: 1.5,
                                }}
                            >
                                2
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: 0,
                                    borderColor: colors.surfaceContainerHighest,
                                    color: colors.onSurface,
                                    fontWeight: 600,
                                    px: 1.5,
                                    textTransform: "none",
                                }}
                            >
                                Next
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Box>

            {/* Create Role Modal */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: radius.xl,
                            maxWidth: "512px",
                            width: "100%",
                            boxShadow: elevation.level2.boxShadow,
                        },
                    }
                }}
            >
                <Box sx={{ px: spacing.lg, py: spacing.md, borderBottom: `1px solid ${colors.surfaceContainerHighest}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ ...typography.bodyBase, fontWeight: 700, color: colors.onSurface }}>
                        Add User Role
                    </Typography>
                    <IconButton size="small" onClick={() => setOpenDialog(false)} sx={{ color: colors.outline, "&:hover": { color: colors.onSurfaceVariant } }}>
                        <X size={20} />
                    </IconButton>
                </Box>
                
                <Box sx={{ p: spacing.lg }}>
                    <Stack spacing={spacing.md}>
                        <Box>
                            <Typography component="label" sx={labelSx}>
                                Role Name
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="e.g. manager_finance"
                                sx={inputSx}
                            />
                        </Box>
                        <Box>
                            <Typography component="label" sx={labelSx}>
                                Display Name
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="e.g. Finance Manager"
                                sx={inputSx}
                            />
                        </Box>
                        <Box>
                            <Typography component="label" sx={labelSx}>
                                Description
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Description of functions and permissions..."
                                sx={{
                                    ...inputSx,
                                    "& .MuiInputBase-root": {
                                        ...inputSx["& .MuiInputBase-root"],
                                        alignItems: "flex-start",
                                    }
                                }}
                            />
                        </Box>
                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        sx={{
                                            "& .MuiSwitch-switchBase.Mui-checked": {
                                                color: colors.primaryContainer,
                                            },
                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                backgroundColor: colors.primaryContainer,
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ ...typography.bodyBase, fontWeight: 500 }}>
                                        System Role
                                    </Typography>
                                }
                            />
                            <Typography sx={{ ...typography.bodySm, color: colors.outline, ml: 7 }}>
                                System roles cannot be deleted.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
                
                <Box sx={{ px: spacing.lg, py: spacing.md, backgroundColor: colors.surfaceContainerLow, borderTop: `1px solid ${colors.surfaceContainerHighest}`, display: "flex", justifyContent: "flex-end", gap: spacing.sm }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{
                            color: colors.outline,
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: radius.lg,
                            px: spacing.md,
                            "&:hover": { backgroundColor: colors.surfaceContainerHighest }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: components.button.primary.background,
                            color: components.button.primary.color,
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: radius.lg,
                            px: spacing.md,
                            boxShadow: "none",
                            "&:hover": { backgroundColor: components.button.primary.hoverBackground, boxShadow: "none" }
                        }}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Dialog>
        </Stack>
    );
};

export default RolePage;
