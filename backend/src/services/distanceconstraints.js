const db = require('../db/models');
const DistanceconstraintsDBApi = require('../db/api/distanceconstraints');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class DistanceconstraintsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await DistanceconstraintsDBApi.create(
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
      let distanceconstraints = await DistanceconstraintsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!distanceconstraints) {
        throw new ValidationError(
          'distanceconstraintsNotFound',
        );
      }

      await DistanceconstraintsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return distanceconstraints;

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

      await DistanceconstraintsDBApi.remove(
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

