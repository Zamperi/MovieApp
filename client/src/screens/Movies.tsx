import { useEffect, useState, useMemo } from "react";
import { Box, Container, Typography, Collapse } from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import FilterCard from "../components/FilterCard";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import { getMovies, type MovieResult } from "../services/tmdbService";

type MovieListType = "popular" | "top_rated" | "now_playing" | "upcoming";

interface MovieFilters {
    hasPoster?: boolean;
    genres?: number[];
}

export default function Movies() {
    const [results, setResults] = useState<MovieResult[]>([]);
    const [listType, setListType] = useState<MovieListType>("popular");
    const [loading, setLoading] = useState<boolean>(true);
    const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
    const [filters, setFilters] = useState<MovieFilters>({});
    const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

    useEffect(() => {
        setFiltersOpen(true);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadResults = async () => {
            setLoading(true);
            try {
                const data = await getMovies(listType);
                if (!cancelled) {
                    setResults(data);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadResults();

        return () => {
            cancelled = true;
        };
    }, [listType]);

    const visibleMovies = useMemo(() => {
        let items = [...results];

        if (filters.hasPoster) {
            items = items.filter((m) => Boolean(m.poster_path));
        }

        if (filters.genres?.length) {
            const selectedGenreIds = filters.genres as number[];

            items = items.filter(
                (m) =>
                    Array.isArray(m.genre_ids) &&
                    m.genre_ids.some((id: number) =>
                        selectedGenreIds.includes(id)
                    )
            );
        }

        return items;
    }, [results, filters]);

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                py: { xs: "1rem", md: "2rem" },
                mb: { xs: "0.5rem", sm: "1rem", md: "1.5rem" },
                mt: { xs: "0.5rem", sm: "1rem", md: "1.5rem" },
                borderRadius: { xs: 0, md: "0.75rem" },
                boxShadow: { xs: "none", md: 3 },
            }}
        >
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ mb: { xs: "1rem", md: "1.5rem" } }}
                >
                    {listType === "popular" && "Popular movies"}
                    {listType === "top_rated" && "Top rated movies"}
                    {listType === "now_playing" && "Now playing"}
                    {listType === "upcoming" && "Upcoming"}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "flex-start",
                        gap: { xs: "1.5rem", md: "2rem" },
                        width: "100%",
                    }}
                >
                    {/* Filters */}
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: { xs: "100%", md: "18rem" },
                        }}
                    >
                        <Collapse
                            in={filtersOpen}
                            orientation="vertical"
                            timeout={500}
                        >
                            <FilterCard
                                page="movies"
                                sortValue={listType}
                                filterValues={filters}
                                onSortChange={(value) =>
                                    setListType(value as MovieListType)
                                }
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
                            {loading
                                ? Array.from({ length: 20 }).map(
                                    (_, index) => (
                                        <Grid
                                            key={index}
                                            size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
                                        >
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: 4,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay:
                                                        index * 0.05,
                                                }}
                                            >
                                                <MovieCardSkeleton />
                                            </motion.div>
                                        </Grid>
                                    )
                                )
                                : visibleMovies.map((movie, index) => (
                                    <Grid
                                        key={movie.id}
                                        size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
                                    >
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 4,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                delay:
                                                    index * 0.10,
                                            }}
                                        >
                                            <MovieCard
                                                id={movie.id}
                                                posterUrl={
                                                    movie.poster_path
                                                        ? imageBaseUrl +
                                                        movie.poster_path
                                                        : "/placeholder.jpg"
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
