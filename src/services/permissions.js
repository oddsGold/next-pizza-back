import { RolePermissionCollection } from '../db/models/rolePermission.js';
import { PermissionsCollection } from '../db/models/resources/permission.js';

class PermissionsService {

  /**
   * Отримує список прав доступу для заданої ролі.
   * Повертає масив об'єктів, де кожен описує ресурс і дію (право).
   *
   * @async
   * @function getPermissionsByRole
   * @param {string} roleId - Ідентифікатор ролі, для якої потрібно отримати права.
   * @returns {Promise<Array<Object>>} Масив об'єктів з правами:
   * [{
   *   resource: string, // slug або name ресурсу
   *   action: string, // дія (action) права
   *   label: string // мітка (label) права
   * }]
   */
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

  /**
   * Додає нові права доступу для ролі на ресурс.
   * Якщо передано масив permissionId, то додаються всі нові права, яких ще не існує.
   * Якщо передано один permissionId — додає тільки його, якщо ще не існує.
   *
   * @async
   * @function addPermission
   * @param {Object} data - Дані для створення прав.
   * @param {string} data.roleId - ID ролі, якій додаються права.
   * @param {string|string[]} data.permissionId - ID одного або кількох permission-документів.
   * @param {string} data.resourceId - ID ресурсу, до якого належать права.
   * @returns {Promise<Object|Object[]|null>} Об'єкт (або масив об'єктів) нових прав, які були додані.
   * Якщо жодного нового права не додано — повертає `[]` або `null`, якщо вже існує.
   */
  async addPermission(data) {
    const { roleId, permissionId, resourceId } = data;

    if (Array.isArray(permissionId)) {
      const existing = await RolePermissionCollection.find({
        roleId,
        resourceId,
        permissionId: { $in: permissionId },
      }).select('permissionId');

      const existingIds = new Set(existing.map(p => p.permissionId.toString()));

      const toInsert = permissionId.filter(id => !existingIds.has(id)).map(id => ({
        roleId,
        permissionId: id,
        resourceId,
      }));

      if (toInsert.length > 0) {
        const inserted = await RolePermissionCollection.insertMany(toInsert);
        return inserted.map(p => p.toObject());
      }

      return [];
    }

    const existing = await RolePermissionCollection.findOne({
      roleId,
      resourceId,
      permissionId,
    });

    if (existing) {
      return null;
    }

    const permission = await RolePermissionCollection.create({
      roleId,
      permissionId,
      resourceId,
    });

    return permission.toObject();
  }

  /**
   * Отримує всі права доступу, згруповані за роллю та ресурсом.
   * Для кожної групи повертає роль, ресурс і масив прав.
   *
   * @async
   * @function getAllPermissions
   * @returns {Promise<Array<Object>>} Масив об'єктів із групованими правами доступу:
   * [{
   *   roleId: string,
   *   roleName: string,
   *   resourceId: string,
   *   resourceName: string,
   *   resourceLabel: string,
   *   permissions: Array<{ _id: string, action: string, label: string }>
   * }]
   */
  async getAllPermissions() {
    const permissions = await RolePermissionCollection.find()
      .populate('roleId', 'name')
      .populate('resourceId', 'name label')
      .populate('permissionId', 'action label')
      .lean();

    const grouped = {};

    for (const p of permissions) {
      const key = `${p.roleId._id}_${p.resourceId._id}`;

      if (!grouped[key]) {
        grouped[key] = {
          roleId: p.roleId._id,
          roleName: p.roleId.name,
          resourceId: p.resourceId._id,
          resourceName: p.resourceId.name,
          resourceLabel: p.resourceId.label,
          permissions: [],
        };
      }

      grouped[key].permissions.push({
        _id: p.permissionId._id,
        action: p.permissionId.action,
        label: p.permissionId.label,
      });
    }

    return Object.values(grouped);
  }

  /**
   * Отримати всі дозволи для заданої ролі і ресурса
   *
   *  @async
   *  @function getPermissionByRoleAndResource
   *  @param {string} roleId - Ідентифікатор ролі.
   *  @param {string} resourceId - Ідентифікатор ресурсу.
   *  @returns {Promise<Object>} Об’єкт з інформацією про роль, ресурс та список дозволів.
   *  @returns {string} return.roleId - Ідентифікатор ролі.
   *  @returns {string|null} return.roleName - Назва ролі або null, якщо не знайдено.
   *  @returns {string} return.resourceId - Ідентифікатор ресурсу.
   *  @returns {string|null} return.resourceName - Назва ресурсу або null, якщо не знайдено.
   *  @returns {string|null} return.resourceLabel - Позначка ресурсу або null, якщо не знайдено.
   *  @returns {Array<Object>} return.permissions - Масив об’єктів дозволів.
   *  @returns {string} return.permissions._id - Ідентифікатор дозволу.
   *  @returns {string} return.permissions.action - Дія дозволу.
   *  @returns {string} return.permissions.label - Позначка дозволу.
   */
  async permissionByRoleAndResource(roleId, resourceId) {
    const permissions = await RolePermissionCollection.find({
      roleId,
      resourceId,
    })
      .populate('roleId', 'name')
      .populate('resourceId', 'name label')
      .populate('permissionId', 'action label')
      .lean();

    return {
      roleId,
      resourceId,
      permissionId: permissions.map(p => ({
        _id: p.permissionId._id,
        action: p.permissionId.action,
        label: p.permissionId.label,
      })),
    };
  }

  /**
   * Оновлює список permission'ів для ролі на конкретний ресурс.
   * Видаляє всі старі permission'и, які не входять у новий список, і додає нові.
   *
   * @param {string} roleId - ID ролі.
   * @param {string} resourceId - ID ресурсу.
   * @param {string[]} permissionId - Массив ID permission'ів.
   * @returns {Promise<Object>} Відповідь з оновленими правами в згрупованому вигляді.
   */
  async updatePermissions(roleId, resourceId, permissionId) {
    await RolePermissionCollection.deleteMany({
      roleId,
      resourceId,
      permissionId: { $nin: permissionId },
    });

    const existing = await RolePermissionCollection.find({
      roleId,
      resourceId,
      permissionId: { $in: permissionId },
    }).select('permissionId');

    const existingIds = new Set(existing.map(p => p.permissionId.toString()));

    const toInsert = permissionId
      .filter(id => !existingIds.has(id))
      .map(id => ({ roleId, resourceId, permissionId: id }));

    if (toInsert.length > 0) {
      await RolePermissionCollection.insertMany(toInsert);
    }

    const permissions = await RolePermissionCollection.find({
      roleId,
      resourceId,
    })
      .populate('roleId', 'name')
      .populate('resourceId', 'name label')
      .populate('permissionId', 'action label')
      .lean();

    return {
      roleId,
      resourceId,
      permissionId: permissions.map(p => ({
        _id: p.permissionId._id,
        action: p.permissionId.action,
        label: p.permissionId.label,
      })),
    };
  }

  async deletePermissions(roleId, resourceId) {
    return RolePermissionCollection.deleteMany({
      roleId,
      resourceId,
    });
  }

}

export default new PermissionsService();
