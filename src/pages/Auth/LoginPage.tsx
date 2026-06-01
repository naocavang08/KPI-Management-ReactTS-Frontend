import {
	Box,
	Button,
	Chip,
	CssBaseline,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	InputAdornment,
	Link,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useForgotPassword, useResetPassword } from "../../hooks/usePasswordRecovery";
import desginToken from "../../theme/desginToken";
import { useLoginPage } from "./useLoginPage";

const { colors, components, elevation, radius, semantic, spacing, typography } =
	desginToken;

const LoginPage = () => {
	const { form, onSubmit, isLoading, showPassword, togglePassword } = useLoginPage();
	const forgotPassword = useForgotPassword();
	const resetPassword = useResetPassword();
	const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
	const [recoveryStep, setRecoveryStep] = useState<"email" | "reset">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = form;

	const loading = isLoading || isSubmitting;
	const recoveryLoading = forgotPassword.isLoading || resetPassword.isLoading;

	const closeRecovery = () => {
		if (recoveryLoading) return;
		setIsRecoveryOpen(false);
		setRecoveryStep("email");
		setOtp("");
		setNewPassword("");
	};

	const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await forgotPassword.submit({ email: email.trim() });
		setRecoveryStep("reset");
	};

	const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await resetPassword.submit({
			email: email.trim(),
			otp: otp.trim(),
			newPassword,
		});
		closeRecovery();
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				backgroundColor: elevation.level0.background,
				backgroundImage: `
					radial-gradient(circle at top left, rgba(218, 226, 255, 0.95), transparent 28%),
					linear-gradient(135deg, ${colors.background} 0%, ${colors.surfaceContainerLow} 50%, ${colors.surfaceContainer} 100%)
				`,
				px: { xs: spacing.md, md: spacing.lg },
				py: { xs: spacing.lg, md: spacing.xl },
			}}
		>
			<CssBaseline />

			<Box
				sx={{
					maxWidth: "500px",
					mx: "auto",
					minHeight: "calc(100vh - 64px)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Paper
					elevation={0}
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						p: { xs: spacing.lg, md: spacing.xl },
						borderRadius: radius.xl,
						backgroundColor: components.card.background,
						border: elevation.level1.border,
						boxShadow: elevation.level2.boxShadow,
					}}
				>
					<Stack spacing={spacing.lg}>
						<Stack spacing={spacing.sm}>
							<Stack
								direction="row"
								spacing={spacing.sm}
								sx={{ alignItems: "center" }}
							>
								<Box
									sx={{
										width: 12,
										height: 12,
										borderRadius: radius.full,
										backgroundColor: semantic.info.main,
										boxShadow: `0 0 0 6px ${semantic.info.container}`,
									}}
								/>
								<Typography
									sx={{
										fontFamily: typography.labelCaps.fontFamily,
										fontSize: typography.labelCaps.fontSize,
										fontWeight: typography.labelCaps.fontWeight,
										lineHeight: typography.labelCaps.lineHeight,
										textTransform: "uppercase",
										letterSpacing: "0.08em",
										color: colors.onSurfaceVariant,
									}}
								>
									Secure access
								</Typography>
							</Stack>

							<Typography
								sx={{
									fontFamily: typography.h1.fontFamily,
									fontSize: typography.h1.fontSize,
									fontWeight: typography.h1.fontWeight,
									lineHeight: typography.h1.lineHeight,
									color: colors.onSurface,
								}}
							>
								Sign in to your workspace
							</Typography>

							<Typography
								sx={{
									fontFamily: typography.bodyBase.fontFamily,
									fontSize: typography.bodyBase.fontSize,
									fontWeight: typography.bodyBase.fontWeight,
									lineHeight: typography.bodyBase.lineHeight,
									color: colors.onSurfaceVariant,
								}}
							>
								Use your company account to open dashboards, reporting cycles,
								and team scorecards.
							</Typography>
						</Stack>

						<Divider sx={{ borderColor: colors.outlineVariant }} />

						<Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
							<Stack spacing={spacing.md}>
								<Box>
									<Typography
										component="label"
										htmlFor="username"
										sx={{
											display: "block",
											mb: spacing.xs,
											fontFamily: typography.labelCaps.fontFamily,
											fontSize: typography.labelCaps.fontSize,
											fontWeight: typography.labelCaps.fontWeight,
											lineHeight: typography.labelCaps.lineHeight,
											textTransform: "uppercase",
											letterSpacing: "0.08em",
											color: colors.onSurfaceVariant,
										}}
									>
										Username
									</Typography>
									<TextField
										id="username"
										fullWidth
										placeholder="admin"
										type="text"
										autoComplete="username"
										error={Boolean(errors.username)}
										helperText={errors.username?.message}
										{...register("username", {
											required: "Username is required",
										})}
										sx={{
											"& .MuiInputBase-root": {
												minHeight: 52,
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
											"& .MuiFormHelperText-root": {
												mt: spacing.xs,
												mx: 0,
												fontFamily: typography.bodySm.fontFamily,
												fontSize: typography.bodySm.fontSize,
												lineHeight: typography.bodySm.lineHeight,
											},
										}}
									/>
								</Box>

								<Box>
									<Typography
										component="label"
										htmlFor="password"
										sx={{
											display: "block",
											mb: spacing.xs,
											fontFamily: typography.labelCaps.fontFamily,
											fontSize: typography.labelCaps.fontSize,
											fontWeight: typography.labelCaps.fontWeight,
											lineHeight: typography.labelCaps.lineHeight,
											textTransform: "uppercase",
											letterSpacing: "0.08em",
											color: colors.onSurfaceVariant,
										}}
									>
										Password
									</Typography>
									<TextField
										id="password"
										fullWidth
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										error={Boolean(errors.password)}
										helperText={errors.password?.message}
										{...register("password", {
											required: "Password is required",
											// pattern: {
											// 	value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
											// 	message: "Password must contain letters and numbers",
											// },
											minLength: {
												value: 6,
												message: "Password must be at least 6 characters",
											},
										})}
										slotProps={{
											input: {
												endAdornment: (
													<InputAdornment position="end">
														<IconButton
															size="small"
															onClick={() => togglePassword()}
															aria-label={
																showPassword ? "Hide password" : "Show password"
															}
															sx={{
																color: colors.onSurfaceVariant,
															}}
														>
															{showPassword ? <MdVisibilityOff /> : <MdVisibility />}
														</IconButton>
													</InputAdornment>
												),
											},
										}}
										sx={{
											"& .MuiInputBase-root": {
												minHeight: 52,
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
											"& .MuiFormHelperText-root": {
												mt: spacing.xs,
												mx: 0,
												fontFamily: typography.bodySm.fontFamily,
												fontSize: typography.bodySm.fontSize,
												lineHeight: typography.bodySm.lineHeight,
											},
										}}
									/>
								</Box>

								<Stack
									direction={{ xs: "column", sm: "row" }}
									spacing={spacing.sm}
									sx={{
										alignItems: { xs: "flex-start", sm: "center" },
										justifyContent: "space-between",
									}}
								>
									<Link
										component="button"
										type="button"
										underline="hover"
										onClick={() => setIsRecoveryOpen(true)}
										sx={{
											border: 0,
											background: "none",
											p: 0,
											cursor: "pointer",
											fontFamily: typography.bodySm.fontFamily,
											fontSize: typography.bodySm.fontSize,
											lineHeight: typography.bodySm.lineHeight,
											color: colors.primaryContainer,
										}}
									>
										Forgot password?
									</Link>
									<Chip
										label="Admin approval required for new accounts"
										sx={{
											height: 28,
											borderRadius: radius.chip,
											backgroundColor: semantic.warning.container,
											color: semantic.warning.onContainer,
											fontFamily: typography.bodySm.fontFamily,
											fontSize: typography.bodySm.fontSize,
										}}
									/>
								</Stack>

								<Button
									type="submit"
									variant="contained"
									disabled={loading}
									sx={{
										minHeight: 52,
										borderRadius: radius.button,
										backgroundColor: components.button.primary.background,
										color: components.button.primary.color,
										fontFamily: typography.bodyBase.fontFamily,
										fontSize: typography.bodyBase.fontSize,
										fontWeight: 700,
										lineHeight: typography.bodyBase.lineHeight,
										textTransform: "none",
										boxShadow: "none",
										"&:hover": {
											backgroundColor: components.button.primary.hoverBackground,
											boxShadow: "none",
										},
										"&.Mui-disabled": {
											backgroundColor: colors.surfaceDim,
											color: colors.onSurfaceVariant,
										},
									}}
								>
									{loading ? "Signing in..." : "Sign in"}
								</Button>
							</Stack>
						</Box>

						<Typography
							sx={{
								fontFamily: typography.bodySm.fontFamily,
								fontSize: typography.bodySm.fontSize,
								fontWeight: typography.bodySm.fontWeight,
								lineHeight: typography.bodySm.lineHeight,
								color: colors.onSurfaceVariant,
								textAlign: "center",
							}}
						>
							© {new Date().getFullYear()} KPI Management. All rights reserved.
						</Typography>
					</Stack>
				</Paper>
			</Box>

			<Dialog
				open={isRecoveryOpen}
				onClose={closeRecovery}
				fullWidth
				maxWidth="xs"
				slotProps={{
					paper: {
						sx: {
							borderRadius: radius.card,
							border: elevation.level1.border,
							boxShadow: elevation.level2.boxShadow,
						},
					},
				}}
			>
				<DialogTitle
					sx={{
						fontFamily: typography.h2.fontFamily,
						fontSize: typography.h2.fontSize,
						fontWeight: typography.h2.fontWeight,
						lineHeight: typography.h2.lineHeight,
						color: colors.onSurface,
						pb: spacing.xs,
					}}
				>
					{recoveryStep === "email" ? "Forgot password" : "Reset password"}
				</DialogTitle>
				<DialogContent sx={{ pt: spacing.xs }}>
					<Box
						component="form"
						noValidate
						onSubmit={recoveryStep === "email" ? handleForgotPassword : handleResetPassword}
					>
						<Stack spacing={spacing.md}>
							<Typography
								sx={{
									fontFamily: typography.bodySm.fontFamily,
									fontSize: typography.bodySm.fontSize,
									lineHeight: typography.bodySm.lineHeight,
									color: colors.onSurfaceVariant,
								}}
							>
								{recoveryStep === "email"
									? "Enter your account email to receive an OTP."
									: "Enter the OTP from your email and choose a new password."}
							</Typography>

							<TextField
								label="Email"
								type="email"
								fullWidth
								required
								value={email}
								disabled={recoveryStep === "reset" || recoveryLoading}
								onChange={(event) => setEmail(event.target.value)}
							/>

							{recoveryStep === "reset" && (
								<>
									<TextField
										label="OTP"
										fullWidth
										required
										value={otp}
										disabled={recoveryLoading}
										onChange={(event) => setOtp(event.target.value)}
									/>
									<TextField
										label="New password"
										type="password"
										fullWidth
										required
										value={newPassword}
										disabled={recoveryLoading}
										onChange={(event) => setNewPassword(event.target.value)}
									/>
								</>
							)}

							<Stack direction="row" spacing={spacing.sm} sx={{ justifyContent: "flex-end" }}>
								<Button
									type="button"
									variant="outlined"
									disabled={recoveryLoading}
									onClick={closeRecovery}
									sx={{ textTransform: "none", borderRadius: radius.button }}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={recoveryLoading}
									sx={{ textTransform: "none", borderRadius: radius.button }}
								>
									{recoveryLoading
										? "Please wait..."
										: recoveryStep === "email"
											? "Send OTP"
											: "Reset password"}
								</Button>
							</Stack>
						</Stack>
					</Box>
				</DialogContent>
			</Dialog>
		</Box>
	);
};

export default LoginPage;
