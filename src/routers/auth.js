import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import AuthController from '../controllers/auth-controller.js';
import { loginWithGoogleOAuthSchema } from '../validation/auth.js';

const authRouter = new Router();

authRouter.get('/get-oauth-url', ctrlWrapper(AuthController.getGoogleOAuthUrlController));
authRouter.post('/confirm-oauth',  validateBody(loginWithGoogleOAuthSchema),   ctrlWrapper(AuthController.loginOrSignupWithGoogle));

export default authRouter;