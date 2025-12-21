import { Card, CardMedia, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
    id: number;
    name: string;
    profileUrl: string | null;
};

export default function PeopleCard({ id, name, profileUrl }: Props) {
    const navigate = useNavigate();

    function handleClick() {
        navigate(`/person/${id}`);
    }

    return (
        <Card
            component="article"
            onClick={handleClick}
            sx={{
                width: "100%",
                borderRadius: "1.2rem",
                boxShadow: 4,
                overflow: "hidden",
                bgcolor: "background.paper",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                transition: "transform 150ms ease, box-shadow 150ms ease",
                "&:hover": {
                    transform: "translateY(-0.25rem)",
                    boxShadow: 8,
                },
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "2 / 3",
                    overflow: "hidden",
                }}
            >
                <CardMedia
                    component="img"
                    image={
                        profileUrl
                            ? profileUrl
                            : "/placeholder-person.jpg"
                    }
                    alt={name}
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        objectFit: "cover",
                    }}
                />
            </Box>

            <Box
                sx={{
                    px: "0.75rem",
                    py: "0.5rem",
                }}
            >
                <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        lineHeight: 1.3,
                    }}
                >
                    {name}
                </Typography>
            </Box>
        </Card>
    );
}
