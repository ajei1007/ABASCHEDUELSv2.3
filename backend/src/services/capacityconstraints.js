const db = require('../db/models');
const CapacityconstraintsDBApi = require('../db/api/capacityconstraints');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class CapacityconstraintsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await CapacityconstraintsDBApi.create(
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
      let capacityconstraints = await CapacityconstraintsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!capacityconstraints) {
        throw new ValidationError(
          'capacityconstraintsNotFound',
        );
      }

      await CapacityconstraintsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return capacityconstraints;

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

      await CapacityconstraintsDBApi.remove(
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

