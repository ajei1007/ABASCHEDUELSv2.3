const db = require('../db/models');
const CompaniesDBApi = require('../db/api/companies');
const UsersCacheApi = require('../cache/users');
const ValidationError = require('./notifications/errors/validation');
const isValidSubscriptionType = require('../utils/isValidSubscriptionType');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');
const { withTransaction } = require('../utils/transactionUtils');

module.exports = class CompaniesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let company = await CompaniesDBApi.findBy(
        { name: data.name },
        { transaction },
      );

      if (company) {
        throw new ValidationError('companies.alreadyExists');
      }

      // check the subscription type,
      // if it is not valid, just set null,
      // by default person will be set on db layer
      if (data.subscriptionType && !isValidSubscriptionType(data.subscriptionType)) {
        data.subscriptionType = null;
      }

      await CompaniesDBApi.create(data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let companies = await CompaniesDBApi.findBy({ id }, { transaction });

      if (!companies) {
        throw new ValidationError('companies.notFound');
      }

      // check the subscription type,
      // if it is not valid just set the previous one
      if (data.subscriptionType && !isValidSubscriptionType(data.subscriptionType)) {
        data.subscriptionType = companies.subscriptionType;
      }

      await CompaniesDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return companies;
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

      await CompaniesDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateOnboardedStatus(companyId, onboarded, options = {}) {
    return withTransaction(async (transaction) => {
      await CompaniesDBApi.updateOnboardedStatus(companyId, onboarded, { transaction });
      
      // Ensures the company associated with the user is kept up to date
      UsersCacheApi.removeAll();
    }, options);
  }
  
};
