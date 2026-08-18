const db = require('../models');
const { Op } = require('sequelize');

class MattermostUsersDBApi {
  static async create(data, options) {
    const transaction = (options && options.transaction) || undefined;
    const mattermostUser = await db.mattermostUsers.create(data, {
      transaction,
    });
    return mattermostUser[0];
  }

  static async findByUserIds(userIds, options) {
    const transaction = (options && options.transaction) || undefined;
    const mattermostUsers = await db.mattermostUsers.findAll({
      where: {
        userId: { [Op.in]: userIds },
      },
      transaction,
    });
    return mattermostUsers;
  }

  static async removeByUserIds(userIds, options) {
    const transaction = (options && options.transaction) || undefined;
    const mattermostUsers = await db.mattermostUsers.destroy({
      where: {
        userId: { [Op.in]: userIds },
      },
      force: true, 
      transaction,
    });
    return mattermostUsers;
  }
}

module.exports = MattermostUsersDBApi; 