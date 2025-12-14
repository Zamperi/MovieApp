import { z } from "zod";

/* =========================
   Shared error response
========================= */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/* =========================
   Legacy CRUD (kept)
========================= */
export const MovieCreateSchema = z.object({
  title: z.string().min(1),
  overview: z.string().optional().nullable(),
});
export type MovieCreateDTO = z.infer<typeof MovieCreateSchema>;

/* =========================
   Movie-fetch (spec-aligned)
========================= */

/** 1) Input boundary: /api/movies/:tmdbId */
export const MovieIdParamSchema = z.object({
  tmdbId: z.coerce.number().int().positive(),
});
export type MovieIdParam = z.infer<typeof MovieIdParamSchema>;

/** 2) External boundary: TMDB /movie/{id} payload (raw) */
export const TmdbMovieRawSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(), // "YYYY-MM-DD"
  runtime: z.number().int().nullable().optional(),
  genres: z.array(z.object({ id: z.number().int(), name: z.string() })).optional(),
});
export type TmdbMovieRaw = z.infer<typeof TmdbMovieRawSchema>;

/** 3) Response contract: what your API returns */
export const MovieResponseDTOSchema = z.object({
  tmdbId: z.number().int(),
  title: z.string(),
  overview: z.string().nullable(),
  posterUrl: z.string().nullable(),
  backdropUrl: z.string().nullable(),
  releaseDate: z.string().nullable(), // format: date (OpenAPI)
  runtimeMinutes: z.number().int().nullable(),
  genres: z.array(z.string()),
});
export type MovieResponseDTO = z.infer<typeof MovieResponseDTOSchema>;
