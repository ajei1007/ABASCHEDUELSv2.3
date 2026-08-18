const db = require('../db/models');
const CancellationtypesDBApi = require('../db/api/cancellationtypes');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class CancellationtypesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await CancellationtypesDBApi.create(
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
      let cancellationtypes = await CancellationtypesDBApi.findBy(
        {id},
        {transaction},
      );

      if (!cancellationtypes) {
        throw new ValidationError(
          'cancellationtypesNotFound',
        );
      }

      await CancellationtypesDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return cancellationtypes;

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

      await CancellationtypesDBApi.remove(
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

