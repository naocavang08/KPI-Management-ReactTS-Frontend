import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
	Avatar,
	Box,
	Chip,
	Collapse,
	Divider,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	Stack,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import {
	BarChart3,
	Bell,
	Building2,
	ChevronDown,
	ChevronRight,
	CircleHelp,
	ClipboardCheck,
	Download,
	FolderKanban,
	LogOut,
	Menu as MenuIcon,
	Scale,
	Settings,
	Shield,
	Target,
	User,
	Users,
	MessageSquareWarning,
} from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import desginToken from "../theme/desginToken";
import { hasRole, hasAuthority } from "../lib/permissions";

const { colors, elevation, layout, radius, semantic, spacing, typography } = desginToken;

type NavigationItem = {
	id: string;
	label: string;
	icon: React.ElementType;
	path?: string;
	disabled?: boolean;
	requiredPermission?: string | string[];
	requiredRole?: string;
	children?: { 
		id: string; 
		label: string; 
		icon?: React.ElementType; 
		path: string;
		requiredPermission?: string | string[];
		requiredRole?: string;
	}[];
};

const navigationItems: NavigationItem[] = [
	{
		id: "admin",
		label: "Admin",
		icon: Users,
		children: [
			{
				id: "admin-users",
				label: "User",
				icon: User,
				path: "/admin/user",
				requiredPermission: "USER:VIEW",
			},
			{
				id: "admin-roles",
				label: "Role",
				icon: Shield,
				path: "/admin/role",
				requiredPermission: "ROLE:VIEW",
			},
		],
	},
	{
		id: "kpi-library",
		label: "KPI Library",
		icon: Target,
		children: [
			{
				id: "kpi-scores",
				label: "KPI Scores",
				icon: BarChart3,
				path: "/kpi/scores",
				requiredPermission: ["KPI:VIEW_SELF", "KPI:VIEW_TEAM"],
			},
			{
				id: "kpi-reviews",
				label: "KPI Reviews",
				icon: ClipboardCheck,
				path: "/kpi/reviews",
				requiredPermission: ["KPI/REVIEW:CREATE", "KPI/REVIEW:UPDATE", "KPI/REVIEW:DELETE"],
			},
			{
				id: "kpi-appeals",
				label: "KPI Appeals",
				icon: MessageSquareWarning,
				path: "/kpi/appeals",
				requiredPermission: ["KPI/APPEAL:CREATE", "KPI/APPEAL:RESOLVE"],
			},
			{
				id: "kpi-weights",
				label: "KPI Weights",
				icon: Scale,
				path: "/kpi/weights",
				requiredPermission: "KPI/WEIGHT:UPDATE",
			},
			{
				id: "kpi-export",
				label: "KPI Export",
				icon: Download,
				path: "/kpi/export",
				requiredPermission: "KPI/REPORT:EXPORT",
			},
		],
	},
	{
		id: "tasks",
		label: "Task Management",
		icon: FolderKanban,
		path: "/tasks",
		requiredPermission: "KPI/TASK:VIEW",
	},
	{
		id: "teams",
		label: "Team Management",
		icon: Building2,
		path: "/teams",
		requiredPermission: "TEAM:VIEW",
	},
	{
		id: "settings",
		label: "Settings",
		icon: Settings,
		path: "/settings",
	},
];

const drawerWidth = parseInt(layout.sidebarWidth, 10);

const ProjectLayout = () => {
	const navigate = useNavigate();
	const theme = useTheme();
	const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
	const location = useLocation();
	const logout = useAuthStore((state) => state.logout);
	const userInfo = useAuthStore((state) => state.user);
	const permissions = useAuthStore((state) => state.permissions);
	const fetchMe = useAuthStore((state) => state.fetchMe);
	const isLoading = useAuthStore((state) => state.isProfileLoading);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

	const visibleNavigationItems = useMemo(() => {
		const checkItem = (item: { requiredPermission?: string | string[]; requiredRole?: string }) => {
			if (!item.requiredPermission && !item.requiredRole) return true;
			if (item.requiredRole && hasRole(userInfo, item.requiredRole)) return true;
			if (item.requiredPermission) {
				const perms = Array.isArray(item.requiredPermission) ? item.requiredPermission : [item.requiredPermission];
				return perms.some(p => hasAuthority(userInfo, permissions, p));
			}
			return false;
		};
		return navigationItems
			.map(item => {
				if (item.children) {
					const visibleChildren = item.children.filter(checkItem);
					if (visibleChildren.length === 0) return null;
					return { ...item, children: visibleChildren };
				}
				return checkItem(item) ? item : null;
			})
			.filter((item): item is NavigationItem => item !== null);
	}, [userInfo, permissions]);

	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
		const initial: Record<string, boolean> = {};
		navigationItems.forEach((item) => {
			if (item.children?.some((child) => child.path === location.pathname)) {
				initial[item.id] = true;
			}
		});
		return initial;
	});

	useEffect(() => {
		visibleNavigationItems.forEach((item) => {
			if (item.children?.some((child) => child.path === location.pathname)) {
				setExpandedItems((prev) => {
					if (prev[item.id]) return prev;
					return { ...prev, [item.id]: true };
				});
			}
		});
	}, [location.pathname, visibleNavigationItems]);

	const toggleExpand = (id: string, e: React.MouseEvent) => {
		e.preventDefault();
		setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const activeItem = useMemo(
		() => {
			for (const item of visibleNavigationItems) {
				if (item.path === location.pathname) return item;
				if (item.children) {
					const child = item.children.find(c => c.path === location.pathname);
					if (child) return child;
				}
			}
			return undefined;
		},
		[location.pathname, visibleNavigationItems]
	);

	const userName = useMemo(() => {
		if (isLoading) return "Loading...";
		return userInfo?.displayName || "User";
	}, [isLoading, userInfo?.displayName]);

	const userEmail = useMemo(() => {
		if (isLoading) return "...";
		return userInfo?.email || "user@example.com";
	}, [isLoading, userInfo?.email]);

	const userRole = useMemo(() => {
		if (isLoading) return "Syncing profile";
		return userInfo?.roles?.[0]?.displayName || userInfo?.roles?.[0]?.name || "Team member";
	}, [isLoading, userInfo?.roles]);

	const currentPageTitle = activeItem?.label || "Workspace";

	useEffect(() => {
		if (userInfo) return;

		void fetchMe().catch((error) => {
			console.error("Failed to fetch user info:", error);
		});
	}, [fetchMe, userInfo]);

	useEffect(() => {
		if (isDesktop) {
			setMobileOpen(false);
		}
	}, [isDesktop]);

	const handleDrawerToggle = () => {
		setMobileOpen((prev) => !prev);
	};

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setMenuAnchor(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	const drawerContent = (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: colors.surfaceContainerLowest,
			}}
		>
			<Box sx={{ px: spacing.lg, py: spacing.lg }}>
				<Stack direction="row" spacing={spacing.sm} sx={{ alignItems: "center" }}>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: radius.base,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: colors.primaryContainer,
							color: colors.onPrimary,
						}}
					>
						<BarChart3 size={20} />
					</Box>
					<Box sx={{ minWidth: 0 }}>
						<Typography
							sx={{
								fontFamily: typography.h2.fontFamily,
								fontSize: "18px",
								fontWeight: 900,
								lineHeight: "20px",
								color: colors.primaryContainer,
							}}
						>
							KPI Management
						</Typography>
						<Typography
							sx={{
								mt: "2px",
								fontFamily: typography.labelCaps.fontFamily,
								fontSize: "10px",
								fontWeight: typography.labelCaps.fontWeight,
								lineHeight: typography.labelCaps.lineHeight,
								letterSpacing: "0.12em",
								textTransform: "uppercase",
								color: colors.outline,
							}}
						>
							Enterprise Portal
						</Typography>
					</Box>
				</Stack>
			</Box>

			<Box sx={{ px: spacing.md, pb: spacing.md }}>
				<Stack spacing="4px">
					{visibleNavigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = item.path === location.pathname;

						if (item.disabled) {
							return (
								<Box
									key={item.id}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: spacing.sm,
										px: spacing.md,
										py: spacing.sm,
										borderLeft: "4px solid transparent",
										color: colors.onSurfaceVariant,
										borderRadius: `0 ${radius.lg} ${radius.lg} 0`,
										opacity: 0.76,
										cursor: "default",
										transition: "background-color 0.2s ease, color 0.2s ease",
										"&:hover": {
											backgroundColor: colors.surfaceContainerLow,
										},
									}}
								>
									<Icon size={19} />
									<Typography
										sx={{
											fontFamily: typography.bodyBase.fontFamily,
											fontSize: typography.bodyBase.fontSize,
											fontWeight: 500,
											lineHeight: typography.bodyBase.lineHeight,
										}}
									>
										{item.label}
									</Typography>
									<Chip
										label="Soon"
										size="small"
										sx={{
											ml: "auto",
											height: 22,
											borderRadius: radius.chip,
											backgroundColor: colors.surfaceContainer,
											color: colors.onSurfaceVariant,
											fontSize: "10px",
											fontWeight: 700,
										}}
									/>
								</Box>
							);
						}

						const isChildActive = item.children?.some(child => child.path === location.pathname);
						const isItemActive = isActive || isChildActive;
						const hasChildren = item.children && item.children.length > 0;
						const isExpanded = expandedItems[item.id];

						return (
							<Box key={item.id} sx={{ display: "flex", flexDirection: "column" }}>
								<Box
									component={hasChildren ? "div" : NavLink}
									{...(hasChildren ? {} : { to: item.path! })}
									onClick={hasChildren ? (e: React.MouseEvent<HTMLDivElement>) => toggleExpand(item.id, e) : () => setMobileOpen(false)}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: spacing.sm,
										px: spacing.md,
										py: spacing.sm,
										textDecoration: "none",
										cursor: "pointer",
										borderLeft: `4px solid ${isItemActive ? colors.primaryContainer : "transparent"
											}`,
										borderRadius: `0 ${radius.lg} ${radius.lg} 0`,
										backgroundColor: isItemActive
											? "rgba(0, 82, 204, 0.08)"
											: "transparent",
										color: isItemActive ? colors.primaryContainer : colors.onSurfaceVariant,
										fontWeight: isItemActive ? 700 : 500,
										transition:
											"background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
										"&:hover": {
											backgroundColor: isItemActive
												? "rgba(0, 82, 204, 0.12)"
												: colors.surfaceContainerLow,
										},
									}}
								>
									<Icon size={19} />
									<Typography
										sx={{
											fontFamily: typography.bodyBase.fontFamily,
											fontSize: typography.bodyBase.fontSize,
											fontWeight: "inherit",
											lineHeight: typography.bodyBase.lineHeight,
											flexGrow: 1,
										}}
									>
										{item.label}
									</Typography>
									{hasChildren && (
										isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
									)}
								</Box>
								{hasChildren && (
									<Collapse in={isExpanded} timeout="auto" unmountOnExit>
										<Stack spacing="2px" sx={{ mt: "2px" }}>
											{item.children!.map((child) => {
												const isChildCurrent = child.path === location.pathname;
												const ChildIcon = child.icon;
												return (
													<Box
														key={child.id}
														component={NavLink}
														to={child.path}
														onClick={() => setMobileOpen(false)}
														sx={{
															display: "flex",
															alignItems: "center",
															gap: spacing.sm,
															pl: ChildIcon ? "42px" : "48px",
															pr: spacing.md,
															py: "8px",
															textDecoration: "none",
															borderRadius: `0 ${radius.lg} ${radius.lg} 0`,
															backgroundColor: isChildCurrent
																? "rgba(0, 82, 204, 0.08)"
																: "transparent",
															color: isChildCurrent ? colors.primaryContainer : colors.onSurfaceVariant,
															fontWeight: isChildCurrent ? 600 : 400,
															transition: "background-color 0.2s ease, color 0.2s ease",
															"&:hover": {
																backgroundColor: isChildCurrent
																	? "rgba(0, 82, 204, 0.12)"
																	: colors.surfaceContainerLow,
															},
														}}
													>
														{ChildIcon && <ChildIcon size={16} />}
														<Typography
															sx={{
																fontFamily: typography.bodyBase.fontFamily,
																fontSize: "14px",
																fontWeight: "inherit",
															}}
														>
															{child.label}
														</Typography>
													</Box>
												);
											})}
										</Stack>
									</Collapse>
								)}
							</Box>
						);
					})}
				</Stack>
			</Box>

			<Box sx={{ mt: "auto", p: spacing.md }}>
				<Paper
					elevation={0}
					sx={{
						p: spacing.md,
						borderRadius: radius.xl,
						backgroundColor: colors.surfaceContainerLow,
						border: elevation.level1.border,
						boxShadow: "none",
					}}
				>
					<Stack direction="row" spacing={spacing.sm} sx={{ alignItems: "center" }}>
						<Avatar
							src={userInfo?.avatarUrl ?? undefined}
							sx={{
								width: 40,
								height: 40,
								border: `1px solid ${colors.surfaceContainerLowest}`,
								boxShadow: elevation.level2.boxShadow,
								bgcolor: colors.surfaceContainerHighest,
								color: colors.onSurfaceVariant,
							}}
						>
							<User size={18} />
						</Avatar>
						<Box sx={{ minWidth: 0, flex: 1 }}>
							<Typography
								noWrap
								sx={{
									fontFamily: typography.bodyBase.fontFamily,
									fontSize: typography.bodyBase.fontSize,
									fontWeight: 700,
									lineHeight: typography.bodyBase.lineHeight,
									color: colors.onSurface,
								}}
							>
								{userName}
							</Typography>
							<Typography
								noWrap
								sx={{
									fontFamily: typography.bodySm.fontFamily,
									fontSize: typography.bodySm.fontSize,
									fontWeight: typography.bodySm.fontWeight,
									lineHeight: typography.bodySm.lineHeight,
									color: colors.outline,
								}}
							>
								{userRole}
							</Typography>
						</Box>
					</Stack>
				</Paper>
			</Box>
		</Box>
	);

	return (
		<Box sx={{ minHeight: "100vh", display: "flex", backgroundColor: elevation.level0.background }}>
			<Box component="nav" sx={{ width: 0, flexShrink: 0 }}>
				<Box
					onClick={handleDrawerToggle}
					sx={{
						display: { xs: mobileOpen ? "block" : "none", lg: "none" },
						position: "fixed",
						inset: 0,
						backgroundColor: "rgba(25, 27, 35, 0.36)",
						zIndex: theme.zIndex.drawer,
					}}
				/>
				<Box
					component="aside"
					sx={{
						position: "fixed",
						top: 0,
						left: 0,
						width: drawerWidth,
						height: "100vh",
						borderRight: elevation.level1.border,
						backgroundColor: colors.surfaceContainerLowest,
						zIndex: theme.zIndex.drawer + 1,
						transform: {
							xs: mobileOpen ? "translateX(0)" : `translateX(-${drawerWidth}px)`,
							lg: "translateX(0)",
						},
						transition: "transform 0.22s ease",
					}}
				>
					{drawerContent}
				</Box>
			</Box>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					minWidth: 0,
					marginLeft: { lg: `${drawerWidth}px` },
				}}
			>
				<Box
					component="header"
					sx={{
						position: "sticky",
						top: 0,
						zIndex: theme.zIndex.appBar,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: spacing.md,
						px: { xs: spacing.md, md: spacing.lg },
						py: spacing.sm,
						backgroundColor: colors.surfaceContainerLowest,
						borderBottom: elevation.level1.border,
					}}
				>
					<Stack direction="row" spacing={spacing.sm} sx={{ alignItems: "center" }}>
						{!isDesktop && (
							<IconButton
								onClick={handleDrawerToggle}
								aria-label="open navigation"
								sx={{ color: colors.onSurface }}
							>
								<MenuIcon size={20} />
							</IconButton>
						)}
						<Box>
							<Typography
								sx={{
									fontFamily: typography.h1.fontFamily,
									fontSize: typography.h1.fontSize,
									fontWeight: typography.h1.fontWeight,
									lineHeight: typography.h1.lineHeight,
									color: colors.onSurface,
								}}
							>
								{currentPageTitle}
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
								Quiet, structured workspace for KPI operations
							</Typography>
						</Box>
					</Stack>

					<Stack direction="row" spacing={spacing.xs} sx={{ alignItems: "center" }}>
						<Box sx={{ position: "relative" }}>
							<Tooltip title="Notifications">
								<IconButton
									size="small"
									sx={{
										color: colors.onSurfaceVariant,
										"&:hover": { backgroundColor: colors.surfaceContainerLow },
									}}
								>
									<Bell size={18} />
								</IconButton>
							</Tooltip>
							<Box
								sx={{
									position: "absolute",
									top: 7,
									right: 7,
									width: 8,
									height: 8,
									borderRadius: "50%",
									backgroundColor: colors.error,
									border: `2px solid ${colors.surfaceContainerLowest}`,
								}}
							/>
						</Box>
						<Tooltip title="Help">
							<IconButton
								size="small"
								sx={{
									color: colors.onSurfaceVariant,
									"&:hover": { backgroundColor: colors.surfaceContainerLow },
								}}
							>
								<CircleHelp size={18} />
							</IconButton>
						</Tooltip>
						<Tooltip title="Account">
							<IconButton
								size="small"
								onClick={handleMenuOpen}
								sx={{
									color: colors.onSurfaceVariant,
									"&:hover": { backgroundColor: colors.surfaceContainerLow },
								}}
							>
								<User size={18} />
							</IconButton>
						</Tooltip>
					</Stack>
				</Box>

				<Box
					sx={{
						maxWidth: "1152px",
						mx: 0,
						px: { xs: spacing.md, md: spacing.lg },
						py: spacing.lg,
					}}
				>
					<Stack spacing={spacing.lg}>
						<Paper
							elevation={0}
							sx={{
								p: spacing.md,
								borderRadius: radius.xl,
								border: elevation.level1.border,
								backgroundColor: colors.surfaceContainerLowest,
								boxShadow: "none",
							}}
						>
							<Stack
								direction={{ xs: "column", md: "row" }}
								spacing={spacing.md}
								sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
							>
								<Box>
									<Typography
										sx={{
											fontFamily: typography.labelCaps.fontFamily,
											fontSize: typography.labelCaps.fontSize,
											fontWeight: typography.labelCaps.fontWeight,
											lineHeight: typography.labelCaps.lineHeight,
											textTransform: "uppercase",
											letterSpacing: "0.08em",
											color: colors.outline,
											mb: "2px",
										}}
									>
										Workspace status
									</Typography>
									<Typography
										sx={{
											fontFamily: typography.bodyBase.fontFamily,
											fontSize: typography.bodyBase.fontSize,
											fontWeight: 600,
											lineHeight: typography.bodyBase.lineHeight,
											color: colors.onSurface,
										}}
									>
										You are signed in as {userEmail}
									</Typography>
								</Box>
								<Chip
									icon={<Shield size={14} />}
									label="Security monitoring enabled"
									sx={{
										alignSelf: "flex-start",
										height: 32,
										borderRadius: radius.chip,
										backgroundColor: semantic.success.container,
										color: semantic.success.onContainer,
										fontWeight: 700,
									}}
								/>
							</Stack>
						</Paper>

						<Outlet />

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
								Last sync secured via internal access token
							</Typography>
							<Stack direction="row" spacing={spacing.md} sx={{ flexWrap: "wrap" }}>
								<Box
									sx={{
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
										color: colors.outline,
									}}
								>
									<Typography
										sx={{
											fontFamily: typography.bodySm.fontFamily,
											fontSize: typography.bodySm.fontSize,
											lineHeight: typography.bodySm.lineHeight,
										}}
									>
										Privacy Policy
									</Typography>
									<ChevronRight size={14} />
								</Box>
								<Box
									sx={{
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
										color: colors.outline,
									}}
								>
									<Typography
										sx={{
											fontFamily: typography.bodySm.fontFamily,
											fontSize: typography.bodySm.fontSize,
											lineHeight: typography.bodySm.lineHeight,
										}}
									>
										Terms of Use
									</Typography>
									<ChevronRight size={14} />
								</Box>
							</Stack>
						</Stack>
					</Stack>
				</Box>
			</Box>

			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={handleMenuClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				slotProps={{
					paper: {
						sx: {
							mt: spacing.xs,
							borderRadius: radius.lg,
							border: elevation.level1.border,
							boxShadow: elevation.level2.boxShadow,
						},
					},
				}}
			>
				<MenuItem onClick={handleMenuClose} sx={{ gap: spacing.sm }}>
					<User size={16} />
					Profile
				</MenuItem>
				<MenuItem onClick={() => navigate("/settings")} sx={{ gap: spacing.sm }}>
					<Settings size={16} />
					Settings
				</MenuItem>
				<Divider />
				<MenuItem
					onClick={() => {
						handleMenuClose();
						logout();
					}}
					sx={{ gap: spacing.sm, color: colors.error }}
				>
					<LogOut size={16} />
					Logout
				</MenuItem>
			</Menu>
		</Box>
	);
};

export default ProjectLayout;
