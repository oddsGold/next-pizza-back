import createHttpError from 'http-errors';
import RolesService from "../services/roles.js";

class RoleController {

  async roles(req, res, next) {
    const roles = await RolesService.getRoles();

    if(!roles) {
      return next(createHttpError(401, 'Roles not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found permissions!',
      data: roles,
    });
  }

}

export default new RoleController();