const { redisHashGet, redisHashSet, redisGetAll, redisSetMultiple, flushCache } = require('./utils/operations');

const KEY_PREFIX = 'branches';
const KEY_USER_BRANCHES = `${KEY_PREFIX}-users`;
const KEY_STRUCTURES_BRANCHES = `${KEY_PREFIX}-structures`;

module.exports = class BranchesCacheApi {
  //* 1. Cache User Branches - 'branches-users'
  static async findUserBranchById(id) {    
    const branchFromRedis = await redisHashGet(KEY_USER_BRANCHES, id);
    if (!branchFromRedis) return null;

    const parsedBranch = JSON.parse(branchFromRedis);
    return parsedBranch;
  }
  
  static async createUserBranch(id, data) {    
    const branchFromRedis = await this.findUserBranchById(id);
    if (branchFromRedis) return;

    return redisHashSet(KEY_USER_BRANCHES, id, JSON.stringify(data));
  }

  //* 2. Cache Company Branches - 'branches-{companyId}'
  static async createCompanyBranches(companyId, branches) {
    await redisSetMultiple(`${KEY_PREFIX}-${companyId}`, branches);
  }

  static async getCompanyBranches(companyId) {
    if (companyId) {
      const companyBranchesFromRedis = await redisGetAll(
        `${KEY_PREFIX}-${companyId}`,
      );
      return companyBranchesFromRedis;
    }
    return [];
  }

  //* 2. Cache Company Structured Branches - 'branches-structures-{companyId}'
  static async findStructuredBranch(companyId, branchId) {
    const branchStructureFromRedis = await redisHashGet(
      `${KEY_STRUCTURES_BRANCHES}-${companyId}`,
      branchId,
    );
    if (!branchStructureFromRedis) return null;

    const parsedBranch = JSON.parse(branchStructureFromRedis);
    return parsedBranch;
  }

  static async createStructuredBranch(companyId, branchId, data) {
    const branchStructuredFromRedis = await this.findStructuredBranch(
      companyId,
      branchId,
    );
    if (branchStructuredFromRedis) return null;
    return redisHashSet(
      `${KEY_STRUCTURES_BRANCHES}-${companyId}`,
      branchId,
      JSON.stringify(data),
    );
  }

  //* Deletes all branch caches
  static async removeBranches() {
    await flushCache();
  }
};
