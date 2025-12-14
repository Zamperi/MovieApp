import type { Request, Response } from "express";
import { movieService } from "../services/movies.service";
import { MovieIdParamSchema } from "../schemas/movie.schema";

type AppError = {
    status: number;
    error: string;
    message: string;
    details?: unknown;
};

function isAppError(err: any): err is AppError {
    return (
        err &&
        typeof err === "object" &&
        typeof err.status === "number" &&
        typeof err.error === "string" &&
        typeof err.message === "string"
    );
}

export const moviesController = {
    /**
     * SPEC: GET /api/movies/:tmdbId
     */
    getByTmdbId: async (req: Request, res: Response) => {
        // V1: validate params (400 VALIDATION_ERROR)
        const parsed = MovieIdParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "tmdbId must be a positive integer",
                details: { issues: parsed.error.issues },
            });
        }

        try {
            const dto = await movieService.getOrFetchByTmdbId(parsed.data.tmdbId);
            return res.status(200).json(dto);
        } catch (err: any) {
            if (isAppError(err)) {
                return res.status(err.status).json({
                    error: err.error,
                    message: err.message,
                    details: err.details,
                });
            }
            return res.status(500).json({
                error: "INTERNAL_ERROR",
                message: "Unexpected error",
            });
        }
    },

    /* =========================
       Legacy CRUD (kept)
    ========================= */

    list: async (_req: Request, res: Response) => {
        try {
            const movies = await movieService.list();
            return res.status(200).json(movies);
        } catch {
            return res.status(500).json({ error: "Failed to fetch movies" });
        }
    },

    get: async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

        try {
            const movie = await movieService.getById(id);
            if (!movie) return res.status(404).json({ error: "Not found" });
            return res.status(200).json(movie);
        } catch {
            return res.status(500).json({ error: "Failed to fetch movie" });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const created = await movieService.create(req.body);
            return res.status(201).json(created);
        } catch {
            return res.status(500).json({ error: "Failed to create movie" });
        }
    },

    remove: async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

        try {
            const ok = await movieService.remove(id);
            if (!ok) return res.status(404).json({ error: "Not found" });
            return res.status(204).end();
        } catch {
            return res.status(500).json({ error: "Failed to delete movie" });
        }
    },
};
