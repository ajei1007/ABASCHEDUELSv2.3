export function getEventCancellationUpdate(newEvent: any, oldEvent: any) {
  return [
    newEvent.canceled !== oldEvent.canceled,
    newEvent.reason_canceled !== oldEvent.reason_canceled,
    newEvent.user_canceled !== oldEvent.user_canceled,
  ].some((condition) => condition);
}

export function adaptEventForGetCancellationUpdate(event: any) {
  return {
    canceled: event.canceled,
    reason_canceled: Array.isArray(event.reason_canceled)
      ? event.reason_canceled.length > 0
        ? event.reason_canceled[0]?.value ?? null
        : null
      : event.reason_canceled || null,
    user_canceled: Array.isArray(event.user_canceled)
      ? event.user_canceled.length > 0
        ? event.user_canceled[0]?.value ?? null
        : null
      : event.user_canceled || null,
  };
}
