import { Router } from "express";
import { moviesController } from "../controllers/moviesController";
import { movieListController } from "../controllers/movieListController";
import { validate } from "../middlewares/validate";
import { MovieCreateSchema } from "../schemas/movie.schema";

const router = Router();

/**
 * Spec-aligned movie lists endpoint (paginated, cached):
 * GET /api/movies/lists/:listType?page=n
 *
 * NOTE: Must be defined BEFORE "/:tmdbId" route to avoid conflicts.
 */
router.get("/lists/:listType", movieListController.getByType);

/**
 * Spec-aligned: GET /api/movies/:tmdbId (cache -> TMDB -> upsert -> response)
 */
router.get("/:tmdbId", moviesController.getByTmdbId);

/**
 * Existing CRUD endpoints (kept, moved under /db to avoid route conflicts)
 */
router.get("/db", moviesController.list);
router.get("/db/:id", moviesController.get);
router.post("/db", validate(MovieCreateSchema), moviesController.create);
router.delete("/db/:id", moviesController.remove);

export default router;
