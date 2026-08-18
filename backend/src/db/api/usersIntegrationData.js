const db = require('../models');
const moment = require('moment');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const { ConflictError } = require('../../common/errors');
const Utils = require('../utils');


module.exports = class UsersInegrationDataDBApi {
  static async create(data, options) {
    const transaction = (options && options.transaction) || undefined;

    const usersIntegrationData = await db.usersIntegrationData.create(
      {
        id: data.id || undefined,
        idOther: data.idOther || null,
        tableName: data.tableName || null,
        integratingSoftware: data.integratingSoftware || '',
        dataInOtherSoftware: data.dataInOtherSoftware || null,
        userId: data.userId || null,
        otherTableName: data.otherTableName || null,
        companyId: data.companyId || null,
        resourceType: data.resourceType || 'unspecified', // this is the default
      },
      { transaction },
    );

    return usersIntegrationData;
  }

  static async createMany(usersIntegrationDataArray, options) {
    const transaction = (options && options.transaction) || undefined;

    const usersIntegrationData = await db.usersIntegrationData.bulkCreate(usersIntegrationDataArray, { transaction });
    return usersIntegrationData;
  }

  static async update(id, data, options) {
    const transaction = (options && options.transaction) || undefined;

    const usersIntegrationData = await db.usersIntegrationData.findByPk(id, {
      transaction,
    });

    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    await usersIntegrationData.update(
      {
        integratingSoftware: data.integratingSoftware || '',
        idOther: data.idOther || null,
        tableName: data.tableName || null,
        dataInOtherSoftware: data.dataInOtherSoftware || null,
        userId: data.userId || null,
        updatedAt: currentDateTime,
        otherTableName: data.otherTableName || null,
        companyId: data.companyId || null,
        resourceType: data.resourceType || 'unspecified', // this is the default
      },
      { transaction },
    );

    return usersIntegrationData;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const usersIntegrationData = await db.usersIntegrationData.findOne(
      { where },
      { transaction },
    );

    if (!usersIntegrationData) {
      return null;
    }

    const output = usersIntegrationData.get({ plain: true });
    return output;
  }

  static async findAllByUserIds(filter, options) {
    const transaction = (options && options.transaction) || undefined;

    if (!Array.isArray(filter.userIds) || filter.userIds.length === 0) {
      return [];
    }

    const where = {
      userId: {
        [Op.in]: filter.userIds,
      },
    }
    if (filter.integratingSoftware) {
      where.integratingSoftware = filter.integratingSoftware;
    }

    const usersIntegrationData = await db.usersIntegrationData.findAll({
      where,
      transaction,
    });

    if (!usersIntegrationData || usersIntegrationData.length === 0) {
      return [];
    }

    // Map through the results and get plain objects
    const output = usersIntegrationData.map((data) =>
      data.get({ plain: true }),
    );
    return output;
  }

  static async findAllByResourceType(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    if (!filter.companyId || !filter.resourceType || !filter.integratingSoftware){
      throw new ConflictError('Provided filter parameters are missing on UsersInegrationDataDBApi.findAllByResourceType');
    }

    const where = {
      companyId: filter.companyId,
      resourceType: filter.resourceType,
      integratingSoftware: filter.integratingSoftware,
    }
  
    const usersIntegrationData = await db.usersIntegrationData.findAll({
      where,
      transaction,
      order: [['createdAt', 'DESC']],
    });

    // Map through the results and get plain objects
    const output = usersIntegrationData.map((data) =>
      data.get({ plain: true }),
    );
    return output;
  }
  
  static async findAllForImportModal(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    if (!filter.companyId || !filter.resourceType || !filter.integratingSoftware){
      throw new ConflictError('Provided filter parameters are missing on UsersInegrationDataDBApi.findAllByResourceType');
    }

    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
    if (limitOffset.lim < 0 || limitOffset.off < 0) {
      return {result: [], count: 0}
    }

    const where = {
      companyId: filter.companyId,
      resourceType: filter.resourceType,
      integratingSoftware: filter.integratingSoftware,
    }
  
    const payload = await db.usersIntegrationData.findAndCountAll({
      where,
      attributes: [
        'id',
        'integratingSoftware',
        'resourceType',
        'userId',
        'createdAt',
        'updatedAt',
        'idOther'
      ],
      include: [
        {
          attributes: ['id', 'firstName', 'lastName'],
          model: db.users,
          as: 'user',
        },
      ],
      limit: limitOffset.lim,
      offset: limitOffset.off,
      transaction,
      order: [['createdAt', 'DESC']],
    });

    return {result: payload.rows, count: payload.count};
  }
};
