import { useState } from "react";
import type { ElementType } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { BadgeCheck, BriefcaseBusiness, KeyRound, Mail, Save, ShieldCheck, User } from "lucide-react";
import desginToken from "../theme/desginToken";
import { useProfileSettings } from "./useProfileSettings";

const { colors, components, elevation, radius, semantic, spacing, typography } = desginToken;

const tabs = [
    { value: "profile", label: "Thông tin cá nhân" },
    { value: "password", label: "Đổi mật khẩu" },
] as const;

type SettingTab = (typeof tabs)[number]["value"];

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
        color: colors.onSurfaceVariant,
    },
};

const labelSx = {
    display: "block",
    mb: spacing.base,
    ...typography.labelCaps,
    letterSpacing: "0.08em",
    color: colors.outline,
};

const cardSx = {
    p: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceContainerLowest,
    border: elevation.level1.border,
    boxShadow: elevation.level1.boxShadow,
};

const sectionTitleSx = {
    ...typography.h2,
    color: colors.onSurface,
};

const buttonSx = {
    px: spacing.lg,
    py: spacing.sm,
    borderRadius: radius.button,
    fontFamily: typography.bodySm.fontFamily,
    fontSize: typography.bodySm.fontSize,
    fontWeight: 700,
    textTransform: "none",
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "Chưa ghi nhận";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const formatEmpty = (value?: string | null) => value?.trim() || "Chưa cập nhật";

type ReadonlyFieldProps = {
    id: string;
    label: string;
    value?: string | null;
};

const ReadonlyField = ({ id, label, value }: ReadonlyFieldProps) => (
    <Box>
        <Typography component="label" htmlFor={id} sx={labelSx}>
            {label}
        </Typography>
        <TextField id={id} fullWidth value={formatEmpty(value)} slotProps={{ input: { readOnly: true } }} sx={readonlyInputSx} />
    </Box>
);

type SummaryItemProps = {
    icon: ElementType;
    label: string;
    value: string;
};

const SummaryItem = ({ icon: Icon, label, value }: SummaryItemProps) => (
    <Stack direction="row" spacing={spacing.sm} sx={{ alignItems: "flex-start" }}>
        <Box
            sx={{
                display: "grid",
                placeItems: "center",
                width: 32,
                height: 32,
                flex: "0 0 32px",
                borderRadius: radius.button,
                backgroundColor: colors.surfaceContainerLow,
                color: colors.primaryContainer,
            }}
        >
            <Icon size={16} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...typography.bodySm, color: colors.outline }}>{label}</Typography>
            <Typography sx={{ ...typography.bodyBase, color: colors.onSurface, overflowWrap: "anywhere" }}>{value}</Typography>
        </Box>
    </Stack>
);

const SettingPage = () => {
    const [activeTab, setActiveTab] = useState<SettingTab>("profile");
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
    const isActive = Boolean(user?.isActive);

    return (
        <Stack spacing={spacing.lg}>
            <Paper elevation={0} sx={{ ...cardSx, p: 0, overflow: "hidden" }}>
                <Box
                    sx={{
                        display: "flex",
                        gap: spacing.base,
                        p: spacing.xs,
                        borderBottom: `1px solid ${colors.outlineVariant}`,
                        overflowX: "auto",
                    }}
                >
                    {tabs.map((tab) => {
                        const selected = tab.value === activeTab;

                        return (
                            <Button
                                key={tab.value}
                                type="button"
                                variant={selected ? "contained" : "text"}
                                onClick={() => setActiveTab(tab.value)}
                                sx={{
                                    ...buttonSx,
                                    flex: "0 0 auto",
                                    minHeight: 36,
                                    backgroundColor: selected ? colors.primaryContainer : "transparent",
                                    color: selected ? colors.onPrimary : colors.onSurfaceVariant,
                                    boxShadow: "none",
                                    "&:hover": {
                                        backgroundColor: selected ? colors.primary : colors.surfaceContainerLow,
                                        boxShadow: "none",
                                    },
                                }}
                            >
                                {tab.label}
                            </Button>
                        );
                    })}
                </Box>

                {activeTab === "profile" && (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
                            gap: spacing.lg,
                            p: spacing.lg,
                        }}
                    >
                        <Stack spacing={spacing.lg}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={spacing.md}
                                sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                            >
                                <Typography sx={sectionTitleSx}>Hồ sơ nhân viên</Typography>
                                <Button
                                    variant="contained"
                                    disabled={profileDisabled}
                                    startIcon={<Save size={16} />}
                                    onClick={() => void saveProfile()}
                                    sx={{
                                        ...buttonSx,
                                        alignSelf: "flex-start",
                                        backgroundColor: components.button.primary.background,
                                        color: components.button.primary.color,
                                        boxShadow: "none",
                                        "&:hover": {
                                            backgroundColor: components.button.primary.hoverBackground,
                                            boxShadow: "none",
                                        },
                                    }}
                                >
                                    {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </Stack>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "140px minmax(0, 1fr)" },
                                    gap: spacing.lg,
                                }}
                            >
                                <Stack spacing={spacing.sm} sx={{ alignItems: { xs: "flex-start", md: "center" } }}>
                                    <Avatar
                                        src={profileForm.avatarUrl}
                                        alt={profileForm.fullname || user?.username || "User"}
                                        sx={{
                                            width: 112,
                                            height: 112,
                                            border: `1px solid ${colors.outlineVariant}`,
                                            bgcolor: colors.surfaceContainerHighest,
                                            color: colors.onSurfaceVariant,
                                        }}
                                    >
                                        <User size={40} />
                                    </Avatar>
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
                                            Họ và tên
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
                                    <ReadonlyField id="username" label="Tên đăng nhập" value={user?.username} />
                                    <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                                        <Typography component="label" htmlFor="avatarUrl" sx={labelSx}>
                                            Ảnh đại diện
                                        </Typography>
                                        <TextField
                                            id="avatarUrl"
                                            fullWidth
                                            disabled={profileDisabled}
                                            placeholder="https://..."
                                            value={profileForm.avatarUrl}
                                            onChange={(event) => updateProfileField("avatarUrl", event.target.value)}
                                            sx={inputSx}
                                        />
                                    </Box>
                                    <ReadonlyField id="email" label="Email" value={user?.email} />
                                    <ReadonlyField id="position" label="Chức vụ" value={user?.position} />
                                    <ReadonlyField id="department" label="Phòng ban" value={user?.department} />
                                    <ReadonlyField id="type" label="Loại nhân sự" value={user?.type} />
                                    <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                                        <ReadonlyField id="roles" label="Vai trò" value={roleNames} />
                                    </Box>
                                </Box>
                            </Box>
                        </Stack>

                        <Paper
                            elevation={0}
                            sx={{
                                p: spacing.md,
                                borderRadius: radius.card,
                                backgroundColor: colors.surfaceContainerLow,
                                border: `1px solid ${colors.outlineVariant}`,
                                alignSelf: "start",
                            }}
                        >
                            <Stack spacing={spacing.md}>
                                <Stack direction="row" spacing={spacing.sm} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography sx={sectionTitleSx}>Tổng quan</Typography>
                                    <Chip
                                        label={isActive ? "Không hoạt động" : "Đang hoạt động" }
                                        sx={{
                                            borderRadius: radius.chip,
                                            backgroundColor: isActive ? semantic.success.container : semantic.warning.container,
                                            color: isActive ? semantic.success.onContainer : semantic.warning.onContainer,
                                            fontWeight: 700,
                                        }}
                                    />
                                </Stack>
                                <SummaryItem icon={BadgeCheck} label="Trạng thái" value={formatEmpty(user?.status)} />
                                <SummaryItem icon={BriefcaseBusiness} label="Ngày tạo" value={formatDateTime(user?.createdAt)} />
                                <SummaryItem icon={ShieldCheck} label="Đăng nhập gần nhất" value={formatDateTime(user?.lastLoginAt)} />
                                <SummaryItem icon={Mail} label="Email" value={formatEmpty(user?.email)} />
                                {user?.lockedUntil && <SummaryItem icon={KeyRound} label="Khóa đến" value={formatDateTime(user.lockedUntil)} />}
                                {user?.lockReason && (
                                    <Typography sx={{ ...typography.bodySm, color: colors.error, overflowWrap: "anywhere" }}>
                                        Lý do khóa: {user.lockReason}
                                    </Typography>
                                )}
                            </Stack>
                        </Paper>
                    </Box>
                )}

                {activeTab === "password" && (
                    <Box sx={{ p: spacing.lg }}>
                        <Stack spacing={spacing.lg}>
                            <Stack direction="row" spacing={spacing.sm} sx={{ alignItems: "center" }}>
                                <KeyRound size={18} color={colors.primaryContainer} />
                                <Typography sx={sectionTitleSx}>Đổi mật khẩu</Typography>
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
                                        Mật khẩu hiện tại
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
                                        Mật khẩu mới
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
                                        Xác nhận mật khẩu
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
                                    startIcon={<KeyRound size={16} />}
                                    onClick={() => void savePassword()}
                                    sx={{
                                        ...buttonSx,
                                        borderColor: colors.outline,
                                        color: colors.onSurface,
                                        "&:hover": {
                                            borderColor: colors.primaryContainer,
                                            backgroundColor: colors.surfaceContainerLow,
                                        },
                                    }}
                                >
                                    {isSavingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                )}
            </Paper>
        </Stack>
    );
};

export default SettingPage;
