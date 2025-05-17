import { Router } from 'express';
import authRouter from './auth.js';
import usersRouter from './users.js';
import menusRouter from './menus.js';
import resourcesRouter from './resources.js';
import permissionsRouter from './permissions.js';

const router = Router();

router.use('/', usersRouter);
router.use('/', authRouter);
router.use('/', menusRouter);
router.use('/', resourcesRouter);
router.use('/', permissionsRouter);

export default router;
