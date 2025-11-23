import { Router } from 'express';
import { moviesController } from '../controllers/moviesController';
import { movieListController } from '../controllers/movieListController';
import { validate } from '../middlewares/validate';
import { MovieCreateSchema } from '../schemas/movie.schema';

const router = Router();

router.get('/popular', movieListController.popular);
router.get('/now_playing', movieListController.nowPlaying);
router.get('/top_rated', movieListController.topRated);
router.get('/upcoming', movieListController.upcoming);
// GET /api/movies
router.get('/', moviesController.list);

// GET /api/movies/:id
router.get('/:id', moviesController.get);

// POST /api/movies
router.post('/', validate(MovieCreateSchema), moviesController.create);

// DELETE /api/movies/:id
router.delete('/:id', moviesController.remove);

export default router;