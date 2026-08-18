function toTwoLettersCapitalize(value) {
  const raw = (value || '').toString();
  if (!raw) return '';
  const slice = raw.substring(0, Math.min(2, raw.length));
  return slice.charAt(0).toUpperCase() + slice.slice(1);
}

function initial(value) {
  const raw = (value || '').toString();
  return raw ? raw.charAt(0).toUpperCase() : '';
}

function generateAlias(firstName, lastName, aliasFormatType, existingAlias) {
  if (existingAlias) return existingAlias;

  const first = firstName || '';
  const last = lastName || '';

  switch (aliasFormatType) {
    case 'Jo Do': {
      const f = toTwoLettersCapitalize(first);
      const l = toTwoLettersCapitalize(last);
      return [f, l].filter(Boolean).join(' ').trim();
    }
    case 'JoDo': {
      const f = toTwoLettersCapitalize(first);
      const l = toTwoLettersCapitalize(last);
      return `${f}${l}`.trim();
    }
    case 'DoJo': {
      const f = toTwoLettersCapitalize(first);
      const l = toTwoLettersCapitalize(last);
      return `${l}${f}`.trim();
    }
    case 'J.D.':
    default: {
      const f = initial(first);
      const l = initial(last);
      return `${f ? f + '.' : ''}${l ? l + '.' : ''}`.trim();
    }
  }
}

module.exports = { generateAlias };

