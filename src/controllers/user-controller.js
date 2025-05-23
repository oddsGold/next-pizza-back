import UsersService from '../services/users.js';
import createHttpError from "http-errors";
import bcrypt from 'bcrypt';
import TokensService from "../services/tokens.js";
import { env } from '../utils/env.js';
import FileService from '../utils/file-service.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

class UserController {

  async registration(req, res, next) {
    const { email, password, name } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await UsersService.getUser(email);

    if(user){
      throw createHttpError(409, 'Email in use');
    }

    const userData = await UsersService.registration(
      email,
      encryptedPassword,
      name
    );

    const accessToken = await UsersService.login(await UsersService.getUser(email));

    res.cookie('refreshToken', accessToken.refreshToken, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure: true});
    res.cookie('sessionId', accessToken._id, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure: true});

    res.status(201).json({
      status: 201,
      message: `Successfully registered a user!`,
      data: {
        user: userData.user,
        accessToken: accessToken.accessToken
      },
    });

  }

  async login(req, res, next) {

    const {email, password} = req.body;

    const user = await UsersService.getUser(email);

    if(!user){
      throw createHttpError(401, 'User not found');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if(!isPassEquals) {
      throw createHttpError(404, 'Incorrect Login or Password');
    }

    await TokensService.removeUserId(user._id);

    const userData = await UsersService.login(user);

    res.cookie('refreshToken', userData.refreshToken, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure: true});
    res.cookie('sessionId', userData._id, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure: true});

    res.status(201).json({
      status: 200,
      message: `Successfully logged in an user!`,
      data: {
        accessToken: userData.accessToken
      }
    });
  }

  async refresh(req, res, next) {
    const {refreshToken, sessionId} = req.cookies;

    TokensService.validateRefreshToken(refreshToken);

    const session = await UsersService.refresh(refreshToken, sessionId);

    res.cookie('refreshToken', session.refreshToken, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure: true});
    res.cookie('sessionId', session._id, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure: true});

    res.json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: session.accessToken,
      },
    });
  }

  async logout(req, res, next){
    const {sessionId} = req.cookies;

    if(sessionId) {
      await UsersService.logout(sessionId);
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    res.status(204).send();
  }

  async getCurrentUser(req, res, next) {
    const {refreshToken, sessionId} = req.cookies;

    TokensService.validateRefreshToken(refreshToken);

    const session = await TokensService.findToken(refreshToken, sessionId);

    const user = await UsersService.getUserById(session.userId);

    if(!user){
      throw createHttpError(401, 'User not found');
    }

    res.json({
      status: 200,
      message: 'Successfully sent user info!',
      data: {
        user
      },
    });

  }

  async patchUser(req, res, next) {
    const {refreshToken, sessionId} = req.cookies;
    const data = req.body;
    const avatar = req.file;

    TokensService.validateRefreshToken(refreshToken);

    const session = await TokensService.findToken(refreshToken, sessionId);

    const user = await UsersService.getUserById(session.userId);

    if(!user){
      throw createHttpError(401, 'User not found');
    }


    let photoUrl;

    if (avatar) {
      if (env('ENABLE_CLOUDINARY') === 'true') {
        photoUrl = await FileService.saveFileToCloudinary(avatar);
      } else {
        photoUrl = await FileService.saveFileToUploadDir(avatar);
      }
      data.avatar = photoUrl;
    }

    const result = await UsersService.updateUser(user._id, data, {});

    if (!result) {
      return next(createHttpError(404, 'Contact not found'));
    }

    res.json({
      status: 200,
      message: `Successfully patched a user!`,
      data: result.user,
    });
  }

  async getUsersLength(req, res, next) {
    const userData = await UsersService.getUsersLength();

    res.json({
      status: 200,
      message: 'Successfully retrieved user count',
      data: userData,
    });
  }

  async getAdminUsers(req, res, next) {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);

    const users = await UsersService.getAdminUsers({
      page,
      perPage,
      sortBy,
      sortOrder
    });

    if(!users) {
      return next(createHttpError(401, 'Users not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found users',
      data: users.data,
      pagination: {
        currentPage: page,
        perPage,
        totalPages: users.totalPages,
        totalCount: users.totalCount,
      },
    });
  }

  async getClientUsers(req, res, next) {
    const users = await UsersService.getClientUsers();

    if(!users) {
      return next(createHttpError(401, 'Users not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found users',
      data: users,
    });
  }

  async deleteAdminUser(req, res, next) {
    const { userId } = req.params;

    if (!userId) {
      return next(createHttpError(404, 'User not found'));
    }

    await UsersService.deleteUser(userId);

    res.status(204).send();
  }

  async getUser(req, res, next){
    const{ userId } = req.params;

    const user = await UsersService.getUserById(userId);

    if(!user){
      throw createHttpError(401, 'User not found');
    }

    res.json({
      status: 200,
      message: 'Successfully sent user info!',
      data: {
        user
      },
    });
  }

  async resetEmail(req, res, next) {
    const {email} = req.body;

    const user = await UsersService.getUser(email);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    await UsersService.resetToken(user);

    res.json({
      message: 'Reset password email was successfully sent!',
      status: 200,
      data: {},
    });
  }

  async resetPassword(req, res, next){
    const {password, token} = req.body;

    const entries = TokensService.validateResetToken(token);

    const user = await UsersService.getUser(entries.email);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    await UsersService.resetPassword(user.id, encryptedPassword);

    res.json({
      message: 'Password was successfully reset!',
      status: 200,
      data: {},
    });
  }

}

export default new UserController();