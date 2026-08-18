const db = require('../db/models');
const TimeconstraintsDBApi = require('../db/api/timeconstraints');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class TimeconstraintsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await TimeconstraintsDBApi.create(
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
      let timeconstraints = await TimeconstraintsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!timeconstraints) {
        throw new ValidationError(
          'timeconstraintsNotFound',
        );
      }

      await TimeconstraintsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return timeconstraints;

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

      await TimeconstraintsDBApi.remove(
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

