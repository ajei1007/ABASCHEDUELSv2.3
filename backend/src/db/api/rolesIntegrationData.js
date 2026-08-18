const db = require('../models');
const moment = require('moment');
const { ConflictError } = require('../../common/errors');


module.exports = class RolesIntegrationDataDBApi {
  static async create(data, options) {
    const transaction = (options && options.transaction) || undefined;

    const rolesIntegrationData = await db.rolesIntegrationData.create(
      {
        id: data.id || undefined,
        idOther: data.idOther || null,
        tableName: data.tableName || null,
        integratingSoftware: data.integratingSoftware || '',
        dataInOtherSoftware: data.dataInOtherSoftware || null,
        roleId: data.roleId || null,
        companyId: data.companyId || null,
      },
      { transaction },
    );

    return rolesIntegrationData;
  }

  static async createMany(rolesIntegrationDataArray, options) {
    const transaction = (options && options.transaction) || undefined;

    const rolesIntegrationData = await db.rolesIntegrationData.bulkCreate(rolesIntegrationDataArray, { transaction });
    return rolesIntegrationData;
  }

  static async update(id, data, options) {
    const transaction = (options && options.transaction) || undefined;

    const rolesIntegrationData = await db.rolesIntegrationData.findByPk(id, {
      transaction,
    });

    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    await rolesIntegrationData.update(
      {
        integratingSoftware: data.integratingSoftware || '',
        idOther: data.idOther || null,
        tableName: data.tableName || null,
        dataInOtherSoftware: data.dataInOtherSoftware || null,
        roleId: data.roleId || null,
        updatedAt: currentDateTime,
        companyId: data.companyId || null,
      },
      { transaction },
    );

    return rolesIntegrationData;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const rolesIntegrationData = await db.rolesIntegrationData.findOne(
      { where },
      { transaction },
    );

    if (!rolesIntegrationData) {
      return null;
    }

    const output = rolesIntegrationData.get({ plain: true });
    return output;
  }


  static async findAll(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    if (!filter.companyId || !filter.integratingSoftware){
      throw new ConflictError('Provided filter parameters are missing on RolesIntegrationDataDBApi.findAllBy');
    }

    const where = {
      companyId: filter.companyId,
      integratingSoftware: filter.integratingSoftware,
    }
  
    const rolesIntegrationData = await db.rolesIntegrationData.findAll({
      where,
      transaction,
      order: [['createdAt', 'DESC']],
    });

    // Map through the results and get plain objects
    const output = rolesIntegrationData.map((data) =>
      data.get({ plain: true }),
    );
    return output;
  }
};
