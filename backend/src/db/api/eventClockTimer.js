const db = require('../models');

module.exports = class EventClockTimerDBApi {
  static async create(data, options) {
    const currentUser = (options.currentUser) || { id: null };
    const transaction = options.transaction;

    const record = await db.eventClockTimer.create({
      id: data.id,
      user_id: data.user_id || currentUser.id,
      event_id: data.event_id,
      start_time: data.start_time,
      lat_start: data.lat_start,
      lon_start: data.lon_start,
    }, { transaction });

    if (data.user) await record.setUser(data.user, { transaction });
    if (data.event) await record.setEvent(data.event, { transaction });

    return record;
  }

  static async update(id, data, options) {
    const transaction = options.transaction;

    const record = await db.eventClockTimer.findByPk(id, { transaction });

    if (!record) {
      return null;
    }

    await record.update({
      end_time: data.end_time || record.end_time,
      duration_seconds: data.duration_seconds || record.duration_seconds,
      lat_end: data.lat_end || record.lat_end,
      lon_end: data.lon_end || record.lon_end,
      note: data.note || record.note,
    }, { transaction });

    if (data.user) await record.setUser(data.user, { transaction });
    if (data.event) await record.setEvent(data.event, { transaction });

    return record;
  }

  static async remove(id, options) {
    const transaction = options.transaction;
    
    const record = await db.eventClockTimer.findByPk(id, { transaction });

    if (!record) {
      return null;
    }
    
    await record.destroy({ transaction });
    
    return true;
  }

  static async getClockLogs(eventId, filters) {
    const where = { event_id: eventId };

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }
    if (filters.start_time) {
      where.start_time = { [db.Sequelize.Op.gte]: new Date(filters.start_time) };
    }
    if (filters.end_time) {
      where.end_time = { [db.Sequelize.Op.lte]: new Date(filters.end_time) };
    }

    return await db.eventClockTimer.findAll({
      where,
      include: [
        {
          model: db.users,
          attributes: ['id', 'firstName', 'lastName']
        },
      ],
      order: [['start_time', 'ASC']],
    });
  }

  static async getLastActiveLogForUser(userId, options = {}) {
    const transaction = options.transaction;
    
    const whereClause = {
      user_id: userId,
      end_time: null
    };
    
    const activeLog = await db.eventClockTimer.findOne({
      where: whereClause,
      include: [
        {
          model: db.users,
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['start_time', 'DESC']],
      transaction
    });
    
    return activeLog;
  }

  static async findById(id, options) {
    const transaction = options.transaction;
    const include = options.include || [];
    const attributes = options.attributes;
    
    return await db.eventClockTimer.findByPk(id, {
      transaction,
      include,
      ...(attributes ? { attributes } : {})
    });
  }
};
