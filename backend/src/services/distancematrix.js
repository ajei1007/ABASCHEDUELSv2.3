const db = require('../db/models');
const DistancematrixDBApi = require('../db/api/distancematrix');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class DistancematrixService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await DistancematrixDBApi.create(
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
      let distancematrix = await DistancematrixDBApi.findBy(
        {id},
        {transaction},
      );

      if (!distancematrix) {
        throw new ValidationError(
          'distancematrixNotFound',
        );
      }

      await DistancematrixDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return distancematrix;

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

      await DistancematrixDBApi.remove(
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

