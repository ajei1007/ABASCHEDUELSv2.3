const EventsDBApi = require('../db/api/events');
const formatEventForScheduler = require('../utils/formatEventForScheduler');
const { getRoleHierarchy } = require('../utils/roleHierarchy');

const generateSchedulerEvents = async (eventIds, includeDeleted, req) => {
  const events = await EventsDBApi.findAllEventsByIds(eventIds, includeDeleted);
  const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
  let allEvents = new Array();

  // 
  const start_real = new Date(req.query.start);
  const end_real = new Date(req.query.end);

  const formattedEvents = events
    .filter((event) => {
      if (!event.dataValues.start || !event.dataValues.end) {
        return false;
      }
      allEvents.push(event);
      const lo = Math.max(start_real, new Date(event.startRecur));
      const hi = Math.min(end_real, new Date(event.endRecur));

      if (lo >= hi) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.deletedAt && !b.deletedAt) {
        return -1;
      }
      if (!a.deletedAt && b.deletedAt) {
        return 1;
      }
      return 0;
    })
    .flatMap((event) => formatEventForScheduler(event, req, roleHierarchy, true));

  // Backend needs to respond all of modified/delete/created events for undo/redo feature
  // so this function respond all events for calendar like before + all events data
  return { requestedRange: formattedEvents, all: allEvents };
}

module.exports = {
  generateSchedulerEvents
}