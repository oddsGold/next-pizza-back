import PermissionsService from "../services/permissions.js";
import createHttpError from 'http-errors';
import TokensService from '../services/tokens.js';
import UsersService from '../services/users.js';

class PermissionController {

  async availablePermissions(req, res, next) {
    const {refreshToken, sessionId} = req.cookies;

    TokensService.validateRefreshToken(refreshToken);

    const session = await TokensService.findToken(refreshToken, sessionId);

    const user = await UsersService.getUserById(session.userId);

    const permissions = await PermissionsService.getPermissionsByRole(user.roleId);

    if(!permissions) {
      return next(createHttpError(401, 'Permissions not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found permissions!',
      data: permissions,
    });

  }

  async permissions(req, res, next) {
    const permissions = await PermissionsService.getPermissions();

    if(!permissions) {
      return next(createHttpError(401, 'Permissions not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found permissions!',
      data: permissions,
    });
  }

}

export default new PermissionController();