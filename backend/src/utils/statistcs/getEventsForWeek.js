const EventsDBApi = require('../../db/api/events');

const getEventsForWeek = async (
  start,
  end,
  companyID,
  branches,
  roles,
  subgroups,
) => {
  const eventsForWeek = await EventsDBApi.findAllEventsForDashboardDateRange({
    companyId: companyID,
    start: start,
    end: end,
    branches: branches,
    subgroups: subgroups,
    roles: roles,
    users: [],
    includeLocations: true,
  });

  let eId = [];
  for (let j = 0; j < eventsForWeek.count; j++) {
    eId.push(eventsForWeek.rows[j].id);
  }

  const filteredEvents = eventsForWeek.rows.filter((e) => !e.isCancelled);

  return { data: { rows: filteredEvents, count: filteredEvents.length } };
};

module.exports = getEventsForWeek;
