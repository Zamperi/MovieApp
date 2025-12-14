import { Router } from "express";
import { moviesController } from "../controllers/moviesController";
import { movieListController } from "../controllers/movieListController";
import { validate } from "../middlewares/validate";
import { MovieCreateSchema } from "../schemas/movie.schema";

const router = Router();

/**
 * TMDB list endpoints (existing)
 */
router.get("/popular", movieListController.popular);
router.get("/now_playing", movieListController.nowPlaying);
router.get("/top_rated", movieListController.topRated);
router.get("/upcoming", movieListController.upcoming);

/**
 * Spec-aligned: GET /api/movies/:tmdbId (cache -> TMDB -> upsert -> response)
 */
router.get("/:tmdbId", moviesController.getByTmdbId);

/**
 * Existing CRUD endpoints (kept, moved under /db to avoid route conflicts)
 * You can spec and refactor these later without breaking movie-fetch.
 */
router.get("/db", moviesController.list);
router.get("/db/:id", moviesController.get);
router.post("/db", validate(MovieCreateSchema), moviesController.create);
router.delete("/db/:id", moviesController.remove);

export default router;
