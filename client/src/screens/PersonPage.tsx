import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CardMedia, Container, Typography, Stack, Chip, Link as MuiLink } from "@mui/material";
import { getPerson } from "../services/tmdbService";
import type { PersonDetails } from "../services/tmdbService";

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetails | null>(null);

  const backdropImageBaseUrl = "https://image.tmdb.org/t/p/w1280";
  const profileImageBaseUrl = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    if (!id) return;

    const personId = Number(id);
    if (isNaN(personId)) return;

    const fetchPerson = async () => {
      const data = await getPerson(personId);
      setPerson(data ?? null);
    };

    fetchPerson();
  }, [id]);

  if (!person) {
    return <div>Loading...</div>;
  }

  const backgroundPath = person.profileUrl ?? null;
  const profileUrl = person.profileUrl
    ? `${profileImageBaseUrl}${person.profileUrl}`
    : "/placeholder-person.jpg";

  const lifeSpan =
    person.birthday && person.deathday
      ? `${person.birthday} – ${person.deathday}`
      : person.birthday
      ? `Born ${person.birthday}`
      : undefined;

  const subtitleParts = [
    person.knownForDepartment,
    lifeSpan,
    person.placeOfBirth,
  ].filter(Boolean);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "40rem",
        backgroundImage: backgroundPath
          ? `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.3), rgba(0,0,0,0.85)),
             url(${backdropImageBaseUrl}${backgroundPath})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        color: "common.white",
        bgcolor: backgroundPath ? "transparent" : "grey.900",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <CardMedia
            component="img"
            image={profileUrl}
            sx={{
              width: { xs: "70%", sm: 220, md: 260 },
              mt: { xs: 2, md: 1 },
              borderRadius: 2,
              boxShadow: 4,
              height: "auto",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: "16px",
              padding: { xs: "1rem", md: "1.5rem" },
              marginLeft: { xs: 0, md: "0.5rem" },
              marginTop: { xs: "1rem", md: 0 },
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Typography variant="h3" gutterBottom>
              {person.name}
            </Typography>

            {subtitleParts.length > 0 && (
              <Typography variant="subtitle1" gutterBottom>
                {subtitleParts.join(" ● ")}
              </Typography>
            )}

            {person.alsoKnownAs && person.alsoKnownAs.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ mt: 1, mb: 1, gap: 0.5 }}
              >
                {person.alsoKnownAs.map((alias) => (
                  <Chip
                    key={alias}
                    label={alias}
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
                  />
                ))}
              </Stack>
            )}

            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginTop: "1rem" }}
            >
              Biography
            </Typography>
            <Typography variant="body1">
              {person.biography && person.biography.trim().length > 0
                ? person.biography
                : "No biography available for this person."}
            </Typography>

            {(person.homepage || person.imdbId) && (
              <Box sx={{ mt: "1.5rem" }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Links
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {person.homepage && (
                    <MuiLink
                      href={person.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      color="primary.light"
                    >
                      Official homepage
                    </MuiLink>
                  )}
                  {person.imdbId && (
                    <MuiLink
                      href={`https://www.imdb.com/name/${person.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      color="primary.light"
                    >
                      IMDb profile
                    </MuiLink>
                  )}
                </Stack>
              </Box>
            )}
          </Container>
        </Container>
      </Container>
    </Box>
  );
}
