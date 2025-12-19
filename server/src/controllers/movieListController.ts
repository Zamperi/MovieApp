import type { Request, Response } from "express";
import { ZodError } from "zod";
import {
  MovieListPathParamSchema,
  MovieListQuerySchema,
} from "../schemas/movielists.schema";
import { movieListsService } from "../services/movieLists.service";

type ErrorResponse = {
  error: string;
  message: string;
  details?: unknown;
};

function sendError(res: Response, status: number, body: ErrorResponse) {
  return res.status(status).json(body);
}

export const movieListController = {
  /**
   * GET /api/movies/lists/:listType?page=n
   * Contract + error handling is defined in docs/flows/movie-lists.*.md
   */
  getByType: async (req: Request, res: Response) => {
    try {
      const { listType } = MovieListPathParamSchema.parse(req.params);
      const { page } = MovieListQuerySchema.parse(req.query);

      const dto = await movieListsService.getList({ listType, page });
      return res.status(200).json(dto);
    } catch (err) {
      // 400 input validation
      if (err instanceof ZodError) {
        return sendError(res, 400, {
          error: "VALIDATION_ERROR",
          message:
            "listType must be one of: popular, top_rated, now_playing, upcoming; page must be an integer >= 1",
          details: err.flatten(),
        });
      }

      // Service-layer typed errors
      if (err && typeof err === "object" && "status" in err && "error" in err) {
        const e = err as any;
        return sendError(res, e.status, {
          error: e.error,
          message: e.message ?? "Request failed",
          details: e.details,
        });
      }

      // Unknown
      return sendError(res, 500, {
        error: "INTERNAL_ERROR",
        message: "Unexpected error",
      });
    }
  },
};
