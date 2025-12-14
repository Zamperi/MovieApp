import { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { getMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import MovieCardSkeleton from '../components/MovieCardSkeleton';

type MovieListType = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

export default function Home() {
    const [results, setResults] = useState<any[]>([]);
    const [listType] = useState<MovieListType>('popular');
    const [loading, setLoading] = useState<boolean>(true);

    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const skeletonCount = 8;

    // Datahaku
    useEffect(() => {
        let cancelled = false;

        setLoading(true);

        async function loadResults() {
            try {
                const data = await getMovies(listType);
                if (!cancelled) {
                    setResults(data);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadResults();

        return () => {
            cancelled = true;
        };
    }, [listType]);

    // Tekstianimaatiot
    const textParent = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 1,
            },
        },
    };

    const textItem = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    // Korttirivin animaatiot
    const rowVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.05,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <>
            {/* Hero / Welcome -osio */}
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
                    <motion.div variants={textParent} initial="hidden" animate="visible">
                        <motion.div variants={textItem}>
                            <Typography variant="h3" gutterBottom>
                                Welcome!
                            </Typography>
                        </motion.div>
                        <motion.div variants={textItem}>
                            <Typography variant="h5">
                                Search millions of movies, people and groups
                            </Typography>
                        </motion.div>
                    </motion.div>
                </Container>
            </Box>

            {/* Trending -osio */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    py: '2.5rem',
                    borderRadius: { xs: 0, md: '0.75rem' },
                    boxShadow: { xs: 'none', md: 3 },
                    mb: '3rem',
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h4" mb={2}>
                        Trending
                    </Typography>

                    {/* Scrollattava rivi */}
                    <Box
                        sx={{
                            overflowX: 'auto',
                            whiteSpace: 'nowrap',
                            '&::-webkit-scrollbar': {
                                height: '0.5rem',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#b5b5b5',
                                borderRadius: '0.25rem',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                backgroundColor: '#9e9e9e',
                            },
                        }}
                    >
                        {loading ? (
                            // 1) Latausvaihe: pelkät skeletonit, nopeasti näkyviin
                            Array.from({ length: skeletonCount }).map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'inline-block',
                                        width: { xs: '60vw', sm: '13rem', md: '11.25rem' }, // ~180px md:llä
                                        mr: index === skeletonCount - 1 ? 0 : '0.75rem',
                                    }}
                                >
                                    <MovieCardSkeleton />
                                </Box>

                            ))
                        ) : (
                            // 2) Data valmis: siisti stagger-animaatio oikeille korteille
                            <motion.div
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                style={{ display: 'inline-block' }}
                            >
                                {results.map((movie, index) => (
                                    <motion.div
                                        key={movie.id}
                                        variants={cardVariants}
                                        style={{
                                            display: 'inline-block',
                                            width: '180px',
                                            marginRight:
                                                index === results.length - 1 ? 0 : 12,
                                        }}
                                    >
                                        <MovieCard
                                            tmdbId={movie.id}
                                            title={movie.title}
                                            posterUrl={
                                                movie.poster_path
                                                    ? `${imageBaseUrl}${movie.poster_path}`
                                                    : '/placeholder.jpg'
                                            }
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </Box>
                </Container>
            </Box>
        </>
    );
}
