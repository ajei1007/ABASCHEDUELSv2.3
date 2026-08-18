const db = require('../db/models');
const GenderconstraintsDBApi = require('../db/api/genderconstraints');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class GenderconstraintsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await GenderconstraintsDBApi.create(
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
      let genderconstraints = await GenderconstraintsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!genderconstraints) {
        throw new ValidationError(
          'genderconstraintsNotFound',
        );
      }

      await GenderconstraintsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return genderconstraints;

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

      await GenderconstraintsDBApi.remove(
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

