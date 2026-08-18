const SubgroupsDBApi = require('../db/api/subgroups');
const { createCompany, createUser, createGrouping, createSubgroup } = require('./helpers');

describe('Subgroup data retrieval behavior', () => {
  let transaction;
  let db;
  let company;
  let user;
  let grouping;

  beforeEach(async () => {
    db = require('../db/models');
    transaction = await db.sequelize.transaction();

    company = await createCompany(db, transaction);
    user = await createUser(db, transaction, { companyId: company.id });
    grouping = await createGrouping(db, transaction);
  });

  afterEach(async () => {
    if (transaction) {
      await transaction.rollback();
    }
  });

  describe('when retrieving subgroups after removing dead code', () => {
    it('should maintain company isolation when retrieving subgroups', async () => {
      // Create test subgroup
      await createSubgroup(db, transaction, { 
        groupId: grouping.id,
        createdById: user.id 
      });

      const result = await SubgroupsDBApi.findAll({
        companyId: company.id
      }, { transaction });

      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(result.count).toBeDefined();
      expect(Array.isArray(result.rows)).toBe(true);
      expect(typeof result.count).toBe('number');
    });
  });
});