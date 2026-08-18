const moment = require('moment');

// TODO Reuse
const getUserRole = (user, roleHierarchy) =>
  user.roles.flatMap((role) => roleHierarchy[role.name] || []);

const getDayIndexes = (event) =>
  ['U', 'M', 'T', 'W', 'R', 'F', 'S']
    .filter((day) => event[day])
    .map((day) => 'UMTWRFS'.indexOf(day));

const formatEvent = (event, employee, client, funder) => {
  let locationId = null;
  let placeOfService = null;
  if (event.location0?.idCustom) {
    locationId = event.location0?.idCustom;
    if (event.location0 && event.location0.roles) {
      event.location0.roles.map((role) => {
        if (role.locationstypes && role.locationstypes.locationTypeCustomId) {
          placeOfService = role.locationstypes.locationTypeCustomId;
          console.log('smigger', placeOfService);
        }
      });
    }
  } else if (event?.users?.length) {
    const userBranchLocations = event.users
      .map((user) => {
        const firstBranch = user.branches[0];
        return firstBranch ? firstBranch.user : null;
      })
      .filter((loc) => loc !== null);

    if (userBranchLocations?.length) {
      locationId = userBranchLocations[0]?.idCustom ?? null;
    }
  }

  return {
    eventId: event.id,
    deletedAt: event.deletedAt,
    eventIdCustom: event.eventIdCustom,
    course: event.eventIdCustom,
    placeOfService: placeOfService,
    activityId: event.activity0.idCustom,
    activityTitle: event.activity0.firstName ?? '',
    activityCode: event.activity0.codeCustom,
    isCancelled: event.isCancelled,
    cancellationReason: event.cancellationReason,
    employeeId: employee?.idCustom,
    employeeUuid: employee.id,
    clientUuid: client.id,
    clientId: client?.idCustom,
    address: event?.address ?? null,
    // Recurrance
    start: event.start,
    end: event.end,
    duration: moment.utc(event.end).diff(moment.utc(event.start), 'seconds'),
    timezone: event.timezone,
    startRecur: event.startRecur,
    endRecur: event.endRecur,
    recurring:
      moment(event.endRecur, 'YYYY-MM-DD').diff(
        moment(event.startRecur, 'YYYY-MM-DD'),
        'days',
      ) > 1,
    interval: event.interval,
    bysetpos: event.bysetpos,
    frequency: event.frequency,
    rules: getDayIndexes(event).join(','),
    days: getDayIndexes(event),
    startRecur_format: moment(event.startRecur).format('MM/DD/YYYY'),
    sunday: event.U,
    monday: event.M,
    tuesday: event.T,
    wednesday: event.W,
    thursday: event.R,
    friday: event.F,
    saturday: event.S,

    funderId: funder?.idCustom ?? null,
    customAddressId: client?.customAddressId ?? null,
    customPayorClientId: client?.customPayorClientId ?? null,
    locationId,
    isHome: event.location0?.firstName?.includes('Home') ?? false,
  };
};

const formatIntegrationOperations = (
  eventsArg,
  roleHierarchy,
  isAddressRequired = false,
) => {
  /* Filters */
  // Filter by address (Address is required!)
  let events = eventsArg;
  if (isAddressRequired) {
    events = eventsArg.filter((ev) => ev.address);
  }

  const createdEvents = [];
  const deletedEvents = [];
  const updatedEvents = [];
  const canceledEvents = [];

  for (const event of events) {
    let employee, client, funder;

    event.users.forEach((user) => {
      const roles = getUserRole(user, roleHierarchy);
      if (roles.includes('Employee')) employee = user;
      else if (roles.includes('Client')) client = user;
      else if (roles.includes('Funder')) funder = user;
    });

    if (employee?.idCustom && client?.idCustom && event?.activity0?.idCustom) {
      const basic_info = formatEvent(event, employee, client, funder);

      if (!event.deletedAt || event.eventIdCustom) {
        if (event.eventIdCustom) {
          (event.deletedAt
            ? deletedEvents
            : event.isCancelled
            ? canceledEvents
            : updatedEvents
          ).push(basic_info);
        } else {
          (event.isCancelled ? canceledEvents : createdEvents).push(basic_info);
        }
      }
    }
  }

  return {
    createdEvents,
    deletedEvents,
    updatedEvents,
    canceledEvents,
    hasValues:
      createdEvents.length > 0 ||
      deletedEvents.length > 0 ||
      updatedEvents.length > 0 ||
      canceledEvents.length > 0,
  };
};

module.exports = formatIntegrationOperations;
