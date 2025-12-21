// src/lib/tmdbMovie.ts
import { TmdbMovieRawSchema, type TmdbMovieRaw } from "../schemas/movie.schema";

type AppError = {
  status: number;
  error: string;
  message: string;
  details?: unknown;
};

function appError(status: number, error: string, message: string, details?: unknown): AppError {
  return { status, error, message, details };
}

const TMDB_BASE_URL = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";

function buildAuthHeaders(): Record<string, string> {
  // Tue joko Bearer-token tai API key. Testeissä fetch stubataan, joten näillä ei ole väliä.
  const bearer = process.env.TMDB_BEARER_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (bearer) headers.authorization = `Bearer ${bearer}`;
  // Jos käytät API keytä query-paramina, voit jättää tämän pois.
  if (!bearer && apiKey) headers.authorization = `Bearer ${apiKey}`;

  return headers;
}

export async function fetchTmdbMovieRawById(tmdbId: number): Promise<TmdbMovieRaw> {
  const url = `${TMDB_BASE_URL}/movie/${tmdbId}`;

  let res: Response;
  try {
    res = await fetch(url, { headers: buildAuthHeaders() });
  } catch (err: any) {
    throw appError(502, "UPSTREAM_NETWORK_ERROR", "TMDB request failed", {
      cause: String(err?.message ?? err),
    });
  }

  if (res.status === 404) {
    throw appError(404, "MOVIE_NOT_FOUND", "Movie not found", {
      tmdbId,
      upstreamStatus: 404,
    });
  }

  if (!res.ok) {
    throw appError(502, "UPSTREAM_HTTP_ERROR", "TMDB responded with an error", {
      tmdbId,
      upstreamStatus: res.status,
    });
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch (err: any) {
    throw appError(502, "UPSTREAM_BAD_JSON", "TMDB returned invalid JSON", {
      tmdbId,
      upstreamStatus: res.status,
      cause: String(err?.message ?? err),
    });
  }

  const parsed = TmdbMovieRawSchema.safeParse(data);
  if (!parsed.success) {
    throw appError(502, "UPSTREAM_SCHEMA_MISMATCH", "TMDB response did not match expected schema", {
      tmdbId,
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}
