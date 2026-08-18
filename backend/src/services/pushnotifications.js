const db = require('../db/models');
const PushnotificationsDBApi = require('../db/api/pushnotifications');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class PushnotificationsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const pushNotification = await PushnotificationsDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return JSON.parse(JSON.stringify(pushNotification));
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let pushnotifications = await PushnotificationsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!pushnotifications) {
        throw new ValidationError(
          'pushnotificationsNotFound',
        );
      }

      await PushnotificationsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return pushnotifications;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  static async checkBulk(ids, currentUser) {
    // Start a transaction
    const transaction = await db.sequelize.transaction();
    try {
      // Check if 'ids' is an array and has elements
      if (!Array.isArray(ids) || !ids.length) {
        await transaction.commit();
        return true
      }

      await PushnotificationsDBApi.checkBulk(
        ids, 
        {currentUser, transaction}
      );

      await transaction.commit();
      return true
    } catch (error) {
      await transaction.rollback();
      throw error; 
    }
  }


  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError(
          'errors.forbidden.message',
        );
      }

      await PushnotificationsDBApi.remove(
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

