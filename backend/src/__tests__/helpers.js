const createCompany = async (db, transaction, data = {}) => {
  const company = await db.companies.create(
    {
      name: 'Test Company ' + Date.now(),
      ...data,
    },
    { transaction }
  );

  return company.get({ plain: true });
};

const createRole = async (db, transaction, data = {}) => {
  const role = await db.roles.create(
    {
      name: 'Test Role ' + Date.now(),
      ...data,
    },
    { transaction }
  );

  return role.get({ plain: true });
};

const createUser = async (db, transaction, data = {}) => {
  const user = await db.users.create(
    {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      ...data,
    },
    { transaction }
  );

  return user.get({ plain: true });
};

const createGrouping = async (db, transaction, data = {}) => {
  const grouping = await db.groupings.create(
    {
      name: 'Test Grouping ' + Date.now(),
      ...data,
    },
    { transaction }
  );

  return grouping.get({ plain: true });
};

const createSubgroup = async (db, transaction, data = {}) => {
  const subgroup = await db.subgroups.create(
    {
      name: 'Test Subgroup ' + Date.now(),
      allbranches: false,
      noTag: false,
      ...data,
    },
    { transaction }
  );

  return subgroup.get({ plain: true });
};

module.exports = {
  createCompany,
  createRole,
  createUser,
  createGrouping,
  createSubgroup,
};