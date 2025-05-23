import { RolesCollection } from '../db/models/resources/role.js';

class RolesService {

  async getRoles(){
    return RolesCollection.find().lean();
  }

  async addNewRole(data) {
    const role = await RolesCollection.create(data);

    return role.toObject();
  }

  async deleteRole(id) {
    return RolesCollection.deleteOne({ _id: id });
  }

}

export default new RolesService();
