/**
 * Split events into created / updated / deleted based on integrationData
 */
const groupEvents = (events) => {
  const created = [];
  const updated = [];
  const deleted = [];

  events.forEach(event => {
    // integrationData is a hasMany include; we only care about the first row for our software
    const row = Array.isArray(event.integrationData)
      ? event.integrationData[0]
      : event.integrationData;

    if (event.deletedAt && row) {
      // Event was deleted after it was integrated
      deleted.push(event);

    } else if (!row) {
      // Never integrated
      created.push(event);

    } else if (new Date(event.updatedAt) > new Date(row.updatedAt)) {
      // Integrated before, but updated since last integration
      updated.push(event);
    }
  });

  return { created, updated, deleted };
}

module.exports = groupEvents;