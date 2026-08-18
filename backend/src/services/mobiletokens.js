const db = require('../db/models');
const MobiletokensDBApi = require('../db/api/mobiletokens');

module.exports = class MobiletokensService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const mobiletokens = await MobiletokensDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();

      return mobiletokens;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let mobiletokens = await MobiletokensDBApi.findBy(
        {id},
        {transaction},
      );

      if (!mobiletokens) {
        throw new ValidationError(
          'mobiletokensNotFound',
        );
      }

      await MobiletokensDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return mobiletokens;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      await MobiletokensDBApi.remove(
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

