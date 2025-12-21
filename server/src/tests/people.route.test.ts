// src/routes/people.routes.test.ts
import request from "supertest";
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import app from "../index";
import { prisma } from "../lib/prisma";

/**
 * Spec sources:
 * docs/flows/people-single.fetch.md
 * docs/flows/people-single.fetch-errors.md
 * docs/flows/people-trending.fetch.md
 * docs/flows/people-trending.fetch-errors.md
 */

describe("People routes (spec-aligned)", () => {
  beforeEach(async () => {
    // Keep DB clean between tests
    await prisma.peopleCache.deleteMany();
    await prisma.trendingPeopleCache.deleteMany();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /api/people/:tmdbPersonId → 400 VALIDATION_ERROR when tmdbPersonId is invalid", async () => {
    const res = await request(app).get("/api/people/0");
    expect(res.status).toBe(400);
    expect(res.body?.error).toBe("VALIDATION_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });

  it("GET /api/people/:tmdbPersonId → 200 from fresh cache (no TMDB call needed)", async () => {
    const tmdbPersonId = 123;

    await prisma.peopleCache.create({
      data: {
        tmdbId: tmdbPersonId,
        name: "Ada Lovelace",
        biography: "Mathematician",
        profileUrl: "https://image.tmdb.org/t/p/w500/ada.png",
        knownForDepartment: "Acting",
        birthday: new Date("1815-12-10"),
        deathday: null,
        placeOfBirth: "London",
        // updatedAt auto -> fresh
      },
    });

    const fetchMock = vi.fn(async () => {
      throw new Error("fetch should not be called when cache is fresh");
    });
    vi.stubGlobal("fetch", fetchMock as any);

    const res = await request(app).get(`/api/people/${tmdbPersonId}`);
    expect(res.status).toBe(200);

    // Response contract (PersonResponseDTO)
    expect(res.body.tmdbPersonId).toBe(tmdbPersonId);
    expect(res.body.name).toBe("Ada Lovelace");
    expect(res.body.biography).toBe("Mathematician");
    expect(res.body.profileUrl).toContain("https://");
    expect(res.body.knownForDepartment).toBe("Acting");
    expect(res.body.birthday).toBe("1815-12-10"); // date string
    expect(res.body.deathday).toBeNull();
    expect(res.body.placeOfBirth).toBe("London");

    // Ensure no upstream call happened
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("GET /api/people/:tmdbPersonId → stale cache triggers TMDB fetch, upsert, and returns 200", async () => {
    const tmdbPersonId = 42;

    // Create a stale cached row (25h ago)
    await prisma.peopleCache.create({
      data: {
        tmdbId: tmdbPersonId,
        name: "Old Name",
        biography: null,
        profileUrl: null,
        knownForDepartment: null,
        birthday: null,
        deathday: null,
        placeOfBirth: null,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
      },
    });

    const rawTmdb = {
      id: tmdbPersonId,
      name: "New Name",
      biography: "Bio",
      profile_path: "/new.png",
      known_for_department: "Acting",
      birthday: "1970-01-01",
      deathday: null,
      place_of_birth: "Helsinki",
    };

    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => rawTmdb,
    }));
    vi.stubGlobal("fetch", fetchMock as any);

    const res = await request(app).get(`/api/people/${tmdbPersonId}`);
    expect(res.status).toBe(200);
    expect(res.body.tmdbPersonId).toBe(tmdbPersonId);
    expect(res.body.name).toBe("New Name");
    expect(res.body.biography).toBe("Bio");
    expect(res.body.profileUrl).toContain("https://");
    expect(res.body.knownForDepartment).toBe("Acting");
    expect(res.body.birthday).toBe("1970-01-01");
    expect(res.body.deathday).toBeNull();
    expect(res.body.placeOfBirth).toBe("Helsinki");

    // Verify upsert happened
    const row = await prisma.peopleCache.findUnique({ where: { tmdbId: tmdbPersonId } });
    expect(row).toBeTruthy();
    expect(row?.name).toBe("New Name");
    expect(row?.biography).toBe("Bio");
    expect(row?.knownForDepartment).toBe("Acting");
    expect(row?.placeOfBirth).toBe("Helsinki");
    expect(row?.profileUrl ?? "").toContain("https://");
  });

  it("GET /api/people/:tmdbPersonId → 404 PERSON_NOT_FOUND when TMDB returns 404", async () => {
    const tmdbPersonId = 999999999;

    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ status_code: 34, status_message: "Not found" }),
    }));
    vi.stubGlobal("fetch", fetchMock as any);

    const res = await request(app).get(`/api/people/${tmdbPersonId}`);
    expect(res.status).toBe(404);
    expect(res.body?.error).toBe("PERSON_NOT_FOUND");
    expect(typeof res.body?.message).toBe("string");
  });

  it("GET /api/people/trending → 200 from fresh cache (no TMDB call needed)", async () => {
    await prisma.trendingPeopleCache.create({
      data: {
        key: "day",
        page: 1,
        totalPages: 10,
        totalResults: 100,
        results: [
          {
            tmdbPersonId: 1,
            name: "Person A",
            profileUrl: "https://image.tmdb.org/t/p/w500/a.png",
            knownForDepartment: "Acting",
            popularity: 12.3,
          },
        ],
        // updatedAt auto -> fresh
      },
    });

    const fetchMock = vi.fn(async () => {
      throw new Error("fetch should not be called when cache is fresh");
    });
    vi.stubGlobal("fetch", fetchMock as any);

    const res = await request(app).get("/api/people/trending");
    expect(res.status).toBe(200);

    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(10);
    expect(res.body.totalResults).toBe(100);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results[0].tmdbPersonId).toBe(1);
    expect(res.body.results[0].name).toBe("Person A");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("GET /api/people/trending → stale cache triggers TMDB fetch, upsert, and returns 200", async () => {
    await prisma.trendingPeopleCache.create({
      data: {
        key: "day",
        page: 1,
        totalPages: 1,
        totalResults: 1,
        results: [],
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
      },
    });

    const rawTmdbTrending = {
      page: 1,
      results: [
        {
          id: 777,
          name: "Trending Person",
          profile_path: "/t.png",
          known_for_department: "Acting",
          popularity: 99.9,
        },
      ],
      total_pages: 2,
      total_results: 20,
    };

    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => rawTmdbTrending,
    }));
    vi.stubGlobal("fetch", fetchMock as any);

    const res = await request(app).get("/api/people/trending");
    expect(res.status).toBe(200);

    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.totalResults).toBe(20);
    expect(res.body.results[0].tmdbPersonId).toBe(777);
    expect(res.body.results[0].name).toBe("Trending Person");
    expect(res.body.results[0].profileUrl).toContain("https://");
    expect(res.body.results[0].knownForDepartment).toBe("Acting");
    expect(res.body.results[0].popularity).toBe(99.9);

    // Verify upsert updated cache
    const row = await prisma.trendingPeopleCache.findUnique({ where: { key: "day" } });
    expect(row).toBeTruthy();
    expect(row?.totalPages).toBe(2);
    expect(row?.totalResults).toBe(20);

    const storedResults = row?.results as any[];
    expect(Array.isArray(storedResults)).toBe(true);
    expect(storedResults[0].tmdbPersonId).toBe(777);
  });
});
