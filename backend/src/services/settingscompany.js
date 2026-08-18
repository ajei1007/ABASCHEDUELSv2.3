const db = require('../db/models');
const SettingscompanyDBApi = require('../db/api/settingscompany');
const { ValidationError, UnauthorizedError } = require('../common/errors');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');
const RolesService = require('./roles');
const RolesDBApi = require('../db/api/roles');

module.exports = class SettingscompanyService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const settingscompany = await SettingscompanyDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return settingscompany;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser, activeTransaction) {
    const transaction = activeTransaction || await db.sequelize.transaction();
    try {
      let settingscompany = await SettingscompanyDBApi.findBy(
        {id},
        {transaction},
      );

      if (!settingscompany) {
        throw new ValidationError(
          'Settings company not found',
        );
      }

      await SettingscompanyDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      if (data.chatEnabled !== settingscompany.chatEnabled) {
        await this.updateChatFeatureForCompanyRoles(
          data.chatEnabled,
          settingscompany.companyId,
          currentUser,
          transaction,
        );
      }

      if (!activeTransaction) {
        await transaction.commit();
      }

      return settingscompany;

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
        throw new UnauthorizedError(
          'Forbidden',
        );
      }

      await SettingscompanyDBApi.remove(
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

  static async updateChatFeatureForCompanyRoles(
    chatEnabled,
    companyId,
    currentUser,
    transaction,
  ) {
    if (chatEnabled) {
      // No updates needed when chat is enabled
      return;
    }
  
    const roles = await RolesDBApi.findAll(
      {
        companyId,
        chatFeature: true,
      },
      { transaction },
    );
  
    await Promise.all(
      roles.rows.map((role) =>
        RolesService.update(
          {
            ...role,
            chatFeature: false,
          },
          role.id,
          currentUser,
          transaction,
        ),
      ),
    );
  
    await RolesService.syncChatUsersAfterRoleRemoval(companyId, transaction);
  }
};

