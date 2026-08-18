const momentTz = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const EventsDBApi = require('../../../db/api/events');
const EventsIntegrationDataDBApi = require('../../../db/api/eventsIntegrationData');
const db = require('../../../db/models');
const indexedDays = require('../../../constants/indexedDays');
const { listAppointmentsTherapyPMS } = require('../therapypms');

const PAGE_WINDOW_DEFAULT_MS = 24 * 60 * 60 * 1000;

const fmtDate = (d, tz) => momentTz(d).tz(tz || 'UTC').format('YYYY-MM-DD');

function calculateRecurrenceInfo(appt, startTz, endTz, zone) {
  let startRecur, endRecur, daysOfWeek;
  
  if (appt.recurring_details && appt.recurring_details.start_date && appt.recurring_details.end_date) {
    // Parse MM/DD/YYYY format from recurring_details
    const recurStartDate = momentTz.tz(appt.recurring_details.start_date, 'MM/DD/YYYY', zone);
    const recurEndDate = momentTz.tz(appt.recurring_details.end_date, 'MM/DD/YYYY', zone);
    
    startRecur = recurStartDate.format('YYYY-MM-DD');
    endRecur = recurEndDate.clone().add(1, 'day').format('YYYY-MM-DD');
    
    // Collect all unique weekdays within the recurrence range
    const weekdaysSet = new Set();
    let currentDate = recurStartDate.clone();
    
    while (currentDate.isSameOrBefore(recurEndDate)) {
      weekdaysSet.add(indexedDays[currentDate.day()]);
      currentDate.add(1, 'day');
    }
    
    daysOfWeek = Array.from(weekdaysSet);
  } else {
    // Fallback to single appointment date if no recurring_details
    startRecur = startTz.format('YYYY-MM-DD');
    endRecur = endTz.clone().startOf('day').add(1, 'day').format('YYYY-MM-DD');
    daysOfWeek = [indexedDays[startTz.day()]];
  }
  
  return { startRecur, endRecur, daysOfWeek };
}

function keepAppointment(appt, min, max, staffSet, clientSet, activitySet) {
  const startMs = Date.parse(appt.from_time);
  const endMs = Date.parse(appt.to_time);
  const inWindow = startMs >= min && endMs <= max;
  const activity_ids = appt.activity_ids;
  const hasActivity = activity_ids.some(id => activitySet.has(id));
  return (
    inWindow &&
    staffSet.has(+appt.provider_id) &&
    clientSet.has(+appt.client_id) &&
    hasActivity
  );
}

function mapApptToEvent(appt, eventGroupId, staffId, clientId, activityId, locationId, tz) {
  const zone = appt.time_zone || tz || 'UTC';
  // Keep the same local date/time, only change timezone offset
  const startNaive = momentTz.parseZone(appt.from_time).format('YYYY-MM-DDTHH:mm:ss');
  const endNaive = momentTz.parseZone(appt.to_time).format('YYYY-MM-DDTHH:mm:ss');
  const startTz = momentTz.tz(startNaive, zone);
  const endTz = momentTz.tz(endNaive, zone);

  // Calculate recurrence information
  const { startRecur, endRecur, daysOfWeek } = calculateRecurrenceInfo(appt, startTz, endTz, zone);

  return {
    id: uuidv4(),
    start: startTz.format('YYYY-MM-DDTHH:mm:ssZ'),
    end: endTz.format('YYYY-MM-DDTHH:mm:ssZ'),
    startActual: startTz.format('YYYY-MM-DDTHH:mm:ssZ'),
    endActual: endTz.format('YYYY-MM-DDTHH:mm:ssZ'),
    startRecur,
    endRecur,
    frequency: 'Weekly',
    interval: 1,
    daysOfWeek,
    timezone: tz || 'UTC',
    eventGroupId,
    users: [staffId, clientId].filter(Boolean),
    activity0Id: activityId ?? null,
    notes: appt.note ?? null,
    location0Id: locationId ?? null,
  };
}

async function importTherapypmsEvents({
  token,
  resources,
  lookbackMs = PAGE_WINDOW_DEFAULT_MS,
  currentUser,
  timezone,
}) {
  const staffIdMap = new Map((resources.employees || []).map(e => [+e.idOther, e.userId]));
  const clientIdMap = new Map((resources.clients || []).map(c => [+c.idOther, c.userId]));
  const activityIdMap = new Map((resources.activities || []).map(a => [+a.idOther, a.userId]));
  const locations = resources.locations || [];

  const staffSet = new Set(staffIdMap.keys());
  const clientSet = new Set(clientIdMap.keys());
  const activitySet = new Set(activityIdMap.keys());

  // Use provided timezone to compute date window boundaries
  const tz = timezone || 'UTC';
  const now = momentTz().tz(tz);
  const startDate = momentTz(now).subtract(lookbackMs, 'milliseconds');
  const minTime = startDate.toDate().getTime();
  const maxTime = now.toDate().getTime();

  const filters = {
    start_date: fmtDate(startDate, tz),
    end_date: fmtDate(now, tz),
  };

  // Fetch all appointments from TherapyPMS by filtering by date window
  const pulledAppointments = await listAppointmentsTherapyPMS(token, filters, { all: true });

  // Filter out appointments that are not within the date window, staff, and client
  const filteredAppointments = pulledAppointments.filter(appt =>
    keepAppointment(appt, minTime, maxTime, staffSet, clientSet, activitySet)
  );

  // Map appointments to events
  const seriesMap = new Map();
  const extIds = filteredAppointments.map(a => String(a.id));
  const transaction = await db.sequelize.transaction();

  // Find existing links between TherapyPMS appointments and events
  const existingLinks = await EventsIntegrationDataDBApi.findAll({
    where: {
      integratingSoftware: 'therapypms',
      eventIdOther: extIds,
    },
    transaction,
  });

  const linkByExtId = new Map(
    existingLinks.map(l => [l.eventIdOther, { id: l.id, eventId: l.eventId }])
  );

  let saved = 0;
  try {
    for (const appt of filteredAppointments) {
      const extId = String(appt.appointment_id);
      const link = linkByExtId.get(extId);
      const seriesId = appt.recurring_id;

      const groupId = seriesId && seriesMap.has(seriesId)
        ? seriesMap.get(seriesId)
        : (() => {
            const g = uuidv4();
            if (seriesId) seriesMap.set(seriesId, g);
            return g;
          })();

      // Map appointment to event
      const eventPayload = mapApptToEvent(
        appt,
        groupId,
        staffIdMap.get(+appt.provider_id),
        clientIdMap.get(+appt.client_id),
        activityIdMap.get(+appt.activity_ids[0]),
        locations.find(l => l.name === appt.place_of_service)?.userId,
        tz,
      );

      let eventRow;
      if (link) {
        eventRow = await EventsDBApi.update(link.eventId, eventPayload, {
          transaction,
          currentUser,
        });
        await EventsIntegrationDataDBApi.update(
          link.id,
          { 
            eventId: eventRow.id, 
            eventIdOther: extId, 
            integratingSoftware: 'therapypms',
            recurringEventIdOther: appt.recurring_id ? String(appt.recurring_id) : null
          },
          { transaction }
        );
      } else {
        eventRow = await EventsDBApi.create(eventPayload, {
          transaction,
          currentUser,
        });
        await EventsIntegrationDataDBApi.create(
          { 
            eventId: eventRow.id, 
            eventIdOther: extId, 
            integratingSoftware: 'therapypms',
            recurringEventIdOther: appt.recurring_id ? String(appt.recurring_id) : null
          },
          { transaction }
        );
      }
      saved += 1;
    }
    await transaction.commit();
    return { pulledAppointments: filteredAppointments, saved };
  } catch (err) {
    await transaction.rollback();
    console.error('TherapyPMS import failed:', err);
    throw err;
  }
}

module.exports = importTherapypmsEvents;


