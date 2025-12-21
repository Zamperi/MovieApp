import type { Request, Response } from "express";
import { people } from "../services/people.service";

type ErrorResponse = {
    status: number;
    error: string;
    message: string;
    details?: unknown;
};

function isErrorResponse(x: unknown): x is ErrorResponse {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return (
        typeof o.status === "number" &&
        typeof o.error === "string" &&
        typeof o.message === "string"
    );
}

export const peopleController = {
    trending: async (_req: Request, res: Response) => {
        try {
            const dto = await people.getTrendingPeopleDay();
            return res.status(200).json(dto);
        } catch (err) {
            if (isErrorResponse(err)) {
                return res.status(err.status).json(err);
            }
            return res.status(500).json({
                status: 500,
                error: "INTERNAL_ERROR",
                message: "Unexpected error",
            });
        }
    },

    getPerson: async (req: Request, res: Response) => {
        try {
            const dto = await people.getPersonByTmdbId(req.params.tmdbPersonId);
            return res.status(200).json(dto);
        } catch (err) {
            if (isErrorResponse(err)) {
                return res.status(err.status).json(err);
            }
            return res.status(500).json({
                status: 500,
                error: "INTERNAL_ERROR",
                message: "Unexpected error",
            });
        }
    },
};
