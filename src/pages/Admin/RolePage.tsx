import { useCallback, useEffect, useState, type FormEvent } from "react";
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
    FormControlLabel,
    IconButton,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import {
    ChevronRight,
    Download,
    Edit,
    Filter,
    Loader2,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { createRole, deleteRole, getRoles } from "../../api/role.api";
import { useToastify } from "../../hooks/useToastify";
import type { CreateRoleRequest, Role } from "../../interfaces/role.types";
import desginToken from "../../theme/desginToken";

const { colors, components, elevation, radius, spacing, typography } = desginToken;

type RoleForm = CreateRoleRequest;

const emptyRoleForm: RoleForm = {
    name: "",
    displayName: "",
    description: "",
    isSystem: false,
};

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

const RolePage = () => {
    const navigate = useNavigate();
    const { success, error } = useToastify();
    const [roles, setRoles] = useState<Role[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState<RoleForm>(emptyRoleForm);
    const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadRoles = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getRoles();
            setRoles(response);
        } catch (err) {
            error("Cannot load roles", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsLoading(false);
        }
    }, [error]);

    useEffect(() => {
        void loadRoles();
    }, [loadRoles]);

    const closeCreateDialog = () => {
        setOpenDialog(false);
        setForm(emptyRoleForm);
    };

    const handleFormChange = <K extends keyof RoleForm>(field: K, value: RoleForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const submitRoleForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const name = form.name.trim();
        const displayName = form.displayName.trim();
        const description = form.description?.trim() ?? "";

        if (!name || !displayName) {
            error("Missing information", "Role name and display name are required");
            return;
        }

        try {
            setIsSubmitting(true);
            await createRole({
                name,
                displayName,
                description,
                isSystem: form.isSystem,
            });
            success("Role created", "The role list has been updated");
            closeCreateDialog();
            await loadRoles();
        } catch (err) {
            error("Cannot create role", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteRole = async () => {
        if (!deleteTarget) return;

        try {
            setIsSubmitting(true);
            await deleteRole(deleteTarget.id);
            success("Role deleted", deleteTarget.displayName || deleteTarget.name);
            setDeleteTarget(null);
            await loadRoles();
        } catch (err) {
            error("Cannot delete role", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const systemChipSx = (isSystem: boolean) => ({
        backgroundColor: isSystem ? colors.primaryFixed : colors.secondaryContainer,
        color: isSystem ? colors.onPrimaryFixedVariant : colors.onSecondaryContainer,
        ...typography.labelCaps,
        fontSize: "10px",
        fontWeight: 700,
        height: "20px",
    });

    return (
        <Stack spacing={spacing.lg} sx={{ flex: 1 }}>
            <Stack direction="row" sx={{ spacing: spacing.xs, alignItems: "center" }}>
                <Typography sx={{ ...typography.bodySm, color: colors.outline }}>
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

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(12, 1fr)",
                    gap: spacing.lg,
                }}
            >
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
                            Role List ({roles.length})
                        </Typography>
                        <Stack direction="row" spacing={spacing.sm}>
                            <Button
                                startIcon={<Filter size={16} />}
                                disabled
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
                                disabled
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
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : roles.length ? (
                                    roles.map((role) => (
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
                                                    {role.name}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${colors.surfaceContainerLow}`, ...typography.bodyBase, fontWeight: 600, color: colors.onSurface }}>
                                                {role.displayName}
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${colors.surfaceContainerLow}`, ...typography.bodySm, color: colors.outline, maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {role.description || "No description"}
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${colors.surfaceContainerLow}` }}>
                                                <Chip label={role.isSystem ? "True" : "False"} size="small" sx={systemChipSx(role.isSystem)} />
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
                                                    disabled={role.isSystem || isSubmitting}
                                                    onClick={() => setDeleteTarget(role)}
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
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                                                No roles found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
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
                            Showing {roles.length} roles
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            <Dialog
                open={openDialog}
                onClose={closeCreateDialog}
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
                <Box component="form" onSubmit={submitRoleForm}>
                    <Box sx={{ px: spacing.lg, py: spacing.md, borderBottom: `1px solid ${colors.surfaceContainerHighest}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ ...typography.bodyBase, fontWeight: 700, color: colors.onSurface }}>
                            Add User Role
                        </Typography>
                        <IconButton size="small" onClick={closeCreateDialog} sx={{ color: colors.outline, "&:hover": { color: colors.onSurfaceVariant } }}>
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
                                    required
                                    value={form.name}
                                    onChange={(event) => handleFormChange("name", event.target.value)}
                                    placeholder="e.g. LEADER"
                                    sx={inputSx}
                                />
                            </Box>
                            <Box>
                                <Typography component="label" sx={labelSx}>
                                    Display Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    required
                                    value={form.displayName}
                                    onChange={(event) => handleFormChange("displayName", event.target.value)}
                                    placeholder="e.g. Team Leader"
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
                                    value={form.description}
                                    onChange={(event) => handleFormChange("description", event.target.value)}
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
                                            checked={form.isSystem}
                                            onChange={(event) => handleFormChange("isSystem", event.target.checked)}
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
                            onClick={closeCreateDialog}
                            disabled={isSubmitting}
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
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <Loader2 size={16} /> : undefined}
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
                </Box>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Delete role</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {deleteTarget?.displayName || deleteTarget?.name}?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={() => void confirmDeleteRole()} disabled={isSubmitting}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default RolePage;
