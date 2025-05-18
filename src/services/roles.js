import { RolesCollection } from '../db/models/resources/role.js';

class RolesService {

  async getRoles(){
    return RolesCollection.find().lean();
  }

}

export default new RolesService();
