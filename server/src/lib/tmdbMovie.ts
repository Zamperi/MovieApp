import { tmdb } from "./tmdb";
import { TmdbMovieRaw, TmdbMovieRawSchema } from "../schemas/movie.schema";

type AppError = {
  status: number;
  error: string;
  message: string;
  details?: unknown;
};

function appError(status: number, error: string, message: string, details?: unknown): AppError {
  return { status, error, message, details };
}

function extractStatus(err: any): number | undefined {
  return err?.status ?? err?.response?.status ?? err?.cause?.status;
}

/**
 * Fetches TMDB movie payload and validates it against TmdbMovieRawSchema.
 * Throws AppError with:
 * - 404 MOVIE_NOT_FOUND
 * - 502 UPSTREAM_TMDB_ERROR
 * - 502 UPSTREAM_SCHEMA_MISMATCH
 */
export async function fetchTmdbMovieRawById(tmdbId: number): Promise<TmdbMovieRaw> {
  let data: unknown;

  try {
    data = (await tmdb(`/movie/${tmdbId}`, { language: "en-US" })) as unknown;
  } catch (err: any) {
    const status = extractStatus(err);
    if (status === 404) {
      throw appError(404, "MOVIE_NOT_FOUND", "Movie not found");
    }
    throw appError(502, "UPSTREAM_TMDB_ERROR", "Failed to fetch movie from TMDB", {
      status,
      cause: String(err?.message ?? err),
    });
  }

  const parsed = TmdbMovieRawSchema.safeParse(data);
  if (!parsed.success) {
    throw appError(502, "UPSTREAM_SCHEMA_MISMATCH", "TMDB response did not match expected schema", {
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}
