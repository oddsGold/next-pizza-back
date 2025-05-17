import { seedPermissions } from './permissions.seed.js';
import { seedRoles } from './roles.seed.js';
import { seedUsers } from './users.seed.js';
import { seedResources } from './resources.seed.js';
import { seedRolePermissions } from './rolePermission.seed.js';
import { seedMenu } from './menu.seed.js';


export const seeds = async () => {
  await seedPermissions();
  await seedRoles();
  await seedUsers();
  await seedResources();
  await seedRolePermissions();
  await seedMenu();
};
