import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import RolesController from '../controllers/roles-controller.js';

const rolesRouter = new Router();

rolesRouter.get('/roles', authenticate, ctrlWrapper(RolesController.roles));

export default rolesRouter;