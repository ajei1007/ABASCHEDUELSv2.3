const EventsDBApi = require('../../db/api/events');

const getEventsForDay = async (
  start,
  end,
  companyID,
  branches,
  roles,
  subgroups,
  users,
) => {
  const eventsForDay = await EventsDBApi.findAllEventsForDashboardDay({
    companyId: companyID,
    start: start,
    end: end,
    branches: branches,
    subgroups: subgroups,
    roles: roles,
    users: users,
  });

  let eId = [];
  for (let j = 0; j < eventsForDay.count; j++) {
    eId.push(eventsForDay.rows[j].id);
  }

  const filteredEvents = eventsForDay.rows.filter((e) => !e.isCancelled);

  return { data: { rows: filteredEvents, count: filteredEvents.length } };
};

module.exports = getEventsForDay;
