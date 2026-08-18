const db = require('../db/models');
const SubgroupsDBApi = require('../db/api/subgroups');
const ValidationError = require('../services/notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');
const { ValidationError: ApiValidationError, ConflictError } = require('../common/errors');

module.exports = class SubgroupsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {

      let subgroupIdsSameName = await SubgroupsDBApi.findBySubroupName(
        {
          name: data.name,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (subgroupIdsSameName.length > 0) {
        throw new ApiValidationError('There is already a tag with this name');
      }

      let res = await SubgroupsDBApi.create(data, {
        currentUser,
        transaction,
      });

      
      await transaction.commit();
      return res
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let subgroups = await SubgroupsDBApi.findBy({ id, companyId: currentUser.companyId }, { transaction });
      if (!subgroups) {
        throw new ApiValidationError('Tag is not found');
      }

      if (subgroups.group.dataValues.name === 'Funder' || subgroups.group.dataValues.name === 'Matching') {
        throw new ApiValidationError(`You cannot modify ${subgroups.group.dataValues.name} tag`);
      }

      let subgroupIdsSameName = await SubgroupsDBApi.findBySubroupName(
        {
          name: data.name,
        },
        {
          currentUser,
          transaction,
        },
      );
      if (subgroupIdsSameName.length > 0) {
        for (let tag of subgroupIdsSameName) {
          if (tag.id !== id){
            throw new ApiValidationError('There is already a tag with this name');
          }
        }
      }

      await SubgroupsDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return subgroups;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      let subgroups = await SubgroupsDBApi.findBy({ id, companyId: currentUser.companyId}, { transaction });
      if (!subgroups) {
        throw new ApiValidationError('Tag is not found');
      }
      // if it is funder tag, then do not delete it
      // it should be done from Funder user deleting.
      // we are not validating Matching here, because we are using it in SubgroupsService.remove in user update
      if (subgroups.group.dataValues.name === 'Funder') {
        throw new ApiValidationError(`You cannot delete ${subgroups.group.dataValues.name} tag`);
      }

      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ApiValidationError('You are not authorized to delete this tag');
      }

      // If the matching subgroup is being deleted, then it will have
      // related active users while being deleted because it is being
      // deleted from user update route
      if (
        (await SubgroupsDBApi.isRelatedActiveUserExists(id)) &&
        subgroups.group.dataValues.name !== 'Matching'
      ) {
        throw new ApiValidationError("This tag has related users");
      }

      await SubgroupsDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
