const db = require('../db/models');
const DrivetimebranchDBApi = require('../db/api/drivetimebranch');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class DrivetimebranchService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await DrivetimebranchDBApi.create(
        data,
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
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let drivetimebranch = await DrivetimebranchDBApi.findBy(
        {id},
        {transaction},
      );

      if (!drivetimebranch) {
        throw new ValidationError(
          'drivetimebranchNotFound',
        );
      }

      await DrivetimebranchDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return drivetimebranch;

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

      await DrivetimebranchDBApi.remove(
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

