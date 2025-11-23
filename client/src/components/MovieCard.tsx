import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

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
            <CardActionArea sx={{ width: '100%' }}>
                <CardMedia
                    component="img"
                    image={posterUrl}
                    alt={title}
                    sx={{
                        width: '100%',
                        aspectRatio: '2 / 3',
                        objectFit: 'cover',
                    }}
                />
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
