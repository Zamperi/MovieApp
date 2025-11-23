import { useEffect, useState } from 'react';
import { Box, Container, Typography, Fade } from '@mui/material';
import { motion } from 'framer-motion';
import { getMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import MovieCardSkeleton from '../components/MovieCardSkeleton';

type MovieListType = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

export default function Home() {
    const [results, setResults] = useState<any[]>([]);
    const [listType] = useState<MovieListType>('popular');
    const [loading, setLoading] = useState<boolean>(true);
    const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

    useEffect(() => {
        if (!loading) setLoading(true);
        let cancelled = false;

        async function loadResults() {
            const data = await getMovies(listType);
            if (!cancelled) {
                setResults(data);
            }
        }
        loadResults();
        setLoading(false);
        return () => {
            cancelled = true;
        };
    }, [listType]);

    //Animations
    const textParent = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 1,
            }
        }
    };

    const textItem = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

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
                    <Box sx={{
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        '&::-webkit-scrollbar': {
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#b5b5b5',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#9e9e9e',
                        },
                    }}> {
                        loading ?

                        Array.from({ length: 8 }).map((_, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 1 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.10 }}
                                style={{ display: 'inline-block', marginRight: '0.75rem' }}
                            >
                                {<MovieCardSkeleton />}
                            </motion.div>
                        )) :

                        results.map((movie, index) => (
                            <Fade
                                key={movie.id}
                                in={true}
                                timeout={500}
                                style={{
                                    transitionDelay: `${index * 100}ms`
                                }}>
                                <Box sx={{ display: 'inline-block', mr: 2, width: '180px' }}>
                                    <MovieCard
                                        id={movie.id}
                                        title={movie.title}
                                        posterUrl={
                                            movie.poster_path
                                                ? `${imageBaseUrl}${movie.poster_path}`
                                                : '/placeholder.jpg'
                                        }
                                    />
                                </Box>
                            </Fade>
                        ))

                        }
                    </Box>
                </Container>
            </Box>
        </>
    );
};
