// function convertTZ(date: any, tzString: string) {
//   return new Date(
//     (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', {
//       timeZone: tzString,
//     }),
//   );
// }

function convertTZ(date: any, tzString: string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    timeZone: tzString,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(dateObj);
  const map = {} as { [key: string]: string };
  parts.forEach(({ type, value }) => {
    map[type] = value;
  });

  return new Date(`${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`);
}

export default convertTZ;