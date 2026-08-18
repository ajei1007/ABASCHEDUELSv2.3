const db = require('../models');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const fn = Sequelize.fn;
const col = Sequelize.col;

module.exports = class CompanyActiveUserStatsDBApi {
  static async create(data, options) {
    const transaction = (options && options.transaction) || undefined;

    const stats = await db.companyActiveUserStats.create(
      {
        companyId: data.companyId || null,
        employeeNumber: data.employeeNumber || 0,
        clientNumber: data.clientNumber || 0,
        date: data.date || null,
      },
      { transaction },
    );

    return stats;
  }

  static async update(id, data, options) {
    const transaction = (options && options.transaction) || undefined;

    const stats = await db.companyActiveUserStats.findByPk(id, {
      transaction,
    });

    await stats.update(
      {
        employeeNumber: data.employeeNumber || 0,
        clientNumber: data.clientNumber || 0,
      },
      { transaction },
    );

    return stats;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const stats = await db.companyActiveUserStats.findOne(
      { where },
      { transaction },
    );

    if (!stats) {
      return stats;
    }
    const output = stats.get({ plain: true });

    return output;
  }

  static async getActiveUsersCount(filter) {
    let where = {}
    if (filter.companyId) {
      where.companyId = filter.companyId;
    }
    if (filter.startDate && filter.endDate) {
      where.createdAt = {
        [Op.between]: [filter.startDate, filter.endDate]
      };
    }
    const result = await db.companyActiveUserStats.findAll({
      attributes: [
        'companyId',
        [fn('MAX', col('employeeNumber')), 'maxEmployeeCount'],
        [fn('MAX', col('clientNumber')), 'maxClientCount']
      ],
      where: where,
      group: ['companyId'],
      raw:true
    });

    let totalEmployeeCount = 0;
    let totalClientCount = 0;

    result.forEach(stat => {
      totalEmployeeCount += Number(stat.maxEmployeeCount);
      totalClientCount += Number(stat.maxClientCount);
    });

    return totalEmployeeCount + totalClientCount;
  }
};
