import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import RolesController from '../controllers/roles-controller.js';
import { permissions } from '../middlewares/permissions.js';

const rolesRouter = new Router();

rolesRouter.get('/roles', authenticate, ctrlWrapper(RolesController.roles));
rolesRouter.post('/roles', authenticate,  permissions('Models\\Role', 'create'), ctrlWrapper(RolesController.addRole));
rolesRouter.delete('/roles/:id', authenticate,  permissions('Models\\Role', 'delete'), ctrlWrapper(RolesController.deleteRole));

export default rolesRouter;