const RolesService = require('../../services/roles');
const SettingscompanyService = require('../../services/settingscompany');
const { createCompany, createRole, createUser } = require('../helpers');
const CompanyChatFeatureDisabledException = require('../../exceptions/company-chat-feature-disabled.exception');

jest.mock('../../services/chat/chat', () => ({
    deleteUsersIfExists: jest.fn(),
  }));
  
const chatService = require('../../services/chat/chat');

describe('Company Chat Feature Setting', () => {
  let transaction;
  let db;
  let company;
  let settingsCompany;
  let role1;
  let role2;
  let user1;
  let user2;

  beforeEach(async () => {
    db = require('../../db/models');
    transaction = await db.sequelize.transaction();

    company = await createCompany(db, transaction);

    settingsCompany = ((
        await db.settingscompany.create(
          {
            companyId: company.id,
            chatEnabled: false,
          },
          { transaction }
        )
      )).get({ plain: true });

    // Seed roles
    role1 = await createRole(db, transaction, {
      name: 'Manager Role',
      chatFeature: false,
    });

    role2 = await createRole(db, transaction, {
      name: 'Employee Role',
      chatFeature: false,
    });

    // Seed users belonging to these roles
    user1 = await createUser(db, transaction, {
        companyId: company.id,
        email: 'user1@example.com',
        roles: [role1.id],
    });
    user2 = await createUser(db, transaction, {
        companyId: company.id,
        email: 'user2@example.com',
        roles: [role2.id],
    });

    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (transaction) {
      await transaction.rollback();
    }
  });

  describe('when chat setting is disabled (false)', () => {
    it('should not allow enabling chatFeature for any role in that company', async () => {
      await expect(
          RolesService.update(
            { ...role1, chatFeature: true },
            role1.id,
            user1,
            transaction
          )
        ).rejects.toThrowError(
          new CompanyChatFeatureDisabledException()
        );
    });
  });

  describe('when chat setting is enabled (true)', () => {
    beforeEach(async () => {
      await SettingscompanyService.update(
        { ...settingsCompany, chatEnabled: true, company: company.id },
        settingsCompany.id,
        user1,
        transaction
      );
    });

    it('should allow enabling chatFeature for a role in that company', async () => {
      // Enable chatFeature for a role
      await RolesService.update(
        { ...role1, chatFeature: true },
        role1.id,
        user1,
        transaction
      );

      const updatedRole = await db.roles.findByPk(role1.id, { transaction });
      expect(updatedRole.chatFeature).toBe(true);
    });
  });

  describe('when chat setting is toggled from true → false', () => {
    beforeEach(async () => {
      await SettingscompanyService.update(
        { ...settingsCompany, chatEnabled: true, company: company.id },
        settingsCompany.id,
        user1,
        transaction
      );

      await RolesService.update(
        { ...role1, chatFeature: true },
        role1.id,
        user1,
        transaction
      );

      await RolesService.update(
        { ...role2, chatFeature: true },
        role2.id,
        user2,
        transaction
      );
    });

    it('should set all roles chatFeature to false', async () => {
      await SettingscompanyService.update(
        { ...settingsCompany, chatEnabled: false, company: company.id },
        settingsCompany.id,
        user1,
        transaction
      );    

      const roles = await db.roles.findAll({
        include: [
          {
            model: db.users,
            as: 'createdBy',
          },
        ],
        where: {
          '$createdBy.companyId$': company.id,
        },
        attributes: ['id', 'name', 'chatFeature'],
        transaction,
      });
    
      expect(roles.every((role) => role.chatFeature === false)).toBe(true);
    });

    it('should call Mattermost to delete all users in the company', async () => {
      await SettingscompanyService.update(
        { ...settingsCompany, chatEnabled: false, company: company.id },
        settingsCompany.id,
        user1,
        transaction
      );

      expect(chatService.deleteUsersIfExists).toHaveBeenCalledTimes(1);
      
      const [[arg]] = chatService.deleteUsersIfExists.mock.calls;
      expect(arg.sort()).toEqual([user1.id, user2.id].sort());
    });
  });
});
  