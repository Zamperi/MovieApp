import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CardMedia, Container, Typography, Rating } from '@mui/material';
import { getMovie } from '../services/tmdbService';
import type { MovieType } from '../services/tmdbService';

export default function MoviePage() {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<MovieType | null>(null);
    const backdropImageBaseUrl = 'https://image.tmdb.org/t/p/w1280';
    const posterUrl = `https://image.tmdb.org/t/p/w500${movie?.poster_path}`;

    useEffect(() => {
        if (!id) return;

        const tmdbId = Number(id);
        if (isNaN(tmdbId)) return;

        const fetchMovie = async () => {
            const data = await getMovie(tmdbId);
            setMovie(data ?? null);
        };

        fetchMovie();
    }, [id]);

    if (!movie) {
        return <div>Loading...</div>;
    }

    const backgroundPath = movie.backdrop_path ?? null;

    return (
        <Box
            component="section"
            sx={{
                position: 'relative',
                width: '100%',
                minHeight: '40rem',
                backgroundImage: backgroundPath
                    ? `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.3), rgba(0,0,0,0.85)),
     url(${backdropImageBaseUrl}${backgroundPath})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                color: 'common.white',
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Container
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                    }}>
                    <CardMedia
                        component="img"
                        image={posterUrl}
                        sx={{
                            width: { xs: '70%', sm: 220, md: 260 },
                            mt: { xs: 2, md: 1 },          // 2 * 8px ja 1 * 8px (theme.spacing)
                            borderRadius: 2,               // vastaa ~16px oletusteemalla
                            boxShadow: 4,
                            height: 'auto',
                            objectFit: 'cover',
                            flexShrink: 0,
                        }}
                    >
                    </CardMedia>
                    <Container
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: '16px',
                            padding: { xs: '1rem', md: '1.5rem' },
                            marginLeft: { xs: 0, md: '0.5rem' },
                            marginTop: { xs: '1rem', md: 0 },
                            width: { xs: '100%', md: 'auto' }
                        }}
                    >
                        <Typography variant="h3" gutterBottom>
                            {movie.title}
                        </Typography>
                        <Typography variant='subtitle1' gutterBottom>
                            {[
                                movie.release_date,
                                movie.genres?.join(', '),
                                movie.runtime ? `${movie.runtime} min` : null
                            ].filter(Boolean).join(' ● ')}
                        </Typography>
                        <Rating
                            value={5}
                            precision={0.1}
                            max={5}
                            name='simple-controlled'
                            size='medium'
                        ></Rating>
                        <Typography variant='h6'
                            sx={{ fontWeight: 'bold', marginTop: '1rem' }}>Overview</Typography>
                        <Typography variant='body1'>
                            {movie.overview}
                        </Typography>
                        <Typography sx={{ marginTop: '1rem' }} variant='h6'>Director</Typography>
                        <Typography variant='body1'>Ossi Ohjaaja</Typography>

                    </Container>
                </Container>
            </Container>
        </Box >
    );
}
