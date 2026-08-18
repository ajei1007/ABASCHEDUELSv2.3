const AvailabilitiesDBApi = require('../../db/api/availabilities');

const getAvailabilitiesForDateRange = async (
  start,
  end,
  companyID,
  branches,
  subgroups,
  roles,
  users,
  all,
) => {
  const availabilitiesForDateRange =
    await AvailabilitiesDBApi.findAllAvailabilitiesOfDateRange({
      companyId: companyID,
      start: start,
      end: end,
      branches: branches,
      subgroups: subgroups,
      roles: roles,
      users: users,
      all: all,
    });
  return { data: availabilitiesForDateRange };
};

module.exports = getAvailabilitiesForDateRange;
