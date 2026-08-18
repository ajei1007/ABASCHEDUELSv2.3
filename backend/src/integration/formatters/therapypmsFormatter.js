const { fetchClientActivityIdsTherapyPMS } = require('../actions/therapypms');
const momentTimezone = require('moment-timezone');
const dayNumberMap = require('../../constants/dayNumberMap');

/**
 * Map your internal event object into the TherapyPMS API payload shape.
 */
async function mapEventToTherapypmsPayload(evt, token) {
  try {
    // Extract provider (staff) and client IDs from integrationData.idOther
    const providerIds = evt.users
      .filter(u => u.integrationData?.resourceType === 'employee')
      .map(u => Number(u.integrationData.idOther));

    const clientIds = evt.users
      .filter(u => u.integrationData?.resourceType === 'client')
      .map(u => Number(u.integrationData.idOther));

    if (providerIds.length === 0 || clientIds.length === 0) {
      const names = evt.users.map(u => u.firstName).join(', ') || 'Unknown';
      throw new Error(
        `TherapyPMS payload error: No integrations found for users: ${names}`
      );
    }

    // Build activities array: one entry per client
    const providerActivityId = evt?.activity0?.integrationData?.idOther;
    if (!providerActivityId) {
      const userNames = evt.users.map(u => u.firstName).join(', ') || 'Unknown';
      throw new Error(
        `TherapyPMS payload error: No appointment activity found for users: ${userNames}`
      );
    }
    let activities = [];
    if (clientIds.length > 0) {
      for (const clientId of clientIds) {
        const clientActivities = await fetchClientActivityIdsTherapyPMS(
          token,
          clientId,
        )
        // if appointment activity is synced, then we need to filter the client activities to only include the appointment activity
        if (providerActivityId) {
          const clientValidActivities = clientActivities.filter(activityId => Number(activityId) === Number(providerActivityId))
          activities.push({
            client_id: clientId,
            client_activities: clientValidActivities,
          })
        } else { // if appointment activity is not synced, then we need to include all client activities
          activities.push({
            client_id: clientId,
            client_activities: clientActivities,
          })
        }
      }
    }

    // core date strings
    const adjustedStartRecur = momentTimezone
      .tz(evt.startRecur, 'YYYY-MM-DD', evt.timezone)
      .format('YYYY-MM-DD');
    const adjustedEndRecur = momentTimezone
      .tz(evt.endRecur, 'YYYY-MM-DD', evt.timezone)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    const session_from_time = momentTimezone(evt.start).tz(evt.timezone).format('HH:mm:ss');
    const session_to_time = momentTimezone(evt.end).tz(evt.timezone).format('HH:mm:ss');
    // Translate the weekdays
    const repeat_day = Object.entries(dayNumberMap)
      .filter(([flag]) => evt[flag])
      .map(([_flag, num]) => num);

    const eventIdOther = evt.integrationData?.[0]?.eventIdOther ? Number(evt.integrationData?.[0]?.eventIdOther) : 0;
    const recurringEventIdOther = evt.integrationData?.[0]?.recurringEventIdOther ? Number(evt.integrationData?.[0]?.recurringEventIdOther) : 0;
    // Place of Service
    const providerLocationId = evt?.location0?.integrationData?.idOther ?? '';

    // If converted is true, then the event is rendered, otherwise it is scheduled
    const status = evt.converted ? 'Rendered' : 'Scheduled';
    return {
      event_id: evt.id,
      appointment_id: eventIdOther,
      provider_ids: providerIds,
      client_ids: clientIds,
      activities,
      pos_code: providerLocationId,
      treatment_type: evt.activity0.firstName,
      status,
      timezone: evt.timezone,
      address: 0, // to use default address of client
      notes: evt.notes || '',

      // Recurring and  date times
      recurring_id: recurringEventIdOther,
      from_date: adjustedStartRecur,
      to_date: adjustedEndRecur,
      session_from_time,
      session_to_time,
      repeat_every: evt.interval,
      repeat_day,
      repeat_each: "Week",

      is_billable: true,
      is_auth: true,
      is_group: false,
      cpt_codes: [0],
    };
  } catch (error) {
    console.log('Something went wrong while formatting the event data:', error)
    return null;
    // throw new Error('Something went wrong while formatting the event data.')
  }
}

module.exports = { mapEventToTherapypmsPayload };
