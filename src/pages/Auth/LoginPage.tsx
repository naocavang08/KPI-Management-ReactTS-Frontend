import {
	Box,
	Button,
	Container,
	CssBaseline,
	Divider,
	IconButton,
	InputAdornment,
	Link,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useLoginPage } from "./useLoginPage";

const LoginPage = () => {
	const { form, onSubmit, isLoading, showPassword, togglePassword } = useLoginPage();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = form;

	const loading = isLoading || isSubmitting;

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				background:
					"linear-gradient(135deg, rgba(250, 247, 242, 1) 0%, rgba(246, 233, 215, 1) 45%, rgba(225, 243, 252, 1) 100%)",
				py: { xs: 6, md: 10 },
			}}
		>
			<CssBaseline />
			<Container maxWidth="sm">
				<Paper
					elevation={4}
					sx={{
						p: { xs: 3, md: 5 },
						borderRadius: 3,
						backgroundColor: "rgba(255, 255, 255, 0.94)",
						boxShadow: "0 20px 60px rgba(31, 41, 55, 0.15)",
					}}
				>
					<Stack spacing={3}>
						<Stack spacing={1}>
							<Typography variant="overline" color="text.secondary">
								Project Hub
							</Typography>
							<Typography variant="h4" fontWeight={700}>
								Welcome back
							</Typography>
							<Typography color="text.secondary">
								Sign in to manage your projects and team updates.
							</Typography>
						</Stack>

						<Divider />

						<Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
							<Stack spacing={2.5}>
								<TextField
									label="Email"
									placeholder="you@example.com"
									type="email"
									autoComplete="email"
									error={Boolean(errors.email)}
									helperText={errors.email?.message}
									{...register("email", {
										required: "Email is required",
										pattern: {
											value: /\S+@\S+\.\S+/,
											message: "Enter a valid email",
										},
									})}
								/>

								<TextField
									label="Password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									error={Boolean(errors.password)}
									helperText={errors.password?.message}
									{...register("password", {
										required: "Password is required",
										pattern: {
											value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
											message:
												"Password must contain letters and numbers",
										},
										minLength: {
											value: 6,
											message: "Password must be at least 6 characters",
										},
									})}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													size="small"
													onClick={() => togglePassword()}
													aria-label={showPassword ? "Hide password" : "Show password"}
												>
													{showPassword ? <MdVisibilityOff /> : <MdVisibility />}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>

								<Stack direction="row" justifyContent="space-between" alignItems="center">
									<Link href="#" underline="hover" color="text.secondary">
										Forgot password?
									</Link>
									<Typography variant="caption" color="text.secondary">
										Need access? Contact admin.
									</Typography>
								</Stack>

								<Button
									type="submit"
									variant="contained"
									size="large"
									disabled={loading}
									sx={{
										textTransform: "none",
										fontWeight: 600,
										py: 1.4,
									}}
								>
									{loading ? "Signing in..." : "Sign in"}
								</Button>
							</Stack>
						</Box>

						<Typography variant="caption" color="text.secondary">
							By continuing you agree to the platform usage policy.
						</Typography>
					</Stack>
				</Paper>
			</Container>
		</Box>
	);
};

export default LoginPage;
