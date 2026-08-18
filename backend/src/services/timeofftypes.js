const db = require('../db/models');
const TimeofftypesDBApi = require('../db/api/timeofftypes');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class TimeofftypesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await TimeofftypesDBApi.create(
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
      let timeofftypes = await TimeofftypesDBApi.findBy(
        {id},
        {transaction},
      );

      if (!timeofftypes) {
        throw new ValidationError(
          'timeofftypesNotFound',
        );
      }

      await TimeofftypesDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return timeofftypes;

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

      await TimeofftypesDBApi.remove(
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

