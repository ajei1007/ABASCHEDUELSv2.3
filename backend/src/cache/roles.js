const { redisHashGet, redisHashSet, redisGetAll, redisSetMultiple, redisSet, redisGet, flushCache } = require('./utils/operations');

const KEY_PREFIX = 'roles';
const KEY_ROLE_HIERARCHY = 'role-hierarchy';

module.exports = class RolesCacheApi {
  //* 1. Cache User Roles - 'roles-users'
  static async findUserRoleById(id) {    
    const roleFromRedis = await redisHashGet(`${KEY_PREFIX}-users`, id);
    return roleFromRedis ? JSON.parse(roleFromRedis) : null;
  }
  
  static async createUserRole(id, data) {    
    const roleFromRedis = await this.findUserRoleById(id);
    if (roleFromRedis) return;
    return redisHashSet(`${KEY_PREFIX}-users`, id, JSON.stringify(data))
  }

  //* 2. Cache All Roles - 'roles'
  static async createMultiple(arr) {
    await redisSetMultiple(KEY_PREFIX, arr)
  }

  static async findAll() {
    const rolesFromRedis = await redisGetAll(KEY_PREFIX)
    return rolesFromRedis || [];
  }

  //* 3. Cache Company Roles - 'roles-{companyId}'
  static async createCompanyRoles(companyId, roles) {
    await redisSetMultiple(`${KEY_PREFIX}-${companyId}`, roles)
  }

  static async getCompanyRoles(companyId) {
    if (companyId) {
      const companyRolesFromRedis = await redisGetAll(`${KEY_PREFIX}-${companyId}`);
      return companyRolesFromRedis || [];
    }
    return [];
  }

  //* 4. Cache Company Role Hierarchy - 'role-hierarchy-{companyId}'
  static async findRoleHierarchy(companyId) {
    const roleHierarchyFromRedis = await redisGet(`${KEY_ROLE_HIERARCHY}-${companyId}`);
    return roleHierarchyFromRedis ? JSON.parse(roleHierarchyFromRedis) : null;
  }

  static async createRoleHierarchy(companyId, data) {
    const roleHierarchyFromRedis = await this.findRoleHierarchy(companyId);
    if (roleHierarchyFromRedis) return;
    return redisSet(`${KEY_ROLE_HIERARCHY}-${companyId}`, JSON.stringify(data))
  }

  //* Deletes all roles caches
  static removeRoles() {
    flushCache();
  }
}
