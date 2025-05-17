import { Router } from 'express';
import MenuController from '../controllers/menu-controller.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import { permissions } from '../middlewares/permissions.js';

const menusRouter = new Router();

/**
 * @requires permissions
 * @param {string} 'Models\\Menu' - Ресурс для проверки прав
 * @param {string} 'create' - Тип разрешения, [read, crate, update, delete, upload]
 */
menusRouter.get('/me/menu', authenticate, ctrlWrapper(MenuController.availableMenu));
menusRouter.get('/menu', authenticate, ctrlWrapper(MenuController.parentMenu));
menusRouter.post('/menu', authenticate, permissions('Models\\Menu', 'create'), ctrlWrapper(MenuController.createMenus));
// menusRouter.put('/menu/:id', authenticate, permissions('Models\\Menu', 'update'), ctrlWrapper(MenuController.updateMenu));
// menusRouter.delete('/menu/:id', authenticate, permissions('Models\\Menu', 'delete'), ctrlWrapper(MenuController.menu));

export default menusRouter;