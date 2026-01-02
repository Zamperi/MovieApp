import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle,
  Menu as MenuIcon,
  Login,
} from "@mui/icons-material";
import { useColorMode } from "../context/ThemeProvider";
import LoginDialog from "../features/auth/LoginDialog";
import SignupDialog from "../features/auth/SignupDialog";
import { useUser } from "../context/useUser";
import { useToast } from "../context/useToast";

export default function Header() {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { user, logout } = useUser();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation("common");

  const [navAnchorEl, setNavAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const navItems = [
    { label: t("navigation.home"), to: "/home" },
    { label: t("navigation.movies"), to: "/movies" },
    { label: t("navigation.people"), to: "/people" },
    { label: t("navigation.groups"), to: "/groups" },
    { label: t("navigation.reviews"), to: "/reviews" },
  ];

  //Language change
  const currentLang = i18n.language.startsWith("fi") ? "fi" : "en";
  const currentLangLabel = currentLang === "fi" ? "FI" : "EN";

  const toggleLanguage = () => {
    const next = currentLang === "fi" ? "en" : "fi";
    i18n.changeLanguage(next);
    // jos haluat muistaa valinnan:
    window.localStorage.setItem("app_language", next);
  };

  const handleSignInClick = () => setLoginOpen(true);
  const handleSwitchToSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };
  const handleSwitchToSignin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };

  const handleSignOutClick = async () => {
    await logout();
    showToast(t("auth.loggedOut"), "info");
  };

  // Navigation menu
  const handleNavMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNavAnchorEl(event.currentTarget);
  };
  const handleNavMenuClose = () => setNavAnchorEl(null);
  const handleNavClick = (to: string) => {
    navigate(to);
    handleNavMenuClose();
  };

  // User menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };
  const handleUserMenuClose = () => setUserAnchorEl(null);

  const handleUserMenuClick = (action: string) => {
    if (action === "MyAccount") {
      alert(user?.firstname);
    } else {
      handleSignOutClick();
    }
    handleUserMenuClose();
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        color="default"
        sx={{
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Vasen: logo + nav */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {isDesktop ? (
                <Box sx={{ display: "flex", gap: 2 }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.to}
                      component={NavLink}
                      to={item.to}
                      color="inherit"
                      sx={{ fontWeight: 500 }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Box>
              ) : (
                <>
                  <IconButton edge="start" onClick={handleNavMenuOpen}>
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    anchorEl={navAnchorEl}
                    open={Boolean(navAnchorEl)}
                    onClose={handleNavMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                  >
                    {navItems.map((item) => (
                      <MenuItem
                        key={item.to}
                        onClick={() => handleNavClick(item.to)}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Box>

            {/* Oikea: kieli, teema, profiili */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={toggleLanguage}
                sx={{ minWidth: "3rem", fontWeight: 600 }}
              >
                {currentLangLabel}
              </Button>
              <IconButton edge="end" onClick={toggleColorMode} color="inherit">
                {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>s

              {user ? (
                <>
                  <IconButton onClick={handleUserMenuOpen}>
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    anchorEl={userAnchorEl}
                    open={Boolean(userAnchorEl)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                  >
                    <MenuItem onClick={() => handleUserMenuClick("MyAccount")}>
                      {t("user.myAccount")}
                    </MenuItem>
                    <MenuItem onClick={() => handleUserMenuClick("LogOut")}>
                      {t("user.logout")}
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <IconButton onClick={handleSignInClick} color="inherit">
                  <Login />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupDialog
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={handleSwitchToSignin}
      />
    </>
  );
}
