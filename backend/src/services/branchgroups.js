const db = require('../db/models');
const BranchgroupsDBApi = require('../db/api/branchgroups');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class BranchgroupsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const branchgroup = await BranchgroupsDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return JSON.parse(JSON.stringify(branchgroup));
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let branchgroups = await BranchgroupsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!branchgroups) {
        throw new ValidationError(
          'branchgroupsNotFound',
        );
      }

      await BranchgroupsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return branchgroups;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError(
          'errors.forbidden.message',
        );
      }

      await BranchgroupsDBApi.remove(
        id,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

