const db = require('../models');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
module.exports = class AuthIntegrationsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const authIntegrations = await db.authIntegrations.create(
      {
        id: data.id || undefined,
        username: data.username || null,
        password: data.password || null,
        userId: currentUser.id,
        token: data.token || null,
        integratingSoftware: data.integratingSoftware || '',
        createdById: currentUser.id,
        updatedById: currentUser.id,
        credentials: data.credentials || null,
      },
      { transaction },
    );

    await authIntegrations.setUser(data.user || null, {
      transaction,
    });

    await authIntegrations.setCompany(data.company || null, {
      transaction,
    });

    return authIntegrations;
  }
  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const authIntegrations = await db.authIntegrations.findByPk(id, {
      transaction,
    });

    await authIntegrations.update(
      {
        id: data.id || undefined,
        username: data.username || null,
        password: data.password || null,
        userId: currentUser.id,
        token: data.token || null,
        integratingSoftware: data.integratingSoftware || '',
        createdById: currentUser.id,
        updatedById: currentUser.id,
        credentials: data.credentials || null,
      },
      { transaction },
    );

    await authIntegrations.setUser(data.user || null, {
      transaction,
    });

    await authIntegrations.setCompany(data.company || null, {
      transaction,
    });

    return authIntegrations;
  }
  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const authIntegrations = await db.authIntegrations.findOne(
      { where },
      { transaction },
    );

    if (!authIntegrations) {
      return null;
    }

    const output = authIntegrations.get({ plain: true });
    return output;
  }

  static async checkLoginCredentialOfUser(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {}

    if (!filter){
      return []
    }

    // Filter by userId if provided
    if (filter.userId) {
      where.userId = {
        [Op.or]: [
          { [Op.eq]: filter.userId },
          { [Op.is]: null }
        ]
      };
    }

    // Filter by companyId if provided
    if (filter.companyId) {
      where.companyId = {
        [Op.or]: [
          { [Op.eq]: filter.companyId },
          { [Op.is]: null }
        ]
      };
    }


    // Filter by integratingSoftware if provided
    if (filter.integratingSoftware) {
      where.integratingSoftware = {
        [Op.or]: [
          { [Op.eq]: filter.integratingSoftware },
          { [Op.eq]: '' } // Assuming empty string is meant as a filter condition
        ]
      };
    }

    const authIntegrations = await db.authIntegrations.findAll(
      { where },
      { transaction },
    );

    if (!authIntegrations || authIntegrations.length === 0) {
      return [];
    }

    const output = JSON.parse(JSON.stringify(authIntegrations));
    return output;
  }
};