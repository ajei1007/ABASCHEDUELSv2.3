function normalize(val) {
  return val?.trim().toLowerCase() || '';
}

function matchExternalToLocalFLNames({
  externals,
  locals,
  localFirstNameKey = 'firstName',
  localLastNameKey = 'lastName',
  externalFirstNameKey = 'firstName',
  externalLastNameKey = 'lastName',
  isRole = false,
  matchExternalRoleToLocalRole = (ext) => ext
}) {
  const matches = [];
  const matchedLocalIds = new Set();

  externals.forEach(ext => {
    const rawExtFirst = ext[externalFirstNameKey];
    const extFirst = normalize(
      isRole ? matchExternalRoleToLocalRole(rawExtFirst) : rawExtFirst
    );
    const extLast = normalize(ext[externalLastNameKey]);

    const matchedLocal = locals.find(loc => {
      const locFirst = normalize(loc[localFirstNameKey]);
      const locLast = normalize(loc[localLastNameKey]);
      const locId = loc.id;

      return !matchedLocalIds.has(locId) && extFirst === locFirst && extLast === locLast;
    });

    if (matchedLocal) {
      matches.push({ external: ext, local: matchedLocal });
      matchedLocalIds.add(matchedLocal.id);
    }
  });

  return matches;
}

module.exports = matchExternalToLocalFLNames;
