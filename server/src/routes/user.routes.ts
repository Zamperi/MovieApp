import Router from 'express';
import { userController } from '../controllers/userController';

const router = Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/refresh', userController.refreshToken);
router.post('/logout', userController.logout);

export default router;