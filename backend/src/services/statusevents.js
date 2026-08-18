const db = require('../db/models');
const StatuseventsDBApi = require('../db/api/statusevents');
const ValidationError = require('./notifications/errors/validation');
const { sendAppointmentStatusChangeNotificationToAdmins, sendAppointmentStatusChangeNotificationToUsers } = require('../utils/pushNotifications');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class StatuseventsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let res = await StatuseventsDBApi.create(data, {
        currentUser,
        transaction,
      });

      // Push notification
      sendAppointmentStatusChangeNotificationToAdmins(data, currentUser);

      await transaction.commit();
      return res.dataValues;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateStatus(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let statusevents = await StatuseventsDBApi.findBy(
        { id },
        { transaction },
      );

      if (!statusevents) {
        throw new ValidationError('statuseventsNotFound');
      }

      const updatedStatusevents = await StatuseventsDBApi.updateStatus(
        id,
        data,
        {
          currentUser,
          transaction,
        },
      );
      // Push notification
      sendAppointmentStatusChangeNotificationToUsers(data, currentUser);

      await transaction.commit();
      return JSON.parse(JSON.stringify(updatedStatusevents));
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let statusevents = await StatuseventsDBApi.findBy(
        { id },
        { transaction },
      );

      if (!statusevents) {
        throw new ValidationError('statuseventsNotFound');
      }

      const updatedStatusevents = await StatuseventsDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      // Push notification
      sendAppointmentStatusChangeNotificationToAdmins(data, currentUser);

      await transaction.commit();
      return JSON.parse(JSON.stringify(updatedStatusevents));
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

      await StatuseventsDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
