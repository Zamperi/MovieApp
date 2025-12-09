import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle,
  Language,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useColorMode } from '../context/ThemeProvider';

const navItems = [
  { label: 'Home', to: '/home' },
  { label: 'Movies', to: '/movies' },
  { label: 'People', to: '/people' },
  { label: 'Groups', to: '/groups' },
  { label: 'Reviews', to: '/reviews' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSignInClick = () => {
    navigate('/signin', { state: { from: location.pathname } });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleNavClick = (to: string) => {
    navigate(to);
    handleMenuClose();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      color="default"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Vasen puoli: logo / nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Voit lisätä logon tähän myöhemmin */}
            {isDesktop ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                <IconButton edge="start" onClick={handleMenuOpen}>
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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

          {/* Oikea puoli: kieli, teema, profiili */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton>
              <Language />
            </IconButton>
            <IconButton edge="end" onClick={toggleColorMode} color="inherit">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <IconButton onClick={handleSignInClick} color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
