const UsersInegrationDataDBApi = require('../db/api/usersIntegrationData');

// TODO Reuse
const getUserRole = (user, roleHierarchy) =>
  user.roles.flatMap((role) => roleHierarchy[role.name] || []);

/* Service to enrich events with user integration data */
async function enrichEventsWithIntegrationData(events, integratingSoftware, roleHierarchy, options = {}) {
  const transaction = options.transaction;

  // 1. — collect all IDs
  const allUserIds = [...new Set(events.flatMap(e => e.userIds || []))];
  const allActivityIds = [...new Set(events.map(e => e.activity0Id).filter(Boolean))];
  const allLocationIds = [...new Set(events.map(e => e.location0Id).filter(Boolean))];

  // 2. — fetch user-type rows via your existing API
  const userRows = allUserIds.length
    ? await UsersInegrationDataDBApi.findAllByUserIds(
      { userIds: allUserIds, integratingSoftware },
      { transaction }
    )
    : [];

  // 3. — fetch activity-type rows
  const activityRows = allActivityIds.length
    ? await UsersInegrationDataDBApi.findAllByUserIds(
      { userIds: allActivityIds, integratingSoftware },
      { transaction }
    )
    : [];

  // 4. — fetch location-type rows
  const locationRows = allLocationIds.length
    ? await UsersInegrationDataDBApi.findAllByUserIds(
      { userIds: allLocationIds, integratingSoftware },
      { transaction }
    )
    : [];

  // 5. — build maps for quick lookup
  const mapByUser = userRows.reduce((m, row) => {
    m[row.userId] = row;
    return m;
  }, {});
  const mapByActivity = activityRows.reduce((m, row) => {
    m[row.userId] = row;
    return m;
  }, {});
  const mapByLocation = locationRows.reduce((m, row) => {
    m[row.userId] = row;
    return m;
  }, {});

  // 6. — attach integrationData in one pass
  return events.map(evt => {
    // Categorize user types
    let employee, client, funder;
    evt.users.forEach((user) => {
      const roles = getUserRole(user, roleHierarchy);
      if (roles.includes('Employee')) employee = user;
      else if (roles.includes('Client')) client = user;
      else if (roles.includes('Funder')) funder = user;
    });

    return {
      ...evt,
      users: evt.users.map(u => ({
        ...u,
        integrationData: mapByUser[u.id] || null
      })),
      activity0: {
        ...evt.activity0,
        integrationData: mapByActivity[evt.activity0Id] || null
      },
      location0: {
        ...evt.location0,
        integrationData: mapByLocation[evt.location0Id] || null
      },
      employee,
      client,
      funder
    }
  });
}


module.exports = { enrichEventsWithIntegrationData };