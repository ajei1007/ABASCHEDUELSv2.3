const momentTz = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const { searchAppointmentsRethink } = require('../rethink');
const EventsDBApi = require('../../../db/api/events');
const EventsIntegrationDataDBApi = require('../../../db/api/eventsIntegrationData');
const db = require('../../../db/models');
const indexedDays = require('../../../constants/indexedDays');

const PAGE_SIZE_DEFAULT = 100;

const fmtParamDateUTC = d =>
  momentTz(d).utc().startOf('day').format("YYYY-MM-DD[T]HH:mm:ss[Z]");

// returns true if appt is inside [min,max] AND staff/client are in the lookup sets
function keepAppointment(appt, min, max, staffSet, clientSet) {
  const inWindow =
    Date.parse(appt.scheduledStartDateTime) >= min ||
    Date.parse(appt.scheduledEndDateTime) <= max;

  return (
    inWindow &&
    staffSet.has(+appt.staffId) &&
    clientSet.has(+appt.clientId) && appt.staffId === 860845
  );
}

function mapApptToEvent(appt, eventGroupId, staffId, clientId, activityId) {
  const [startRecur] = appt.actualStartDateTime.split('T');
  const [rawEndDate] = appt.actualEndDateTime.split('T');

  // bump endRecur by +1 day
  const endRecurDate = new Date(rawEndDate + 'T00:00:00Z');
  endRecurDate.setUTCDate(endRecurDate.getUTCDate() + 1);
  const endRecur = endRecurDate.toISOString().split('T')[0];

  const weekdayId = indexedDays[new Date(startRecur).getUTCDay()];

  return {
    id: uuidv4(),

    /* master datetimes */
    start: appt.actualStartDateTime,
    end: appt.actualEndDateTime,
    startActual: appt.actualStartDateTime,
    endActual: appt.actualEndDateTime,

    /* recurrence helpers */
    startRecur,
    endRecur,
    frequency: "Weekly",
    interval: 1,
    daysOfWeek: [weekdayId], 

    timezone: 'UTC',
    eventGroupId,
    users: [staffId, clientId].filter(Boolean),
    activity0Id: activityId ?? null,
  };
}


async function importRethinkEvents({
  token,
  resources,
  lookbackMs,
  pageSize = PAGE_SIZE_DEFAULT,
  currentUser,
}) {
  /* quick idOther → our id maps */
  const staffIdMap = new Map((resources.employees || []).map(e => [+e.idOther, e.userId]));
  const clientIdMap = new Map((resources.clients || []).map(c => [+c.idOther, c.userId]));
  // const activityIdMap = new Map((resources.activities || []).map(a => [+a.idOther, a.userId]));

  const staffSet = new Set(staffIdMap.keys());
  const clientSet = new Set(clientIdMap.keys());

  const now = new Date();
  const startDate = new Date(now - lookbackMs);
  const minTime = startDate.getTime();
  const maxTime = now.getTime();

  const After = fmtParamDateUTC(startDate);
  const ToDate = fmtParamDateUTC(now);

  const pulledAppointments = [];
  let fetched = 0;

  /* --------------------- stage 1: fetch & filter ---------------------- */
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const res = await searchAppointmentsRethink(token, {
      After,
      ToDate,
      PageSize: pageSize,
      Page: page,
    });
    if (!res || !Array.isArray(res.appointments)) break;

    fetched += res.appointments.length;
    totalPages = res.totalPages || totalPages;

    res.appointments.forEach(appt => {
      if (keepAppointment(appt, minTime, maxTime, staffSet, clientSet)) {
        pulledAppointments.push(appt);
      }
    });
  }

  /* --------------------- stage 2: save & link ------------------------- */
  const seriesMap = new Map();  // seriesAppointmentId → eventGroupId
  let saved = 0;
  const integratedAppointments = [];
  // grab every appointmentId on this page
  const extIds = pulledAppointments.map(a => String(a.appointmentId));

  const transaction = await db.sequelize.transaction();

  const existingLinks = await EventsIntegrationDataDBApi.findAll({
    where: {
      integratingSoftware: 'rethink',
      eventIdOther: extIds,
    },
    transaction,
  });

  // Map: extId → { id, eventId }
  const linkByExtId = new Map(
    existingLinks.map(l => [l.eventIdOther, { id: l.id, eventId: l.eventId }])
  );

  try {
    for (const appt of pulledAppointments) {
      const extId = String(appt.appointmentId);
      const link = linkByExtId.get(extId);
      const seriesId = appt.seriesAppointmentId;

      // 1) ensure we have an eventGroupId for this series
      const groupId = seriesId && seriesMap.has(seriesId)
        ? seriesMap.get(seriesId)
        : (() => {
          const g = uuidv4();
          if (seriesId) seriesMap.set(seriesId, g);
          return g;
        })();

      // 2) build event payload
      const eventPayload = mapApptToEvent(
        appt,
        groupId,
        staffIdMap.get(+appt.staffId),
        clientIdMap.get(+appt.clientId),
        resources.activities[0]?.userId,
      );

      let eventRow;

      if (link) {
        /* ---- UPDATE existing event ------------------------------------- */
        eventRow = await EventsDBApi.update(link.eventId, eventPayload, {
          transaction,
          currentUser,
        });

        await EventsIntegrationDataDBApi.update(
          link.id,
          { eventId: eventRow.id, eventIdOther: extId, integratingSoftware: 'rethink' },
          { transaction }
        );
      } else {
        /* ---- CREATE new event  ----------------------------------------- */
        eventRow = await EventsDBApi.create(eventPayload, {
          transaction,
          currentUser,
        });
        await EventsIntegrationDataDBApi.create(
          { eventId: eventRow.id, eventIdOther: extId, integratingSoftware: 'rethink' },
          { transaction }
        );
      }

      saved += 1;
    }

    await transaction.commit();
    return { pulledAppointments, integratedAppointments };
  } catch (err) {
    await transaction.rollback();
    console.error('Rethink import failed:', err);
    throw err;
  }
}

module.exports = importRethinkEvents;