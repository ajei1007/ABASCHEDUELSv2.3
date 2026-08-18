const db = require('../models');

module.exports = class EventsIntegrationDataDBApi {
  /**
   * Create a new EventsIntegrationData record
   * @param {Object} data
   * @param {Object} options
   */
  static async create(data, options = {}) {
    const transaction = options.transaction;
    const record = await db.eventsIntegrationData.create(
      {
        id: data.id || undefined,
        integratingSoftware: data.integratingSoftware,
        eventId: data.eventId,
        eventIdOther: data.eventIdOther,
        recurringEventIdOther: data.recurringEventIdOther,
      },
      { transaction },
    );
    return record;
  }

  /**
   * Update an existing EventsIntegrationData record
   * @param {String} id
   * @param {Object} data
   * @param {Object} options
   */
  static async update(id, data, options = {}) {
    const transaction = options.transaction;
    const record = await db.eventsIntegrationData.findByPk(id, { transaction });
    if (!record) throw new Error(`Record not found: ${id}`);

    await record.update(
      {
        integratingSoftware: data.integratingSoftware,
        eventId: data.eventId,
        eventIdOther: data.eventIdOther,
        recurringEventIdOther: data.recurringEventIdOther,
      },
      { transaction },
    );
    return record;
  }

  /**
   * Remove a EventsIntegrationData record
   * @param {String} id
   * @param {Object} options
   */
  static async remove(id, options = {}) {
    const transaction = options.transaction;
    const record = await db.eventsIntegrationData.findByPk(id, { transaction });
    if (!record) throw new Error(`Record not found: ${id}`);

    await record.destroy({ transaction });
    return record;
  }

  /**
   * Upsert multiple integration rows for events.
   * @param {Array<{eventId: string, eventIdOther: string}>} results
   * @param {string} integratingSoftware
   * @param {Object} options
   */
  static async upsertIntegrationRows(
    results,
    integratingSoftware,
    options = {},
  ) {
    const transaction = options.transaction;

    for (const { eventId, eventIdOther, recurringEventIdOther } of results) {
      // Fetch existing integration rows for this event and software
      const existingRows = await db.eventsIntegrationData.findAll({
        where: { eventId, integratingSoftware },
        transaction,
      });
      // Find exact match by external ID
      const match = existingRows.find(
        (r) => String(r.eventIdOther) === String(eventIdOther),
      );
      if (match) {
        // Update the existing row's timestamp or data
        await this.update(
          match.id,
          { eventId, eventIdOther, integratingSoftware, recurringEventIdOther },
          { transaction },
        );
      } else {
        // Create a new linkage row
        await this.create(
          { eventId, eventIdOther, integratingSoftware, recurringEventIdOther },
          { transaction },
        );
      }
    }
  }

  /**
   * Find integration rows by any combination of { id, eventId, eventIdOther }.
   *
   * – If only `id` is supplied → returns a single record (or null).
   * – Otherwise → returns an array that matches all supplied fields.
   *
   * @param {Object} filter   e.g. { id, eventId, eventIdOther, recurringEventIdOther }
   * @param {Object} options  e.g. { transaction }
   */
  static async findAll(filter = {}, options = {}) {
    const { id, eventId, eventIdOther, recurringEventIdOther } = filter;
    const transaction = options.transaction;

    // ------------------------- fast path: primary key --------------------
    if (id && !eventId && !eventIdOther) {
      return db.eventsIntegrationData.findOne({
        where: { id },
        include: [
          {
            model: db.events,
            as: 'event',
            required: true, // exclude soft-deleted events via paranoid
          },
        ],
        transaction,
      });
    }

    // ------------------------- composite queries -------------------------
    const where = {};
    if (id) where.id = id;
    if (eventId) where.eventId = eventId;
    if (eventIdOther) where.eventIdOther = eventIdOther;
    if (recurringEventIdOther) where.recurringEventIdOther = recurringEventIdOther;

    return db.eventsIntegrationData.findAll({
      where,
      include: [
        {
          model: db.events,
          as: 'event',
          required: true, // exclude soft-deleted events via paranoid
        },
      ],
      transaction,
    });
  }
};
