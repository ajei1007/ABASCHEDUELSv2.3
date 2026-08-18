const db = require('../db/models');
const AvailabilitiesDBApi = require('../db/api/availabilities');
const ValidationError = require('./notifications/errors/validation');
const validateTimeAndDate = require('../utils/validateTimeAndDate');

const {
  sendMultipleOnCallNotifications,
  sendAppointmentStatusChangeNotificationToAdmins,
  sendAavailabilityRequestNotificationToAdmins,
  sendAppointmentStatusChangeNotificationToUsers,
  sendAvailabilityRequestStatusChangeNotificationToUsers,
} = require('../utils/pushNotifications');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class AvailabilitiesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      validateTimeAndDate(
        {
          start: data.startTime,
          end: data.endTime,
          startRecur: data.startRange,
          endRecur: data.endRange,
        },
        'availabilities',
      );

      // Adding default values to make endpoint backward compatible
      // Should be removed after making mobile changes 
      data.frequency = data?.frequency ?? 'Weekly';
      data.interval = data?.interval || 1;
      data.bysetpos =
        data.frequency === 'Monthly'
          ? data.bysetpos && Number.isInteger(Number(data.bysetpos)) 
            ? `${data.bysetpos}`
            : '1'
          : undefined;

      let availability = await AvailabilitiesDBApi.create(data, {
        currentUser,
        transaction,
      });

      const parsedAvailability = JSON.parse(JSON.stringify(availability));
      if (parsedAvailability.oncall) {
        sendMultipleOnCallNotifications(
          [parsedAvailability.userId],
          parsedAvailability,
          currentUser,
        );
      }

      if (data.status !== 'Approved' && currentUser) {
        sendAavailabilityRequestNotificationToAdmins(data, currentUser)
      }

      await transaction.commit();
      return availability;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      validateTimeAndDate(
        {
          start: data.startTime,
          end: data.endTime,
          startRecur: data.startRange,
          endRecur: data.endRange,
        },
        'availabilities',
      );

      let availabilities = await AvailabilitiesDBApi.findBy(
        { id },
        { transaction },
      );

      if (!availabilities) {
        throw new ValidationError('availabilitiesNotFound');
      }

      // Adding default values to make endpoint backward compatible
      // Should be removed after making changes to mobile and frontend
      data.frequency = data?.frequency ?? availabilities?.frequency ?? 'Weekly';
      data.interval = data?.interval || availabilities?.interval || 1;
      data.bysetpos =
        data.frequency === 'Monthly'
          ? data.bysetpos && Number.isInteger(Number(data.bysetpos))
            ? `${data.bysetpos}`
            : '1'
          : availabilities?.bysetpos;

      const availability = await AvailabilitiesDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      const parsedAvailability = JSON.parse(JSON.stringify(availability));
      if (parsedAvailability.oncall) {
        sendMultipleOnCallNotifications(
          [parsedAvailability.userId],
          parsedAvailability,
          currentUser,
        );
      }

      await transaction.commit();
      return availabilities;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateStatus(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      // TODO no need to get all values of the availability in such cases
      let availability = await AvailabilitiesDBApi.findBy(
        { id },
        { transaction },
      );

      if (!availability) {
        throw new ValidationError('availabilitiesNotFound');
      }

      // If existing availability status is 'Delete' and admin sending 'Approved', then delete the availability
      if (availability.statusType === 'Delete' && data.status === 'Approved') {
        await AvailabilitiesDBApi.remove(id, {
          currentUser,
          transaction,
        });
      } else {
        await AvailabilitiesDBApi.updateStatus(id, data, {
          currentUser,
          transaction,
        });
      }
      sendAvailabilityRequestStatusChangeNotificationToUsers(JSON.parse(JSON.stringify(availability)), data.status, currentUser);

      await transaction.commit();
      return availability;
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

      await AvailabilitiesDBApi.remove(id, {
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
