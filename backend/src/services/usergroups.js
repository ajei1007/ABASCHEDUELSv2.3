const db = require('../db/models');
const UsergroupsDBApi = require('../db/api/usergroups');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class UsergroupsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const usergroup = await UsergroupsDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return JSON.parse(JSON.stringify(usergroup));
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let usergroups = await UsergroupsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!usergroups) {
        throw new ValidationError(
          'usergroupsNotFound',
        );
      }

      await UsergroupsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return usergroups;

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

      await UsergroupsDBApi.remove(
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

