const db = require('../db/models');
const BranchtypeDBApi = require('../db/api/branchtype');
const ValidationError = require('../services/notifications/errors/validation');

module.exports = class BranchtypeService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let branchtypeIdsSameName = await BranchtypeDBApi.findByBranchtypeName(
        {
          name: data.name,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (branchtypeIdsSameName.length > 0) {
        throw new ValidationError('branchetypes.branchtypeNameTaken')
      }

      await BranchtypeDBApi.create(
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
      let branchtype = await BranchtypeDBApi.findBy(
        {id},
        {transaction},
      );

      if (!branchtype) {
        throw new ValidationError(
          'branchetypes.notFound',
        );
      }

      let decendentBrancheTypes = await BranchtypeDBApi.getDescendentBrancheTypes({
        branchTypeIds: id,
      });

      if (decendentBrancheTypes.includes(data.parent)) {
        throw new ValidationError('branchetypes.breakStructure');
      }

      let branchtypeIdsSameName = await BranchtypeDBApi.findByBranchtypeName(
        {
          name: data.name,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (branchtypeIdsSameName.length > 0) {
        for (let branchtype of branchtypeIdsSameName) {
          if (branchtype.id !== id){
            throw new ValidationError('branchetypes.branchtypeNameTaken');
          }
        }
      }

      await BranchtypeDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return branchtype;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {      
      await BranchtypeDBApi.remove(
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

