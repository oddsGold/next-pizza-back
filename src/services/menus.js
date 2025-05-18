import { MenuCollection } from '../db/models/menu.js';
import { RolePermissionCollection } from '../db/models/rolePermission.js';

class MenusService {
  /**
   * Отримує меню для конкретної ролі
   * @param {string} roleId - ID ролі
   * @returns {Promise<Array>} - Дерево меню
   */
  async getMenus(roleId) {
    const allowedPermissionPairs = await this.getAllowedPermissionPairs(roleId);
    const menuMap = await this.buildMenuMap(allowedPermissionPairs);
    return this.buildMenuTree(menuMap);
  }

  /**
   * Отримує дозволені пари (resourceId + permissionId) для ролі
   * @param {string} roleId - ID ролі
   * @returns {Promise<Array<{resource_id: string, permission_id: string}>>}
   */
  async getAllowedPermissionPairs(roleId) {
    const rolePermissions = await RolePermissionCollection.find({ roleId })
      .select('resourceId permissionId')
      .lean();

    return rolePermissions
      .filter(rp => rp.resourceId && rp.permissionId)
      .map(rp => ({
        resource_id: rp.resourceId.toString(),
        permission_id: rp.permissionId.toString()
      }));
  }

  /**
   * Створює мапу меню на основі дозволених permission пар
   * @param {Array<{resource_id: string, permission_id: string}>} allowedPermissionPairs
   * @returns {Promise<Map>} - Мапа меню (id => menu)
   */
  async buildMenuMap(allowedPermissionPairs) {
    const allowedMenus = await this.fetchAllowedMenus(allowedPermissionPairs);
    const menuMap = this.initMenuMap(allowedMenus);
    await this.addParentMenus(menuMap);
    return menuMap;
  }

  /**
   * Отримує дозволені меню з урахуванням пар (resource + permission)
   * @param {Array<{resource_id: string, permission_id: string}>} allowedPermissionPairs
   * @returns {Promise<Array>}
   */
  async fetchAllowedMenus(allowedPermissionPairs) {
    return MenuCollection.find({
      $or: [
        { resource_id: null },
        { permission_id: null },
        {
          $or: allowedPermissionPairs.map(pair => ({
            resource_id: pair.resource_id,
            permission_id: pair.permission_id
          }))
        }
      ]
    }).lean();
  }

  /**
   * Ініціалізує мапу меню з дозволених меню
   * @param {Array} menus
   * @returns {Map}
   */
  initMenuMap(menus) {
    const menuMap = new Map();
    const parentIdsToCheck = new Set();

    menus.forEach(menu => {
      this.normalizeMenuIds(menu);
      menu.children = [];
      menuMap.set(menu._id, menu);
      if (menu.parent_id) {
        parentIdsToCheck.add(menu.parent_id);
      }
    });

    menuMap.parentIdsToCheck = parentIdsToCheck;
    return menuMap;
  }

  /**
   * Додає батьківські меню, які є предками дозволених меню
   * @param {Map} menuMap
   */
  async addParentMenus(menuMap) {
    const parentMenus = await this.fetchParentMenus(menuMap.parentIdsToCheck);

    parentMenus.forEach(parent => {
      const parentId = parent._id.toString();
      if (this.hasChildInMenuMap(parentId, menuMap)) {
        this.normalizeMenuIds(parent);
        parent.children = [];
        menuMap.set(parentId, parent);
      }
    });
  }

  /**
   * Отримує батьківські меню
   * @param {Set<string>} parentIds
   * @returns {Promise<Array>}
   */
  async fetchParentMenus(parentIds) {
    return MenuCollection.find({
      _id: { $in: [...parentIds] }
    }).lean();
  }

  /**
   * Чи має батьківський пункт дочірні в мапі
   * @param {string} parentId
   * @param {Map} menuMap
   * @returns {boolean}
   */
  hasChildInMenuMap(parentId, menuMap) {
    return [...menuMap.values()].some(menu => menu.parent_id === parentId);
  }

  /**
   * Нормалізує всі ID в меню до string
   * @param {Object} menu
   */
  normalizeMenuIds(menu) {
    menu._id = menu._id.toString();
    if (menu.parent_id) menu.parent_id = menu.parent_id.toString();
    if (menu.permission_id) menu.permission_id = menu.permission_id.toString();
    if (menu.resource_id) menu.resource_id = menu.resource_id.toString();
  }

  /**
   * Побудова дерева з мапи меню
   * @param {Map} menuMap
   * @returns {Array}
   */
  buildMenuTree(menuMap) {
    const rootMenus = [];

    menuMap.forEach(menu => {
      if (menu.parent_id && menuMap.has(menu.parent_id)) {
        menuMap.get(menu.parent_id).children.push(menu);
      } else if (!menu.parent_id) {
        rootMenus.push(menu);
      }
    });

    return rootMenus;
  }

  /**
   * Отримує всі кореневі пункти меню
   * @returns {Promise<Array>}
   */
  async getParentMenuItems() {
    return MenuCollection.find({ parent_id: null }).lean();
  }

  /**
   * Додає новий пункт меню
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async addMenuItem(data) {
    const menu = await MenuCollection.create(data);
    return menu.toObject();
  }
}

export default new MenusService();
