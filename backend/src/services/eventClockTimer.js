const db = require('../db/models');
const EventClockTimerDBApi = require('../db/api/eventClockTimer');
const EventsDBApi = require('../db/api/events');
const { getSecondsBetweenDates } = require('../utils/date');
const { ConflictError, NotFoundError, UnauthorizedError } = require('../common/errors');
const { scheduleClockOutReminder } = require('../utils/scheduleClockOutReminder');
const checkUserPermission = require('../utils/checkUserPermission');

module.exports = class EventClockTimerService {
  static async create(data, currentUser) {
    // Check if user has clockIn permission
    if (!checkUserPermission(currentUser, 'clockInOut')) {
      throw new UnauthorizedError('Access denied: clockInOut permission required');
    }

    const transaction = await db.sequelize.transaction();

    let record;

    try {
      // Check if the user already has an active session for any event
      const activeLog = await EventClockTimerDBApi.getLastActiveLogForUser(
        currentUser.id, 
        { 
          transaction
        }
      );

      const eventCount = await EventsDBApi.countBy({ id: data.event_id }, { transaction });

      if (eventCount === 0) {
        throw new NotFoundError('Event not found');
      }
      
      if (activeLog) {
        const errorMessage = `You already have an active session for ${
          data.event_id === activeLog.event_id ? 'this' : 'another'
        } event. Please clock out first.`;

        throw new ConflictError(errorMessage);
      }
      
      record = await EventClockTimerDBApi.create(data, { currentUser, transaction });

      await scheduleClockOutReminder(record.id, transaction);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return record;
  }

  static async update(id, data, currentUser) {
    // Check if user has clockIn permission
    if (!checkUserPermission(currentUser, 'clockInOut')) {
      throw new UnauthorizedError('Access denied: clockInOut permission required');
    }

    const transaction = await db.sequelize.transaction();
    try {
      // First, get the existing record to calculate duration
      const existingRecord = await EventClockTimerDBApi.findById(id, { transaction });
      
      if (!existingRecord) {
        throw new NotFoundError('Clock record not found');
      }

      if (existingRecord.end_time) {
        throw new ConflictError('This session has already been clocked out');
      }
      
      // Calculate duration in seconds if we have both start and end times
      if (data.end_time && existingRecord.start_time) {
        data.duration_seconds = getSecondsBetweenDates(
          existingRecord.start_time, 
          data.end_time
        );
      }
      
      const record = await EventClockTimerDBApi.update(id, data, { currentUser, transaction });
      await transaction.commit();
      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    // Check if user has clockIn permission
    if (!checkUserPermission(currentUser, 'clockInOut')) {
      throw new UnauthorizedError('Access denied: clockInOut permission required');
    }

    const transaction = await db.sequelize.transaction();
    try {
      const record = await EventClockTimerDBApi.remove(id, { currentUser, transaction });

      if (!record) {
        throw new NotFoundError('Clock record not found');
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  static async getClockLogs(eventId, filters, currentUser) {
    // Check if user has clockIn permission
    if (!checkUserPermission(currentUser, 'clockInOut')) {
      throw new UnauthorizedError('Access denied: clockInOut permission required');
    }

    try {
      if (!filters.user_id && currentUser) {
        filters.user_id = currentUser.id;
      }

      const logs = await EventClockTimerDBApi.getClockLogs(eventId, filters);
      
      const totalDurationSeconds = logs.reduce((total, log) => {
        return total + (log.duration_seconds || 0);
      }, 0);

      return {
        logs,
        total_duration_seconds: totalDurationSeconds,
      };
    } catch (error) {
      throw error;
    }
  }
};
