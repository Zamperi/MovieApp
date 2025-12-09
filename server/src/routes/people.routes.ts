import { Router } from 'express';
import { peopleController } from '../controllers/peopleController';

const router = Router();

router.get('/trending', peopleController.trending);
router.get('/:id', peopleController.getPerson)

export default router;