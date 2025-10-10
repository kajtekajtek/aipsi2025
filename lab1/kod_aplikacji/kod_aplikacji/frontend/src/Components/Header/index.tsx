import * as React from "react";
import {useEffect, useState} from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import SettingsIcon from "@mui/icons-material/Settings";
import {useTranslation} from "react-i18next";
import {DarkModeToggle} from "../DarkModeToggle";
import {LanguageChooser} from "../LanguageChooser";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import {useLogout} from "../../Hooks/useLogout";
import {Badge, Divider, Icon, Link, Stack, useMediaQuery, useTheme,} from "@mui/material";
import {useAuth} from "../../Hooks/useAuth";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LoginIcon from "@mui/icons-material/Login";
import {AccountCircle, DoneAll, Logout, Person} from "@mui/icons-material";
import {Notification} from "../../Models/Notification";
import {useAxiosPrivate} from "../../Hooks/useAxiosPrivate";
import {Notification as NotificationComponent} from "../../Components/Notification";

const settings = [
    {
        name: "darkMode",
        component: <DarkModeToggle/>,
    },
    {
        name: "language",
        component: <LanguageChooser/>,
    },
];

export function Header() {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
        null
    );
    const [anchorElSettings, setAnchorElSettings] = React.useState<null | HTMLElement>(
        null
    );
    const [anchorElNotification, setAnchorElNotification] =
        React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] =
        React.useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [badgeCount, setBadgeCount] = useState<number>(0);
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {logout} = useLogout();
    const {auth} = useAuth();
    const theme = useTheme();
    const matchesMdUp = useMediaQuery(theme.breakpoints.up("sm"));
    const pages = [
        {
            condition:
                auth?.roles?.includes("USER") || auth?.roles?.includes("ADMIN"),
            name: "books",
            path: "/books",
        },
        {
            condition: auth?.roles?.includes("USER") && !auth?.roles?.includes("ADMIN"),
            name: "my_loans",
            path: "/my_loans",
        },
        {
            condition: auth?.roles?.includes("ADMIN"),
            name: "loans_history",
            path: "/admin/loanHistory",
        },
        {
            condition: auth?.roles?.includes("ADMIN"),
            name: "books_pending",
            path: "/admin/books/pending",
        },
        {
            condition: auth?.roles?.includes("ADMIN"),
            name: "loans_pending",
            path: "/admin/loans/pending",
        }
    ];

    const signOut = async () => {
        await logout();
        navigate("/login");
    };

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    const handleCloseSettingsMenu = () => {
        setAnchorElSettings(null);
    };

    const handleOpenSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElSettings(event.currentTarget);
    }

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNotification(event.currentTarget);
        setBadgeCount(0);
    };

    const handleCloseNotificationMenu = () => {
        setAnchorElNotification(null);
    };
    const axiosPrivate = useAxiosPrivate();

    const markNotificationAsRead = async (notification: Notification) => {
        try {
            const response = await axiosPrivate.put(
                `/notifications/${notification.id}/read`
            );
            if (response.status === 200) {
                setNotifications(notifications.filter((n) => n.id !== notification.id));
            }
        } catch (error) {
            console.error(error);
        }
    };
    const markAllNotificationsAsRead = async () => {
        try {
            const response = await axiosPrivate.put(
                `/notifications/user/${auth.id}/read`
            );
            if (response.status === 200) {
                setNotifications([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const fetchNotifications = async () => {
            if (auth.id) {
                try {
                    const response = await axiosPrivate.get(
                        `/notifications/user/${auth.id}`
                    );
                    isMounted && setNotifications(response.data);
                    isMounted && setBadgeCount(response.data.length);
                } catch (error) {
                    console.error(error);
                }
            }
        };
        fetchNotifications();

        return () => {
            isMounted = false;
        };
    }, [axiosPrivate, auth.id]);

    return (
        <AppBar
            position="fixed"
            sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}
        >
            <Toolbar>
                <Box sx={{flexGrow: 1, display: {xs: "flex", md: "none"}}}>
                    {auth.id && <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleOpenNavMenu}
                        color="inherit"
                    >
                        <MenuIcon/>
                    </IconButton>}
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{
                            display: {xs: "block", md: "none"},
                        }}
                    >
                        {pages.map((page) => (
                            page.condition &&
                            <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                                <Link
                                    color={"inherit"}
                                    underline={"none"}
                                    component={RouterLink}
                                    to={page.path}
                                >
                                    {t(`header.pages.${page.name}`)}
                                </Link>
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
                <Box sx={{flexGrow: 1, display: {xs: "none", md: "flex"}}}>
                    {pages.map(
                        (page) =>
                            page.condition && (
                                <Button
                                    disableRipple
                                    variant="text"
                                    disableElevation
                                    key={page.name}
                                    sx={{
                                        my: 2,
                                        color: "primary.contrastText",
                                        display: "block",
                                    }}
                                >
                                    <Typography sx={{textDecoration: "none"}}>
                                        <Link
                                            color={"inherit"}
                                            underline={"none"}
                                            component={RouterLink}
                                            to={page.path}
                                        >
                                            {t(`header.pages.${page.name}`)}
                                        </Link>
                                    </Typography>
                                </Button>
                            )
                    )}
                </Box>

                <Stack direction={"row"} gap={5} sx={{flexGrow: 0}}>
                    {!auth.accessToken && (
                        <>
                            {matchesMdUp ? (
                                <Button
                                    variant="text"
                                    sx={{color: "primary.contrastText"}}
                                    startIcon={<LoginIcon/>}
                                    component={RouterLink}
                                    to="/login"
                                >
                                    {t("header.logIn")}
                                </Button>
                            ) : (
                                <IconButton component={RouterLink} to="/login">
                                    <LoginIcon/>
                                </IconButton>
                            )}
                        </>
                    )}
                    {auth.accessToken && (
                        <IconButton
                            sx={{p: 0}}
                            onClick={handleOpenUserMenu}
                        >
                            <Person/>
                        </IconButton>
                    )}
                    <Menu
                        sx={{mt: "45px"}}
                        id="menu2"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                        onClick={handleCloseUserMenu}
                    >
                        <MenuItem disableRipple disableTouchRipple
                                  sx={{'&:hover': {backgroundColor: 'white'}, pointerEvents: "none"}}>
                            <AccountCircle sx={{marginRight: 1}}/>
                            <Typography textAlign="center" component={"div"}>
                                {auth.username}
                            </Typography>
                        </MenuItem>

                        {auth.accessToken && (
                            <MenuItem onClick={signOut} disableRipple disableTouchRipple>
                                <Logout sx={{marginRight: 1}}/> <Typography textAlign="center">
                                {t("header.logOut")}
                            </Typography>
                            </MenuItem>
                        )}
                    </Menu>
                    {auth.accessToken && !auth.roles?.includes("ADMIN") && (
                        <IconButton sx={{p: 0}} onClick={handleOpenNotificationMenu}>
                            <Badge
                                badgeContent={
                                    badgeCount
                                }
                                color="error"
                            >
                                <NotificationsIcon/>
                            </Badge>
                        </IconButton>
                    )}
                    <Menu
                        sx={{
                            mt: "45px", height: 400
                            , overflowY: "auto"
                        }}
                        id="notification-menu"
                        anchorEl={anchorElNotification}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        open={Boolean(anchorElNotification)}
                        onClose={handleCloseNotificationMenu}
                        slotProps={{
                            paper: {
                                style: {
                                    width: "300px",
                                },
                            },
                        }}
                    >
                        <Box
                            id={"notification-header"}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingX: "8px",
                            }}
                        >
                            <Typography
                                id={"notification-title"}
                                component={"div"}
                                variant="h6"
                            >
                                {t("header.notifications")}
                            </Typography>
                            {notifications.length > 0 && (
                                <Tooltip title={t("header.markAllAsRead")}>
                                    <Icon
                                        sx={{cursor: "pointer"}}
                                        onClick={markAllNotificationsAsRead}
                                    >
                                        <DoneAll/>
                                    </Icon>
                                </Tooltip>
                            )}
                        </Box>
                        <Divider/>
                        {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <NotificationComponent
                                    key={index}
                                    notification={notification}
                                    onIconClick={markNotificationAsRead}
                                />
                            ))
                        ) : (
                            <MenuItem
                                disableRipple
                                disableTouchRipple
                                sx={{display: "flex", alignItems: "center"}}
                            >
                                <div>{t("header.noNotifications")}</div>
                            </MenuItem>
                        )}
                    </Menu>
                    <Tooltip title={t("header.openSettings")}>
                        <IconButton onClick={handleOpenSettingsMenu} sx={{p: 0}}>
                            <SettingsIcon/>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{mt: "45px"}}
                        id="menu1"
                        anchorEl={anchorElSettings}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        open={Boolean(anchorElSettings)}
                        onClose={handleCloseSettingsMenu}
                        onClick={handleCloseSettingsMenu}
                    >
                        {settings.map((setting) => (
                            <MenuItem key={setting.name} disableRipple disableTouchRipple>
                                <Typography textAlign="center">
                                    {t(`header.settings.${setting.name}`)}
                                </Typography>
                                {setting.component}
                            </MenuItem>
                        ))}
                    </Menu>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
