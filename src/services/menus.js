import { MenuCollection } from '../db/models/menu.js';
import { RolePermissionCollection } from '../db/models/rolePermission.js';

// Константи для зрозумілих умов
const HEADER_MENU_CONDITION = { resource_id: null };

class MenusService {
  /**
   * Отримує меню для конкретної ролі
   * @param {string} roleId - ID ролі
   * @returns {Promise<Array>} - Дерево меню
   */
  async getMenus(roleId) {
    const allowedPermissionIds = await this.getAllowedPermissionIds(roleId);
    const menuMap = await this.buildMenuMap(allowedPermissionIds);
    return this.buildMenuTree(menuMap);
  }

  /**
   * Отримує дозволені permission IDs для ролі
   * @param {string} roleId - ID ролі
   * @returns {Promise<Array<string>>} - Масив дозволених permission IDs
   */
  async getAllowedPermissionIds(roleId) {
    const rolePermissions = await RolePermissionCollection.find({ roleId })
      .select('permissionId')
      .lean();

    return rolePermissions
      .map(rp => rp.permissionId?.toString())
      .filter(Boolean);
  }

  /**
   * Створює мапу меню на основі дозволених permission IDs
   * @param {Array<string>} allowedPermissionIds - Дозволені permission IDs
   * @returns {Promise<Map>} - Мапа меню (id => menu)
   */
  async buildMenuMap(allowedPermissionIds) {
    const allowedMenus = await this.fetchAllowedMenus(allowedPermissionIds);
    const menuMap = this.initMenuMap(allowedMenus);
    await this.addParentMenus(menuMap);
    return menuMap;
  }

  /**
   * Отримує меню, які мають дозволи
   * @param {Array<string>} allowedPermissionIds - Дозволені permission IDs
   * @returns {Promise<Array>} - Масив дозволених меню
   */
  async fetchAllowedMenus(allowedPermissionIds) {
    return MenuCollection.find({
      permission_id: { $in: allowedPermissionIds }
    }).lean();
  }

  /**
   * Ініціалізує мапу меню з дозволених меню
   * @param {Array} menus - Масив дозволених меню
   * @returns {Map} - Мапа меню (id => menu)
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

    // Зберігаємо для подальшого використання
    menuMap.parentIdsToCheck = parentIdsToCheck;
    return menuMap;
  }

  /**
   * Додає батьківські меню до мапи, якщо вони потрібні
   * @param {Map} menuMap - Мапа меню
   * @returns {Promise<void>}
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
   * @param {Set} parentIds - ID батьківських меню
   * @returns {Promise<Array>} - Масив батьківських меню
   */
  async fetchParentMenus(parentIds) {
    return MenuCollection.find({
      _id: { $in: [...parentIds] },
      ...HEADER_MENU_CONDITION
    }).lean();
  }

  /**
   * Перевіряє, чи є у меню діти в мапі
   * @param {string} parentId - ID батьківського меню
   * @param {Map} menuMap - Мапа меню
   * @returns {boolean}
   */
  hasChildInMenuMap(parentId, menuMap) {
    return [...menuMap.values()].some(menu => menu.parent_id === parentId);
  }

  /**
   * Нормалізує ID в меню (конвертує в строки)
   * @param {Object} menu - Об'єкт меню
   */
  normalizeMenuIds(menu) {
    menu._id = menu._id.toString();
    if (menu.parent_id) menu.parent_id = menu.parent_id.toString();
    if (menu.permission_id) menu.permission_id = menu.permission_id.toString();
  }

  /**
   * Будує дерево меню з мапи
   * @param {Map} menuMap - Мапа меню
   * @returns {Array} - Масив кореневих меню
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

  async getParentMenuItems() {
    return MenuCollection.find({parent_id: null});
  }

  async addMenuItem(data){
    const menu = await MenuCollection.create(data);

    const menuData = menu.toObject();
    return menuData;
  }
}

export default new MenusService();