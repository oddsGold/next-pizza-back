import { RolePermissionCollection } from '../models/rolePermission.js';
import { RolesCollection } from '../models/resources/role.js';
import { PermissionsCollection } from '../models/resources/permission.js';
import { ResourcesCollection } from '../models/resource.js';

export const seedRolePermissions = async () => {
  const role = await RolesCollection.findOne({ name: 'SuperAdmin' });
  if (!role) {
    console.log('❌ Missing required role: SuperAdmin');
    return;
  }

  // Масив ресурсів, для яких треба створити записи
  const resourceNames = ['Models\\Menu', 'Models\\Permission'];

  const permissions = await PermissionsCollection.find();
  if (!permissions.length) {
    console.log('❌ No permissions found');
    return;
  }

  for (const resourceName of resourceNames) {
    const resource = await ResourcesCollection.findOne({ name: resourceName });
    if (!resource) {
      console.log(`❌ Resource not found: ${resourceName}`);
      continue;
    }

    const existing = await RolePermissionCollection.findOne({
      roleId: role._id,
      resourceId: resource._id,
    });

    if (existing) {
      console.log(`Role permissions already seeded for resource ${resourceName}`);
      continue;
    }

    const rolePermissions = permissions.map(permission => ({
      roleId: role._id,
      permissionId: permission._id,
      resourceId: resource._id,
    }));

    await RolePermissionCollection.insertMany(rolePermissions);
    console.log(`Role permissions seeded successfully for resource ${resourceName} ✅`);
  }
};
