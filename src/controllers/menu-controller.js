import MenusService from "../services/menus.js";
import createHttpError from 'http-errors';
import TokensService from '../services/tokens.js';
import UsersService from '../services/users.js';

class MenuController {

  async availableMenu(req, res, next) {
    const {refreshToken, sessionId} = req.cookies;

    TokensService.validateRefreshToken(refreshToken);

    const session = await TokensService.findToken(refreshToken, sessionId);

    const user = await UsersService.getUserById(session.userId);

    const menus = await MenusService.getMenus(user.roleId);

    if(!menus) {
      return next(createHttpError(401, 'List of menu not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found list of menu!',
      data: menus,
    });

  }

  async parentMenu(req, res, next) {
    const parentItems = await MenusService.getParentMenuItems();

    if(!parentItems) {
      return next(createHttpError(401, 'List of parent menu items not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found list of menu!',
      data: parentItems,
    });
  }

  async createMenus(req, res, next) {
    const { parent_id, resource_id, permission_id, urn, ...rest } = req.body;

    const cleanBody = {
      ...rest,
      parent_id: parent_id || null,
      resource_id: resource_id || null,
      permission_id: permission_id || null,
      urn: urn || null,
    };

    const menus = await MenusService.addMenuItem(cleanBody);

    res.status(201).json({
      status: 201,
      message: `Successfully created menu item!`,
      data: menus
    });
  }

}

export default new MenuController();