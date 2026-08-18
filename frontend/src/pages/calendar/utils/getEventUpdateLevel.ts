function hasIntervalChanged(newEvent: any, oldEvent: any) {
  const parsedNewInterval = parseInt(newEvent?.interval);
  const parsedOldInterval = parseInt(oldEvent?.interval);
  return parsedNewInterval !== parsedOldInterval;
}

function hasFrequencyChanged(newEvent: any, oldEvent: any) {
  const newFrequency = newEvent?.frequency;
  const oldFrequency = oldEvent?.frequency;
  return !(newFrequency === oldFrequency && newFrequency !== undefined);
}

function hasBysetposChanged(newEvent: any, oldEvent: any) {
  const parsedNewBystepos = parseInt(newEvent?.bysetpos);
  const parsedOldBystepos = parseInt(oldEvent?.bysetpos);
  return parsedNewBystepos !== parsedOldBystepos;
}

function hasDateRangeChanged(newEvent: any, oldEvent: any) {
  const newStartRecur = newEvent?.startRecur;
  const newEndRecur = newEvent?.endRecur;
  const oldStartRecur = oldEvent?.startRecur;
  const oldEndRecur = oldEvent?.endRecur;

  return (
    !(newStartRecur === oldStartRecur && newStartRecur !== undefined) ||
    !(newEndRecur === oldEndRecur && newEndRecur !== undefined)
  );
}

function hasDaysOfWeekChanged(newEvent: any, oldEvent: any) {
  const newDays = newEvent?.daysOfWeek || [];
  const oldDays = oldEvent?.daysOfWeek || [];
  if (newDays.length !== oldDays.length) {
    return true;
  }

  return (
    newDays.some((item: any) => !oldDays.includes(item)) ||
    oldDays.some((item: any) => !newDays.includes(item))
  );
}

export function getEventUpdateLevel(newEvent: any, oldEvent: any) {
  const predicates = [
    hasIntervalChanged,
    hasFrequencyChanged,
    hasBysetposChanged,
    hasDateRangeChanged,
    hasDaysOfWeekChanged,
  ];

  if (predicates.some((predicate) => predicate(newEvent, oldEvent))) {
    return 'RRULE';
  }

  return 'SIMPLE';
}

export function adaptEventFromUpdateForm(event: any) {
  return {
    startRecur: event?.startRecur,
    endRecur: event?.endRecur,
    interval: event?.interval?.[0]?.value,
    frequency: event?.frequency?.[0]?.value,
    bysetpos: event?.bysetpos?.[0]?.value,
    daysOfWeek: event?.daysOfWeek,
  };
}
