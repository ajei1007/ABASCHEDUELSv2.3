const db = require('../db/models');
const RolesDBApi = require('../db/api/roles');
const ValidationError = require('../services/notifications/errors/validation');
const { ValidationError: ApiValidationError, NotFoundError } = require('../common/errors');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');
const { ROOT_ROLE_NAMES } = require('../constants/roles');
const { Op } = require('sequelize');
const SettingsCompanyDBApi = require('../db/api/settingscompany');
const UsersDBApi = require('../db/api/users');
const ChatService = require('../services/chat/chat');
const { getRolesAndDescendants } = require('../utils/roleHierarchy');
const CompanyChatFeatureDisabledException = require('../exceptions/company-chat-feature-disabled.exception');

module.exports = class RolesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const existingRole = await RolesDBApi.findBy({
        name: data.name,
        companyId: currentUser.companyId,
      }, {transaction});

      if (existingRole) {
        throw new ApiValidationError(
          `Role with name '${data.name}' already exists for this company`
        );      
      }
      
      await RolesDBApi.create(
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
  static async update(data, id, currentUser, activeTransaction) {
    const transaction = activeTransaction || await db.sequelize.transaction();
    try {
      const existingRole = await RolesDBApi.findBy({
        name: data.name,
        companyId: currentUser.companyId,
        id: {
          [Op.ne]: id
        }
      }, {transaction});

      if (existingRole) {
        throw new ApiValidationError(
          `Role with name '${data.name}' already exists for this company`
        );
      }

      let role = await RolesDBApi.findBy(
        {id},
        {transaction},
      );

      if (!role) {
        throw new NotFoundError('Role not found');
      }

      const chatFeature = data.chatFeature;
      const settingscompany = await SettingsCompanyDBApi.findByCompanyId(
        currentUser.companyId,
        {
          transaction,
        }
      );

      if (chatFeature && !settingscompany.chatEnabled) {
        throw new CompanyChatFeatureDisabledException();
      }

      await RolesDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      if (!activeTransaction) {
        await transaction.commit();
      }

      try {
        await RolesService.syncRoleChatStatus(
          currentUser.companyId,
          id,
        );
      } catch (error) {
        console.log('Error syncing chat status', error);
      }

      return role;

    } catch (error) {
      if (!activeTransaction) {
        await transaction.rollback();
      }
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

      let activeUserNumberOfBranch = await RolesDBApi.findRelatedActiveUserNumber(id)
      if (activeUserNumberOfBranch > 0){
        throw new ApiValidationError('Role has related active users');
      }

      const role = await RolesDBApi.findBy(
        { id, companyId: currentUser.companyId },
        {
          transaction,
          attributes: ['id', 'name'],
        }
      );
      if (!role) {
        throw new NotFoundError('Role not found');
      }
      if (ROOT_ROLE_NAMES.includes(role.name)) {
        throw new ApiValidationError(
          'Cannot delete a root role. Root roles ' +
          '(Employee, Client, Location, Activity, Funder) are required by the system.'
        );
      }

      await RolesDBApi.remove(
        id,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();

      try {
        await RolesService.syncRoleChatStatus(
          currentUser.companyId,
          id,
          true
        );
      } catch (error) {
        console.log('Error syncing chat status', error);
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async syncRoleChatStatus(companyId, roleId, isRemoving = false) {
    if (isRemoving) {
      await this.syncChatUsersAfterRoleRemoval(companyId);
      return;
    }

    const role = await RolesDBApi.findBy(
      { id: roleId },
      {
        attributes: ['id', 'name', 'parentId', 'chatFeature'],
      }
    );
    if(!role) return;
    const chatFeatureFlag = role.chatFeature;

    if (chatFeatureFlag) {
      const roleAndDescendants = await getRolesAndDescendants(companyId, [role.name]);

      const users = await UsersDBApi.findUsersByRoles(
        roleAndDescendants,
      );

      await ChatService.upsertUsers(users);
    } else {
      const rolesWithChatEnabled = await RolesDBApi.findAll(
        {
          companyId,
          chatFeature: true,
        },
      );
  
      const chatEnabledRolesAndDescendants = await getRolesAndDescendants(
        companyId,
        rolesWithChatEnabled.rows.map(role => role.name)
      );

      // Upsert users that inherit chat feature from one of the roles
      const usersInChatEnabledRoles = await UsersDBApi.findUsersByRoles(
        chatEnabledRolesAndDescendants,
      );
      await ChatService.upsertUsers(usersInChatEnabledRoles);
      
      // Delete users that do not inherit chat feature from any role
      const usersNotInChatEnabledRoles = await UsersDBApi.findUsersNotInRoles(
        companyId,
        chatEnabledRolesAndDescendants,
      );
      
      const userIds = usersNotInChatEnabledRoles.map(user => user.id);
      await ChatService.deleteUsersIfExists(userIds);  
    }
  }

  static async syncChatUsersAfterRoleRemoval(companyId, transaction) {
    const rolesWithChatEnabled = await RolesDBApi.findAll(
      {
        companyId,
        chatFeature: true,
      },
      { transaction },
    );

    const chatEnabledRolesAndDescendants = await getRolesAndDescendants(
      companyId,
      rolesWithChatEnabled.rows.map(role => role.name)
    );

    const usersNotInChatEnabledRoles = await UsersDBApi.findUsersNotInRoles(
      companyId,
      chatEnabledRolesAndDescendants,
      { transaction },
    );

    const userIds = usersNotInChatEnabledRoles.map(user => user.id);
    await ChatService.deleteUsersIfExists(userIds);
  }
};

