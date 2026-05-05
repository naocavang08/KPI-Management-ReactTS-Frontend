import { useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Chip,
	Divider,
	Paper,
	Stack,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import { BellRing, Camera, LockKeyhole, Mail, MessageSquare, Shield } from "lucide-react";
import desginToken from "../theme/desginToken";

const { colors, components, elevation, radius, spacing, typography } = desginToken;

const tabs = ["Thông tin cơ bản", "Đổi mật khẩu", "Cấu hình thông báo"] as const;

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

const SettingPage = () => {
	const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
	const [profile, setProfile] = useState({
		fullName: "Nguyễn Văn A",
		employeeCode: "EMP-99201",
		department: "Phát triển phần mềm (R&D)",
		position: "Kỹ sư phần mềm cao cấp",
		email: "anv.dev@enterprise.com",
	});
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [notificationConfig, setNotificationConfig] = useState({
		email: true,
		push: true,
		browser: false,
	});

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
								borderBottom: `2px solid ${
									isActive ? colors.primaryContainer : "transparent"
								}`,
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

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(320px, 1fr)" },
					gap: spacing.lg,
				}}
			>
				<Stack spacing={spacing.lg}>
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
									Thông tin nhân viên
								</Typography>
								<Button
									variant="contained"
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
									Lưu thay đổi
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
									<Box sx={{ position: "relative" }}>
										<Avatar
											src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5ZLqDg5vkpgPnshQVcR69WqYhPkO1fLjfgXMl2dq8yrIdiqYkeY-pNrYMTV4On_1Pb11tbkqbO0rsxFCtEWCeUKib8EwnHeAPNwm_8365DuBFACY6o1HLdCwDAxvdgyop-ie9cfNuZUootLfsb-Yd8NxI3gQ7UGaaU-F7dpSK24y_mALs51qNlVZ4Y2gUEBpEZ28z2hpluf3YZLRoRQhE3HNFM66eHsI6fCxKgsXBOano7AKtpgoVqKCr2Qsx5pnDhtNIrnej7A"
											sx={{
												width: 128,
												height: 128,
												border: `4px solid ${colors.surfaceContainer}`,
											}}
										/>
										<Box
											sx={{
												position: "absolute",
												inset: 0,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												borderRadius: "50%",
												backgroundColor: "rgba(0, 0, 0, 0.36)",
												opacity: 0,
												cursor: "pointer",
												transition: "opacity 0.2s ease",
												"&:hover": {
													opacity: 1,
												},
											}}
										>
											<Camera size={28} color={colors.onPrimary} />
										</Box>
									</Box>
									<Typography
										sx={{
											fontFamily: typography.bodySm.fontFamily,
											fontSize: typography.bodySm.fontSize,
											fontWeight: 500,
											lineHeight: typography.bodySm.lineHeight,
											color: colors.outline,
										}}
									>
										PNG hoặc JPG, tối đa 5MB
									</Typography>
								</Stack>

								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
										gap: spacing.lg,
									}}
								>
									<Box>
										<Typography component="label" htmlFor="fullName" sx={labelSx}>
											Họ và tên
										</Typography>
										<TextField
											id="fullName"
											fullWidth
											value={profile.fullName}
											onChange={(event) =>
												setProfile((prev) => ({
													...prev,
													fullName: event.target.value,
												}))
											}
											sx={inputSx}
										/>
									</Box>
									<Box>
										<Typography
											component="label"
											htmlFor="employeeCode"
											sx={labelSx}
										>
											Mã nhân viên
										</Typography>
										<TextField
											id="employeeCode"
											fullWidth
											value={profile.employeeCode}
											slotProps={{ input: { readOnly: true } }}
											sx={{
												...inputSx,
												"& .MuiInputBase-root": {
													...inputSx["& .MuiInputBase-root"],
													backgroundColor: colors.surfaceContainerLow,
													color: colors.outline,
												},
											}}
										/>
									</Box>
									<Box>
										<Typography
											component="label"
											htmlFor="department"
											sx={labelSx}
										>
											Phòng ban
										</Typography>
										<TextField
											id="department"
											fullWidth
											value={profile.department}
											slotProps={{ input: { readOnly: true } }}
											sx={{
												...inputSx,
												"& .MuiInputBase-root": {
													...inputSx["& .MuiInputBase-root"],
													backgroundColor: colors.surfaceContainerLow,
													color: colors.outline,
												},
											}}
										/>
									</Box>
									<Box>
										<Typography component="label" htmlFor="position" sx={labelSx}>
											Chức vụ
										</Typography>
										<TextField
											id="position"
											fullWidth
											value={profile.position}
											slotProps={{ input: { readOnly: true } }}
											sx={{
												...inputSx,
												"& .MuiInputBase-root": {
													...inputSx["& .MuiInputBase-root"],
													backgroundColor: colors.surfaceContainerLow,
													color: colors.outline,
												},
											}}
										/>
									</Box>
									<Box sx={{ gridColumn: { md: "1 / -1" } }}>
										<Typography component="label" htmlFor="email" sx={labelSx}>
											Email công ty
										</Typography>
										<TextField
											id="email"
											fullWidth
											type="email"
											value={profile.email}
											onChange={(event) =>
												setProfile((prev) => ({
													...prev,
													email: event.target.value,
												}))
											}
											sx={inputSx}
										/>
									</Box>
								</Box>
							</Box>
						</Stack>
					</Paper>

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
									Đổi mật khẩu
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
									<Typography component="label" htmlFor="currentPassword" sx={labelSx}>
										Mật khẩu cũ
									</Typography>
									<TextField
										id="currentPassword"
										fullWidth
										type="password"
										placeholder="••••••••"
										value={passwordForm.currentPassword}
										onChange={(event) =>
											setPasswordForm((prev) => ({
												...prev,
												currentPassword: event.target.value,
											}))
										}
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
										placeholder="Tối thiểu 8 ký tự"
										value={passwordForm.newPassword}
										onChange={(event) =>
											setPasswordForm((prev) => ({
												...prev,
												newPassword: event.target.value,
											}))
										}
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
										placeholder="Nhập lại mật khẩu mới"
										value={passwordForm.confirmPassword}
										onChange={(event) =>
											setPasswordForm((prev) => ({
												...prev,
												confirmPassword: event.target.value,
											}))
										}
										sx={inputSx}
									/>
								</Box>
							</Box>

							<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
								<Button
									variant="outlined"
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
									Cập nhật mật khẩu
								</Button>
							</Box>
						</Stack>
					</Paper>
				</Stack>

				<Stack spacing={spacing.lg}>
					<Paper elevation={0} sx={cardSx}>
						<Stack spacing={spacing.lg}>
							<Typography
								sx={{
									fontFamily: typography.h2.fontFamily,
									fontSize: typography.h2.fontSize,
									fontWeight: typography.h2.fontWeight,
									lineHeight: typography.h2.lineHeight,
									color: colors.onSurface,
								}}
							>
								Cấu hình thông báo
							</Typography>

							{[
								{
									key: "email" as const,
									icon: <Mail size={18} color={colors.secondary} />,
									title: "Email",
									description: "Báo cáo KPI hàng tuần",
								},
								{
									key: "push" as const,
									icon: <BellRing size={18} color={colors.tertiary} />,
									title: "Thông báo đẩy",
									description: "Cập nhật từ cấp quản lý",
								},
								{
									key: "browser" as const,
									icon: <MessageSquare size={18} color={colors.primaryContainer} />,
									title: "Trình duyệt",
									description: "Cảnh báo KPI dưới mục tiêu",
								},
							].map((item) => (
								<Box
									key={item.key}
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: spacing.md,
										p: spacing.md,
										borderRadius: radius.lg,
										backgroundColor: colors.surfaceContainerLow,
									}}
								>
									<Stack direction="row" spacing={spacing.sm} sx={{ alignItems: "center" }}>
										<Box>{item.icon}</Box>
										<Box>
											<Typography
												sx={{
													fontFamily: typography.bodyBase.fontFamily,
													fontSize: typography.bodyBase.fontSize,
													fontWeight: 700,
													lineHeight: typography.bodyBase.lineHeight,
													color: colors.onSurface,
												}}
											>
												{item.title}
											</Typography>
											<Typography
												sx={{
													fontFamily: typography.bodySm.fontFamily,
													fontSize: typography.bodySm.fontSize,
													fontWeight: typography.bodySm.fontWeight,
													lineHeight: typography.bodySm.lineHeight,
													color: colors.outline,
												}}
											>
												{item.description}
											</Typography>
										</Box>
									</Stack>
									<Switch
										checked={notificationConfig[item.key]}
										onChange={(_, checked) =>
											setNotificationConfig((prev) => ({
												...prev,
												[item.key]: checked,
											}))
										}
										sx={{
											"& .MuiSwitch-switchBase.Mui-checked": {
												color: colors.primaryContainer,
											},
											"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
												backgroundColor: colors.primaryContainer,
											},
											"& .MuiSwitch-track": {
												backgroundColor: colors.outlineVariant,
											},
										}}
									/>
								</Box>
							))}
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
								Bảo mật tài khoản
							</Typography>
							<Typography
								sx={{
									maxWidth: 280,
									fontFamily: typography.bodySm.fontFamily,
									fontSize: typography.bodySm.fontSize,
									fontWeight: typography.bodySm.fontWeight,
									lineHeight: typography.bodySm.lineHeight,
									opacity: 0.84,
								}}
							>
								Tăng cường bảo vệ tài khoản bằng xác thực 2 lớp để bảo đảm an toàn
								cho dữ liệu KPI nội bộ.
							</Typography>
							<Box sx={{ pt: spacing.md }}>
								<Button
									variant="contained"
									sx={{
										backgroundColor: colors.surfaceContainerLowest,
										color: colors.primaryContainer,
										px: spacing.md,
										py: spacing.sm,
										borderRadius: radius.base,
										fontFamily: typography.bodySm.fontFamily,
										fontSize: typography.bodySm.fontSize,
										fontWeight: 700,
										textTransform: "none",
										boxShadow: "none",
										"&:hover": {
											backgroundColor: colors.surfaceBright,
											boxShadow: "none",
										},
									}}
								>
									Kích hoạt ngay
								</Button>
							</Box>
						</Stack>
					</Paper>
				</Stack>
			</Box>

			<Divider sx={{ borderColor: colors.outlineVariant }} />

			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={spacing.md}
				sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
			>
				<Typography
					sx={{
						fontFamily: typography.labelCaps.fontFamily,
						fontSize: typography.labelCaps.fontSize,
						fontWeight: typography.labelCaps.fontWeight,
						lineHeight: typography.labelCaps.lineHeight,
						textTransform: "uppercase",
						letterSpacing: "0.08em",
						color: colors.outline,
					}}
				>
					Last login: 24/05/2024 08:45 AM from IP: 192.168.1.1
				</Typography>
				<Stack direction="row" spacing={spacing.lg}>
					<Chip
						label="Chính sách bảo mật"
						variant="outlined"
						sx={{
							borderColor: colors.outlineVariant,
							color: colors.onSurfaceVariant,
							borderRadius: radius.chip,
						}}
					/>
					<Chip
						label="Điều khoản sử dụng"
						variant="outlined"
						sx={{
							borderColor: colors.outlineVariant,
							color: colors.onSurfaceVariant,
							borderRadius: radius.chip,
						}}
					/>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default SettingPage;