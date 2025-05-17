import ResourcesService from "../services/resources.js";
import createHttpError from 'http-errors';

class ResourceController {

  async resources(req, res, next) {
    const resources  = await ResourcesService.getResources();

    if(!resources ) {
      return next(createHttpError(401, 'Resources not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully found resources!',
      data: resources,
    });

  }

}

export default new ResourceController();