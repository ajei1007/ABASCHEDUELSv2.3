const getCalendarView = (view, day) => {
  if (day === 'Day' && view === 'Timeline') {
    return 'Day_Timeline';
  } else if (day === 'Day' && view === 'Timegrid') {
    return 'resourceTimeGridDay';
  } else if (day === 'Day' && view === 'List') {
    return 'listDay';
  } else if (day === 'Week' && view === 'Timeline') {
    return 'Week_Timeline';
  } else if (day === 'Week' && view === 'Timegrid') {
    return 'resourceTimeGridWeek';
  } else if (day === 'Week' && view === 'List') {
    return 'listWeek';
  } else if (
    (day === 'Month' && view === 'Timegrid') ||
    (day === 'Month' && view === 'Timeline')
  ) {
    return 'dayGridMonth';
  } else if (day === 'Month' && view === 'List') {
    return 'listMonth';
  }
};

export default getCalendarView;