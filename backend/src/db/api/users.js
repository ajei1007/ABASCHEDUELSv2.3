const db = require('../models');
const FileDBApi = require('./file');
const BranchesDBApi = require('./branches');
const CompaniesDBApi = require('./companies');
const RolesDBApi = require('./roles');
const MattermostUsersDBApi = require('./mattermostUsers');
const crypto = require('crypto');
const Utils = require('../utils');
const bcrypt = require('bcrypt');
const config = require('../../config');
const UsersCacheApi = require('../../cache/users');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const { getRolesAndDescendants } = require('../../utils/roleHierarchy');

module.exports = class UsersDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;
    const id_this = data.data.password || 'password';
    const hashedPassword = await bcrypt.hash(id_this, config.bcrypt.saltRounds);

    UsersCacheApi.removeAll();

    const user = await db.users.create(
      {
        id: data.data.id || undefined,
        capacity: data.data.capacity || null,
        firstName: data.data.firstName || null,
        lastName: data.data.lastName || null,
        phoneNumber: data.data.phoneNumber || null,
        email: data.data.email || `${uuidv4()}@mail.com`,
        email1: data.data.email1 || null,
        email2: data.data.email2 || null,
        needroom: data.data.needroom || false,
        needseat: data.data.needseat || false,
        titleCustom: data.data.titleCustom || null,
        codeCustom: data.data.codeCustom || null,
        // role: data.data.role
        role: 'admin' || 'user',
        disabled: data.data.disabled || false,
        password: hashedPassword || null,
        emailVerified: data.data.emailVerified || true,
        emailVerificationToken: data.data.emailVerificationToken || null,
        emailVerificationTokenExpiresAt:
          data.data.emailVerificationTokenExpiresAt || null,
        passwordResetToken: data.data.passwordResetToken || null,
        passwordResetTokenExpiresAt:
          data.data.passwordResetTokenExpiresAt || null,
        provider: data.data.provider || null,
        gender: data.data.gender || null,
        alias: data.data.alias || null,
        otherPhones: data.data.otherPhones || null,
        otherEmails: data.data.otherEmails || null,
        address: data.data.address || null,
        longitude: data.data.longitude || null,
        latitude: data.data.latitude || null,
        active: data.data.active || false,
        minHours: data.data.minHours || null,
        maxHours: data.data.maxHours || null,
        color: data.data.color || null,
        borderColor: data.data.borderColor || null,
        birthday: data.data.birthday || null,
        mobiletoken: data.data.mobiletoken || null,
        address2: data.data.address2 || null,
        address2Default: data.data.address2Default || false,
        idCustom: data.data.idCustom || null,
        idCustom2: data.data.idCustom2 || null,
        billable: data.data.billable || false,
        notWorking: data.data.notWorking || false,
        auth: data.data.auth || false,
        clientReq: data.data.clientReq || false,
        locReq: data.data.locReq || false,
        empNotReq: data.data.empNotReq || false,
        calendarhide: data.data.calendarhide || false,
        importHash: data.data.importHash || null,
        createdById: currentUser.id,
        paid: data.data.paid || false,
        updatedById: currentUser.id,
        allBranches: data.data.allBranches || false,
        waitlisted: data.data.waitlisted || false,
        supervision: data.data.supervision || false,
        productivityInclude: data.data.productivityInclude || false,
        productivityExclude: data.data.productivityExclude || false,
        notes: data.data.notes || null,
        defaultDuration: data.data.defaultDuration || null,
        immutable: data.data.immutable || false,

        hourlyrate: data.data.hourlyrate || null,
        salary: data.data.salary || null,
        hourlyrevenue: data.data.hourlyrevenue || null,
        priority: data.data.priority || null,
        employeeratio: data.data.employeeratio || null,
        clientratio: data.data.clientratio || null,
        disabledAt: data.data.disabledAt || null,
        importHash: data.data.importHash || null,
        siblingGroupId: data.data.siblingGroupId || data.data.id || undefined,
        supervisionRateInclude: data.data.supervisionRateInclude || false,
        customAddressId: data.data.customAddressId || null,
        customPayorClientId: data.data.customPayorClientId || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await UsersDBApi.setRelations(user, data.data, currentUser, options);

    const output = user.get({ plain: true });
    output.roles = await user.getRoles({
      transaction,
    });

    output.company = await user.getCompany({
      transaction,
    });

    return output;
  }

  static async createMany(usersDataArray, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // 1. Hash Passwords in parallel
    const usersDataWithHashedPasswords = await Promise.all(
      usersDataArray.map(async (userData) => {
        const password = userData.password || 'password';
        const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
        return {
          ...userData,
          password: hashedPassword,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        };
      })
    );

    // 2. Bulk create users (main table only)
    const createdUsers = await db.users.bulkCreate(usersDataWithHashedPasswords, { transaction });

    // 3. Set up relations for each user (roles, branches, etc.)
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const userData = usersDataWithHashedPasswords[i];

      await UsersDBApi.setRelations(user, userData, currentUser, options);
    }

    UsersCacheApi.removeAll();

    return createdUsers;
  }

  static async setRelations(user, userData, currentUser, options) {
    const transaction = (options && options.transaction) || undefined;

    await user.setParent(userData.parent || null, {
      transaction,
    });

    await user.setResource(userData.resource || null, {
      transaction,
    });

    await user.setCompany(
      currentUser.company?.id || userData.companyId || null,
      {
        transaction,
      },
    );

    await user.setLocationType(userData.locationType || null, {
      transaction,
    });

    await user.setAddress1Relationship(
      userData.address1Relationship || null,
      {
        transaction,
      },
    );

    await user.setAddress2Relationship(
      userData.address2Relationship || null,
      {
        transaction,
      },
    );

    await user.setRoomparent(userData.roomparent || [], {
      transaction,
    });

    await user.setRooms(userData.rooms || [], {
      transaction,
    });

    await user.setFunders(userData.funders || [], {
      transaction,
    });

    await user.setSubgroups(userData.subgroups || [], {
      transaction,
    });

    await user.setRoles(userData.roles || [], {
      transaction,
    });
    await user.setBranches(userData.branches || [], {
      transaction,
    });

    await user.setTags(userData.tags || [], {
      transaction,
    });

    await user.setRelationshipUsers(userData.relationshipUsers || [], {
      transaction,
    });

    await user.setRelationships(userData.relationships || [], {
      transaction,
    });

    await user.setPrimarylocation(userData.primarylocation || [], {
      transaction,
    });

    await user.setUserdefaultlocation(userData.userdefaultlocation || [], {
      transaction,
    });

    await user.setUserdefaultactivity(userData.userdefaultactivity || [], {
      transaction,
    });

    await user.setMobiletokens(userData.mobiletokens || [], {
      transaction,
    });

    await user.setCredential(userData.credential || [], {
      transaction,
    });

    await user.setRoster(userData.roster || [], {
      transaction,
    });

    await user.setTotals(userData.totals || [], {
      transaction,
    });

    if (userData.avatar) {
      await FileDBApi.replaceRelationFiles(
        {
          belongsTo: db.users.getTableName(),
          belongsToColumn: 'avatar',
          belongsToId: user.id,
        },
        userData.avatar,
        options,
      );
    }
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, {
      transaction,
    });
    let disabledAt = users.dataValues.disabledAt;
    if (!users.disabled && data.disabled) {
      disabledAt = new Date();
    }

    const id_this = data.password || null;
    let hashedPassword = null;
    if (id_this) {
      hashedPassword = await bcrypt.hash(id_this, config.bcrypt.saltRounds);
    }

    UsersCacheApi.removeAll();

    const siblingGroupId = data.siblingGroupId || uuidv4();

    await users.update(
      {
        capacity: data.capacity || null,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        email1: data.email1 || null,
        email2: data.email2 || null,
        needroom: data.needroom || false,
        needseat: data.needseat || false,
        locReq: data.locReq || false,
        clientReq: data.clientReq || false,
        empNotReq: data.empNotReq || false,
        titleCustom: data.titleCustom || null,
        codeCustom: data.codeCustom || null,
        role: data.role || 'admin',
        disabled: data.disabled || false,
        ...(hashedPassword && {
          password: hashedPassword,
        }),
        emailVerified: data.emailVerified || true,
        emailVerificationToken: data.emailVerificationToken || null,
        emailVerificationTokenExpiresAt:
          data.emailVerificationTokenExpiresAt || null,
        passwordResetToken: data.passwordResetToken || null,
        passwordResetTokenExpiresAt: data.passwordResetTokenExpiresAt || null,
        provider: data.provider || null,
        gender: data.gender || null,
        alias: data.alias || null,
        otherPhones: data.otherPhones || null,
        otherEmails: data.otherEmails || null,
        address: data.address || null,
        longitude: data.longitude || null,
        latitude: data.latitude || null,
        active: data.active || false,
        minHours: data.minHours || null,
        maxHours: data.maxHours || null,
        color: data.color || null,
        borderColor: data.borderColor || null,
        birthday: data.birthday || null,
        mobiletoken: data.mobiletoken || null,
        address2: data.address2 || null,
        address2Default: data.address2Default || false,
        billable: data.billable || false,
        notWorking: data.notWorking || false,
        auth: data.auth || false,
        calendarhide: data.calendarhide || false,
        idCustom: data.idCustom || null,
        idCustom2: data.idCustom2 || null,
        allBranches: data.allBranches || false,
        paid: data.paid || false,
        waitlisted: data.waitlisted || false,
        supervision: data.supervision || false,
        // If 3 user are sibling and if you want to remove one of them
        // just give null as siblingGroupId then it will be generated
        //  new groupId for that specific user
        siblingGroupId,
        ////////////////////////////////////////////////////////////////
        productivityInclude: data.productivityInclude || false,
        productivityExclude: data.productivityExclude || false,
        customAddressId: data.customAddressId || null,
        customPayorClientId: data.customPayorClientId || null,
        priority: data.priority || null,
        employeeratio: data.employeeratio || null,
        clientratio: data.clientratio || null,
        disabledAt: disabledAt,
        notes: data.notes || null,
        defaultDuration: data.defaultDuration || null,

        hourlyrate: data.hourlyrate || null,
        salary: data.salary || null,
        hourlyrevenue: data.hourlyrevenue || null,
        supervisionRateInclude: data.supervisionRateInclude || false,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await users.setParent(data.parent || null, {
      transaction,
    });

    await users.setResource(data.resource || null, {
      transaction,
    });

    await users.setCompany(currentUser.company?.id || data.company, {
      transaction,
    });

    await users.setLocationType(data.locationType || null, {
      transaction,
    });

    await users.setAddress1Relationship(data.address1Relationship || null, {
      transaction,
    });

    await users.setAddress2Relationship(data.address2Relationship || null, {
      transaction,
    });

    await users.setRoomparent(data.roomparent || [], {
      transaction,
    });

    await users.setRooms(data.rooms || [], {
      transaction,
    });

    await users.setFunders(data.funders || [], {
      transaction,
    });

    await users.setSubgroups(data.subgroups || [], {
      transaction,
    });

    await users.setRoles(data.roles || [], {
      transaction,
    });

    await users.setBranches(data.branches || [], {
      transaction,
    });

    await users.setTags(data.tags || [], {
      transaction,
    });

    await users.setRelationshipUsers(data.relationshipUsers || [], {
      transaction,
    });

    await users.setRelationships(data.relationships || [], {
      transaction,
    });

    await users.setPrimarylocation(data.primarylocation || [], {
      transaction,
    });
    await users.setUserdefaultlocation(data.userdefaultlocation || [], {
      transaction,
    });
    await users.setUserdefaultactivity(data.userdefaultactivity || [], {
      transaction,
    });
    await users.setMobiletokens(data.mobiletokens || [], {
      transaction,
    });
    await users.setCredential(data.credential || [], {
      transaction,
    });
    await users.setRoster(data.roster || [], {
      transaction,
    });
    await users.setCredentialFunders(data.credentialFunders || [], {
      transaction,
    });
    await users.setTotals(data.totals || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.users.getTableName(),
        belongsToColumn: 'avatar',
        belongsToId: users.id,
      },
      data.avatar,
      options,
    );

    const output = users.get({ plain: true });
    output.roles = await users.getRoles({
      transaction,
    });

    output.company = await users.getCompany({
      transaction,
    });

    output.branches = await users.getBranches({
      transaction,
    });

    const parsedUser = JSON.parse(JSON.stringify(output));
    return parsedUser;
  }

  static async updateForIntegration(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const user = await db.users.findByPk(id, {
      transaction,
    });
    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    await user.update(
      {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        address: data.address || null,
        address2: data.address2 || null,
        birthday: data.birthday || null,
        gender: data.gender || null,
        updatedAt: currentDateTime,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    if (data.roles && data.roles.length > 0){
      await user.setRoles(data.roles, {
        transaction,
      });
    }

    return true;
  }

  static async updateDynamic(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, {
      transaction,
    });

    UsersCacheApi.removeAll();

    await users.update(
      {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        address: data.address || null,
        longitude: data.longitude || null,
        latitude: data.latitude || null,
        idCustom2: data.idCustom2 || null,
        disabled: data.disabled || false,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    return true;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, options);

    UsersCacheApi.removeAll();

    await users.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );
    await users.destroy({
      transaction,
    });

    return users;
  }
  static async findBy2(where, options) {
    const transaction = (options && options.transaction) || undefined;

    //** CACHE */
    if (where.id) {
      const cachedUser = await UsersCacheApi.findById(where.id);
      // If user exists in redis then return
      if (cachedUser) return cachedUser;
    }

    const users = await db.users.findOne(
      {
        where,
        include: [
          {
            model: db.companies,
            as: 'company',
            include: [
              {
                model: db.settingscompany,
                as: 'settingscompany',
                attributes: ['id', 'isAlias', 'aliasFormatType'],
              },
            ],
          },
        ],
      },
      { transaction },
    );
    if (!users) return users;

    const output = users.get({ plain: true });

    output.roles = await users.getRoles({
      transaction,
    });

    output.company = await users.getCompany({
      transaction,
    });

    output.branches = await users.getBranches({
      transaction,
    });

    const parsedUsers = JSON.parse(JSON.stringify(output));
    UsersCacheApi.create(output.id, parsedUsers);
    return parsedUsers;
  }
  static async findBy_auth(where, options) {
    const transaction = (options && options.transaction) || undefined;

    // //** CACHE */
    if (where.id && where.cache) {
      const cachedUser = await UsersCacheApi.findById(where.id);
      // If user exists in redis then return
      if (cachedUser) {
        // const isCompanyDisabled = await CompaniesDBApi.findCompanyDisabled({
        //   id: cachedUser.company.id,
        // });
        const isCompanyDisabled = false
        cachedUser.company.disabled = isCompanyDisabled;
        return cachedUser;
      }
    }

    delete where.cache;
    // If user is not exist in redis then get from db then store in cache
    const users = await db.users.findOne(
      {
        //logging: console.log,
        where,
        include: [
          {
            model: db.companies,
            as: 'company',
            include: [
              {
                model: db.settingscompany,
                as: 'settingscompany',
                attributes: ['id', 'isAlias', 'aliasFormatType'],
              },
            ],
          },
          {
            model: db.roles,
            as: 'roles',
            //attributes: ['id', 'name'],
            through: { attributes: [] },
          },
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
          },
          {
            attributes: ['id', 'userId'],
            model: db.siblingsUsers,
            as: 'siblingUser',
          },
          {
            attributes: ['mattermostUserId', 'mattermostTeamId'],
            model: db.mattermostUsers,
            as: 'mattermostUser',
          },
        ],
      },
      { transaction },
    );
    if (!users) return users;
    const output = users.get({ raw: true });

    output.subgroups = await users.getSubgroups({
      transaction,
    });

    output.company = await users.getCompany({
      transaction,
    });

    output.mobiletokens = await users.getMobiletokens({
      transaction,
    });

    const parsedUsers = JSON.parse(JSON.stringify(output));
    await UsersCacheApi.create(output.id, parsedUsers);
    return parsedUsers;
  }

  static async findOneAdminOfCompany(filter, options, roleName = null) {
    const transaction = (options && options.transaction) || undefined;
    let where = {
      companyId: filter.companyId,
    };

    const roleFilter = roleName
      ? {
          where: {
            name: roleName, // Filter by the specific role
          },
        }
      : {};

    const users = await db.users.findOne(
      {
        where,
        include: [
          {
            model: db.roles,
            as: 'roles',
            attributes: ['id', 'name', 'allowAlias'],
            through: {
              attributes: [],
            },
            ...roleFilter, // Apply role filter only when roleName is provided
          },
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
          },
          {
            attributes: ['id', 'userId'],
            model: db.siblingsUsers,
            as: 'siblingUser',
          },
        ],
      },
      { transaction },
    );

    if (!users) return users;

    const output = users.get({ raw: true });

    output.subgroups = await users.getSubgroups({
      transaction,
    });

    output.roles = await users.getRoles({
      transaction,
    });

    output.company = await users.getCompany({
      transaction,
    });

    const parsedUsers = JSON.parse(JSON.stringify(output));
    await UsersCacheApi.create(output.id, parsedUsers);

    return parsedUsers;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    // //** CACHE */
    if (where.id && where.cache) {
      const cachedUser = await UsersCacheApi.findById(where.id);
      // If user exists in redis then return
      if (cachedUser) return cachedUser;
    }

    delete where.cache;
    // If user is not exist in redis then get from db then store in cache
    const users = await db.users.findOne(
      {
        //logging: console.log,
        where,
        include: [
          {
            model: db.roles,
            as: 'roles',
            //attributes: ['id', 'name'],
            through: { attributes: [] },
          },
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
          },
          {
            model: db.availabilities,
            as: 'availabilities',
            separate: true,
            through: { attributes: [] },
            include: [
              {
                model: db.users,
                as: 'location2',
                attributes: ['id', 'firstName', 'lastName'],
                through: { attributes: [] },
              },
              {
                model: db.branches,
                as: 'branch',
              },
            ],
            where: {
              available: true,
              [Op.and]: [
                Sequelize.where(
                  Sequelize.literal(
                    'DATEDIFF(availabilities.endRange, availabilities.startRange)',
                  ),
                  { [Op.gt]: 1 },
                ),
              ],
            },
          },
          {
            model: db.timeconstraints,
            as: 'timeconstraints',
            separate: true,
            include: [
              {
                model: db.users,
                as: 'user2',
              },
            ],
          },
        ],
      },
      { transaction },
    );
    if (!users) return users;
    const output = users.get({ raw: true });
    let currentSiblingGroupId = output.siblingGroupId;
    output.siblings = new Array();

    if (currentSiblingGroupId) {
      let allsiblings = await db.users.findAll({
        attributes: ['id', 'firstName', 'lastName', 'siblingGroupId'],
        where: {
          siblingGroupId: currentSiblingGroupId,
        },
      });

      let siblingLabel = '';
      for (let k = 0; k < allsiblings.length; k++) {
        let c = allsiblings[k];
        siblingLabel += `${c.firstName} ${c?.lastName ?? ''} `;
      }

      output.siblingGroupId = {
        id: output.siblingGroupId,
        label: siblingLabel,
      };
    }

    output.roomparent = await users.getRoomparent({
      transaction,
    });

    output.rooms = await users.getRooms({
      transaction,
    });

    output.subgroups = await users.getSubgroups({
      transaction,
    });

    output.company = await users.getCompany({
      transaction,
    });

    output.mobiletokens = await users.getMobiletokens({
      transaction,
    });

    output.credentialFunders = await users.getCredentialFunders({
      transaction,
    });

    const parsedUsers = JSON.parse(JSON.stringify(output));
    await UsersCacheApi.create(output.id, parsedUsers);
    return parsedUsers;
  }

  static async checkEmailUsed(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};
    if (!filter.email) {
      return true;
    }

    where.email = filter.email;

    if (filter.notThisID) {
      where.id = { [Op.ne]: filter.notThisID };
    }

    const result = await db.users.findAll(
      { where, attributes: ['id'] },
      { transaction },
    );

    const parsedResult = JSON.parse(JSON.stringify(result));

    return parsedResult.length > 0;
  }

  static async getUserRoleSubgroupBranchList(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(where.id, {
      include: [
        {
          model: db.roles,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          attributes: ['id', 'name'],
          model: db.branches,
          as: 'branches',
          through: { attributes: [] },
        },
        {
          attributes: ['id', 'name', 'groupId'],
          model: db.subgroups,
          as: 'subgroups',
          through: { attributes: [] },
        },
      ],
      attributes: ['id', 'firstName', 'lastName', 'companyId', 'address'],
      transaction,
    });

    const parsedUsers = JSON.parse(JSON.stringify(users));
    return parsedUsers;
  }

  static async getUserRoleSubgroupBranchListInBulk(filter, options) {
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findAll({
      where: {
        id: { [Op.in]: filter.userIds },
      },
      include: [
        {
          model: db.roles,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          attributes: ['id', 'name'],
          model: db.branches,
          as: 'branches',
          through: { attributes: [] },
        },
        {
          attributes: ['id', 'name', 'groupId'],
          model: db.subgroups,
          as: 'subgroups',
          through: { attributes: [] },
        },
      ],
      attributes: ['id', 'firstName', 'lastName', 'companyId', 'address'],
      transaction,
    });

    const parsedUsers = JSON.parse(JSON.stringify(users));
    return parsedUsers;
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: filter.branches,
      });
    }
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
    if (limitOffset.lim < 0 || limitOffset.off < 0) {
      filter.bol = false;
    }

    const transaction = (options && options.transaction) || undefined;
    let where = {
      active: 0,
    };
    if (filter) {
      if (filter.query) {
        where = {
          ...where,
          // TODO: There is no index on the concat function, so we will need to create a new column for this search
          [Op.and]: Sequelize.where(
            Sequelize.fn(
              'LOWER',
              Sequelize.fn(
                'CONCAT',
                Sequelize.fn('IFNULL', Sequelize.col('users.firstName'), ''),
                ' ',
                Sequelize.fn('IFNULL', Sequelize.col('users.lastName'), ''),
              ),
            ),
            { [Op.like]: `%${`${filter.query}`.toLowerCase()}%` },
          ),
        };
      }
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (Array.isArray(filter.ids) && filter.ids.length) {
        where = {
          ...where,
          id: { [Op.or]: filter.ids },
        };
      }
      if (filter.companyId) {
        where = {
          ...where,
          ['$users.companyId$']: Utils.uuid(filter.companyId),
        };
      }
      if (filter.firstName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'firstName', filter.firstName),
        };
      }
      if (filter.updatedAt) {
        where = {
          ...where,
          '$users.updatedAt$': { [Op.gt]: filter.updatedAt },
        };
      }
      if (filter.lastName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'lastName', filter.lastName),
        };
      }
      if (filter.phoneNumber) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'phoneNumber', filter.phoneNumber),
        };
      }
      if (filter.email) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'email', filter.email),
        };
      }
      if (filter.password) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'password', filter.password),
        };
      }
      if (filter.emailVerificationToken) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'users',
            'emailVerificationToken',
            filter.emailVerificationToken,
          ),
        };
      }
      if (filter.passwordResetToken) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'users',
            'passwordResetToken',
            filter.passwordResetToken,
          ),
        };
      }
      if (filter.provider) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'provider', filter.provider),
        };
      }
      if (filter.alias) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'alias', filter.alias),
        };
      }
      if (filter.otherPhones) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'otherPhones', filter.otherPhones),
        };
      }
      if (filter.otherEmails) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'otherEmails', filter.otherEmails),
        };
      }
      if (filter.address) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'address', filter.address),
        };
      }
      if (filter.color) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'color', filter.color),
        };
      }
      if (filter.mobiletoken) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'mobiletoken', filter.mobiletoken),
        };
      }
      if (filter.address2) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'address2', filter.address2),
        };
      }
      if (filter.capacity) {
        where = {
          ...where,
          capacity: {
            ...where.capacity,
            [Op.gte]: -1,
          },
        };
      }

      if (filter.siblingGroupId) {
        where = {
          ...where,
          siblingGroupId: filter.siblingGroupId,
        };
      }
      if (filter.idCustom) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'idCustom', filter.idCustom),
        };
      }
      if (filter.idCustom2) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'idCustom2', filter.idCustom2),
        };
      }
      if (filter.capacityRange) {
        const [start, end] = filter.capacityRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            capacity: {
              ...where.capacity,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            capacity: {
              ...where.capacity,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.emailVerificationTokenExpiresAtRange) {
        const [start, end] = filter.emailVerificationTokenExpiresAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            emailVerificationTokenExpiresAt: {
              ...where.emailVerificationTokenExpiresAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            emailVerificationTokenExpiresAt: {
              ...where.emailVerificationTokenExpiresAt,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.passwordResetTokenExpiresAtRange) {
        const [start, end] = filter.passwordResetTokenExpiresAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            passwordResetTokenExpiresAt: {
              ...where.passwordResetTokenExpiresAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            passwordResetTokenExpiresAt: {
              ...where.passwordResetTokenExpiresAt,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.longitudeRange) {
        const [start, end] = filter.longitudeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            longitude: {
              ...where.longitude,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            longitude: {
              ...where.longitude,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.latitudeRange) {
        const [start, end] = filter.latitudeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            latitude: {
              ...where.latitude,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            latitude: {
              ...where.latitude,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.minHoursRange) {
        const [start, end] = filter.minHoursRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            minHours: {
              ...where.minHours,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            minHours: {
              ...where.minHours,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.maxHoursRange) {
        const [start, end] = filter.maxHoursRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            maxHours: {
              ...where.maxHours,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            maxHours: {
              ...where.maxHours,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.birthdayRange) {
        const [start, end] = filter.birthdayRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            birthday: {
              ...where.birthday,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            birthday: {
              ...where.birthday,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.priorityRange) {
        const [start, end] = filter.priorityRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            priority: {
              ...where.priority,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            priority: {
              ...where.priority,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.hourlyrateRange) {
        const [start, end] = filter.hourlyrateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            hourlyrate: {
              ...where.hourlyrate,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            hourlyrate: {
              ...where.hourlyrate,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.salaryRange) {
        const [start, end] = filter.salaryRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            salary: {
              ...where.salary,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            salary: {
              ...where.salary,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.hourlyrevenueRange) {
        const [start, end] = filter.hourlyrevenueRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            hourlyrevenue: {
              ...where.hourlyrevenue,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            hourlyrevenue: {
              ...where.hourlyrevenue,
              [Op.lte]: end,
            },
          };
        }
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.role) {
        where = {
          ...where,
          role: filter.role,
        };
      }

      if (
        filter.disabled === true ||
        filter.disabled === 'true' ||
        filter.disabled === false ||
        filter.disabled === 'false'
      ) {
        where = {
          ...where,
          disabled: JSON.parse(filter.disabled),
        };
      }

      if (filter.emailVerified) {
        where = {
          ...where,
          emailVerified: filter.emailVerified,
        };
      }

      if (filter.gender) {
        where = {
          ...where,
          gender: filter.gender,
        };
      }

      if (filter.active) {
        where = {
          ...where,
          active: filter.active,
        };
      }

      if (filter.address2Default) {
        where = {
          ...where,
          address2Default: filter.address2Default,
        };
      }

      if (filter.billable) {
        where = {
          ...where,
          billable: filter.billable,
        };
      }

      if (filter.notWorking) {
        where = {
          ...where,
          notWorking: filter.notWorking,
        };
      }
      if (filter.auth) {
        where = {
          ...where,
          auth: filter.auth,
        };
      }

      if (filter.calendarhide) {
        where = {
          ...where,
          calendarhide: filter.calendarhide,
        };
      }

      if (filter.allBranches) {
        where = {
          ...where,
          allBranches: filter.allBranches,
        };
      }

      if (filter.paid) {
        where = {
          ...where,
          paid: filter.paid,
        };
      }

      if (filter.waitlisted) {
        where = {
          ...where,
          waitlisted: filter.waitlisted,
        };
      }

      if (filter.parent) {
        var listItems = filter.parent.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          parentId: { [Op.or]: listItems },
        };
      }

      if (filter.resource) {
        var listItems = filter.resource.split('|').map((item) => {
          return item;
        });

        where = {
          ...where,
          '$roles.name$': { [Op.or]: listItems },
        };
      }

      if (filter.company) {
        var listItems = filter.company.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          companyId: { [Op.or]: listItems },
        };
      }

      if (filter.locationType) {
        var listItems = filter.locationType.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          locationTypeId: { [Op.or]: listItems },
        };
      }

      if (filter.address1Relationship) {
        var listItems = filter.address1Relationship.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          address1RelationshipId: { [Op.or]: listItems },
        };
      }

      if (filter.address2Relationship) {
        var listItems = filter.address2Relationship.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          address2RelationshipId: { [Op.or]: listItems },
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.branches && filter.branches.length > 0) {
        where = {
          ...where,
          '$branches.id$': { [Op.or]: filter.branches },
        };
      }

      if (Array.isArray(filter.roleNames) && filter.roleNames.length > 0) {
        where = {
          ...where,
          '$roles.name$': { [Op.in]: filter.roleNames },
        };
      }

      if (filter.excludeSupervision) {
        where = {
          ...where,
          supervision: excludeSupervision,
        };
      }
    }

    let include = [
      {
        model: db.companies,
        as: 'company',
        attributes: ['id'],
        // if bol is true (Users table), then do not include the settingscompany
        ...(!filter.bol ? {
          include: [
            {
              model: db.settingscompany,
              as: 'settingscompany',
              attributes: ['id', 'isAlias', 'aliasFormatType'],
            },
          ]
        } : {})
      },
      {
        attributes: ['id', 'firstName', 'capacity'],
        model: db.users,
        as: 'rooms',
        through: filter.rooms
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.rooms.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : { attributes: [] },
        required: filter.rooms ? true : null,
      },
      {
        model: db.subgroups,
        attributes: ['id', 'name', 'groupId', 'iconName'],
        as: 'subgroups',
        through: filter.subgroups
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.subgroups.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : { attributes: [] },
        required: filter.subgroups ? true : null,
      },

      {
        model: db.roles,
        as: 'roles',
        attributes: ['id', 'name', 'allowAlias'],
        through: filter.roles
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.roles.split('|').map((item) => {
                  return { roleId: Utils.uuid(item) }; // or role_id if you used snake_case
                }),
              },
            }
          : { attributes: [] },
        required: filter.roles ? true : null,
      },

      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];
    let userIds = [];
    let numberOfUsers = 0;
    if (filter.bol) {
      let queryOptionForGettingTheIds = {
        where,
        attributes: ['id'],
        group: ['id'],
        include: [
          {
            model: db.roles,
            as: 'roles',
            attributes: [],
            through: filter.roles
              ? {
                  attributes: [],
                  where: {
                    [Op.or]: filter.roles.split('|').map((item) => {
                      return { roleId: Utils.uuid(item) }; // or role_id if you used snake_case
                    }),
                  },
                }
              : { attributes: [] },
            required: filter.roles ? true : null,
          },
          {
            attributes: [],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
          },
        ],
        order:
          filter.field && filter.sort
            ? [[filter.field, filter.sort]]
            : [['createdAt', 'desc']],
        transaction,
      };

      if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
        queryOptionForGettingTheIds = {
          ...queryOptionForGettingTheIds,
          limit: limitOffset.lim,
          offset: limitOffset.off,
          subQuery: false,
        };
      }

      const results = await db.users.findAndCountAll(
        queryOptionForGettingTheIds,
      );

      userIds = results.rows;
      numberOfUsers = results.count.length;
    }
    const userIdsParsed = userIds;
    const userIdArray = userIdsParsed.map((user) => user.id);
    let rows = [];
    let parsedUsers = [];
    if (!filter.bol || userIdArray.length > 0) {
      rows = await db.users.findAll({
        where: !filter.bol
          ? where
          : {
              id: { [Op.or]: userIdArray },
            },
        include,
        order:
          filter.field && filter.sort
            ? [[filter.field, filter.sort]]
            : [['createdAt', 'desc']],
        attributes: {
          exclude: [
            'password',
            'emailVerificationTokenExpiresAt',
            'emailVerificationToken',
            'passwordResetToken',
            'passwordResetTokenExpiresAt',
            'updatedById',
            'updatedAt',
            'mobiletoken',
          ],
        },
        transaction,
      });
      parsedUsers = rows;
    }

    if (!filter.bol) {
      numberOfUsers = rows.length;
    }
    return { rows: parsedUsers, count: numberOfUsers };
  }

  static async findUserIdsInSiblingGroup(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = { active: 0 };
    if (!filter.siblingGroupId) {
      return [];
    }

    where = {
      ...where,
      siblingGroupId: filter.siblingGroupId,
    };

    let rows = await db.users.findAll({
      where: where,
      attributes: ['id'],
      transaction,
    });

    let users = rows;
    let ids = users.map((user) => user.id);

    return ids;
  }

  static async findOpenShifts(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = { ['$roles.openshift$']: true };
    if (filter) {
      if (filter.companyId) {
        where = {
          ...where,
          ['$users.companyId$']: Utils.uuid(filter.companyId),
        };
      }
      if (filter.branches && filter.branches.length > 0) {
        where = {
          ...where,
          '$branches.id$': { [Op.or]: filter.branches },
        };
      }

      if (filter.company) {
        var listItems = filter.company.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          companyId: { [Op.or]: listItems },
        };
      }
    }
    let include = [
      {
        model: db.roles,
        as: 'roles',
        attributes: ['id', 'name'],
        through: filter.roles
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.roles.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : { attributes: [] },
        required: filter.roles ? true : null,
      },

      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
        required: filter.branches ? true : null,
      },
    ];

    let rows = [];
    let parsedUsers = [];
    rows = await db.users.findAll({
      where,
      include,
      attributes: ['id'],
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

    parsedUsers = JSON.parse(JSON.stringify(rows));

    return { rows: parsedUsers, count: parsedUsers.length };
  }

  static async findAllForStaffTracker(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
    let where = {};
    if (filter) {
      if (filter.query) {
        where = {
          ...where,
          // TODO: There is no index on the concat function, so we will need to create a new column for this search
          [Op.and]: Sequelize.where(
            Sequelize.fn(
              'LOWER',
              Sequelize.fn(
                'CONCAT',
                Sequelize.fn('IFNULL', Sequelize.col('users.firstName'), ''),
                ' ',
                Sequelize.fn('IFNULL', Sequelize.col('users.lastName'), ''),
              ),
            ),
            { [Op.like]: `%${`${filter.query}`.toLowerCase()}%` },
          ),
        };
      }
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (Array.isArray(filter.ids) && filter.ids.length > 0) {
        where = {
          ...where,
          id: { [Op.or]: filter.ids },
        };
      }
      if (filter.userIds) {
        var listItems = filter.userIds.split('|');
        where = {
          ...where,
          id: { [Op.or]: listItems },
        };
      }
      if (filter.companyId) {
        where = {
          ...where,
          ['$users.companyId$']: Utils.uuid(filter.companyId),
        };
      }
      if (filter.firstName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'firstName', filter.firstName),
        };
      }
      if (filter.lastName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'lastName', filter.lastName),
        };
      }
      if (filter.phoneNumber) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'phoneNumber', filter.phoneNumber),
        };
      }
      if (filter.email) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'email', filter.email),
        };
      }
      if (filter.password) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'password', filter.password),
        };
      }
      if (filter.emailVerificationToken) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'users',
            'emailVerificationToken',
            filter.emailVerificationToken,
          ),
        };
      }
      if (filter.passwordResetToken) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'users',
            'passwordResetToken',
            filter.passwordResetToken,
          ),
        };
      }
      if (filter.provider) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'provider', filter.provider),
        };
      }
      if (filter.alias) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'alias', filter.alias),
        };
      }
      if (filter.otherPhones) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'otherPhones', filter.otherPhones),
        };
      }
      if (filter.otherEmails) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'otherEmails', filter.otherEmails),
        };
      }
      if (filter.address) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'address', filter.address),
        };
      }
      if (filter.color) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'color', filter.color),
        };
      }
      if (filter.mobiletoken) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'mobiletoken', filter.mobiletoken),
        };
      }

      // Initialize the OR condition array specifically for branches and additional users
      const branchesAndAdditionalUsersConditions = [];

      // if only addtional users are called then do not filter by branch
      if (
        filter.branches &&
        filter.branches.length > 0 &&
        !filter.onlyAdditional
      ) {
        branchesAndAdditionalUsersConditions.push({
          '$branches.id$': { [Op.in]: filter.branches },
        });
      }

      if (filter.additionalUsers && filter.additionalUsers.length > 0) {
        branchesAndAdditionalUsersConditions.push({
          id: { [Op.in]: filter.additionalUsers },
        });
      } else {
        if (filter.onlyAdditional) {
          /* If code came to this point then it means
         frontend called only for additional users
         and if there is no additional user then no 
         need to get empty array from db
         users, just responde empty array */
          return { rows: [], count: 0 };
        }
      }

      // Add OR conditions to the main `where` clause only if needed
      if (branchesAndAdditionalUsersConditions.length > 0) {
        where = {
          ...where,
          [Op.or]: branchesAndAdditionalUsersConditions,
        };
      }

      if (filter.address2) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'address2', filter.address2),
        };
      }
      if (filter.capacity) {
        where = {
          ...where,
          capacity: {
            ...where.capacity,
            [Op.gte]: -1,
          },
        };
      }
      if (filter.idCustom) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'idCustom', filter.idCustom),
        };
      }

      if (filter.idCustom2) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'idCustom2', filter.idCustom2),
        };
      }
      if (filter.capacityRange) {
        const [start, end] = filter.capacityRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            capacity: {
              ...where.capacity,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            capacity: {
              ...where.capacity,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.emailVerificationTokenExpiresAtRange) {
        const [start, end] = filter.emailVerificationTokenExpiresAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            emailVerificationTokenExpiresAt: {
              ...where.emailVerificationTokenExpiresAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            emailVerificationTokenExpiresAt: {
              ...where.emailVerificationTokenExpiresAt,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.passwordResetTokenExpiresAtRange) {
        const [start, end] = filter.passwordResetTokenExpiresAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            passwordResetTokenExpiresAt: {
              ...where.passwordResetTokenExpiresAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            passwordResetTokenExpiresAt: {
              ...where.passwordResetTokenExpiresAt,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.longitudeRange) {
        const [start, end] = filter.longitudeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            longitude: {
              ...where.longitude,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            longitude: {
              ...where.longitude,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.latitudeRange) {
        const [start, end] = filter.latitudeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            latitude: {
              ...where.latitude,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            latitude: {
              ...where.latitude,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.minHoursRange) {
        const [start, end] = filter.minHoursRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            minHours: {
              ...where.minHours,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            minHours: {
              ...where.minHours,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.maxHoursRange) {
        const [start, end] = filter.maxHoursRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            maxHours: {
              ...where.maxHours,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            maxHours: {
              ...where.maxHours,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.birthdayRange) {
        const [start, end] = filter.birthdayRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            birthday: {
              ...where.birthday,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            birthday: {
              ...where.birthday,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.priorityRange) {
        const [start, end] = filter.priorityRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            priority: {
              ...where.priority,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            priority: {
              ...where.priority,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.hourlyrateRange) {
        const [start, end] = filter.hourlyrateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            hourlyrate: {
              ...where.hourlyrate,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            hourlyrate: {
              ...where.hourlyrate,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.salaryRange) {
        const [start, end] = filter.salaryRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            salary: {
              ...where.salary,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            salary: {
              ...where.salary,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.hourlyrevenueRange) {
        const [start, end] = filter.hourlyrevenueRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            hourlyrevenue: {
              ...where.hourlyrevenue,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            hourlyrevenue: {
              ...where.hourlyrevenue,
              [Op.lte]: end,
            },
          };
        }
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.role) {
        where = {
          ...where,
          role: filter.role,
        };
      }

      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
        };
      }

      if (filter.emailVerified) {
        where = {
          ...where,
          emailVerified: filter.emailVerified,
        };
      }

      if (filter.gender) {
        where = {
          ...where,
          gender: filter.gender,
        };
      }

      if (filter.active) {
        where = {
          ...where,
          active: filter.active,
        };
      }

      if (filter.address2Default) {
        where = {
          ...where,
          address2Default: filter.address2Default,
        };
      }

      if (filter.billable) {
        where = {
          ...where,
          billable: filter.billable,
        };
      }

      if (filter.notWorking) {
        where = {
          ...where,
          notWorking: filter.notWorking,
        };
      }
      if (filter.auth) {
        where = {
          ...where,
          auth: filter.auth,
        };
      }

      if (filter.calendarhide) {
        where = {
          ...where,
          calendarhide: filter.calendarhide,
        };
      }

      if (filter.allBranches) {
        where = {
          ...where,
          allBranches: filter.allBranches,
        };
      }

      if (filter.paid) {
        where = {
          ...where,
          paid: filter.paid,
        };
      }

      if (filter.waitlisted) {
        where = {
          ...where,
          waitlisted: filter.waitlisted,
        };
      }

      if (filter.parent) {
        var listItems = filter.parent.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          parentId: { [Op.or]: listItems },
        };
      }

      if (filter.resource) {
        var listItems = filter.resource.split('|').map((item) => {
          return item;
        });

        where = {
          ...where,
          '$roles.name$': { [Op.or]: listItems },
        };
      }

      if (filter.company) {
        var listItems = filter.company.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          companyId: { [Op.or]: listItems },
        };
      }

      if (filter.locationType) {
        var listItems = filter.locationType.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          locationTypeId: { [Op.or]: listItems },
        };
      }

      if (filter.address1Relationship) {
        var listItems = filter.address1Relationship.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          address1RelationshipId: { [Op.or]: listItems },
        };
      }

      if (filter.address2Relationship) {
        var listItems = filter.address2Relationship.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          address2RelationshipId: { [Op.or]: listItems },
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }

      if (Array.isArray(filter.roleNames) && filter.roleNames.length > 0) {
        where = {
          ...where,
          '$roles.name$': { [Op.in]: filter.roleNames },
        };
      }

      if (filter.excludeSupervision) {
        where = {
          ...where,
          supervision: false,
        };
      }
    }
    let include = [
      {
        model: db.companies,
        as: 'company',
        include: [
          {
            model: db.settingscompany,
            as: 'settingscompany',
            attributes: ['id', 'isAlias', 'aliasFormatType'],
          },
        ],
      },
      {
        model: db.subgroups,
        as: 'subgroups',
        attributes: ['name', 'id', 'iconName'],
        through: { attributes: [] },
      },
      {
        model: db.roles,
        as: 'roles',
        attributes: ['id', 'name', 'allowAlias'],
        through: filter.roles
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.roles.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : { attributes: [] },
        required: filter.roles ? true : null,
      },
      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
        required: filter.branches ? true : null,
      },
      {
        attributes: ['id', 'firstName', 'capacity'],
        model: db.users,
        as: 'rooms',
        through: filter.rooms
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.rooms.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : { attributes: [] },
        required: filter.rooms ? true : null,
      },
    ];

    if (filter.staffTracker) {
      include = [
        {
          model: db.roles,
          as: 'roles',
          attributes: ['id', 'name'],
          through: filter.roles
            ? {
                attributes: [],
                where: {
                  [Op.or]: filter.roles.split('|').map((item) => {
                    return { ['Id']: Utils.uuid(item) };
                  }),
                },
              }
            : { attributes: [] },
          required: filter.roles ? true : null,
        },

        {
          attributes: ['id', 'name'],
          model: db.branches,
          as: 'branches',
          where: filter.branches.length
            ? [{ '$branches.id$': { [Op.in]: filter.branches } }]
            : [],
          through: { attributes: [] },
          required: filter.branches ? true : null,
        },
      ];
    }

    let rows = [];
    let parsedUsers = [];
    rows = await db.users.findAll({
      where,
      include,
      ...(limitOffset.lim >= 0 && limitOffset.off >= 0
        ? {
            limit: limitOffset.lim,
            offset: limitOffset.off,
            subQuery: false,
          }
        : {}),
      transaction,
    });
    parsedUsers = rows;

    let resIds = parsedUsers.map((u) => u.id);
    let userIdFunders = new Map();

    if (resIds.length > 0) {
      const usersCredentialFunders = await db.sequelize.query(
        `SELECT userId, JSON_ARRAYAGG(credentialFunderId) as funders FROM usersCredentialFundersUsers WHERE userId IN (:userIds) group by userId`,
        {
          replacements: { userIds: resIds },
          type: db.sequelize.QueryTypes.SELECT,
        },
      );

      // create userId --> [funder ids] map
      for (let i = 0; i < usersCredentialFunders.length; i++) {
        userIdFunders.set(
          usersCredentialFunders[i].userId,
          usersCredentialFunders[i].funders,
        );
      }
    }

    // set funder Ids to each user
    parsedUsers.forEach((user) => {
      const funders = userIdFunders.get(user.id);
      // Ensure that funders is an array before attempting to map
      if (Array.isArray(funders)) {
        user.credentialFunders = funders.map((funderId) => {
          return { id: funderId, firstName: '' };
        });
      } else {
        // Handle the case where funders is not an array
        user.credentialFunders = [];
      }
    });

    return { rows: parsedUsers, count: parsedUsers.length };
  }
  static async countEmployeeClientUsers(filter, options) {
    const transaction = (options && options.transaction) || undefined;

    let include = [
      {
        model: db.roles,
        as: 'roles',
        attributes: [],
        through: { attributes: [] },
      },
    ];

    let whereEmp = {
      companyId: filter.companyId,
      disabled: 0,
      '$roles.name$': { [Op.or]: filter.employee },
    };

    let whereCli = {
      companyId: filter.companyId,
      disabled: 0,
      '$roles.name$': { [Op.or]: filter.client },
    };

    if (filter.branches.length > 0) {
      include.push({
        model: db.branches,
        as: 'branches',
        attributes: [],
        through: { attributes: [] },
      });

      whereEmp = {
        ...whereEmp,
        '$branches.id$': { [Op.or]: filter.branches },
      };

      whereCli = {
        ...whereCli,
        '$branches.id$': { [Op.or]: filter.branches },
      };
    }

    if (filter.subgroups.length > 0) {
      include.push({
        model: db.subgroups,
        as: 'subgroups',
        attributes: [],
        through: { attributes: [] },
      });

      whereEmp = {
        ...whereEmp,
        '$subgroups.id$': { [Op.or]: filter.subgroups },
      };

      whereCli = {
        ...whereCli,
        '$subgroups.id$': { [Op.or]: filter.subgroups },
      };
    }

    const employeeUserIds = await db.users.findAll({
      where: whereEmp,
      attributes: ['id'],
      include,
      group: ['id'],
      transaction,
      benchmark: true,
    });

    const clientUserIds = await db.users.findAll({
      where: whereCli,
      attributes: ['id'],
      include,
      group: ['id'],
      transaction,
      benchmark: true,
    });

    let parsedEmployeIds = JSON.parse(JSON.stringify(employeeUserIds));
    let parsedClientIds = JSON.parse(JSON.stringify(clientUserIds));

    return {
      employee: parsedEmployeIds.length,
      client: parsedClientIds.length,
    };
  }

  static async findAllSiblingGroups(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = { active: 0, companyId: filter.companyId };
    let rows = await db.users.findAll({
      where,
      attributes: ['siblingGroupId', 'firstName', 'lastName'],
      transaction,
    });

    let parsedSiblingGroups = JSON.parse(JSON.stringify(rows));
    let siblingGroupsMap = new Map();
    for (let user of parsedSiblingGroups) {
      if (!siblingGroupsMap.has(user.siblingGroupId)) {
        siblingGroupsMap.set(user.siblingGroupId, '');
      }

      let family = siblingGroupsMap.get(user.siblingGroupId);
      family += `${user.firstName} ${user?.lastName ?? ''} `;
      siblingGroupsMap.set(user.siblingGroupId, family);
    }

    let result = new Array();
    for (let [key, value] of siblingGroupsMap.entries()) {
      if (filter.query.length > 0) {
        if (!value.toLowerCase().includes(filter.query)) {
          continue;
        }
      }
      result.push({
        id: key,
        label: value,
      });

      if (result.length == filter.limit) {
        break;
      }
    }

    return { rows: result };
  }

  static async findAllAutocomplete(query, limit, filter, roles_list = []) {
    let where = {};
    if (roles_list.length > 0) {
      var listItems = roles_list.map((item) => {
        return item;
      });

      where = {
        ...where,
        '$roles.name$': { [Op.or]: listItems },
      };
    }

    if (query) {
      where = {
        ...where,
        // TODO: There is no index on the concat function, so we will need to create a new column for this search
        [Op.and]: Sequelize.where(
          Sequelize.fn('LOWER', 
            Sequelize.fn('CONCAT', 
              Sequelize.fn('IFNULL', Sequelize.col('users.firstName'), ''), 
              ' ', 
              Sequelize.fn('IFNULL', Sequelize.col('users.lastName'), '')
            )
          ),
          { [Op.like]: `%${`${query}`.toLowerCase()}%` }
        ),
      };
    }
    if (filter.companyId) {
      where = {
        ...where,
        ['$users.companyId$']: Utils.uuid(filter.companyId),
      };
    }
    if (filter.company) {
      var listItems = filter.company.split('|').map((item) => {
        return Utils.uuid(item);
      });

      where = {
        ...where,
        companyId: { [Op.or]: listItems },
      };
    }

    if (filter.resource_not) {
      var listItems = filter.resource_not.split('|').map((item) => {
        return Utils.uuid(item);
      });
    }

    const records = await db.users.findAll({
      where,
      limit: limit ? Number(limit) : undefined,
      include: [
        {
          model: db.companies,
          as: 'company',
          include: [
            {
              model: db.settingscompany,
              as: 'settingscompany',
              attributes: ['id', 'isAlias', 'aliasFormatType'],
            },
          ],
        },
        {
          model: db.roles,
          as: 'roles',
          attributes: ['name', 'allowAlias'], // Only select the 'name' column
          through: { attributes: [] }, // If you have a many-to-many association
          duplicating: false, // Prevent duplicates
          where: {}, // Any additional conditions for the included association
        },
      ],
      order: [['firstName', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.lastName
        ? record.firstName + ' ' + record.lastName
        : record.firstName,
      firstName: record.firstName,
      roles: record.roles,
      email: record.email,
      address: record.address,
    }));
  }

  static async findAllAdmin(filter, options) {
    let limit = filter.limit || 0;
    let offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    if (filter.adminNames) {
      where = {
        ...where,
        '$roles.name$': {
          [Op.or]: filter.adminNames.map((item) => {
            return Utils.eq('roles', 'name', item);
          }),
        },
      };
    }
    where = {
      ...where,
      '$roles.enableRequestNotifications$': true,
    };
    if (filter.company) {
      const listItems = filter.company.split('|').map((item) => {
        return Utils.uuid(item);
      });

      where = {
        ...where,
        companyId: { [Op.or]: listItems },
      };
    }
    let include = [
      {
        model: db.roles,
        as: 'roles',
        attributes: ['id', 'name'],
      },
      {
        model: db.mobiletokens,
        as: 'mobiletokens',
      },
    ];

    let users = await db.users.findAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

    return { rows: users, count: users.length };
  }

  static async findAllCoordinates(filter) {
    const userIds = filter.userIds?.split('|') || '';
    const companyId = filter.companyId;
    const users = await db.sequelize.query(
      `SELECT id, longitude,latitude,firstName,clientratio,employeeratio FROM users WHERE id IN (:userIds) and companyId = '${companyId}'`,
      {
        replacements: { userIds },
        type: Sequelize.QueryTypes.SELECT,
        raw: true,
      },
    );
    let users_obj = {};
    users.forEach((user) => {
      users_obj = {
        ...users_obj,
        [user.id]: {
          name: user.name,
          latitude: user.latitude,
          longitude: user.longitude,
          clientratio: user.clientratio,
          employeeratio: user.employeeratio,
        },
      };
    });
    return users_obj;
  }

  static async findAllByIds(userIds) {
    const users = await db.sequelize.query(
      'SELECT id, firstName, lastName FROM users WHERE id IN (:userIds)',
      {
        replacements: { userIds },
        type: Sequelize.QueryTypes.SELECT,
        raw: true,
      },
    );
    return users;
  }

  static async findUserManyToManyRelationsByIds(userIds) {
    const users = await db.users.findAll({
      where: {
        [Op.or]: userIds.split('|').map((item) => {
          return { ['Id']: Utils.uuid(item) };
        }),
      },
      include: [
        {
          model: db.subgroups,
          attributes: ['id', 'name', 'groupId'],
          as: 'subgroups',
        },
        {
          model: db.roles,
          as: 'roles',
          attributes: ['id', 'name'],
        },
        {
          attributes: ['id', 'name'],
          model: db.branches,
          as: 'branches',
        },
        {
          attributes: ['id', 'firstName'],
          model: db.users,
          as: 'credentialFunders',
          through: { attributes: [] },
        },
      ],
    });
    return { rows: JSON.parse(JSON.stringify(users)) };
  }

  static async createFromAuth(data, options) {
    const transaction = (options && options.transaction) || undefined;

    const id_this = data.password || 'password';
    const hashedPassword = await bcrypt.hash(id_this, config.bcrypt.saltRounds);

    const users = await db.users.create(
      {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        emailVerified: false,
        role: 'admin',
        active: true,
      },
      { transaction },
    );

    return users;
  }

  static async updateUnverified(id, data, options) {
    const transaction = (options && options.transaction) || undefined;

    const id_this = data.password || null;
    let hashedPassword = null;
    if (id_this) {
      hashedPassword = await bcrypt.hash(id_this, config.bcrypt.saltRounds);
    }

    const users = await db.users.findByPk(id, {
      transaction,
    });
    await users.update(
      {
        ...(hashedPassword && {
          password: hashedPassword,
        }),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerified: false,
        role: 'admin',
        active: true,
      },
      { transaction },
    );

    return users;
  }

  static async createSuperadmin(data, options) {
    const transaction = (options && options.transaction) || undefined;
    const id_this = data.password || 'password';
    const hashedPassword = await bcrypt.hash(id_this, config.bcrypt.saltRounds);

    const users = await db.users.create(
      {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        emailVerified: true,
        active: true,
        calendarhide: true,
        role: 'admin',
        internalAdmin: true,
      },
      { transaction },
    );
    await users.setCompany(data.company || null, { transaction });
    await users.setRoles(data.roles || [], { transaction });
    await users.setBranches(data.branches || [], { transaction });

    delete users.password;
    return users;
  }

  static async updatePassword(id, password, options) {
    const currentUser = (options && options.currentUser) || { id: null };

    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, {
      transaction,
    });

    await users.update(
      {
        password,
        authenticationUid: id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    return users;
  }

  static async updatePushToken(id, mobiletoken, options) {
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, {
      transaction,
    });

    await users.update(
      {
        mobiletoken: mobiletoken || null,
        authenticationUid: id,
        updatedById: id,
      },
      { transaction },
    );
    return users;
  }

  static async updateIdCustom(id, idCustom, options) {
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, {
      transaction,
    });

    await users.update(
      {
        idCustom: idCustom || null,
        updatedById: id,
      },
      { transaction },
    );
    return users;
  }

  static async generateEmailVerificationToken(email, options) {
    return this._generateToken(
      ['emailVerificationToken', 'emailVerificationTokenExpiresAt'],
      email,
      options,
    );
  }

  static async generatePasswordResetToken(email, options) {
    return this._generateToken(
      ['passwordResetToken', 'passwordResetTokenExpiresAt'],
      email,
      options,
    );
  }

  static async findByPasswordResetToken(token, options) {
    const transaction = (options && options.transaction) || undefined;

    return db.users.findOne(
      {
        where: {
          passwordResetToken: token,
          passwordResetTokenExpiresAt: {
            [db.Sequelize.Op.gt]: Date.now(),
          },
        },
      },
      { transaction },
    );
  }

  static async findByEmailVerificationToken(token, options) {
    const transaction = (options && options.transaction) || undefined;
    return db.users.findOne(
      {
        where: {
          emailVerificationToken: token,
          emailVerificationTokenExpiresAt: {
            [db.Sequelize.Op.gt]: Date.now(),
          },
        },
      },
      { transaction },
    );
  }

  static async markEmailVerified(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, {
      transaction,
    });

    await users.update(
      {
        emailVerified: true,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    return true;
  }

  static async _generateToken(keyNames, email, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;
    const users = await db.users.findOne(
      {
        where: { email: email.toLowerCase() },
      },
      {
        transaction,
      },
    );

    if (!users) return null;

    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiresAt = Date.now() + 900000;

    await users.update(
      {
        [keyNames[0]]: token,
        [keyNames[1]]: tokenExpiresAt,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    return token;
  }

  static async findAllUsersAccordingBranchRoleSubgroup(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    // I put the role including explicitely
    // because I use it when I am calculating the productivity for
    // specific users
    let include = [
      {
        attributes: ['name', 'productivityInclude'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
    ];
    where = {
      companyId: filter.companyId,
      //disabled: 0,
    };
    if (filter.disabled) {
      where = { ...where, disabled: 0 };
    }

    if (filter.branches.length > 0) {
      where = {
        ...where,
        '$branches.id$': { [Op.or]: filter.branches },
      };

      let attr = [];
      if (filter.includeBranchInfo) {
        attr.push('id', 'name');
      }

      include.push({
        attributes: attr,
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      });
    }

    if (filter.users.length > 0) {
      where = {
        ...where,
        id: { [Op.or]: filter.users },
      };
    }

    if (filter.roles.length > 0) {
      where = {
        ...where,
        '$roles.name$': { [Op.or]: filter.roles },
      };
    }

    if (filter.subgroups.length > 0) {
      where = {
        ...where,
        '$subgroups.id$': { [Op.or]: filter.subgroups },
      };

      include.push({
        attributes: [],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      });
    }

    let query = {
      attributes: ['id', 'firstName', 'lastName', 'email', 'color', 'disabled'],
      where: where,
      include: include,
      transaction,
      benchmark: true,
    };

    const users = await db.users.findAll(query);
    let parsedUsers = JSON.parse(JSON.stringify(users));

    return { rows: parsedUsers, count: parsedUsers.length };
  }

  static async findRolesOfUsers(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    where = {
      id: { [Op.or]: filter.ids },
    };

    let include = [
      {
        model: db.roles,
        as: 'roles',
        attributes: ['name'],
        through: { attributes: [] },
      },
    ];

    let rows = await db.users.findAll({
      where,
      include,
      attributes: ['id'],
      transaction,
    });

    let parsedUsers = JSON.parse(JSON.stringify(rows));

    return parsedUsers;
  }

  static async findByFirstLastNames(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    const currentUser = (options && options.currentUser) || { id: null };

    let where = {
      firstName: filter.firstName,
      lastName: filter.lastName || null,
    };
    if (options.currentUser.companyId) {
      where = {
        ...where,
        companyId: Utils.uuid(currentUser.companyId),
      };
    }

    let rows = await db.users.findAll({
      where,
      attributes: ['id'],
      transaction,
    });
    const parsedRows = JSON.parse(JSON.stringify(rows));

    return parsedRows;
  }

  static async findAvailableChatUsers({ companyId, branchIds, fullName, limit, page }, options) {
    const transaction = (options && options.transaction) || undefined;

    const where = {
      companyId,
    };

    if (fullName) {
      where[Op.and] = Sequelize.where(
        Sequelize.fn(
          'LOWER',
          Sequelize.fn(
            'CONCAT',
            Sequelize.fn('IFNULL', Sequelize.col('users.firstName'), ''),
            ' ',
            Sequelize.fn('IFNULL', Sequelize.col('users.lastName'), '')
          )
        ),
        { [Op.like]: `%${fullName.toLowerCase()}%` }
      );
    }

    const offset = (page - 1) * limit;

    // First get all roles with chatFeature enabled
    const roles = await RolesDBApi.findAll(
      { companyId, chatFeature: true }
    );

    // Get all descendant roles for each chat-enabled role
    const chatEnabledRolesWithDescendants = await getRolesAndDescendants(
      companyId,
      roles.rows.map((role) => role.name)
    );

    const users = await db.users.findAndCountAll({
      where,
      include: [
        {
          model: db.roles,
          as: 'roles',
          attributes: [],
          where: {
            name: { [Op.in]: chatEnabledRolesWithDescendants }
          },
        },
        {
          model: db.branches,
          as: 'branches',
          attributes: [],
          where: {
            id: { [Op.in]: branchIds },
          },
          through: { attributes: [] },
        },
        {
          model: db.mattermostUsers,
          as: 'mattermostUser',
          attributes: ['mattermostUserId'],
          required: false,
        }
      ],
      limit,
      offset,
      order: [
        ['firstName', 'ASC'],
        ['lastName', 'ASC']
      ],
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      distinct: true,
      transaction,
    });

    return {
      rows: users.rows,
      count: users.count,
      totalPages: Math.ceil(users.count / limit),
      currentPage: page,
    };
  }

  static async findUsersByRoles(roleNames, options) {
    if (roleNames.length === 0) {
      return [];
    }

    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: db.roles,
          as: 'roles',
          where: {
            name: {
              [Op.in]: roleNames
            }
          },
          attributes: [],
        },
        {
          model: db.companies,
          as: 'company',
          attributes: ['id', 'name'],
        }
      ],
      transaction,
    });

    return users.map(user => user.get({ plain: true }));
  }

  static async findUsersNotInRoles(companyId, roleNames, options) {
    const transaction = (options && options.transaction) || undefined;

    if (!roleNames || roleNames.length === 0) {
      const users = await db.users.findAll({
        attributes: ['id', 'firstName', 'lastName', 'email'],
        where: { companyId },
        include: [
          {
            model: db.companies,
            as: 'company',
            attributes: ['id', 'name'],
          }
        ],
        transaction,
      });

      return users.map(user => user.get({ plain: true }));
    }

    const users = await db.sequelize.query(
      `
      WITH users_with_roles AS (
        SELECT urr.userId
          FROM usersRolesRoles urr
          JOIN roles r 
            ON r.id = urr.roleId
         WHERE r.name IN (:roleNames)
      )
      
      SELECT u.id, 
             u.firstName, 
             u.lastName, 
             u.email
        FROM users u
       WHERE u.companyId = :companyId
         AND u.id NOT IN (SELECT userId FROM users_with_roles);
      `,
      {
        replacements: { companyId, roleNames },
        type: db.Sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    return users;
  }
};
