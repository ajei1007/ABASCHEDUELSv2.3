const db = require('../db/models');
const RolegroupsDBApi = require('../db/api/rolegroups');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class RolegroupsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const rolegroup = await RolegroupsDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return JSON.parse(JSON.stringify(rolegroup));
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let rolegroups = await RolegroupsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!rolegroups) {
        throw new ValidationError(
          'rolegroupsNotFound',
        );
      }

      await RolegroupsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return rolegroups;

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

      await RolegroupsDBApi.remove(
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

