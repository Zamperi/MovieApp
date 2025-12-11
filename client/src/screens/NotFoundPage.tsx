import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                py: { xs: "1.25rem", md: "2.5rem" },
                mb: { xs: "0.75rem", md: "1.5rem" },
                mt: { xs: "0.5rem", md: "1.5rem" },
                borderRadius: { xs: 0, md: "0.75rem" },
                boxShadow: { xs: "none", md: 3 },
                overflowX: "hidden",
            }}
            gap={'1.5rem'}
        >
            <Typography variant='h3'>
                404 - This is not the page you are looking for
            </Typography>
            <Button variant='contained' component={Link} to="/home">
                Go to home page
            </Button>
        </Box>
    );
}