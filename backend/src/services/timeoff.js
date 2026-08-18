const db = require('../db/models');
const TimeoffDBApi = require('../db/api/timeoff');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');
/* Push Notification */
// const {
//   sendCreatedTimeoffNotification,
//   sendDeletedTimeoffNotification,
//   sendTimeOffStatusChangeNotification
// } = require('../utils/pushNotifications');

module.exports = class TimeoffService {
  static async create(req, data, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      await TimeoffDBApi.create(
        data,
        {
          currentUser,
          transaction,
        },
      );

      /* Send push notification */
      // await sendCreatedTimeoffNotification(req)

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let timeoff = await TimeoffDBApi.findBy(
        {id},
        {transaction},
      );

      if (!timeoff) {
        throw new ValidationError(
          'timeoffNotFound',
        );
      }

      await TimeoffDBApi.update(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );

      /* Send push notification */
      // await sendTimeOffStatusChangeNotification(data);

      await transaction.commit();
      return timeoff;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError(
          'errors.forbidden.message',
        );
      }

      const timeoff = await TimeoffDBApi.remove(
        id,
        {
          currentUser,
          transaction,
        },
      );

      /* Send push notification */
      // await sendDeletedTimeoffNotification(timeoff, currentUser)

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

