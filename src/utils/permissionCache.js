import { redisClient } from '../db/initRedis.js';
import { RolePermissionCollection } from '../db/models/rolePermission.js';

export const getCachedPermissionsForRole = async (roleId) => {
  const cacheKey = `role_permissions:${roleId}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  // Якщо немає в кеші — отримуємо з БД
  const permissions = await RolePermissionCollection.find({ roleId })
    .populate('permissionId')
    .populate('resourceId');

  // Трансформуємо у просту структуру: { [resourceName]: [actions] }
  const structured = {};

  permissions.forEach(({ permissionId, resourceId }) => {
    const resourceName = resourceId.name;
    const action = permissionId.action;

    if (!structured[resourceName]) {
      structured[resourceName] = [];
    }

    structured[resourceName].push(action);
  });

  // Кешуємо на 1 годину (3600 сек)
  await redisClient.set(cacheKey, JSON.stringify(structured), 'EX', 3600);

  return structured;
};
