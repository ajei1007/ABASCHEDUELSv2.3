const db = require('../db/models');
const DataconstraintsDBApi = require('../db/api/dataconstraints');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class DataconstraintsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await DataconstraintsDBApi.create(
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
      let dataconstraints = await DataconstraintsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!dataconstraints) {
        throw new ValidationError(
          'dataconstraintsNotFound',
        );
      }

      await DataconstraintsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return dataconstraints;

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

      await DataconstraintsDBApi.remove(
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

