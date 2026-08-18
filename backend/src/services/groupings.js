const db = require('../db/models');
const GroupingsDBApi = require('../db/api/groupings');
const SubgroupsDBApi = require('../db/api/subgroups');
const ValidationError = require('../services/notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class GroupingsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let groupingIdsSameName = await GroupingsDBApi.findByGroupingName(
        {
          name: data.name,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (groupingIdsSameName.length > 0) {
        throw new ValidationError('groupings.groupingNameTaken');
      }

      await GroupingsDBApi.create(
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
      let groupings = await GroupingsDBApi.findBy(
        {id},
        {transaction},
      );

      if (!groupings) {
        throw new ValidationError(
          'groupingsNotFound',
        );
      }

      if ((groupings.name !== data.name) && (data.name === 'Matching' || groupings.name === 'Matching')){
        throw new ValidationError('groupings.matchingNameValidation');
      }

      if ((groupings.name !== data.name) && (data.name === 'Funder' || groupings.name === 'Funder')){
        throw new ValidationError('groupings.funderNameValidation');
      }

      let groupingIdsSameName = await GroupingsDBApi.findByGroupingName(
        {
          name: data.name,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (groupingIdsSameName.length > 0) {
        for (let grouping of groupingIdsSameName) {
          if (grouping.id !== id){
            throw new ValidationError('groupings.groupingNameTaken');
          }
        }
      }

      await GroupingsDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return groupings;

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

      // check if there is a tag under this grouping
      const childSubgroup = await SubgroupsDBApi.findBy({
        groupId: id,
      });

      if (childSubgroup){
        throw new ValidationError('groupings.hasChild');
      }

      await GroupingsDBApi.remove(
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

