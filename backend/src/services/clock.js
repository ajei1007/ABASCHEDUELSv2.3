const db = require('../db/models');
const ClockDBApi = require('../db/api/clock');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class ClockService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const clock = await ClockDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return clock;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let clock = await ClockDBApi.findBy(
        {id},
        {transaction},
      );

      if (!clock) {
        throw new ValidationError(
          'clockNotFound',
        );
      }

      const updatedClock = await ClockDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return updatedClock;

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

      await ClockDBApi.remove(
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

