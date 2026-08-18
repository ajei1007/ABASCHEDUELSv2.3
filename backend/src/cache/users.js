const { redisHashGet, redisHashSet, redisGetAll, redisSetMultiple, flushCache } = require('./utils/operations');
const _ = require('lodash');
const RolesCacheApi = require('./roles');
const BranchesCacheApi = require('./branches');

const KEY_PREFIX = 'users';

module.exports = class UsersCacheApi {
  //* 1. Cache Users - 'users'
  static async findById(id) {    
    const userFromRedis = await redisHashGet(KEY_PREFIX, id)
    if (!userFromRedis) return null;

    const parsedUser = JSON.parse(userFromRedis);
    return parsedUser;
  }

  static async create(id, data) {    
    const userFromRedis = await redisHashGet(KEY_PREFIX, id)
    if (userFromRedis) return

    await redisHashSet(KEY_PREFIX, id, JSON.stringify(data))
  }

  static async findAll () {
    const usersFromRedis = await redisGetAll(KEY_PREFIX)
    return usersFromRedis || null;
  }

  static async createMultiple(arr) {
    await redisSetMultiple(KEY_PREFIX, arr)
  }

  static async updateUser(id, data) {
    let userData = data
    // * Roles
    let userRoleIds = [];
    const userRoles = userData.roles;
    if (userRoles && userRoles.length) {
      for (const role of userRoles) {
        await RolesCacheApi.createUserRole(role.id, role);
        userRoleIds.push(role.id);
      }
    }
    userData.roles = userRoleIds;

    // * Branches
    let userBranchIds = [];
    const userBranches = userData.branches;
    if (userBranches && userBranches.length) {
      for (const branch of userBranches) {
        await BranchesCacheApi.createUserBranch(branch.id, branch);
        userBranchIds.push(branch.id);
      }
    }
    userData.branches = userBranchIds;

    return redisHashSet(KEY_PREFIX, id, JSON.stringify(userData))
  }

  //* Deletes all user caches
  static removeAll() {
    flushCache();
  }
}
