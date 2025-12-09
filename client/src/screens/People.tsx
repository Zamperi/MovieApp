import { useEffect, useState, useMemo } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import PeopleCard from "../components/PeopleCard";
import { getTrendingPeople, type PersonResult } from "../services/tmdbService";

const SKELETON_COUNT = 20;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function People() {
  const [results, setResults] = useState<PersonResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const loadResults = async () => {
      setLoading(true);
      try {
        const data = await getTrendingPeople();
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
  }, []);

  const visiblePeople = useMemo(() => {
    return [...results];
  }, [results]);

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
          Trending people
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
          {/* Varsinainen grid-lista ihmisistä */}
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
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                  lg: "repeat(5, minmax(0, 1fr))",
                },
                gap: (theme) => ({
                  xs: theme.spacing(2),
                  sm: theme.spacing(2.5),
                  md: theme.spacing(3),
                }) as any,
              }}
            >
              {Array.from({
                length: Math.max(visiblePeople.length || 0, SKELETON_COUNT),
              }).map((_, index) => {
                const person = visiblePeople[index];
                const isLoaded = !loading && !!person;

                return (
                  <Box
                    key={isLoaded ? person!.id : `skeleton-${index}`}
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
                        delay: index * 0.04,
                      }}
                    >
                      {isLoaded ? (
                        <PeopleCard
                          id={person!.id}
                          name={person!.name}
                          profileUrl={
                            person!.profile_path
                              ? `${IMAGE_BASE_URL}${person!.profile_path}`
                              : "/placeholder.jpg"
                          }
                        />
                      ) : (
                        // Yksinkertainen skeleton ilman uutta komponenttia
                        <Box
                          sx={{
                            width: "100%",
                            aspectRatio: "2/3",
                            borderRadius: "1.2rem",
                            bgcolor: "grey.900",
                            opacity: 0.4,
                          }}
                        />
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
