
function fmtRethinkDate(input) {
  const iso = (input instanceof Date)
    ? input.toISOString()
    : new Date(input).toISOString();
  // remove the fraction, keep trailing Z
  return iso.replace(/\.\d{3}Z$/, 'Z');
}

/**
 * From a staff’s integrationData.dataInOtherSoftware,
 * pick the one clientAuthorization that’s currently in-effect,
 * then return its first service’s billingCodeId.
 */
function pickPayCodeIdFromClientData(clientData) {
  const auths = clientData.clientAuthorizations || [];
  const now = new Date();

  // 1) find authorizations whose window covers “now”
  const valid = auths.filter(auth => {
    const start = new Date(auth.authStartDate);
    const end = new Date(auth.authEndDate);
    return start <= now && now <= end;
  });

  if (valid.length > 0) {
    const firstAuth = valid[0];
    const svc = firstAuth.authorizationServices?.[0];
    if (svc && typeof svc.authorizationBillingCodeId === 'number') {
      return svc.authorizationBillingCodeId;
    }
  }

  // 2) fallback to any top-level payCodeId if you have one
  if (typeof clientData.payCodeId === 'number') {
    return clientData.payCodeId;
  }

  // 3) ultimate fallback
  return null;
}

/* Turn a single enriched event into a Rethink‐API payload. */
function mapEventToRethinkPayload(evt) {
  // pick staff/client by resourceType (adjust as needed)
  const staff = evt.users.find(u => u.integrationData?.resourceType === 'employee');
  const client = evt.users.find(u => u.integrationData?.resourceType === 'client');

  const location = evt.location0.integrationData ?? null;
  const activity = evt.activity0.integrationData ?? null;

  const authorizationBillingCodeId = pickPayCodeIdFromClientData(client?.integrationData?.dataInOtherSoftware) || null;
  const payCodeId = 3484
  const locationCodeId = 3;
  const tagId = 9566;
  return {
    eventId: evt.id,
    appointmentId: null,
    // Ready
    scheduledStartDateTime: fmtRethinkDate(evt.startDatetime),
    scheduledEndDateTime: fmtRethinkDate(evt.endDatetime),
    actualStartDateTime: fmtRethinkDate(evt.start),
    actualEndDateTime: fmtRethinkDate(evt.end),
    ...(evt.latitude && evt.longitude ? {
      scheduledLocation: {
        latitude: evt.latitude,
        longitude: evt.longitude
      },
      actualStartLocation: {
        latitude: evt.latitude,
        longitude: evt.longitude
      },
      actualEndLocation: {
        latitude: evt.latitude,
        longitude: evt.longitude
      },
    } : {}),
    scheduledLocationAddress: evt.address,
    ...(evt.isCancelled ? {
      cancellationTypeId: Number(evt.cancellationReasonId),
    } : {}),

    // Need to update
    staffId: staff ? Number(staff.integrationData.idOther) : 0,
    clientId: client ? Number(client.integrationData.idOther) : 0,
    locationId: location?.idOther ? Number(location.idOther) : null,
    appointmentTypeId: 2,
    // appointmentTypeId: activity?.idOther ? Number(activity.idOther) : null,

    // TODO Need to ask these fields
    authorizationBillingCodeId,
    locationCodeId,
    payCodeId,
    funderBillingCodeId: null,
    billingCodeCredentialId: null,
    tagId,
    cancellationSubtypeId: null,
    staffVerificationDateTime: null,
    parentVerificationDateTime: null,
    parentSignature: null,
  };
}

module.exports = { mapEventToRethinkPayload };
