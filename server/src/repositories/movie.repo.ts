import { prisma } from "../lib/prisma";

export type MovieRow = {
    id: number;
    tmdbId: number;
    title: string;
    overview: string | null;
    posterUrl: string | null;
    backdropUrl: string | null;
    releaseDate: Date | null;
    runtimeMinutes: number | null;
    genres: string[];
    updatedAt: Date;
};

export const movieRepo = {
    // legacy list (kept)
    list: () =>
        prisma.movie.findMany({
            orderBy: { id: "desc" },
            take: 50,
        }),

    // legacy by internal id (kept)
    findById: (id: number) =>
        prisma.movie.findUnique({
            where: { id },
        }),

    // spec: by tmdbId (cache)
    findByTmdbId: (tmdbId: number) =>
        prisma.movie.findUnique({
            where: { tmdbId },
        }),

    // spec: upsert cache row
    upsertByTmdbId: (tmdbId: number, data: Omit<MovieRow, "id" | "tmdbId" | "updatedAt">) =>
        prisma.movie.upsert({
            where: { tmdbId },
            create: {
                tmdbId,
                ...data,
            },
            update: {
                ...data,
            },
        }),

    // legacy create/update/remove (kept)
    create: (data: any) => prisma.movie.create({ data }),
    update: (id: number, data: any) => prisma.movie.update({ where: { id }, data }),
    remove: (id: number) => prisma.movie.delete({ where: { id } }),
};
