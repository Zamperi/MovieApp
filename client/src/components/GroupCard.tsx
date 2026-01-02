import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Box,
    Chip,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";

type Props = {
    id: number;
    name: string;
    createdAt?: string | null;
};

export default function GroupCard({ id, name, createdAt }: Props) {
    const navigate = useNavigate();

    const createdLabel = useMemo(() => {
        if (!createdAt) return null;
        const d = new Date(createdAt);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleDateString();
    }, [createdAt]);

    function handleClick() {
        navigate(`/group/${id}`);
    }

    return (
        <Card
            component="div"
            sx={{
                width: "100%",
                borderRadius: "1.2rem",
                boxShadow: 4,
                overflow: "hidden",
                backgroundColor: "background.paper",
                cursor: "pointer",
                transition: "transform 150ms ease, box-shadow 150ms ease",
                "&:hover": {
                    transform: "translateY(-0.25rem)",
                    boxShadow: 8,
                },
            }}
        >
            <CardActionArea
                component="div"
                onClick={handleClick}
                sx={{ width: "100%" }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        px: "1rem",
                        pt: "1rem",
                    }}
                >
                    <Box
                        sx={{
                            width: "2.75rem",
                            height: "2.75rem",
                            borderRadius: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "rgba(0,0,0,0.06)",
                        }}
                    >
                        <GroupsIcon />
                    </Box>

                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                            variant="subtitle1"
                            noWrap
                            sx={{
                                fontWeight: 700,
                                fontSize: "1rem",
                                lineHeight: 1.2,
                            }}
                        >
                            {name}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ opacity: 0.7, mt: "0.15rem", fontSize: "0.85rem" }}
                            noWrap
                        >
                            {createdLabel ? `Created ${createdLabel}` : "Open group"}
                        </Typography>
                    </Box>

                    <Chip
                        label="View"
                        size="small"
                        sx={{
                            borderRadius: "9999px",
                            fontWeight: 600,
                            height: "1.8rem",
                            px: "0.25rem",
                        }}
                    />
                </Box>

                <CardContent sx={{ padding: "0.9rem 1rem 1rem" }}>
                    <Typography
                        variant="body2"
                        sx={{
                            opacity: 0.8,
                            fontSize: "0.9rem",
                            lineHeight: 1.4,
                        }}
                    >
                        Browse details, members and join requests.
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
