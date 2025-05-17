import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import ResourceController from '../controllers/resources-controller.js';

const resourcesRouter = new Router();

resourcesRouter.get('/resources', authenticate, ctrlWrapper(ResourceController.resources));

export default resourcesRouter;