import { Router } from "express";
import { groupController } from "../controllers/groupController";
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();

router.get('/all', groupController.list);
router.get('/:groupId', groupController.getGroup)
router.post('/', authMiddleware, groupController.createGroup);
router.delete('/:groupId', authMiddleware, groupController.deleteGroup);
router.post('/:groupId/join-requests', authMiddleware, groupController.joinRequestGroup);
router.post('/:groupId/join-requests/:requestId/approve', authMiddleware, groupController.approveJoinRequestGroup);
router.post('/:groupId/join-requests/:requestId/decline', authMiddleware, groupController.declineJoinRequestGroup)

export default router;