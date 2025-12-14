import request from "supertest";
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import app from "../index";
import { prisma } from "../lib/prisma";

/**
 * Spec sources:
 * docs/flows/movie-fetch.md
 * docs/flows/movie-fetch.errors.md
 */

describe("Movies routes (spec-aligned)", () => {
  beforeEach(async () => {
    // Keep DB clean between tests
    await prisma.movie.deleteMany();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /api/health → 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /api/movies/:tmdbId → 400 VALIDATION_ERROR when tmdbId is invalid", async () => {
    const res = await request(app).get("/api/movies/0");
    expect(res.status).toBe(400);
    expect(res.body?.error).toBe("VALIDATION_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });

  it("GET /api/movies/:tmdbId → 200 from fresh cache (no TMDB call needed)", async () => {
    const tmdbId = 123;

    // Freshness rule: updatedAt >= now - 24h
    // Prisma @updatedAt will set updatedAt automatically unless you override it.
    await prisma.movie.create({
      data: {
        tmdbId,
        title: "Inception",
        overview: "Mind-bender",
        posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
        backdropUrl: null,
        releaseDate: new Date("2010-07-16"),
        runtimeMinutes: 148,
        genres: ["Sci-Fi", "Thriller"],
        // updatedAt auto -> fresh
      },
    });

    const res = await request(app).get(`/api/movies/${tmdbId}`);
    expect(res.status).toBe(200);

    // Response contract (MovieResponseDTO)
    expect(res.body.tmdbId).toBe(tmdbId);
    expect(res.body.title).toBe("Inception");
    expect(res.body.overview).toBe("Mind-bender");
    expect(res.body.posterUrl).toContain("https://");
    expect(res.body.backdropUrl).toBeNull();
    expect(res.body.releaseDate).toBeTruthy(); // should be string (date)
    expect(res.body.runtimeMinutes).toBe(148);
    expect(Array.isArray(res.body.genres)).toBe(true);
    expect(res.body.genres).toEqual(["Sci-Fi", "Thriller"]);
  });

  it("GET /api/movies/:tmdbId → stale cache triggers TMDB fetch, upsert, and returns 200", async () => {
    const tmdbId = 550;

    // Create a stale cached row: updatedAt older than 24h.
    // Note: overriding updatedAt requires Prisma allowing explicit updatedAt in create/update.
    // If your schema uses @updatedAt, Prisma still allows setting it explicitly in create.
    await prisma.movie.create({
      data: {
        tmdbId,
        title: "Old title",
        overview: null,
        posterUrl: null,
        backdropUrl: null,
        releaseDate: null,
        runtimeMinutes: null,
        genres: [],
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25h ago => stale
      },
    });

    /**
     * MOCK HERE:
     * Mock whatever module/function your TMDB integration uses.
     *
     * Example 1 (if you have a wrapper like ../integrations/tmdb):
     *   vi.mock("../integrations/tmdb", () => ({
     *     fetchTmdbMovieById: vi.fn().mockResolvedValue({ ...rawTmdb })
     *   }));
     *
     * Example 2 (if you use global fetch):
     *   vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => rawTmdb })));
     *
     * Replace the snippet below to match your codebase.
     */

    const rawTmdb = {
      id: tmdbId,
      title: "Fight Club",
      overview: "Some overview",
      poster_path: "/poster.png",
      backdrop_path: "/backdrop.png",
      release_date: "1999-10-15",
      runtime: 139,
      genres: [{ id: 18, name: "Drama" }],
    };

    // Example: mock global fetch (only works if your TMDB client uses fetch)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => rawTmdb,
      })) as any
    );

    const res = await request(app).get(`/api/movies/${tmdbId}`);
    expect(res.status).toBe(200);
    expect(res.body.tmdbId).toBe(tmdbId);
    expect(res.body.title).toBe("Fight Club");
    expect(res.body.runtimeMinutes).toBe(139);
    expect(res.body.genres).toEqual(["Drama"]);

    // Verify upsert happened (cache updated)
    const row = await prisma.movie.findUnique({ where: { tmdbId } });
    expect(row).toBeTruthy();
    expect(row?.title).toBe("Fight Club");
    expect(row?.runtimeMinutes).toBe(139);
    expect(row?.genres).toEqual(["Drama"]);
    expect(row?.posterUrl).toContain("https://"); // if you normalize to full URL
  });

  it("GET /api/movies/:tmdbId → 404 MOVIE_NOT_FOUND when TMDB returns 404", async () => {
    const tmdbId = 999999999;

    // Mock global fetch 404 (adjust to your TMDB client)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({ status_code: 34, status_message: "The resource you requested could not be found." }),
      })) as any
    );

    const res = await request(app).get(`/api/movies/${tmdbId}`);
    expect(res.status).toBe(404);
    expect(res.body?.error).toBe("MOVIE_NOT_FOUND");
    expect(typeof res.body?.message).toBe("string");
  });
});
