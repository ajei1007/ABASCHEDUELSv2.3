const db = require('../models');
const { ValidationError: ApiValidationError } = require('../../common/errors');

module.exports = class OptimizerActionLogsDBApi {
  /**
   * Create a new optimizer action log
   * @param {Object} data - Log data
   * @param {Object} options - Transaction and user options
   * @returns {Promise<Object>} - Created log
   */
  static async create(data, options) {
    const transaction = (options && options.transaction) || undefined;

    if (!options || !options.currentUser) {
      throw new ApiValidationError(
        'Missing current user information for creating optimizer action log',
      );
    }

    const currentUser = options.currentUser;

    const logData = {
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      status: data.status || null,
      requestPayload: data.requestPayload || null,
      responsePayload: data.responsePayload || null,
      triggerBy: currentUser.id,
    };

    const createdLog = await db.optimizerActionLogs.create(logData, {
      transaction,
    });
    return createdLog;
  }

  /**
   * Find optimizer action logs with filtering and pagination
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - Paginated logs with count
   */
  static async findAndCountAll(filters) {
    const { companyId, userId, startDate, endDate, status, page, limit, triggerByUser } =
      filters;

    // Build where conditions
    const whereConditions = {};

    if (status) {
      whereConditions.status = status;
    }

    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) {
        whereConditions.createdAt[db.Sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereConditions.createdAt[db.Sequelize.Op.lte] = new Date(endDate);
      }
    }

    // Build include conditions for user filtering
    const includeConditions = [
      {
        model: db.users,
        as: 'triggerByUser',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        required: false,
        include: [
          {
            model: db.companies,
            as: 'company',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
      },
    ];

    // Add user ID filter if specified
    if (userId) {
      whereConditions.triggerBy = userId;
    }

    // Add triggered by user name filter if specified
    if (triggerByUser) {
      includeConditions[0].where = db.Sequelize.where(
        db.Sequelize.fn('LOWER',
          db.Sequelize.fn('CONCAT', 
            db.Sequelize.col('triggerByUser.firstName'), 
            ' ', 
            db.Sequelize.col('triggerByUser.lastName')
          )
        ),
        {
          [db.Sequelize.Op.like]: `%${triggerByUser.toLowerCase()}%`
        }
      );
      includeConditions[0].required = true;
    }

    // Add company filter through user association if specified
    if (companyId) {
      includeConditions[0].include[0].where = { id: companyId };
      includeConditions[0].include[0].required = true;
      includeConditions[0].required = true;
    }

    // Build query options
    const queryOptions = {
      where: whereConditions,
      include: includeConditions,
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: (page - 1) * limit,
    };

    // Execute query
    const result = await db.optimizerActionLogs.findAndCountAll(queryOptions);
    return result;
  }

  /**
   * Find optimizer action log by primary key
   * @param {String} id - Log ID
   * @returns {Promise<Object|null>} - Found log or null
   */
  static async findByPk(id) {
    if (!id) {
      throw new ApiValidationError('Log ID is required');
    }

    const log = await db.optimizerActionLogs.findByPk(id);
    return log;
  }

  /**
   * Soft delete an optimizer action log
   * @param {String} id - Log ID to delete
   * @param {Object} options - Transaction options
   * @returns {Promise<Boolean>} - Success status
   */
  static async destroy(id, options) {
    const transaction = (options && options.transaction) || undefined;

    if (!id) {
      throw new ApiValidationError('Log ID is required');
    }

    const log = await db.optimizerActionLogs.findByPk(id);

    if (!log) {
      throw new ApiValidationError('Action log not found');
    }

    await log.destroy({ transaction });
    return true;
  }
};
