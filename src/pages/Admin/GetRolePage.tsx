import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    Switch,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Divider,
} from "@mui/material";
import {
    ChevronLeft,
    Shield,
    Settings,
} from "lucide-react";
import desginToken from "../../theme/desginToken";

const { colors, elevation, radius, spacing, typography, components } = desginToken;

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

const GetRolePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tabIndex, setTabIndex] = useState(0);

    // Mock initial data based on ID
    const [roleData, setRoleData] = useState({
        id: id || "admin",
        name: id === "admin" ? "Administrator" : "User Role",
        description: "Full access and system configuration, environment management.",
        isSystem: true,
    });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const modules = [
        {
            name: "Dashboard",
            permissions: ["Read", "Export"],
        },
        {
            name: "KPI Management",
            permissions: ["Read", "Create", "Update", "Delete", "Approve"],
        },
        {
            name: "User Management",
            permissions: ["Read", "Create", "Update", "Delete"],
        },
        {
            name: "System Settings",
            permissions: ["Read", "Update"],
        },
    ];

    return (
        <Stack spacing={spacing.lg} sx={{ flex: 1 }}>
            {/* Breadcrumbs & Back */}
            <Stack direction="row" spacing={spacing.xs} alignItems="center">
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

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={spacing.xs}>
                    <Typography sx={headerSx}>
                        Edit Role: {roleData.name}
                    </Typography>
                    <Typography sx={{ ...typography.bodyBase, color: colors.outline }}>
                        Configure role details and specific access permissions for the system.
                    </Typography>
                </Stack>
            </Stack>

            {/* Tabs */}
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

            {/* Content Area */}
            <Box sx={{ mt: spacing.base }}>
                {tabIndex === 0 && (
                    <Paper elevation={0} sx={cardSx}>
                        <Stack spacing={spacing.md} maxWidth="600px">
                            <Box>
                                <Typography sx={labelSx}>Role Name</Typography>
                                <TextField
                                    fullWidth
                                    value={roleData.id}
                                    disabled
                                    sx={inputSx}
                                />
                            </Box>
                            <Box>
                                <Typography sx={labelSx}>Display Name</Typography>
                                <TextField
                                    fullWidth
                                    value={roleData.name}
                                    onChange={(e) => setRoleData({ ...roleData, name: e.target.value })}
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
                                    value={roleData.description}
                                    onChange={(e) => setRoleData({ ...roleData, description: e.target.value })}
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
                                            checked={roleData.isSystem} 
                                            onChange={(e) => setRoleData({ ...roleData, isSystem: e.target.checked })}
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
                )}

                {tabIndex === 1 && (
                    <Stack spacing={spacing.lg}>
                        {modules.map((module, idx) => (
                            <Paper key={idx} elevation={0} sx={{ ...cardSx, p: 0, overflow: "hidden" }}>
                                <Box sx={{ px: spacing.lg, py: spacing.md, backgroundColor: colors.surfaceContainerLow, borderBottom: `1px solid ${colors.surfaceContainerHighest}` }}>
                                    <Typography sx={{ ...typography.bodyBase, fontWeight: 700, color: colors.onSurface }}>
                                        {module.name}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: spacing.lg }}>
                                    <FormGroup sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: spacing.lg }}>
                                        {module.permissions.map((perm) => (
                                            <FormControlLabel
                                                key={perm}
                                                control={
                                                    <Checkbox 
                                                        defaultChecked={roleData.id === "admin"}
                                                        sx={{
                                                            color: colors.outlineVariant,
                                                            "&.Mui-checked": {
                                                                color: colors.primaryContainer,
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography sx={{ ...typography.bodySm, fontWeight: 500 }}>
                                                        {perm}
                                                    </Typography>
                                                }
                                            />
                                        ))}
                                    </FormGroup>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Box>

            {/* Bottom Actions */}
            <Divider sx={{ my: spacing.md, borderColor: colors.surfaceContainerHighest }} />
            <Stack direction="row" spacing={spacing.sm} justifyContent="flex-end">
                <Button
                    onClick={() => navigate("/admin/role")}
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