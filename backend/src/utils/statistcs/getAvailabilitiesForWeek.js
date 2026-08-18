const AvailabilitiesDBApi = require('../../db/api/availabilities');

const getAvailabilitiesForWeek = async (
  start,
  end,
  companyID,
  branches,
  subgroups,
  roles,
  users,
  all
) => {
  const availabilitiesForWeek =
    await AvailabilitiesDBApi.findAllAvailabilitiesOfWeek({
      companyId: companyID,
      start: start,
      end: end,
      branches: branches,
      subgroups: subgroups,
      roles: roles,
      users: users,
      all : all
    });

  return { data: availabilitiesForWeek };
};

module.exports = getAvailabilitiesForWeek;
