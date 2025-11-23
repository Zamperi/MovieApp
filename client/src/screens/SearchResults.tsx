import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Collapse, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import { searchMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import FilterCard from '../components/FilterCard';
import { filterConfigByPage } from '../components/filterConfig';

export default function SearchResults() {
    const [results, setResults] = useState<any[]>([]);
    const [sortValue, setSortValue] = useState<string>('');
    const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const location = useLocation();
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    const query = new URLSearchParams(location.search).get('q') || '';

    // Alusta oletusfiltterit konfiguraatiosta
    useEffect(() => {
        const fields = filterConfigByPage.search.filterFields;
        const map: Record<string, any> = {};

        for (const f of fields) {
            if (f.type === 'boolean') {
                map[f.key] = f.default ?? false;
            }
        }

        setFilters(map);
    }, []);

    // Avaa filtteri-kortti sisään tullessa
    useEffect(() => {
        setFiltersOpen(true);
    }, []);

    // Hae hakutulokset
    useEffect(() => {
        async function loadResults() {
            const data = await searchMovies(query);
            setResults(data);
        }
        loadResults();
    }, [query]);

    // Suodata ja järjestä näkyvät elokuvat
    const visibleMovies = useMemo(() => {
        let items = [...results];

        if (filters.hasPoster) {
            items = items.filter((m) => Boolean(m.poster_path));
        }

        switch (sortValue) {
            case 'popular':
                items.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'release_date':
                items.sort(
                    (a, b) =>
                        Date.parse(b.release_date) - Date.parse(a.release_date)
                );
                break;
            case 'relevance':
            default:
                break;
        }

        return items;
    }, [results, filters, sortValue]);

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                py: { xs: '1rem', md: '2rem' },
                mb: { xs: '0.5rem', sm: '1rem', md: '1.5rem' },
                mt: { xs: '0.5rem', sm: '1rem', md: '1.5rem' },
                borderRadius: { xs: 0, md: '0.75rem' },
                boxShadow: { xs: 'none', md: 3 },
            }}
        >
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ mb: { xs: '1rem', md: '1.5rem' } }}
                >
                    Search results: {query}
                </Typography>

                {results.length === 0 && (
                    <Typography sx={{ mb: '1.5rem' }}>
                        No results found
                    </Typography>
                )}

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'flex-start',
                        gap: { xs: '1.5rem', md: '2rem' },
                        width: '100%',
                    }}
                >
                    {/* Filters */}
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: { xs: '100%', md: '18rem' },
                        }}
                    >
                        <Collapse
                            in={filtersOpen}
                            orientation="vertical"
                            timeout={500}
                        >
                            <FilterCard
                                page="search"
                                sortValue={sortValue}
                                filterValues={filters}
                                onSortChange={(value) => setSortValue(value)}
                                onFiltersChange={setFilters}
                            />
                        </Collapse>
                    </Box>

                    {/* Results */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid
                            container
                            spacing={{ xs: 2, sm: 2.5, md: 3 }}
                        >
                            {visibleMovies.map((movie, index) => (
                                <Grid
                                    key={movie.id}
                                    size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: index * 0.1,
                                        }}
                                    >
                                        <MovieCard
                                            id={movie.id}
                                            posterUrl={
                                                movie.poster_path
                                                    ? imageBaseUrl +
                                                      movie.poster_path
                                                    : '/placeholder.jpg'
                                            }
                                            title={movie.title}
                                        />
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
