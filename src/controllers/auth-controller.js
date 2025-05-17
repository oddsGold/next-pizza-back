import {generateAuthUrl} from '../utils/googleOAuth2.js';
import { validateCode } from '../utils/googleOAuth2.js';
import createHttpError from "http-errors";
import UsersService from "../services/users.js";
import AuthService from "../services/auth.js";
import bcrypt from "bcrypt";
import { randomBytes } from 'crypto';


class AuthController {
  async getGoogleOAuthUrlController(req, res) {
    const url = generateAuthUrl();
    res.json({
      status: 200,
      message: 'Successfully get Google OAuth url!',
      data: {
        url,
      },
    });
  }

  async loginOrSignupWithGoogle(req, res) {
    const code = req.body.code;
    let password;

    const loginTicket = await validateCode(code);
    const payload = loginTicket.getPayload();

    if (!payload) throw createHttpError(401);

    const user = await UsersService.getUser(payload.email);

    if (!user) {
      password = await bcrypt.hash(randomBytes(10), 10);
    }

    const { user: userData, session } = await AuthService.loginOrSignupWithGoogle(payload, password);

    res.cookie('refreshToken', session.refreshToken, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true});
    res.cookie('sessionId', session._id, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true});

    res.json({
      status: 200,
      message: 'Successfully logged in via Google OAuth!',
      data: {
        accessToken: session.accessToken,
      },
    });

  }

}

export default new AuthController();