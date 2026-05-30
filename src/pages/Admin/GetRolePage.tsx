import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    FormControlLabel,
    FormGroup,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    Switch,
} from "@mui/material";
import {
    ChevronLeft,
    Loader2,
    Shield,
    Settings,
} from "lucide-react";
import {
    assignRolePermission,
    getAllPermissions,
    getRoleById,
    getRolePermissions,
    removeRolePermission,
    updateRole,
} from "../../api/role.api";
import { useToastify } from "../../hooks/useToastify";
import type { Permission, Role, UpdateRoleRequest } from "../../interfaces/role.types";
import desginToken from "../../theme/desginToken";

const { colors, elevation, radius, spacing, typography, components } = desginToken;

type RoleForm = UpdateRoleRequest;

const emptyRoleForm: RoleForm = {
    name: "",
    displayName: "",
    description: "",
    isSystem: false,
};

const headerSx = {
    fontFamily: typography.h1.fontFamily,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.onSurface,
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

const buildFormFromRole = (role: Role): RoleForm => ({
    name: role.name,
    displayName: role.displayName,
    description: role.description ?? "",
    isSystem: role.isSystem,
});

const GetRolePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error } = useToastify();
    const [tabIndex, setTabIndex] = useState(0);
    const [roleData, setRoleData] = useState<Role | null>(null);
    const [form, setForm] = useState<RoleForm>(emptyRoleForm);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [initialPermissionIds, setInitialPermissionIds] = useState<Set<number>>(new Set());
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roleId = Number(id);

    const loadRoleData = useCallback(async () => {
        if (!Number.isInteger(roleId) || roleId <= 0) {
            error("Invalid role", "Role id is not valid");
            navigate("/admin/role");
            return;
        }

        try {
            setIsLoading(true);
            const [role, allPermissions, rolePermissions] = await Promise.all([
                getRoleById(roleId),
                getAllPermissions(),
                getRolePermissions(roleId),
            ]);
            const assignedIds = new Set(rolePermissions.map((permission) => permission.id));

            setRoleData(role);
            setForm(buildFormFromRole(role));
            setPermissions(allPermissions);
            setInitialPermissionIds(assignedIds);
            setSelectedPermissionIds(new Set(assignedIds));
        } catch (err) {
            error("Cannot load role", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsLoading(false);
        }
    }, [error, navigate, roleId]);

    useEffect(() => {
        void loadRoleData();
    }, [loadRoleData]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleFormChange = <K extends keyof RoleForm>(field: K, value: RoleForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const groupedPermissions = useMemo(() => {
        return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
            const resource = permission.resource || "other";
            groups[resource] = groups[resource] ?? [];
            groups[resource].push(permission);
            return groups;
        }, {});
    }, [permissions]);

    const togglePermission = (permissionId: number, checked: boolean) => {
        setSelectedPermissionIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(permissionId);
            } else {
                next.delete(permissionId);
            }
            return next;
        });
    };

    const submitRoleChanges = async () => {
        if (!Number.isInteger(roleId) || roleId <= 0) return;

        const name = form.name.trim();
        const displayName = form.displayName.trim();
        const description = form.description?.trim() ?? "";

        if (!name || !displayName) {
            error("Missing information", "Role name and display name are required");
            return;
        }

        const addedPermissionIds = [...selectedPermissionIds].filter((permissionId) => !initialPermissionIds.has(permissionId));
        const removedPermissionIds = [...initialPermissionIds].filter((permissionId) => !selectedPermissionIds.has(permissionId));

        try {
            setIsSubmitting(true);
            await updateRole(roleId, {
                name,
                displayName,
                description,
                isSystem: form.isSystem,
            });

            await Promise.all([
                ...addedPermissionIds.map((permissionId) => assignRolePermission(roleId, { permissionId })),
                ...removedPermissionIds.map((permissionId) => removeRolePermission(roleId, permissionId)),
            ]);

            success("Role updated", "Role details and permissions have been saved");
            await loadRoleData();
        } catch (err) {
            error("Cannot update role", getErrorMessage(err, "Please try again later"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack spacing={spacing.lg} sx={{ flex: 1 }}>
            <Stack direction="row" spacing={spacing.xs} sx={{ alignItems: "center" }}>
                <Button
                    startIcon={<ChevronLeft size={18} />}
                    onClick={() => navigate("/admin/role")}
                    sx={{
                        color: colors.outline,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": { color: colors.primaryContainer }
                    }}
                >
                    Back to Roles
                </Button>
            </Stack>

            <Stack direction="row" sx={{justifyContent: "space-between", alignItems: "center" }}>
                <Stack spacing={spacing.xs}>
                    <Typography sx={headerSx}>
                        Edit Role: {roleData?.displayName || form.displayName || "Loading..."}
                    </Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Configure role details and specific access permissions for the system.
                    </Typography>
                </Stack>
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: colors.surfaceContainerHighest }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            minHeight: 48,
                            color: colors.outline,
                            "&.Mui-selected": {
                                color: colors.primaryContainer,
                            }
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: colors.primaryContainer,
                        }
                    }}
                >
                    <Tab icon={<Settings size={18} />} iconPosition="start" label="Role Details" />
                    <Tab icon={<Shield size={18} />} iconPosition="start" label="Assign Permissions" />
                </Tabs>
            </Box>

            <Box sx={{ mt: spacing.base }}>
                {isLoading ? (
                    <Paper elevation={0} sx={{ ...cardSx, py: 8 }}>
                        <Stack sx={{ alignItems: "center" }}>
                            <CircularProgress size={30} />
                        </Stack>
                    </Paper>
                ) : tabIndex === 0 ? (
                    <Paper elevation={0} sx={cardSx}>
                        <Stack spacing={spacing.md} sx={{ maxWidth: "600px" }}>
                            <Box>
                                <Typography sx={labelSx}>Role Name</Typography>
                                <TextField
                                    fullWidth
                                    value={form.name}
                                    disabled
                                    sx={inputSx}
                                />
                            </Box>
                            <Box>
                                <Typography sx={labelSx}>Display Name</Typography>
                                <TextField
                                    fullWidth
                                    value={form.displayName}
                                    onChange={(e) => handleFormChange("displayName", e.target.value)}
                                    placeholder="e.g. Administrator"
                                    sx={inputSx}
                                />
                            </Box>
                            <Box>
                                <Typography sx={labelSx}>Description</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) => handleFormChange("description", e.target.value)}
                                    placeholder="Brief description of this role"
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
                                            onChange={(e) => handleFormChange("isSystem", e.target.checked)}
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
                                            Is System
                                        </Typography>
                                    }
                                />
                                <Typography sx={{ ...typography.bodySm, color: colors.outline, ml: 7 }}>
                                    System roles cannot be deleted.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                ) : (
                    <Stack spacing={spacing.lg}>
                        {Object.keys(groupedPermissions).length ? (
                            Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                                <Paper key={resource} elevation={0} sx={{ ...cardSx, p: 0, overflow: "hidden" }}>
                                    <Box sx={{ px: spacing.lg, py: spacing.md, backgroundColor: colors.surfaceContainerLow, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                                        <Typography sx={{ ...typography.bodyBase, fontWeight: 700, color: colors.onSurface, textTransform: "capitalize" }}>
                                            {resource}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: spacing.lg }}>
                                        <FormGroup sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: spacing.md }}>
                                            {resourcePermissions.map((permission) => (
                                                <FormControlLabel
                                                    key={permission.id}
                                                    sx={{ m: 0, alignItems: "flex-start" }}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedPermissionIds.has(permission.id)}
                                                            onChange={(event) => togglePermission(permission.id, event.target.checked)}
                                                            sx={{
                                                                color: colors.outlineVariant,
                                                                "&.Mui-checked": {
                                                                    color: colors.primaryContainer,
                                                                },
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography sx={{ ...typography.bodySm, fontWeight: 700, textTransform: "capitalize" }}>
                                                                {permission.action}
                                                            </Typography>
                                                            {permission.description ? (
                                                                <Typography sx={{ ...typography.bodySm, color: colors.outline }}>
                                                                    {permission.description}
                                                                </Typography>
                                                            ) : null}
                                                        </Box>
                                                    }
                                                />
                                            ))}
                                        </FormGroup>
                                    </Box>
                                </Paper>
                            ))
                        ) : (
                            <Paper elevation={0} sx={cardSx}>
                                <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                                    No permissions found
                                </Typography>
                            </Paper>
                        )}
                    </Stack>
                )}
            </Box>

            <Divider sx={{ my: spacing.md, borderColor: colors.surfaceContainerHighest }} />
            <Stack direction="row" spacing={spacing.sm} sx={{ justifyContent: "flex-end" }}>
                <Button
                    onClick={() => navigate("/admin/role")}
                    disabled={isSubmitting}
                    sx={{
                        color: colors.outline,
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: radius.lg,
                        px: spacing.md,
                        "&:hover": { backgroundColor: colors.surfaceContainerLow }
                    }}
                >
                    Discard Changes
                </Button>
                <Button
                    variant="contained"
                    onClick={() => void submitRoleChanges()}
                    disabled={isLoading || isSubmitting}
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
                    Update Role
                </Button>
            </Stack>
        </Stack>
    );
};

export default GetRolePage;
