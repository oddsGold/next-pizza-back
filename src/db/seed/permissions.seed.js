import { PermissionsCollection } from '../models/resources/permission.js';

export const seedPermissions = async () => {
  const existing = await PermissionsCollection.find();
  if (existing.length) {
    console.log('Permissions already seeded');
    return;
  }

  const permissions = [
    { action: 'create', label: 'Створити' },
    { action: 'read', label: 'Переглянути' },
    { action: 'update', label: 'Редагувати' },
    { action: 'delete', label: 'Видалити' },
    { action: 'upload', label: 'Завантажити' },
  ];

  await PermissionsCollection.insertMany(permissions);
  console.log('Permissions seeded successfully ✅');
};
