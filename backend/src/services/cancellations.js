const db = require('../db/models');
const CancellationsDBApi = require('../db/api/cancellations');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class CancellationsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await CancellationsDBApi.create(
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

  static async createBulk(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await CancellationsDBApi.createBulk(
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
      let existingCancellation = await CancellationsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!existingCancellation) {
        throw new ValidationError(
          'cancellationsNotFound',
        );
      }

      const updatedCancellation = await CancellationsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return {
        newData: {
          data: {
            ...JSON.parse(JSON.stringify(updatedCancellation)),
            event: updatedCancellation.eventId,
            user: updatedCancellation.userId,
            reason: updatedCancellation.reasonId
          },
          id: updatedCancellation.id
        },
        oldData: {
          data: {
            ...JSON.parse(JSON.stringify(existingCancellation)),
            event: existingCancellation.eventId,
            user: existingCancellation.userId,
            reason: existingCancellation.reasonId
          },
          id: existingCancellation.id
        }
      };
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

      await CancellationsDBApi.remove(
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

  static async removeBulk(ids, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError(
          'errors.forbidden.message',
        );
      }

      await CancellationsDBApi.removeBulk(
        ids,
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
