import { RolesCollection } from '../models/resources/role.js';

export const seedRoles = async () => {
  const existingRoles = await RolesCollection.find();
  if (existingRoles.length) {
    console.log('Roles already seeded');
    return;
  }

  const roles = [{ name: 'SuperAdmin' }];

  await RolesCollection.insertMany(roles);
  console.log('Roles seeded successfully ✅');
};
