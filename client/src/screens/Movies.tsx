// Movies.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Typography, Collapse } from "@mui/material";
import { motion } from "framer-motion";
import FilterCard from "../components/FilterCard";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import {
  getMovieListPage,
  type MovieListItemDTO,
  type MovieListType,
} from "../services/tmdbService";

interface MovieFilters {
  hasPoster?: boolean;
  genres?: number[];
}

const SKELETON_COUNT = 20;

function mergeUniqueByTmdbId(
  prev: MovieListItemDTO[],
  next: MovieListItemDTO[]
): MovieListItemDTO[] {
  const map = new Map<number, MovieListItemDTO>();
  for (const m of prev) map.set(m.tmdbId, m);
  for (const m of next) map.set(m.tmdbId, m);
  return Array.from(map.values());
}

export default function Movies() {
  const [results, setResults] = useState<MovieListItemDTO[]>([]);
  const [listType, setListType] = useState<MovieListType>("popular");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<MovieFilters>({});

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadedPagesRef = useRef<Set<number>>(new Set());
  const inFlightRef = useRef<boolean>(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const hasMore = page < totalPages;

  useEffect(() => {
    setFiltersOpen(true);
  }, []);

  // Reset + load page 1 when listType changes
  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      setLoading(true);
      setLoadingMore(false);
      setResults([]);

      setPage(1);
      setTotalPages(1);

      loadedPagesRef.current = new Set();
      inFlightRef.current = false;

      const dto = await getMovieListPage(listType, 1);
      if (cancelled) return;

      if (!dto) {
        setLoading(false);
        return;
      }

      loadedPagesRef.current.add(dto.page);
      setResults(dto.results);
      setPage(dto.page);
      setTotalPages(dto.totalPages);
      setLoading(false);
    }

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [listType]);

  async function loadNextPage() {
    if (!hasMore) return;
    if (loading) return;
    if (inFlightRef.current) return;

    const nextPage = page + 1;
    if (loadedPagesRef.current.has(nextPage)) return;

    inFlightRef.current = true;
    setLoadingMore(true);

    const dto = await getMovieListPage(listType, nextPage);

    if (dto?.results?.length) {
      loadedPagesRef.current.add(dto.page);
      setResults((prev) => mergeUniqueByTmdbId(prev, dto.results));
      setPage(dto.page);
      setTotalPages(dto.totalPages);
    }

    setLoadingMore(false);
    inFlightRef.current = false;
  }

  // Infinite scroll: observe sentinel at bottom of results
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        void loadNextPage();
      },
      {
        root: null,
        rootMargin: "600px",
        threshold: 0.01,
      }
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [page, totalPages, listType, loading]);

  const visibleMovies = useMemo(() => {
    let items = [...results];

    if (filters.hasPoster) {
      items = items.filter((m) => Boolean(m.posterUrl));
    }

    if (filters.genres?.length) {
      const selectedGenreIds = filters.genres as number[];
      items = items.filter(
        (m) =>
          Array.isArray(m.genreIds) &&
          m.genreIds.some((id: number) => selectedGenreIds.includes(id))
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
          {/* Filters */}
          <Box sx={{ flexShrink: 0, width: { xs: "100%", md: "17rem" } }}>
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

          {/* Results */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: (theme) =>
                  ({
                    xs: theme.spacing(2),
                    sm: theme.spacing(2.5),
                    md: theme.spacing(3),
                  }) as any,
              }}
            >
              {Array.from({
                length: Math.max(
                  visibleMovies.length || 0,
                  loading ? SKELETON_COUNT : 0,
                  loadingMore ? visibleMovies.length + 8 : visibleMovies.length
                ),
              }).map((_, index) => {
                const movie = visibleMovies[index];
                const isLoaded = !!movie;

                return (
                  <Box
                    key={isLoaded ? movie.tmdbId : `skeleton-${index}`}
                    sx={{ width: "100%", maxWidth: "100%" }}
                  >
                    <motion.div
                      style={{ width: "100%" }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.02,
                      }}
                    >
                      {isLoaded ? (
                        <MovieCard
                          tmdbId={movie.tmdbId}
                          posterUrl={movie.posterUrl ?? "/placeholder.jpg"}
                          title={movie.title}
                        />
                      ) : (
                        <MovieCardSkeleton />
                      )}
                    </motion.div>
                  </Box>
                );
              })}
            </Box>

            {/* Sentinel */}
            <Box ref={sentinelRef} sx={{ height: "1px" }} />

            {!loading && !hasMore && results.length > 0 && (
              <Typography variant="body2" sx={{ mt: "1rem", opacity: 0.7 }}>
                End of results.
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
