import { prisma } from "../lib/prisma";
import { tmdb } from "../lib/tmdb";

import {
  PersonIdParamSchema,
  TmdbPersonRawSchema,
  PersonResponseDTOSchema,
  TmdbTrendingPeopleRawSchema,
  TrendingPersonDTOSchema,
  TrendingPeopleResponseDTOSchema,
} from "../schemas/people.schema";

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
const TMDB_IMAGE_BASE = process.env.TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p/w500";

function isFresh(updatedAt: Date): boolean {
  return Date.now() - updatedAt.getTime() <= TTL_MS;
}

function toIsoDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function dateFromYyyyMmDd(s: string | null | undefined): Date | null {
  if (!s) return null;
  // expects "YYYY-MM-DD"
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function profileUrlFromPath(profilePath: string | null | undefined): string | null {
  if (!profilePath) return null;
  return `${TMDB_IMAGE_BASE}${profilePath}`;
}

function normalizePersonToDto(row: {
  tmdbId: number;
  name: string;
  biography: string | null;
  profileUrl: string | null;
  knownForDepartment: string | null;
  birthday: Date | null;
  deathday: Date | null;
  placeOfBirth: string | null;
}) {
  const dto = {
    tmdbPersonId: row.tmdbId,
    name: row.name,
    biography: row.biography,
    profileUrl: row.profileUrl,
    knownForDepartment: row.knownForDepartment,
    birthday: toIsoDate(row.birthday),
    deathday: toIsoDate(row.deathday),
    placeOfBirth: row.placeOfBirth,
  };
  return PersonResponseDTOSchema.parse(dto);
}

export const people = {
  /** GET /api/people/{tmdbPersonId} */
  async getPersonByTmdbId(tmdbPersonIdRaw: unknown) {
    // 1) Input boundary validate
    const { tmdbPersonId } = PersonIdParamSchema.parse({ tmdbPersonId: tmdbPersonIdRaw });

    // 2) Cache lookup
    try {
      const cached = await prisma.peopleCache.findUnique({
        where: { tmdbId: tmdbPersonId },
      });

      if (cached && isFresh(cached.updatedAt)) {
        return normalizePersonToDto({
          tmdbId: cached.tmdbId,
          name: cached.name,
          biography: cached.biography ?? null,
          profileUrl: cached.profileUrl ?? null,
          knownForDepartment: cached.knownForDepartment ?? null,
          birthday: cached.birthday ?? null,
          deathday: cached.deathday ?? null,
          placeOfBirth: cached.placeOfBirth ?? null,
        });
      }
    } catch (err) {
      throw appError(500, "DB_ERROR", "Database error", err);
    }

    // 3) Cache miss/stale -> TMDB fetch + validate raw
    let raw: unknown;
    try {
      raw = await tmdb(`/person/${tmdbPersonId}`, {
        language: process.env.TMDB_LANG,
      });
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (msg.includes("TMDB 404")) {
        throw appError(404, "PERSON_NOT_FOUND", "Person not found");
      }
      throw appError(502, "UPSTREAM_TMDB_ERROR", "TMDB upstream error", { message: msg });
    }

    let tmdbPerson;
    try {
      tmdbPerson = TmdbPersonRawSchema.parse(raw);
    } catch (err) {
      throw appError(502, "UPSTREAM_SCHEMA_MISMATCH", "TMDB response schema mismatch", err);
    }

    // 4) Normalize + UPSERT cache
    const toUpsert = {
      tmdbId: tmdbPerson.id,
      name: tmdbPerson.name,
      biography: tmdbPerson.biography ?? null,
      profileUrl: profileUrlFromPath(tmdbPerson.profile_path ?? null),
      knownForDepartment: tmdbPerson.known_for_department ?? null,
      birthday: dateFromYyyyMmDd(tmdbPerson.birthday ?? null),
      deathday: dateFromYyyyMmDd(tmdbPerson.deathday ?? null),
      placeOfBirth: tmdbPerson.place_of_birth ?? null,
    };

    try {
      const row = await prisma.peopleCache.upsert({
        where: { tmdbId: tmdbPersonId },
        create: toUpsert,
        update: toUpsert,
      });

      return normalizePersonToDto({
        tmdbId: row.tmdbId,
        name: row.name,
        biography: row.biography ?? null,
        profileUrl: row.profileUrl ?? null,
        knownForDepartment: row.knownForDepartment ?? null,
        birthday: row.birthday ?? null,
        deathday: row.deathday ?? null,
        placeOfBirth: row.placeOfBirth ?? null,
      });
    } catch (err) {
      throw appError(500, "DB_ERROR", "Database error", err);
    }
  },

  /** GET /api/people/trending (day) */
  async getTrendingPeopleDay() {
    // 1) Cache lookup (key='day')
    try {
      const cached = await prisma.trendingPeopleCache.findUnique({
        where: { key: "day" },
      });

      if (cached && isFresh(cached.updatedAt)) {
        const dto = {
          page: cached.page,
          results: cached.results as unknown,
          totalPages: cached.totalPages,
          totalResults: cached.totalResults,
        };
        // Validate cached payload shape (defensive)
        return TrendingPeopleResponseDTOSchema.parse(dto);
      }
    } catch (err) {
      throw appError(500, "DB_ERROR", "Database error", err);
    }

    // 2) Cache miss/stale -> TMDB fetch + validate raw
    let raw: unknown;
    try {
      raw = await tmdb("/trending/person/day", {
        language: process.env.TMDB_LANG,
      });
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      throw appError(502, "UPSTREAM_TMDB_ERROR", "TMDB upstream error", { message: msg });
    }

    let tmdbTrending;
    try {
      tmdbTrending = TmdbTrendingPeopleRawSchema.parse(raw);
    } catch (err) {
      throw appError(502, "UPSTREAM_SCHEMA_MISMATCH", "TMDB response schema mismatch", err);
    }

    // 3) Normalize list -> TrendingPersonDTO[]
    const normalizedResults = tmdbTrending.results.map((p) =>
      TrendingPersonDTOSchema.parse({
        tmdbPersonId: p.id,
        name: p.name,
        profileUrl: profileUrlFromPath(p.profile_path ?? null),
        knownForDepartment: p.known_for_department ?? null,
        popularity: p.popularity ?? null,
      }),
    );

    // 4) UPSERT cache row
    try {
      const row = await prisma.trendingPeopleCache.upsert({
        where: { key: "day" },
        create: {
          key: "day",
          page: tmdbTrending.page,
          totalPages: tmdbTrending.total_pages,
          totalResults: tmdbTrending.total_results,
          results: normalizedResults as any,
        },
        update: {
          page: tmdbTrending.page,
          totalPages: tmdbTrending.total_pages,
          totalResults: tmdbTrending.total_results,
          results: normalizedResults as any,
        },
      });

      const dto = {
        page: row.page,
        results: row.results as unknown,
        totalPages: row.totalPages,
        totalResults: row.totalResults,
      };

      return TrendingPeopleResponseDTOSchema.parse(dto);
    } catch (err) {
      throw appError(500, "DB_ERROR", "Database error", err);
    }
  },
};
