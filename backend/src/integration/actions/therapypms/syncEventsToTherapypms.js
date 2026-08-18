const { mapEventToTherapypmsPayload } = require('../../formatters/therapypmsFormatter');
const { createAndUpdateAppointmentTherapyPMS, deleteAppointmentTherapyPMS } = require('../therapypms');
const groupEvents = require('../../lib/groupEvents');

/**
 * Sync a batch of events to TherapyPMS:
 *
 * @param {Array} eventsWithIntegrationData — your enriched events
 * @param {string} token — TherapyPMS auth token
 */
async function syncEventsToTherapypms(eventsWithIntegrationData, token) {
  const { created, updated, deleted } = groupEvents(eventsWithIntegrationData);

  // 1) Prepare payloads
  const toCreate = await Promise.all(created.map(evt => mapEventToTherapypmsPayload(evt, token)));

  const toUpdate = await Promise.all(updated.map(evt => mapEventToTherapypmsPayload(evt, token)));

  const toDelete = await Promise.all(deleted.map(evt => mapEventToTherapypmsPayload(evt, token)))

  // 2) Send all requests in parallel
  const [createdRes, updatedRes, deletedRes] = await Promise.all([
    Promise.all(toCreate.filter(Boolean).map(payload =>
      createAndUpdateAppointmentTherapyPMS(token, payload)
    )),
    Promise.all(toUpdate.filter(Boolean).map(payload =>
      createAndUpdateAppointmentTherapyPMS(token, payload)
    )),
    Promise.all(toDelete.filter(Boolean).map(e => deleteAppointmentTherapyPMS(token, e))),
  ]);

  return [...createdRes.filter(Boolean), ...updatedRes.filter(Boolean), ...deletedRes.filter(Boolean)]
}

module.exports = syncEventsToTherapypms;
