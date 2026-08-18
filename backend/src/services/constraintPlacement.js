const db = require('../db/models');
const ConstraintPlacementDBApi = require('../db/api/constraintPlacement');

module.exports = class ConstraintPlacementService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const constraintPlacement = await ConstraintPlacementDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return constraintPlacement;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let constraintPlacement = await ConstraintPlacementDBApi.findBy(
        { id },
        { transaction},
      );

      if (!constraintPlacement) {
        throw 'Constraint Placement not found!';
      }

      await ConstraintPlacementDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return true;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
};