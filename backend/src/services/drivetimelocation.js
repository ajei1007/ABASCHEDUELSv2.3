const db = require('../db/models');
const DrivetimelocationDBApi = require('../db/api/drivetimelocation');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class DrivetimelocationService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await DrivetimelocationDBApi.create(
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
      let drivetimelocation = await DrivetimelocationDBApi.findBy(
        {id},
        {transaction},
      );

      if (!drivetimelocation) {
        throw new ValidationError(
          'drivetimelocationNotFound',
        );
      }

      await DrivetimelocationDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return drivetimelocation;

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

      await DrivetimelocationDBApi.remove(
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

