const db = require('../db/models');
const ConstraintgeneratorDBApi = require('../db/api/constraintgenerator');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class ConstraintgeneratorService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await ConstraintgeneratorDBApi.create(
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
      let constraintgenerator = await ConstraintgeneratorDBApi.findBy(
        {id},
        {transaction},
      );

      if (!constraintgenerator) {
        throw new ValidationError(
          'constraintgeneratorNotFound',
        );
      }

      await ConstraintgeneratorDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return constraintgenerator;

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

      await ConstraintgeneratorDBApi.remove(
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

