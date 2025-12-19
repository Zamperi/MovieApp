import { prisma } from "../lib/prisma";
import { tmdb } from "../lib/tmdb";
import {
  MovieListResponseDTOSchema,
  TmdbMovieListRawSchema,
  type MovieListType,
  type MovieListResponseDTO,
} from "../schemas/movielists.schema";

const TTL_MS = 24 * 60 * 60 * 1000; // 24h
const TMDB_IMAGE_BASE =
  process.env.TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p/w500";

function isFresh(updatedAt: Date): boolean {
  return Date.now() - updatedAt.getTime() <= TTL_MS;
}

type ServiceError = {
  status: number;
  error: string;
  message: string;
  details?: unknown;
};

function serviceError(
  status: number,
  error: string,
  message: string,
  details?: unknown
): ServiceError {
  return { status, error, message, details };
}

function toUrlOrNull(path: unknown): string | null {
  if (typeof path !== "string" || path.length === 0) return null;
  return `${TMDB_IMAGE_BASE}${path}`;
}

function normalize(listType: MovieListType, raw: unknown): MovieListResponseDTO {
  const parsed = TmdbMovieListRawSchema.safeParse(raw);
  if (!parsed.success) {
    throw serviceError(
      502,
      "UPSTREAM_SCHEMA_MISMATCH",
      "TMDB response did not match expected schema",
      parsed.error.flatten()
    );
  }

  const r = parsed.data;

  const dto: MovieListResponseDTO = {
    listType,
    page: r.page,
    totalPages: r.total_pages,
    totalResults: r.total_results,
    results: r.results.map((it) => ({
      tmdbId: it.id,
      title: it.title,
      overview: it.overview ?? null,
      posterUrl: toUrlOrNull(it.poster_path),
      backdropUrl: toUrlOrNull(it.backdrop_path),
      releaseDate: it.release_date ?? null,
      genreIds: it.genre_ids,
      popularity: it.popularity ?? null,
      voteAverage: it.vote_average ?? null,
      voteCount: it.vote_count ?? null,
    })),
  };

  return MovieListResponseDTOSchema.parse(dto);
}

export const movieListsService = {
  async getList(input: { listType: MovieListType; page: number }) {
    const { listType, page } = input;

    // 1) Try cache
    let cached: { payloadJson: unknown; updatedAt: Date } | null = null;

    try {
      cached = await prisma.movieListCache.findUnique({
        where: { listType_page: { listType, page } },
        select: { payloadJson: true, updatedAt: true },
      });
    } catch (e) {
      throw serviceError(500, "DB_ERROR", "Database operation failed", String(e));
    }

    if (cached && isFresh(cached.updatedAt)) {
      const parsed = MovieListResponseDTOSchema.safeParse(cached.payloadJson);
      if (parsed.success) return parsed.data;
      // invalid cache payload => treat as stale and refresh
    }

    // 2) Fetch from TMDB
    let raw: unknown;
    try {
      raw = await tmdb(`/movie/${listType}`, {
        language: process.env.TMDB_LANG,
        page,
      });
    } catch (e) {
      throw serviceError(
        502,
        "UPSTREAM_TMDB_ERROR",
        "Failed to fetch list from TMDB",
        String(e)
      );
    }

    const dto = normalize(listType, raw);

    // 3) Upsert cache
    try {
      await prisma.movieListCache.upsert({
        where: { listType_page: { listType, page } },
        create: { listType, page, payloadJson: dto as any },
        update: { payloadJson: dto as any },
      });
    } catch (e) {
      throw serviceError(500, "DB_ERROR", "Database operation failed", String(e));
    }

    return dto;
  },
};
