import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Link as LinkIcon, LockKeyhole, Shield, User } from "lucide-react";
import desginToken from "../theme/desginToken";
import { useProfileSettings } from "./useProfileSettings";

const { colors, components, elevation, radius, semantic, spacing, typography } = desginToken;

const tabs = ["Basic information", "Change password"] as const;

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

const readonlyInputSx = {
    ...inputSx,
    "& .MuiInputBase-root": {
        ...inputSx["& .MuiInputBase-root"],
        backgroundColor: colors.surfaceContainerLow,
        color: colors.outline,
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

const formatDateTime = (value?: string | null) => {
    if (!value) return "Not recorded";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const SettingPage = () => {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
    const {
        user,
        profileForm,
        passwordForm,
        roleNames,
        isProfileLoading,
        isSavingPassword,
        isSavingProfile,
        updateProfileField,
        updatePasswordField,
        saveProfile,
        savePassword,
    } = useProfileSettings();

    const profileDisabled = isProfileLoading || isSavingProfile;

    return (
        <Stack spacing={spacing.xl}>
            <Box
                sx={{
                    display: "flex",
                    gap: spacing.xl,
                    borderBottom: `1px solid ${colors.outlineVariant}`,
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                }}
            >
                {tabs.map((tab) => {
                    const isActive = tab === activeTab;
                    return (
                        <Box
                            key={tab}
                            component="button"
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                pb: spacing.sm,
                                background: "transparent",
                                border: "none",
                                borderBottom: `2px solid ${isActive ? colors.primaryContainer : "transparent"}`,
                                color: isActive ? colors.primaryContainer : colors.outline,
                                cursor: "pointer",
                                fontFamily: typography.bodyBase.fontFamily,
                                fontSize: typography.bodyBase.fontSize,
                                fontWeight: isActive ? 700 : 500,
                                lineHeight: typography.bodyBase.lineHeight,
                                transition: "color 0.2s ease, border-color 0.2s ease",
                                "&:hover": {
                                    color: colors.onSurface,
                                },
                            }}
                        >
                            {tab}
                        </Box>
                    );
                })}
            </Box>

            {activeTab === "Basic information" && (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(300px, 1fr)" },
                        gap: spacing.lg,
                    }}
                >
                    <Paper elevation={0} sx={cardSx}>
                        <Stack spacing={spacing.lg}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={spacing.md}
                                sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                            >
                                <Typography
                                    sx={{
                                        fontFamily: typography.h2.fontFamily,
                                        fontSize: typography.h2.fontSize,
                                        fontWeight: typography.h2.fontWeight,
                                        lineHeight: typography.h2.lineHeight,
                                        color: colors.onSurface,
                                    }}
                                >
                                    Employee profile
                                </Typography>
                                <Button
                                    variant="contained"
                                    disabled={profileDisabled}
                                    onClick={() => void saveProfile()}
                                    sx={{
                                        alignSelf: "flex-start",
                                        px: spacing.lg,
                                        py: spacing.sm,
                                        borderRadius: radius.lg,
                                        backgroundColor: components.button.primary.background,
                                        color: components.button.primary.color,
                                        fontFamily: typography.bodySm.fontFamily,
                                        fontSize: typography.bodySm.fontSize,
                                        fontWeight: 700,
                                        textTransform: "none",
                                        boxShadow: "none",
                                        "&:hover": {
                                            backgroundColor: components.button.primary.hoverBackground,
                                            boxShadow: "none",
                                        },
                                    }}
                                >
                                    {isSavingProfile ? "Saving..." : "Save changes"}
                                </Button>
                            </Stack>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "180px minmax(0, 1fr)" },
                                    gap: spacing.xl,
                                }}
                            >
                                <Stack spacing={spacing.md} sx={{ alignItems: "center" }}>
                                    <Avatar
                                        src={profileForm.avatarUrl}
                                        sx={{
                                            width: 128,
                                            height: 128,
                                            border: `4px solid ${colors.surfaceContainer}`,
                                            bgcolor: colors.surfaceContainerHighest,
                                            color: colors.onSurfaceVariant,
                                        }}
                                    >
                                        <User size={44} />
                                    </Avatar>
                                    <Chip
                                        icon={<LinkIcon size={14} />}
                                        label="Avatar URL only"
                                        sx={{
                                            borderRadius: radius.chip,
                                            backgroundColor: semantic.info.container,
                                            color: semantic.info.onContainer,
                                            fontFamily: typography.bodySm.fontFamily,
                                            fontSize: typography.bodySm.fontSize,
                                        }}
                                    />
                                </Stack>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                        gap: spacing.lg,
                                    }}
                                >
                                    <Box>
                                        <Typography component="label" htmlFor="fullname" sx={labelSx}>
                                            Full name
                                        </Typography>
                                        <TextField
                                            id="fullname"
                                            fullWidth
                                            disabled={profileDisabled}
                                            value={profileForm.fullname}
                                            onChange={(event) => updateProfileField("fullname", event.target.value)}
                                            sx={inputSx}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography component="label" htmlFor="username" sx={labelSx}>
                                            Username
                                        </Typography>
                                        <TextField
                                            id="username"
                                            fullWidth
                                            value={user?.username ?? ""}
                                            slotProps={{ input: { readOnly: true } }}
                                            sx={readonlyInputSx}
                                        />
                                    </Box>
                                    <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                                        <Typography component="label" htmlFor="avatarUrl" sx={labelSx}>
                                            Avatar URL
                                        </Typography>
                                        <TextField
                                            id="avatarUrl"
                                            fullWidth
                                            disabled={profileDisabled}
                                            value={profileForm.avatarUrl}
                                            onChange={(event) => updateProfileField("avatarUrl", event.target.value)}
                                            sx={inputSx}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography component="label" htmlFor="email" sx={labelSx}>
                                            Email
                                        </Typography>
                                        <TextField
                                            id="email"
                                            fullWidth
                                            value={user?.email ?? ""}
                                            slotProps={{ input: { readOnly: true } }}
                                            sx={readonlyInputSx}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography component="label" htmlFor="position" sx={labelSx}>
                                            Position
                                        </Typography>
                                        <TextField
                                            id="position"
                                            fullWidth
                                            value={user?.position ?? ""}
                                            slotProps={{ input: { readOnly: true } }}
                                            sx={readonlyInputSx}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography component="label" htmlFor="type" sx={labelSx}>
                                            Type
                                        </Typography>
                                        <TextField
                                            id="type"
                                            fullWidth
                                            value={user?.type ?? ""}
                                            slotProps={{ input: { readOnly: true } }}
                                            sx={readonlyInputSx}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography component="label" htmlFor="status" sx={labelSx}>
                                            Status
                                        </Typography>
                                        <TextField
                                            id="status"
                                            fullWidth
                                            value={user?.status ?? ""}
                                            slotProps={{ input: { readOnly: true } }}
                                            sx={readonlyInputSx}
                                        />
                                    </Box>
                                    <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                                        <Typography component="label" htmlFor="roles" sx={labelSx}>
                                            Roles
                                        </Typography>
                                        <TextField
                                            id="roles"
                                            fullWidth
                                            value={roleNames}
                                            slotProps={{ input: { readOnly: true } }}
                                            sx={readonlyInputSx}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>

                    <Stack spacing={spacing.lg}>
                        <Paper elevation={0} sx={cardSx}>
                            <Stack spacing={spacing.md}>
                                <Typography
                                    sx={{
                                        fontFamily: typography.h2.fontFamily,
                                        fontSize: typography.h2.fontSize,
                                        fontWeight: typography.h2.fontWeight,
                                        lineHeight: typography.h2.lineHeight,
                                        color: colors.onSurface,
                                    }}
                                >
                                    Account status
                                </Typography>
                                <Chip
                                    label={user?.isActive ? "Active account" : "Inactive account"}
                                    sx={{
                                        alignSelf: "flex-start",
                                        borderRadius: radius.chip,
                                        backgroundColor: user?.isActive
                                            ? semantic.success.container
                                            : semantic.warning.container,
                                        color: user?.isActive
                                            ? semantic.success.onContainer
                                            : semantic.warning.onContainer,
                                        fontWeight: 700,
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontFamily: typography.bodySm.fontFamily,
                                        fontSize: typography.bodySm.fontSize,
                                        lineHeight: typography.bodySm.lineHeight,
                                        color: colors.outline,
                                    }}
                                >
                                    Last login: {formatDateTime(user?.lastLoginAt)}
                                </Typography>
                                {user?.lockReason && (
                                    <Typography
                                        sx={{
                                            fontFamily: typography.bodySm.fontFamily,
                                            fontSize: typography.bodySm.fontSize,
                                            lineHeight: typography.bodySm.lineHeight,
                                            color: colors.error,
                                        }}
                                    >
                                        Lock reason: {user.lockReason}
                                    </Typography>
                                )}
                            </Stack>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                ...cardSx,
                                position: "relative",
                                overflow: "hidden",
                                backgroundColor: colors.primaryContainer,
                                color: colors.onPrimary,
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    right: -28,
                                    bottom: -28,
                                    opacity: 0.12,
                                }}
                            >
                                <Shield size={144} />
                            </Box>

                            <Stack spacing={spacing.sm} sx={{ position: "relative", zIndex: 1 }}>
                                <Typography
                                    sx={{
                                        fontFamily: typography.h2.fontFamily,
                                        fontSize: typography.h2.fontSize,
                                        fontWeight: typography.h2.fontWeight,
                                        lineHeight: typography.h2.lineHeight,
                                    }}
                                >
                                    Account security
                                </Typography>
                                <Typography
                                    sx={{
                                        maxWidth: 280,
                                        fontFamily: typography.bodySm.fontFamily,
                                        fontSize: typography.bodySm.fontSize,
                                        lineHeight: typography.bodySm.lineHeight,
                                        opacity: 0.84,
                                    }}
                                >
                                    Profile changes are protected by your current access token.
                                </Typography>
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            )}

            {activeTab === "Change password" && (
                <Paper elevation={0} sx={cardSx}>
                    <Stack spacing={spacing.lg}>
                        <Stack direction="row" spacing={spacing.sm} sx={{ alignItems: "center" }}>
                            <LockKeyhole size={18} color={colors.primaryContainer} />
                            <Typography
                                sx={{
                                    fontFamily: typography.h2.fontFamily,
                                    fontSize: typography.h2.fontSize,
                                    fontWeight: typography.h2.fontWeight,
                                    lineHeight: typography.h2.lineHeight,
                                    color: colors.onSurface,
                                }}
                            >
                                Change password
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                                gap: spacing.lg,
                            }}
                        >
                            <Box>
                                <Typography component="label" htmlFor="oldPassword" sx={labelSx}>
                                    Current password
                                </Typography>
                                <TextField
                                    id="oldPassword"
                                    fullWidth
                                    type="password"
                                    autoComplete="current-password"
                                    value={passwordForm.oldPassword}
                                    onChange={(event) => updatePasswordField("oldPassword", event.target.value)}
                                    sx={inputSx}
                                />
                            </Box>
                            <Box>
                                <Typography component="label" htmlFor="newPassword" sx={labelSx}>
                                    New password
                                </Typography>
                                <TextField
                                    id="newPassword"
                                    fullWidth
                                    type="password"
                                    autoComplete="new-password"
                                    value={passwordForm.newPassword}
                                    onChange={(event) => updatePasswordField("newPassword", event.target.value)}
                                    sx={inputSx}
                                />
                            </Box>
                            <Box>
                                <Typography component="label" htmlFor="confirmPassword" sx={labelSx}>
                                    Confirm password
                                </Typography>
                                <TextField
                                    id="confirmPassword"
                                    fullWidth
                                    type="password"
                                    autoComplete="new-password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
                                    sx={inputSx}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="outlined"
                                disabled={isSavingPassword}
                                onClick={() => void savePassword()}
                                sx={{
                                    px: spacing.lg,
                                    py: spacing.sm,
                                    borderRadius: radius.lg,
                                    borderColor: colors.outline,
                                    color: colors.onSurface,
                                    fontFamily: typography.bodySm.fontFamily,
                                    fontSize: typography.bodySm.fontSize,
                                    fontWeight: 700,
                                    textTransform: "none",
                                    "&:hover": {
                                        borderColor: colors.outline,
                                        backgroundColor: colors.surfaceContainer,
                                    },
                                }}
                            >
                                {isSavingPassword ? "Updating..." : "Update password"}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            )}

            <Divider sx={{ borderColor: colors.outlineVariant }} />
        </Stack>
    );
};

export default SettingPage;
