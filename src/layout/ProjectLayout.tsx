import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
    AppBar,
    Avatar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { BarChart3, Bell, FileText, FolderKanban, Home, LogOut, Menu as MenuIcon, Settings, Stamp, User, Users } from "lucide-react";
import { me } from "@/api/auth.api";
import type { MeResponse } from "@/interfaces/auth.types";
import { useAuthStore } from "@/stores/auth.store";

const MENU_ITEMS = [
    {
        id: 'users',
        label: 'Users',
        icon: Users,
        path: '/users',
    },
    {
        id: 'roles',
        label: 'Roles',
        icon: Stamp,
        path: '/roles',
    },
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        path: '/dashboard',
    },
    {
        id: 'tasks',
        label: 'Tasks',
        icon: FolderKanban,
        path: '/tasks',
    },
    {
        id: 'reports',
        label: 'Reports',
        icon: BarChart3,
        path: '/reports',
    },
    {
        id: 'kpis',
        label: 'KPIs',
        icon: FileText,
        path: '/kpis',
    },
    {
        id: 'teams',
        label: 'Teams',
        icon: Users,
        path: '/teams',
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        path: '/notifications',
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/settings',
    },
] as const;

const drawerWidth = 260;

const ProjectLayout = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
    const { logout, auth } = useAuthStore();
    const [userInfo, setUserInfo] = useState<MeResponse["user"] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const userName = useMemo(() => {
        if (isLoading) return "Loading...";
        return userInfo?.fullName || "User";
    }, [isLoading, userInfo?.fullName]);

    const userEmail = useMemo(() => {
        if (isLoading) return "...";
        return userInfo?.email || "user@example.com";
    }, [isLoading, userInfo?.email]);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth) return;
            try {
                setIsLoading(true);
                const response = await me();
                if (response?.user) {
                    setUserInfo(response.user);
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [auth]);

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
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 2 }}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontWeight: 700,
                        fontSize: 14,
                    }}
                >
                    PM
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Project Management
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Internal System
                    </Typography>
                </Box>
            </Box>

            <Divider />

            <Box sx={{ flex: 1, overflow: "auto" }}>
                <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ px: 2, pt: 2, pb: 1, display: "block" }}
                >
                    Navigation
                </Typography>
                <List sx={{ px: 1 }}>
                    {MENU_ITEMS.map((item) => (
                        <ListItemButton
                            key={item.id}
                            component={NavLink}
                            to={item.path}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                "&.active": {
                                    bgcolor: "action.selected",
                                    "& .MuiListItemIcon-root": { color: "primary.main" },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <item.icon size={18} />
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Box>

            <Divider />

            <Box sx={{ px: 2, py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: "grey.200", color: "grey.700" }}>
                        <User size={18} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {userEmail}
                        </Typography>
                    </Box>
                    <Tooltip title="Account">
                        <IconButton size="small" onClick={handleMenuOpen}>
                            <Settings size={18} />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    v1.0.0
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    zIndex: theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ gap: 2 }}>
                    {!isDesktop && (
                        <IconButton edge="start" onClick={handleDrawerToggle} aria-label="open drawer">
                            <MenuIcon size={20} />
                        </IconButton>
                    )}
                    <Typography variant="h6" fontWeight={600}>
                        Project Hub
                    </Typography>
                    <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                        <Tooltip title="Notifications">
                            <IconButton size="small">
                                <Bell size={18} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": { width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8 }}>
                <Outlet />
            </Box>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <MenuItem onClick={handleMenuClose}>
                    <User size={16} style={{ marginRight: 8 }} />
                    Profile
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <Settings size={16} style={{ marginRight: 8 }} />
                    Settings
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        logout();
                    }}
                    sx={{ color: "error.main" }}
                >
                    <LogOut size={16} style={{ marginRight: 8 }} />
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ProjectLayout;
