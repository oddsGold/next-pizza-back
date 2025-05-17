import { MenuCollection } from '../models/menu.js';
import { ResourcesCollection } from '../models/resource.js';
import { PermissionsCollection } from '../models/resources/permission.js';

export const seedMenu = async () => {
  const existingMain = await MenuCollection.findOne({ name: 'Меню', parent_id: null });
  if (existingMain) {
    console.log('Головне меню вже існує');
    return;
  }

  // Створюємо головне меню
  const mainMenu = await MenuCollection.create({
    name: 'Меню',
    urn: null,
    parent_id: null,
    resource_id: null,
    permission_id: null,
  });

  const resource = await ResourcesCollection.findOne({ name: 'Models\\Menu' });
  if (!resource) {
    console.error('❌ Ресурс "Models\\Menu" не знайдено. Спочатку виконай seedResources.');
    return;
  }

  const createPermission = await PermissionsCollection.findOne({ action: 'create' });
  const readPermission = await PermissionsCollection.findOne({ action: 'read' });

  if (!createPermission || !readPermission) {
    console.error('❌ Не знайдені необхідні пермішени. Спочатку виконай seedPermissions.');
    return;
  }

  await MenuCollection.create({
    name: 'Додати новий пункт',
    urn: '/admin/menu/create',
    parent_id: mainMenu._id,
    resource_id: resource._id,
    permission_id: createPermission._id,
  });

  console.log('✅ Підпункт "Додати новий пункт" створено');

  await MenuCollection.create({
    name: 'Всі пункти меню',
    urn: '/admin/menu',
    parent_id: mainMenu._id,
    resource_id: resource._id,
    permission_id: readPermission._id,
  });

  const permission = await MenuCollection.create({
    name: 'Права доступу',
    urn: null,
    parent_id: null,
    resource_id: null,
    permission_id: null,
  });

  console.log('✅ Меню права доступу створено');

  const resourcePermission = await ResourcesCollection.findOne({ name: 'Models\\Permission' });
  if (!resourcePermission) {
    console.error('❌ Ресурс "Models\\Permission" не знайдено. Спочатку виконай seedResources.');
    return;
  }

  await MenuCollection.create({
    name: 'Надати права доступу',
    urn: '/admin/permission/create',
    parent_id: permission._id,
    resource_id: resourcePermission._id,
    permission_id: createPermission._id,
  });

  await MenuCollection.create({
    name: 'Переглянути права доступу',
    urn: '/admin/permission',
    parent_id: permission._id,
    resource_id: resourcePermission._id,
    permission_id: readPermission._id,
  });
  console.log('✅ Підпункт "Всі пункти меню" створено');
};