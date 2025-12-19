import { z } from "zod";

export { ErrorResponseSchema, type ErrorResponse } from "./movie.schema";

/* =========================
   Input boundary: /api/movies/lists/:listType?page=n
========================= */

export const MovieListTypeSchema = z.enum([
  "popular",
  "top_rated",
  "now_playing",
  "upcoming",
]);
export type MovieListType = z.infer<typeof MovieListTypeSchema>;

export const MovieListPathParamSchema = z.object({
  listType: MovieListTypeSchema,
});
export type MovieListPathParam = z.infer<typeof MovieListPathParamSchema>;

export const MovieListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});
export type MovieListQuery = z.infer<typeof MovieListQuerySchema>;

/* =========================
   External boundary: TMDB /movie/{listType}?page=n payload (raw)
========================= */

export const TmdbMovieListItemRawSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(), // "YYYY-MM-DD"
  genre_ids: z.array(z.number().int()),
  popularity: z.number().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().int().optional(),
});
export type TmdbMovieListItemRaw = z.infer<typeof TmdbMovieListItemRawSchema>;

export const TmdbMovieListRawSchema = z.object({
  page: z.number().int(),
  results: z.array(TmdbMovieListItemRawSchema),
  total_pages: z.number().int(),
  total_results: z.number().int(),
});
export type TmdbMovieListRaw = z.infer<typeof TmdbMovieListRawSchema>;

/* =========================
   Response contract: what API returns
========================= */

export const MovieListItemDTOSchema = z.object({
  tmdbId: z.number().int(),
  title: z.string(),
  overview: z.string().nullable(),
  posterUrl: z.string().nullable(),
  backdropUrl: z.string().nullable(),
  releaseDate: z.string().nullable(),
  genreIds: z.array(z.number().int()),
  popularity: z.number().nullable().optional(),
  voteAverage: z.number().nullable().optional(),
  voteCount: z.number().int().nullable().optional(),
});
export type MovieListItemDTO = z.infer<typeof MovieListItemDTOSchema>;

export const MovieListResponseDTOSchema = z.object({
  listType: MovieListTypeSchema,
  page: z.number().int().min(1),
  results: z.array(MovieListItemDTOSchema),
  totalPages: z.number().int().min(1),
  totalResults: z.number().int().min(0),
});
export type MovieListResponseDTO = z.infer<typeof MovieListResponseDTOSchema>;
