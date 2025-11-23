import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, IconButton } from '@mui/material';
import { Search } from '@mui/icons-material';
import TextField from '@mui/material/TextField';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    function handleSearch() {
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setQuery('');
    }

    return (
        <Box>
            <Container maxWidth='lg' sx={{display: 'flex', my: {xs: '0.5rem',sm: '0.5rem', md: '0.75rem'}}}>
                <IconButton onClick={handleSearch}>{<Search/>}</IconButton>
                                <TextField
                    label="Search movies, actors..."
                    variant="outlined"
                    margin='none'
                    size='small'
                    fullWidth
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
            </Container>
        </Box>
    );
}

