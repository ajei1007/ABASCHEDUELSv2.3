const {
  mapEventToRethinkPayload
} = require('../../formatters/rethinkFormatter');
const {
  createAppointmentRethink,
  updateAppointmentRethink,
  deleteAppointmentRethink,
} = require('../rethink');
const groupEvents = require('../../lib/groupEvents');

/**
 * Sync a batch of events to Rethink, using eventsIntegrationData instead of eventConnectId
 *
 * @param {Array} eventsWithIntegrationData
 * @param {string} token
 */
async function syncEventsToRethink(eventsWithIntegrationData, token) {
  const { created, updated, deleted } = groupEvents(eventsWithIntegrationData);

  // prepare payloads
  const toCreate = created.map(evt =>
    mapEventToRethinkPayload(evt)
  );
  console.log("🚀 ~ syncEventsToRethink ~ toCreate:", toCreate)
  const toUpdate = updated.map(evt => {
    const body = mapEventToRethinkPayload(evt);
    const extId = evt.integrationData[0].eventIdOther;
    body.appointmentId = extId;
    return body;
  });
  console.log("🚀 ~ syncEventsToRethink ~ toUpdate:", toUpdate)
  const toDelete = deleted.map(evt => {
    const body = mapEventToRethinkPayload(evt);
    const extId = evt.integrationData[0].eventIdOther;
    body.appointmentId = extId;
    return body;
  });
  console.log("🚀 ~ syncEventsToRethink ~ toDelete:", toDelete)

  // fire off all requests in parallel
  const [createdRes, updatedRes, deletedRes] = await Promise.all([
    Promise.all(toCreate.map(payload =>
      createAppointmentRethink(token, payload)
    )),
    Promise.all(toUpdate.map((payload) =>
      updateAppointmentRethink(token, payload)
    )),
    Promise.all(toDelete.map(payload =>
      deleteAppointmentRethink(token, payload)
    )),
  ]);
  console.log("🚀 ~ syncEventsToRethink ~ deletedRes:", deletedRes)
  console.log("🚀 ~ syncEventsToRethink ~ updatedRes:", updatedRes)
  console.log("🚀 ~ syncEventsToRethink ~ createdRes:", createdRes)

  return [...createdRes.filter(Boolean), ...updatedRes.filter(Boolean), ...deletedRes.filter(Boolean)]
}

module.exports = syncEventsToRethink;
