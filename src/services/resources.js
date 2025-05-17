import { ResourcesCollection } from '../db/models/resource.js';

class ResourcesService {

  async getResources() {
    return ResourcesCollection.find();
  }

}

export default new ResourcesService();