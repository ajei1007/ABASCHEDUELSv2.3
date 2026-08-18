const EventsDBApi = require('../db/api/events');
const { createCompany, createUser } = require('./helpers');

describe('Events status filtering behavior', () => {
  let transaction;
  let db;
  let company;
  let user;
  let activeEvent;
  let canceledEvent;
  let deletedEvent;

  beforeEach(async () => {
    db = require('../db/models');
    transaction = await db.sequelize.transaction();

    company = await createCompany(db, transaction);
    user = await createUser(db, transaction, { companyId: company.id });
    
    const baseEventData = {
      start: new Date('2025-09-01T10:00:00Z'),
      end: new Date('2025-09-01T11:00:00Z'),
      startDatetime: new Date('2025-09-01T10:00:00Z'),
      endDatetime: new Date('2025-09-01T11:00:00Z'),
      startRecur: '2025-09-01',
      endRecur: '2025-09-02',
      frequency: 'Daily',
      interval: 1,
      createdById: user.id,
      userIds: [user.id],
      users: [user.id]
    };

    try {
      activeEvent = await EventsDBApi.create({
        ...baseEventData,
        isCancelled: false,
      }, { currentUser: user, transaction });

      canceledEvent = await EventsDBApi.create({
        ...baseEventData,
        isCancelled: true,
      }, { currentUser: user, transaction });

      deletedEvent = await EventsDBApi.create({
        ...baseEventData,
        isCancelled: false,
      }, { currentUser: user, transaction });
      
      await db.events.destroy({ 
        where: { id: deletedEvent.id },
        transaction 
      });

    } catch (error) {
      console.error('Error creating test events:', error);
      throw error;
    }
  });

  afterEach(async () => {
    if (transaction) {
      await transaction.rollback();
    }
  });

  describe('when filtering events by status using findAllEventsForTable', () => {
    const getBaseFilter = () => ({
      companyId: user.companyId,
      start: '2025-09-01 00:00:00',
      end: '2025-09-02 00:00:00',
      limit: 10,
      page: 1,
      roles: [],
    });

    it('should return only active events when status contains showActive only', async () => {
      const filter = {
        ...getBaseFilter(),
        status: ['showActive'],
      };
      
      const result = await EventsDBApi.findAllEventsForTable(filter, { transaction });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(activeEvent.id);
      expect(result.rows[0].isCancelled).toBe(false);
      expect(result.rows[0].deletedAt).toBeNull();
    });

    it('should return only canceled events when status contains showCanceled only', async () => {
      const result = await EventsDBApi.findAllEventsForTable({
        ...getBaseFilter(),
        status: ['showCanceled'],
      }, { transaction });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(canceledEvent.id);
      expect(result.rows[0].isCancelled).toBe(true);
      expect(result.rows[0].deletedAt).toBeNull();
    });

    it('should return only deleted events when status contains showDeleted only', async () => {
      const result = await EventsDBApi.findAllEventsForTable({
        ...getBaseFilter(),
        status: ['showDeleted'],
      }, { transaction });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(deletedEvent.id);
      expect(result.rows[0].deletedAt).not.toBeNull();
    });

    it('should return both active and canceled events when status contains both showActive and showCanceled', async () => {
      const result = await EventsDBApi.findAllEventsForTable({
        ...getBaseFilter(),
        status: ['showActive', 'showCanceled'],
      }, { transaction });

      expect(result.rows).toHaveLength(2);

      const eventIds = result.rows.map(r => r.id).sort();
      expect(eventIds).toEqual([activeEvent.id, canceledEvent.id].sort());

      const isCancelledValues = result.rows.map(r => r.isCancelled).sort();
      expect(isCancelledValues).toEqual([false, true]);

      result.rows.forEach(row => {
        expect(row.deletedAt).toBeNull();
      });
    });

    it('should return both canceled and deleted events when status contains showCanceled and showDeleted', async () => {
      const result = await EventsDBApi.findAllEventsForTable({
        ...getBaseFilter(),
        status: ['showCanceled', 'showDeleted'],
      }, { transaction });

      expect(result.rows).toHaveLength(2);

      const eventIds = result.rows.map(r => r.id).sort();
      expect(eventIds).toEqual([canceledEvent.id, deletedEvent.id].sort());

      const canceledEvents = result.rows.filter(r => r.deletedAt === null);
      const deletedEvents = result.rows.filter(r => r.deletedAt !== null);

      expect(canceledEvents).toHaveLength(1);
      expect(canceledEvents[0].id).toBe(canceledEvent.id);
      expect(canceledEvents[0].isCancelled).toBe(true);

      expect(deletedEvents).toHaveLength(1);
      expect(deletedEvents[0].id).toBe(deletedEvent.id);
    });

    it('should return all events when status contains showActive, showCanceled, and showDeleted', async () => {
      const result = await EventsDBApi.findAllEventsForTable({
        ...getBaseFilter(),
        status: ['showActive', 'showCanceled', 'showDeleted'],
      }, { transaction });

      expect(result.rows).toHaveLength(3);

      const eventIds = result.rows.map(r => r.id).sort();
      expect(eventIds).toEqual([activeEvent.id, canceledEvent.id, deletedEvent.id].sort());

      const activeEvents = result.rows.filter(r => r.deletedAt === null && !r.isCancelled);
      const canceledEvents = result.rows.filter(r => r.deletedAt === null && r.isCancelled);
      const deletedEvents = result.rows.filter(r => r.deletedAt !== null);

      expect(activeEvents).toHaveLength(1);
      expect(activeEvents[0].id).toBe(activeEvent.id);

      expect(canceledEvents).toHaveLength(1);
      expect(canceledEvents[0].id).toBe(canceledEvent.id);

      expect(deletedEvents).toHaveLength(1);
      expect(deletedEvents[0].id).toBe(deletedEvent.id);
    });

    it('should return both active and deleted events when status contains showActive and showDeleted', async () => {
      const result = await EventsDBApi.findAllEventsForTable({
        ...getBaseFilter(),
        status: ['showActive', 'showDeleted'],
      }, { transaction });

      expect(result.rows).toHaveLength(2);

      const eventIds = result.rows.map(r => r.id).sort();
      expect(eventIds).toEqual([activeEvent.id, deletedEvent.id].sort());

      const activeEvents = result.rows.filter(r => r.deletedAt === null);
      const deletedEvents = result.rows.filter(r => r.deletedAt !== null);

      expect(activeEvents).toHaveLength(1);
      expect(activeEvents[0].id).toBe(activeEvent.id);
      expect(activeEvents[0].isCancelled).toBe(false);

      expect(deletedEvents).toHaveLength(1);
      expect(deletedEvents[0].id).toBe(deletedEvent.id);
    });
  });
});