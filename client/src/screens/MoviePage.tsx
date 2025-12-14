import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CardMedia, Container, Typography, Rating } from "@mui/material";
import { getMovie } from "../services/tmdbService";
import type { MovieType } from "../services/tmdbService";

function parsePositiveInt(value: string | undefined): number | null {
    if (!value) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
    return n;
}

function posterFallbackSvg(title: string) {
    return (
        "data:image/svg+xml;utf8," +
        encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900">
        <rect width="100%" height="100%" fill="#1f1f1f"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              fill="#bdbdbd" font-family="Arial" font-size="28">
          ${title ? title.replace(/&/g, "and") : "No poster"}
        </text>
      </svg>
    `)
    );
}

export default function MoviePage() {
    const { id } = useParams<{ id: string }>();

    const tmdbId = useMemo(() => parsePositiveInt(id), [id]);

    const [movie, setMovie] = useState<MovieType | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "notfound" | "error">("idle");

    useEffect(() => {
        if (!tmdbId) {
            setMovie(null);
            setStatus("error");
            return;
        }

        let cancelled = false;

        (async () => {
            setStatus("loading");
            try {
                const data = await getMovie(tmdbId);

                if (cancelled) return;

                if (!data) {
                    // getMovie palauttaa null sekä notfoundissa että muissa virheissä.
                    // Tässä pidetään käytös yksinkertaisena: null => notfound.
                    setMovie(null);
                    setStatus("notfound");
                    return;
                }

                setMovie(data);
                setStatus("ready");
            } catch {
                if (cancelled) return;
                setMovie(null);
                setStatus("error");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [tmdbId]);

    if (!tmdbId) {
        return <div>Invalid id</div>;
    }

    if (status === "loading" || status === "idle") {
        return <div>Loading...</div>;
    }

    if (status === "notfound") {
        return <div>Movie not found</div>;
    }

    if (status === "error") {
        return <div>Something went wrong</div>;
    }

    if (!movie) {
        return <div>Loading...</div>;
    }

    const posterSrc = movie.posterUrl ?? posterFallbackSvg(movie.title);
    const backgroundStyle = movie.backdropUrl
        ? `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.3), rgba(0,0,0,0.85)),
       url(${movie.backdropUrl})`
        : "none";

    const metaLine = [
        movie.releaseDate ?? null,
        movie.genres?.length ? movie.genres.join(", ") : null,
        movie.runtimeMinutes != null ? `${movie.runtimeMinutes} min` : null,
    ]
        .filter(Boolean)
        .join(" ● ");

    return (
        <Box
            component="section"
            sx={{
                position: "relative",
                width: "100%",
                minHeight: "40rem",
                backgroundImage: backgroundStyle,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                alignItems: "center",
                color: "common.white",
            }}
        >
            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: { xs: "1rem", md: "0.75rem" },
                        alignItems: { xs: "stretch", md: "center" },
                    }}
                >
                    <CardMedia
                        component="img"
                        image={posterSrc}
                        alt={movie.title}
                        sx={{
                            width: { xs: "70%", sm: "14rem", md: "16rem" },
                            mt: { xs: "1rem", md: "0.5rem" },
                            borderRadius: "1rem",
                            boxShadow: 4,
                            height: "auto",
                            objectFit: "cover",
                            flexShrink: 0,
                            alignSelf: { xs: "center", md: "flex-start" },
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            borderRadius: "1rem",
                            padding: { xs: "1rem", md: "1.5rem" },
                            width: "100%",
                        }}
                    >
                        <Typography variant="h3" gutterBottom>
                            {movie.title}
                        </Typography>

                        {metaLine ? (
                            <Typography variant="subtitle1" gutterBottom>
                                {metaLine}
                            </Typography>
                        ) : null}

                        <Rating value={5} precision={0.1} max={5} name="rating" size="medium" readOnly />

                        <Typography variant="h6" sx={{ fontWeight: "bold", marginTop: "1rem" }}>
                            Overview
                        </Typography>

                        <Typography variant="body1">
                            {movie.overview ?? "No overview available."}
                        </Typography>

                        <Typography sx={{ marginTop: "1rem" }} variant="h6">
                            Director
                        </Typography>
                        <Typography variant="body1">Ossi Ohjaaja</Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
