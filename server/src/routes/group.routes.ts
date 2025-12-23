import { Router } from "express";
import { groupController } from "../controllers/groupController";

const router = Router();

router.get('/all', groupController.list);
router.get('/:groupId', groupController.getGroup)

export default router;