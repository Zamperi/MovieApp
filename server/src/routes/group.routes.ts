import { Router } from "express";
import { groupController } from "../controllers/groupController";
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();

router.get('/all', groupController.list);
router.get('/:groupId', groupController.getGroup)
router.post('/', authMiddleware, groupController.createGroup);

export default router;