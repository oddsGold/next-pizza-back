import { RolePermissionCollection } from '../db/models/rolePermission.js';
import { PermissionsCollection } from '../db/models/resources/permission.js';

class PermissionsService {
  async getPermissionsByRole(roleId) {
    const rolePermissions = await RolePermissionCollection.find({ roleId })
      .populate('permissionId')
      .populate('resourceId')
      .lean();

    const permissions = rolePermissions
      .filter(rp => rp.permissionId && rp.resourceId)
      .map(rp => ({
        resource: rp.resourceId.slug || rp.resourceId.name,
        action: rp.permissionId.action,
        label: rp.permissionId.label,
      }));

    return permissions;
  }

  async getPermissions(){
    return PermissionsCollection.find().lean();
  }

}

export default new PermissionsService();
