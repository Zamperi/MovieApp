import { useEffect, useState, useMemo } from "react";
import { Box, Container, Typography, Collapse } from "@mui/material";
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

const SKELETON_COUNT = 20;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function Movies() {
  const [results, setResults] = useState<MovieResult[]>([]);
  const [listType, setListType] = useState<MovieListType>("popular");
  const [loading, setLoading] = useState<boolean>(true);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<MovieFilters>({});

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
          m.genre_ids.some((id: number) => selectedGenreIds.includes(id))
      );
    }

    return items;
  }, [results, filters]);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        py: { xs: "1.25rem", md: "2.5rem" },
        mb: { xs: "0.75rem", md: "1.5rem" },
        mt: { xs: "0.5rem", md: "1.5rem" },
        borderRadius: { xs: 0, md: "0.75rem" },
        boxShadow: { xs: "none", md: 3 },
        overflowX: "hidden",
      }}
    >
      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          px: { xs: 1.5, sm: 2, md: 3 },
          boxSizing: "border-box",
        }}
      >
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
          {/* Filters-paneeli */}
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: "17rem" },
            }}
          >
            <Collapse in={filtersOpen} orientation="vertical" timeout={500}>
              <FilterCard
                page="movies"
                sortValue={listType}
                filterValues={filters}
                onSortChange={(value) => setListType(value as MovieListType)}
                onFiltersChange={setFilters}
              />
            </Collapse>
          </Box>

          {/* Tulokset – EI enää MUI Grid, vaan puhdas CSS Grid */}
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))", // 2 korttia / rivi mobiilissa
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: (theme) => ({
                  xs: theme.spacing(2),
                  sm: theme.spacing(2.5),
                  md: theme.spacing(3),
                }) as any,
              }}
            >
              {Array.from({
                length: Math.max(visibleMovies.length || 0, SKELETON_COUNT),
              }).map((_, index) => {
                const movie = visibleMovies[index];
                const isLoaded = !loading && !!movie;

                return (
                  <Box
                    key={isLoaded ? movie!.id : `skeleton-${index}`}
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                    }}
                  >
                    <motion.div
                      style={{ width: "100%" }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                    >
                      {isLoaded ? (
                        <MovieCard
                          id={movie!.id}
                          posterUrl={
                            movie!.poster_path
                              ? `${IMAGE_BASE_URL}${movie!.poster_path}`
                              : "/placeholder.jpg"
                          }
                          title={movie!.title}
                        />
                      ) : (
                        <MovieCardSkeleton />
                      )}
                    </motion.div>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
