import { prisma } from "../lib/prisma";
import { fetchTmdbMovieRawById } from "../lib/tmdbMovie";
import { movieRepo } from "../repositories/movie.repo";
import type { MovieCreateDTO, MovieResponseDTO, TmdbMovieRaw } from "../schemas/movie.schema";

type AppError = {
    status: number;
    error: string;
    message: string;
    details?: unknown;
};

function appError(status: number, error: string, message: string, details?: unknown): AppError {
    return { status, error, message, details };
}

const TTL_MS = 24 * 60 * 60 * 1000;
const TMDB_POSTER_BASE =
    process.env.TMDB_POSTER_BASE ?? "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE =
    process.env.TMDB_BACKDROP_BASE ?? "https://image.tmdb.org/t/p/w1280";

function isFresh(updatedAt: Date): boolean {
    return Date.now() - updatedAt.getTime() <= TTL_MS;
}

function toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    // YYYY-MM-DD
    return d.toISOString().slice(0, 10);
}

function normalizeFromTmdb(raw: TmdbMovieRaw) {
    const posterUrl = raw.poster_path ? `${TMDB_POSTER_BASE}${raw.poster_path}` : null;
    const backdropUrl = raw.backdrop_path ? `${TMDB_BACKDROP_BASE}${raw.backdrop_path}` : null;

    const releaseDate = raw.release_date ? new Date(raw.release_date) : null;
    const runtimeMinutes = raw.runtime ?? null;
    const genres = raw.genres?.map((g) => g.name) ?? [];
    const overview = raw.overview ?? null;

    return {
        title: raw.title,
        overview,
        posterUrl,
        backdropUrl,
        releaseDate,
        runtimeMinutes,
        genres,
    };
}

function toResponseDTO(row: any): MovieResponseDTO {
    return {
        tmdbId: row.tmdbId,
        title: row.title,
        overview: row.overview ?? null,
        posterUrl: row.posterUrl ?? null,
        backdropUrl: row.backdropUrl ?? null,
        releaseDate: toIsoDate(row.releaseDate ?? null),
        runtimeMinutes: row.runtimeMinutes ?? null,
        genres: Array.isArray(row.genres) ? row.genres : [],
    };
}

export const movieService = {
    /**
     * SPEC: GET /api/movies/:tmdbId
     * Cache hit fresh -> return
     * Else -> fetch TMDB, validate, upsert cache, return
     */
    getOrFetchByTmdbId: async (tmdbId: number): Promise<MovieResponseDTO> => {
        // 1) cache lookup
        let cached: any;
        try {
            cached = await movieRepo.findByTmdbId(tmdbId);
        } catch (err: any) {
            throw appError(500, "DB_ERROR", "Database operation failed", { cause: String(err?.message ?? err) });
        }

        if (cached && cached.updatedAt && isFresh(cached.updatedAt)) {
            return toResponseDTO(cached);
        }

        // 2) fetch from TMDB (throws AppError for 404/502 cases)
        const raw = await fetchTmdbMovieRawById(tmdbId);

        // 3) normalize + upsert
        const normalized = normalizeFromTmdb(raw);

        try {
            const row = await prisma.$transaction(async () => {
                return movieRepo.upsertByTmdbId(tmdbId, normalized);
            });
            return toResponseDTO(row);
        } catch (err: any) {
            throw appError(500, "DB_ERROR", "Database operation failed", { cause: String(err?.message ?? err) });
        }
    },

    /* =========================
       Legacy CRUD (kept)
    ========================= */
    list: () => movieRepo.list(),

    getById: (id: number) => movieRepo.findById(id),

    create: (dto: MovieCreateDTO) =>
        prisma.$transaction(async () => {
            // minimal legacy create; maps to current DB shape
            return movieRepo.create({
                tmdbId: Math.floor(Math.random() * 1_000_000_000), // placeholder legacy behavior
                title: dto.title,
                overview: dto.overview ?? null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: null,
                runtimeMinutes: null,
                genres: [],
            });
        }),

    update: (id: number, data: Partial<MovieResponseDTO>) =>
        prisma.$transaction(async () => {
            // legacy update maps response fields -> DB fields
            return movieRepo.update(id, {
                title: data.title,
                overview: data.overview,
                posterUrl: data.posterUrl,
                backdropUrl: data.backdropUrl,
                releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
                runtimeMinutes: data.runtimeMinutes,
                genres: data.genres,
            });
        }),

    remove: (id: number) =>
        prisma.$transaction(async () => {
            const exists = await movieRepo.findById(id);
            if (!exists) return false;
            await movieRepo.remove(id);
            return true;
        }),
};
