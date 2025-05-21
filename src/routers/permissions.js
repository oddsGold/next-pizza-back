import { Router } from 'express';
import PermissionController from '../controllers/permission-controller.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import { permissions } from '../middlewares/permissions.js';

const permissionsRouter = new Router();

permissionsRouter.get('/me/permissions', authenticate, ctrlWrapper(PermissionController.availablePermissions));
permissionsRouter.get('/permissions', authenticate, ctrlWrapper(PermissionController.permissions));
permissionsRouter.post('/permissions', authenticate, permissions('Models\\Permission', 'create'), ctrlWrapper(PermissionController.createPermissions));
permissionsRouter.get('/all/permissions', authenticate, permissions('Models\\Permission', 'read'), ctrlWrapper(PermissionController.allPermissions));
permissionsRouter.get('/roles/:roleId/permissions/:resourceId', authenticate, permissions('Models\\Permission', 'update'), ctrlWrapper(PermissionController.getPermissionByRoleAndResource));
permissionsRouter.put('/roles/:roleId/permissions/:resourceId', authenticate, permissions('Models\\Permission', 'update'), ctrlWrapper(PermissionController.updatePermissions));
permissionsRouter.delete('/roles/:roleId/permissions/:resourceId', authenticate, permissions('Models\\Permission', 'delete'), ctrlWrapper(PermissionController.deletePermissionByRoleAndResource));

export default permissionsRouter;