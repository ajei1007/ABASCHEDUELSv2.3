const db = require('../models');
const moment = require('moment');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const { ConflictError } = require('../../common/errors');
const Utils = require('../utils');
const logger = require('../../services/logger/logger');
const { v4: uuidv4 } = require('uuid');



module.exports = class IntegrationImportSyncAuditDBApi {
  static async upsert(where, options) {
    const transaction = (options && options.transaction) || undefined;

    let lastAction = await db.integrationImportSyncAudit.findOne(
      { where },
      { transaction },
    );

    // if there is no, then create
    if (!lastAction) {
        lastAction = await db.integrationImportSyncAudit.create(
          {
            integratingSoftware: where.integratingSoftware || '',
            action: where.action || 'unspecified', // this is the default,
            companyId: where.companyId || null,
            resourceType: where.resourceType || 'unspecified', // this is the default
          },
          { transaction },
        );

      return lastAction;
    }

    // if there is, then update
    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    await lastAction.set('updatedAt', currentDateTime);
    await lastAction.changed('updatedAt', true);
    await lastAction.save({ transaction });

    return lastAction;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const integrationImportSyncAudit = await db.integrationImportSyncAudit.findOne(
      { where },
      { transaction },
    );

    if (!integrationImportSyncAudit) {
      return null;
    }

    const output = integrationImportSyncAudit.get({ plain: true });
    return output;
  }
};
