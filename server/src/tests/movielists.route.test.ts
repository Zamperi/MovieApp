import request from "supertest";
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import app from "../index";
import { prisma } from "../lib/prisma";

/**
 * Spec sources:
 * docs/flows/movie-lists.data-flow.md
 * docs/flows/movie-lists.error-flow.md
 *
 * Endpoint:
 * GET /api/movies/lists/:listType?page=n
 */

const TMDB_IMAGE_BASE = process.env.TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p/w500";

describe("Movie lists routes (spec-aligned)", () => {
  beforeEach(async () => {
    // Keep DB clean between tests
    // NOTE: this assumes the MovieListCache model exists in Prisma
    await prisma.movieListCache.deleteMany();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 400 VALIDATION_ERROR for unsupported listType", async () => {
    const res = await request(app).get("/api/movies/lists/not-a-list?page=1");
    expect(res.status).toBe(400);
    expect(res.body?.error).toBe("VALIDATION_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });

  it("returns 400 VALIDATION_ERROR for invalid page", async () => {
    const res = await request(app).get("/api/movies/lists/popular?page=0");
    expect(res.status).toBe(400);
    expect(res.body?.error).toBe("VALIDATION_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });

  it("returns 200 from fresh cache (no TMDB call)", async () => {
    const payload = {
      listType: "popular",
      page: 1,
      totalPages: 10,
      totalResults: 100,
      results: [
        {
          tmdbId: 1,
          title: "Cached Movie",
          overview: null,
          posterUrl: `${TMDB_IMAGE_BASE}/poster.jpg`,
          backdropUrl: null,
          releaseDate: "2010-01-01",
          genreIds: [28, 12],
          popularity: 123.4,
          voteAverage: 7.8,
          voteCount: 999,
        },
      ],
    };

    await prisma.movieListCache.create({
      data: {
        listType: "popular",
        page: 1,
        payloadJson: payload as any,
        // updatedAt is @updatedAt, so "now" => fresh
      },
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch" as any);

    const res = await request(app).get("/api/movies/lists/popular?page=1");
    expect(res.status).toBe(200);

    // Response contract (MovieListResponseDTO)
    expect(res.body.listType).toBe("popular");
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(10);
    expect(res.body.totalResults).toBe(100);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results[0].tmdbId).toBe(1);
    expect(res.body.results[0].title).toBe("Cached Movie");

    // No upstream call on fresh cache hit
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("cache miss -> fetches TMDB, validates payload, upserts cache, returns normalized DTO", async () => {
    const tmdbRaw = {
      page: 1,
      total_pages: 2,
      total_results: 40,
      results: [
        {
          id: 101,
          title: "From TMDB",
          overview: "Hello",
          poster_path: "/p.jpg",
          backdrop_path: "/b.jpg",
          release_date: "2014-02-02",
          genre_ids: [18, 80],
          popularity: 9.9,
          vote_average: 6.6,
          vote_count: 12,
        },
      ],
    };

    vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => tmdbRaw,
    } as any);

    const res = await request(app).get("/api/movies/lists/top_rated?page=1");
    expect(res.status).toBe(200);

    expect(res.body.listType).toBe("top_rated");
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.totalResults).toBe(40);

    expect(res.body.results?.[0]?.tmdbId).toBe(101);
    expect(res.body.results?.[0]?.title).toBe("From TMDB");
    expect(res.body.results?.[0]?.posterUrl).toBe(`${TMDB_IMAGE_BASE}/p.jpg`);
    expect(res.body.results?.[0]?.backdropUrl).toBe(`${TMDB_IMAGE_BASE}/b.jpg`);
    expect(res.body.results?.[0]?.genreIds).toEqual([18, 80]);
    expect(res.body.results?.[0]?.voteAverage).toBe(6.6);

    // Cache row should exist after fetch
    const row = await prisma.movieListCache.findUnique({
      where: { listType_page: { listType: "top_rated", page: 1 } },
    });
    expect(row).toBeTruthy();
    expect((row?.payloadJson as any)?.listType).toBe("top_rated");
    expect((row?.payloadJson as any)?.results?.[0]?.tmdbId).toBe(101);
  });

  it("stale cache -> refreshes from TMDB", async () => {
    const stalePayload = {
      listType: "now_playing",
      page: 1,
      totalPages: 1,
      totalResults: 1,
      results: [
        {
          tmdbId: 1,
          title: "Stale",
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          releaseDate: null,
          genreIds: [],
        },
      ],
    };

    // Create a row then manually set updatedAt far in the past to force staleness
    const created = await prisma.movieListCache.create({
      data: {
        listType: "now_playing",
        page: 1,
        payloadJson: stalePayload as any,
      },
    });

    await prisma.movieListCache.update({
      where: { id: created.id },
      data: { updatedAt: new Date(0) as any },
    });

    const tmdbRaw = {
      page: 1,
      total_pages: 5,
      total_results: 100,
      results: [
        {
          id: 202,
          title: "Fresh After Stale",
          overview: null,
          poster_path: null,
          backdrop_path: null,
          release_date: null,
          genre_ids: [16],
        },
      ],
    };

    vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => tmdbRaw,
    } as any);

    const res = await request(app).get("/api/movies/lists/now_playing?page=1");
    expect(res.status).toBe(200);
    expect(res.body.results?.[0]?.tmdbId).toBe(202);
    expect(res.body.totalPages).toBe(5);

    const row = await prisma.movieListCache.findUnique({
      where: { listType_page: { listType: "now_playing", page: 1 } },
    });
    expect((row?.payloadJson as any)?.results?.[0]?.tmdbId).toBe(202);
  });

  it("returns 502 UPSTREAM_TMDB_ERROR when TMDB returns non-200", async () => {
    vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ status_message: "Service unavailable" }),
    } as any);

    const res = await request(app).get("/api/movies/lists/upcoming?page=1");
    expect(res.status).toBe(502);
    expect(res.body?.error).toBe("UPSTREAM_TMDB_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });

  it("returns 502 UPSTREAM_SCHEMA_MISMATCH when TMDB payload does not match schema", async () => {
    // Missing required fields (results etc)
    const invalidRaw = { nope: true };

    vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => invalidRaw,
    } as any);

    const res = await request(app).get("/api/movies/lists/popular?page=1");
    expect(res.status).toBe(502);
    expect(res.body?.error).toBe("UPSTREAM_SCHEMA_MISMATCH");
    expect(typeof res.body?.message).toBe("string");
  });

  it("returns 500 DB_ERROR when database read fails", async () => {
    vi.spyOn(prisma.movieListCache, "findUnique").mockRejectedValueOnce(
      new Error("DB is down") as any
    );

    const res = await request(app).get("/api/movies/lists/popular?page=1");
    expect(res.status).toBe(500);
    expect(res.body?.error).toBe("DB_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });
});
