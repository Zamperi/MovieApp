// src/schemas/people.schema.ts
import { z } from "zod";

/* =========================
   People-fetch (spec-aligned)
========================= */

/** 1) Input boundary: /api/people/{tmdbPersonId} */
export const PersonIdParamSchema = z.object({
  tmdbPersonId: z.coerce.number().int().positive(),
});
export type PersonIdParam = z.infer<typeof PersonIdParamSchema>;

/** 2) External boundary: TMDB /person/{id} payload (raw) */
export const TmdbPersonRawSchema = z.object({
  id: z.number().int(),
  name: z.string(),

  biography: z.string().nullable().optional(),
  profile_path: z.string().nullable().optional(),
  known_for_department: z.string().nullable().optional(),

  birthday: z.string().nullable().optional(), // "YYYY-MM-DD"
  deathday: z.string().nullable().optional(), // "YYYY-MM-DD"
  place_of_birth: z.string().nullable().optional(),
});
export type TmdbPersonRaw = z.infer<typeof TmdbPersonRawSchema>;

/** 2b) Internal normalized DB row shape (optional but useful) */
export const PeopleCacheRowSchema = z.object({
  tmdb_id: z.number().int().positive(),
  name: z.string(),

  biography: z.string().nullable(),
  profile_url: z.string().nullable(),
  known_for_department: z.string().nullable(),

  birthday: z.string().nullable(), // store as ISO date string when mapping to DTO layers
  deathday: z.string().nullable(),
  place_of_birth: z.string().nullable(),

  updated_at: z.string(), // ISO timestamp
});
export type PeopleCacheRow = z.infer<typeof PeopleCacheRowSchema>;

/** 3) Response contract: what your API returns */
export const PersonResponseDTOSchema = z.object({
  tmdbPersonId: z.number().int().positive(),
  name: z.string(),

  biography: z.string().nullable(),
  profileUrl: z.string().nullable(),
  knownForDepartment: z.string().nullable(),

  birthday: z.string().nullable(), // format: date (OpenAPI)
  deathday: z.string().nullable(), // format: date (OpenAPI)
  placeOfBirth: z.string().nullable(),
});
export type PersonResponseDTO = z.infer<typeof PersonResponseDTOSchema>;

/* =========================
   People-trending (spec-aligned)
========================= */

/** 2) External boundary: TMDB /trending/person/day payload (raw) */
export const TmdbTrendingPersonItemRawSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  profile_path: z.string().nullable().optional(),
  known_for_department: z.string().nullable().optional(),
  popularity: z.number().nullable().optional(),
});
export type TmdbTrendingPersonItemRaw = z.infer<typeof TmdbTrendingPersonItemRawSchema>;

export const TmdbTrendingPeopleRawSchema = z.object({
  page: z.number().int(),
  results: z.array(TmdbTrendingPersonItemRawSchema),
  total_pages: z.number().int(),
  total_results: z.number().int(),
});
export type TmdbTrendingPeopleRaw = z.infer<typeof TmdbTrendingPeopleRawSchema>;

/** 2b) Normalized DTO item */
export const TrendingPersonDTOSchema = z.object({
  tmdbPersonId: z.number().int().positive(),
  name: z.string(),
  profileUrl: z.string().nullable(),
  knownForDepartment: z.string().nullable(),
  popularity: z.number().nullable(),
});
export type TrendingPersonDTO = z.infer<typeof TrendingPersonDTOSchema>;

/** 3) Response contract */
export const TrendingPeopleResponseDTOSchema = z.object({
  page: z.number().int().min(1),
  results: z.array(TrendingPersonDTOSchema),
  totalPages: z.number().int().min(1),
  totalResults: z.number().int().min(0),
});
export type TrendingPeopleResponseDTO = z.infer<typeof TrendingPeopleResponseDTOSchema>;

/** 2c) Internal DB cache row (optional) */
export const TrendingPeopleCacheRowSchema = z.object({
  key: z.string(), // "day"
  page: z.number().int(),
  total_pages: z.number().int(),
  total_results: z.number().int(),
  results: z.array(TrendingPersonDTOSchema), // normalized list stored as jsonb
  updated_at: z.string(), // ISO timestamp
});
export type TrendingPeopleCacheRow = z.infer<typeof TrendingPeopleCacheRowSchema>;
