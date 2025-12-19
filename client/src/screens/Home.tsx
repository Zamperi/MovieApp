import { useEffect, useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import {
  getMovieListPage,
  type MovieListItemDTO,
  type MovieListType,
} from "../services/tmdbService";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";

export default function Home() {
  const [results, setResults] = useState<MovieListItemDTO[]>([]);
  const [listType] = useState<MovieListType>("popular");
  const [loading, setLoading] = useState<boolean>(true);

  const skeletonCount = 8;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setResults([]);

      // Home shows only page 1 by design
      const dto = await getMovieListPage(listType, 1);
      if (cancelled) return;

      setResults(dto?.results ?? []);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [listType]);

  const textParent = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 1 } },
    }),
    []
  );

  const textItem = useMemo(
    () => ({
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }),
    []
  );

  const rowVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.05 },
      },
    }),
    []
  );

  const cardVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0 },
    }),
    []
  );

  return (
    <>
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

      <Box
        sx={{
          bgcolor: "background.paper",
          py: "2.5rem",
          borderRadius: { xs: 0, md: "0.75rem" },
          boxShadow: { xs: "none", md: 3 },
          mb: "3rem",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" mb={2}>
            Trending
          </Typography>

          <Box
            sx={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              "&::-webkit-scrollbar": { height: "0.5rem" },
              "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#b5b5b5",
                borderRadius: "0.25rem",
              },
              "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#9e9e9e" },
            }}
          >
            {loading ? (
              Array.from({ length: skeletonCount }).map((_, index) => (
                <Box
                  key={`skel-${index}`}
                  sx={{
                    display: "inline-block",
                    width: { xs: "60vw", sm: "13rem", md: "11.25rem" },
                    mr: index === skeletonCount - 1 ? 0 : "0.75rem",
                  }}
                >
                  <MovieCardSkeleton />
                </Box>
              ))
            ) : (
              <motion.div
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                style={{ display: "inline-block" }}
              >
                {results.map((movie, index) => (
                  <motion.div
                    // key must be stable AND unique within this row
                    key={`${listType}-${movie.tmdbId}`}
                    variants={cardVariants}
                    style={{
                      display: "inline-block",
                      width: "180px",
                      marginRight: index === results.length - 1 ? 0 : 12,
                    }}
                  >
                    <MovieCard
                      tmdbId={movie.tmdbId}
                      title={movie.title}
                      posterUrl={movie.posterUrl ?? "/placeholder.jpg"}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
}
