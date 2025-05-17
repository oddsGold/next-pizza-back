import { redisClient } from '../db/initRedis.js';
import { RolePermissionCollection } from '../db/models/rolePermission.js';

const checkPermission = (action, resourceName) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const cacheKey = `permissions:${user.roleId}`;
    let permissions = await redisClient.get(cacheKey);

    if (permissions) {
      permissions = JSON.parse(permissions);
    } else {
      const rolePermissions = await RolePermissionCollection.find({ roleId: user.roleId })
        .populate('permissionId')
        .populate('resourceId');

      permissions = rolePermissions.map(rp => ({
        action: rp.permissionId.action,
        resource: rp.resourceId.name,
      }));

      await redisClient.set(cacheKey, JSON.stringify(permissions), {
        EX: 3600,
      }); // 1 hour
    }

    const hasPermission = permissions.some(p => p.action === action && p.resource === resourceName);

    if (!hasPermission) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

export default checkPermission;