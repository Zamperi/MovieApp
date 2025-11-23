import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useColorMode } from '../context/ThemeProvider';
import { IconButton, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon, AccountCircle } from '@mui/icons-material';

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { mode, toggleColorMode } = useColorMode();
    const theme = useTheme();

    function handleClick() {
        navigate('/signin', {
            state: { from: location.pathname },
        });
    }

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
            <Container maxWidth="lg">   {/* ← tämä rajoittaa leveyden */}
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

                    <Box sx={{ display: 'flex', gap: '1rem' }}>
                        <Button component={NavLink} to="/home" color="inherit">Home</Button>
                        <Button component={NavLink} to="/movies" color="inherit">Movies</Button>
                        <Button component={NavLink} to="/people" color="inherit">People</Button>
                        <Button component={NavLink} to="/groups" color="inherit">Groups</Button>
                        <Button component={NavLink} to="/reviews" color='inherit'>Reviews</Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                        <IconButton edge="end" onClick={toggleColorMode} color="inherit">
                            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                        </IconButton>

                        <IconButton onClick={handleClick} color="inherit">
                            <AccountCircle />
                        </IconButton>
                    </Box>

                </Toolbar>
            </Container>
        </AppBar>
    );
}