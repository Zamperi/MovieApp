import Router from "express";
import { Request, Response} from 'express';
import swaggerUi from 'swagger-ui-express';

import { openapi } from '../../openapi';

const router = Router();

router.get('/openapi.json', (_req: Request, res: Response) => res.json(openapi));
router.use('/', swaggerUi.serve, swaggerUi.setup(openapi));

export default router;