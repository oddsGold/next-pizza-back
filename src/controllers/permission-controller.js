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

  async createPermissions(req, res, next) {
    const permissions = await PermissionsService.addPermission(req.body);

    res.status(201).json({
      status: 201,
      message: `Successfully created permission!`,
      data: permissions
    });
  }

  async allPermissions(req, res, next) {
    const permissions = await PermissionsService.getAllPermissions();

    if(!permissions) {
      return next(createHttpError(401, 'Permissions not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found all permissions!',
      data: permissions,
    });
  }

  async getPermissionByRoleAndResource(req, res, next) {
    const { roleId, resourceId } = req.params;

    const permissions = await PermissionsService.permissionByRoleAndResource(roleId, resourceId);

    if(!permissions) {
      return next(createHttpError(401, 'Permissions not found'));
    }

    res.json({
      status: 200,
      message: `Successfully get a permission by role and resource!`,
      data: permissions,
    });
  }

  async updatePermissions(req, res, next){
    const { permissionId } = req.body;
    const { roleId, resourceId } = req.params;

    const permissions = await PermissionsService.updatePermissions(roleId, resourceId, permissionId);

    if(!permissions) {
      return next(createHttpError(401, 'Permissions not found'));
    }

    res.json({
      status: 200,
      message: `Successfully patched a permission!`,
      data: permissions,
    });
  }

  async deletePermissionByRoleAndResource(req, res, next) {
    const { roleId, resourceId } = req.params;

    await PermissionsService.deletePermissions( roleId, resourceId);

    res.status(204).send();
  }

}

export default new PermissionController();