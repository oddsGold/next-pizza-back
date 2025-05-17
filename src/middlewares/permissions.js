import { getCachedPermissionsForRole } from '../utils/permissionCache.js';

export const permissions = (resourceName, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.roleId) {
        return res.status(403).json({ message: 'Access denied: No user or role' });
      }

      const permissions = await getCachedPermissionsForRole(user.roleId);

      const allowedActions = permissions[resourceName] || [];

      if (!allowedActions.includes(action)) {
        return res.status(403).json({ message: 'Access denied: Missing permission' });
      }

      next();
    } catch (err) {
      console.error('Authorization error:', err);
      res.status(500).json({ message: 'Server error in authorization' });
    }
  };
}; 