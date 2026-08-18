const db = require('../db/models');
const NogapsconstraintDBApi = require('../db/api/nogapsconstraint');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class NogapsconstraintService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await NogapsconstraintDBApi.create(
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
      let nogapsconstraint = await NogapsconstraintDBApi.findBy(
        {id},
        {transaction},
      );

      if (!nogapsconstraint) {
        throw new ValidationError(
          'nogapsconstraintNotFound',
        );
      }

      await NogapsconstraintDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return nogapsconstraint;

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

      await NogapsconstraintDBApi.remove(
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

