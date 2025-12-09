import { useNavigate } from 'react-router-dom';
import { Card, Box, Rating, IconButton } from '@mui/material';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { BookmarkAdd } from '@mui/icons-material';

type Props = {
    id: number;
    title: string;
    posterUrl: string;
};

export default function MovieCard({ id, title, posterUrl }: Props) {
    const navigate = useNavigate();

    function handleClick() {
        navigate(`/movie/${id}`);
    }

    return (
        <Card
            component='div'
            onClick={handleClick}
            sx={{
                width: '100%',              // Täyttää Grid-itemin
                borderRadius: '1.2rem',
                boxShadow: 4,
                overflow: 'hidden',
                backgroundColor: 'background.paper',
                cursor: 'pointer',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                '&:hover': {
                    transform: 'translateY(-0.25rem)',
                    boxShadow: 8,
                },
            }}
        >
            <CardActionArea component='div' sx={{ width: '100%' }}>
                {/*Kuvakontti + overlay*/}
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '2/3',
                    }}
                >
                    <CardMedia
                        component="img"
                        image={posterUrl}
                        alt={title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    {/*Overlays */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '0.5rem',
                            left: '0.5rem',
                            bgcolor: 'rgba(0,0,0,0.6)',
                            borderRadius: '0.5rem',
                            p: '0.2rem 0.35rem'
                        }}>
                        <Rating
                            value={5}
                            precision={0.1}
                            max={5}
                            name='simple-controlled'
                            size='small'
                        ></Rating>
                    </Box>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            borderRadius: '9999px',
                            bgcolor: 'rgba(0,0,0,0.55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                p: '0.15rem',
                                color: 'common.white',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.12)',
                                },
                            }}
                        ><BookmarkAdd/>
                        </IconButton>
                    </Box>
                </Box>
                <CardContent
                    sx={{
                        padding: '0.75rem 0.9rem 0.9rem',
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        noWrap
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            lineHeight: 1.3,
                        }}
                    >
                        {title}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
