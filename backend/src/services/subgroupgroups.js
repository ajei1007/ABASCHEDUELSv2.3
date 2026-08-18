const db = require('../db/models');
const SubgroupgroupsDBApi = require('../db/api/subgroupgroups');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class SubgroupgroupsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const subgroupgroup = await SubgroupgroupsDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return JSON.parse(JSON.stringify(subgroupgroup));
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let subgroupgroups = await SubgroupgroupsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!subgroupgroups) {
        throw new ValidationError(
          'subgroupgroupsNotFound',
        );
      }

      await SubgroupgroupsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return subgroupgroups;

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

      await SubgroupgroupsDBApi.remove(
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

