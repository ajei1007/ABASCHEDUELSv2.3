const db = require('../db/models');
const BranchesDBApi = require('../db/api/branches');
const BranchtypeDBApi = require('../db/api/branchtype');
const ValidationError = require('../services/notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class BranchesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let branchIdsSameName = await BranchesDBApi.findByBranchName(
        {
          name: data.name,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (branchIdsSameName.length > 0) {
        throw new ValidationError('branches.branchNameTaken');
      }

      if (data.id === data.name) {
        throw new ValidationError('branches.invalidBranchName');
      }

      if (data.parent && data.branchType) {
        let parentBranch = await BranchesDBApi.findBy(
          { id: data.parent },
          { transaction },
        );

        let decendentBrancheTypes =
          await BranchtypeDBApi.getDescendentBrancheTypes({
            branchTypeIds: data.branchType,
          });

        if (parentBranch.branchType) {
          if (
            decendentBrancheTypes.includes(
              parentBranch.branchType.dataValues.id,
            )
          ) {
            throw new ValidationError('branches.breakTypeParentStructure');
          }
        }
      }

      const branch = await BranchesDBApi.create(data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return branch;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let branches = await BranchesDBApi.findBy({ id }, { transaction });

      if (!branches) {
        throw new ValidationError('branches.notFound');
      }

      // get all descendent branches for checking if it breakes the structure
      let decendentBranches = await BranchesDBApi.getDescendentBranches({
        branchIds: id,
      });

      if (decendentBranches.includes(data.parent)) {
        throw new ValidationError('branches.breakStructure');
      }

      // get branches with same name for checking the UNIQUENESS on name
      let branchIdsSameName = await BranchesDBApi.findByBranchName(
        {
          name: data.name,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (branchIdsSameName.length > 0) {
        for (let branch of branchIdsSameName) {
          if (branch.id !== id) {
            throw new ValidationError('branches.branchNameTaken');
          }
        }
      }

      // check if the branch name is equal to its id
      if (id === data.name) {
        throw new ValidationError('branches.invalidBranchName');
      }

      // check if the branchtype is breaking with parent's branch
      if (data.parent && data.branchType) {
        let parentBranch = await BranchesDBApi.findBy(
          { id: data.parent },
          { transaction },
        );

        let descendentBrancheTypes =
          await BranchtypeDBApi.getDescendentBrancheTypes({
            branchTypeIds: data.branchType,
          });

        // if parent branchtype is in descendent branchtypes then 
        // Parent has lower branchtype
        if (parentBranch.branchType) {
          if (
            descendentBrancheTypes.includes(
              parentBranch.branchType.dataValues.id,
            )
          ) {
            throw new ValidationError('branches.breakTypeParentStructure');
          }
        }
      }

      // check if the branchtype is breaking with children branch
      if (data.branchType) {
        let childrenBranchBranchTypes =
          await BranchesDBApi.getChildrenBranchtypes({ branchId: id });

        let descendentBrancheTypesOfChildren =
          await BranchtypeDBApi.getDescendentBrancheTypes({
            branchTypeIds: childrenBranchBranchTypes.map(
              (bt) => bt.branchTypeId,
            ).join('|'),
          });
          
          // if the brnachtype is in children branchtypes descendents then
          // One of the children branch has higher branchtype
          if (
            descendentBrancheTypesOfChildren.includes(
              data.branchType
            )
          ) {
            throw new ValidationError('branches.breakTypeChildStructure');
          }
      }

      await BranchesDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return branches;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError('errors.forbidden.message');
      }

      let activeUserNumberOfBranch = await BranchesDBApi.findRelatedActiveUserNumber(id);
      if (activeUserNumberOfBranch > 0){
        throw new ValidationError('branches.hasActiveUsers');
      }
    
      await BranchesDBApi.remove(id, {
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
