import { Router } from 'express';
import PermissionController from '../controllers/permission-controller.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';

const permissionsRouter = new Router();

permissionsRouter.get('/me/permissions', authenticate, ctrlWrapper(PermissionController.availablePermissions));
permissionsRouter.get('/permissions', authenticate, ctrlWrapper(PermissionController.permissions));

export default permissionsRouter;