const EventsDBApi = require('../../db/api/events');

const getEventsForDateRange = async (
  start,
  end,
  companyID,
  branches,
  roles,
  subgroups,
  users,
  disabled = true,
) => {
  const eventsForDateRange =
    await EventsDBApi.findAllEventsForDashboardDateRange({
      companyId: companyID,
      start: start,
      end: end,
      branches: branches,
      subgroups: subgroups,
      roles: roles,
      users: users,
      disabled: disabled,
    });

  let cancelledEvents = new Array();
  for (let j = 0; j < eventsForDateRange.count; j++) {
    let event = eventsForDateRange.rows[j];
    if (event.isCancelled) {
      cancelledEvents.push({
        ...event.get({ plain: true }),
        cancellerId: event.cancelledByUserId,
      });
    }
  }

  const filteredEvents = eventsForDateRange.rows.filter((e) => !e.isCancelled);

  return {
    data: { rows: filteredEvents, count: filteredEvents.length },
    cancelledEvents: { rows: cancelledEvents, count: cancelledEvents.length },
  };
};

module.exports = getEventsForDateRange;
