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

  async addRole(req, res, next) {
    const roles = await RolesService.addNewRole(req.body);

    if(!roles) {
      return next(createHttpError(401, 'Roles not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found permissions!',
      data: roles,
    });
  }

  async deleteRole(req, res, next) {
    const { id } = req.params;

    await RolesService.deleteRole(id);

    res.status(204).send();
  }

}

export default new RoleController();