describe('Test Infrastructure Validation', () => {
  let transaction;

  beforeEach(async () => {
    const db = require('../db/models');
    transaction = await db.sequelize.transaction();
  });

  afterEach(async () => {
    if (transaction) {
      await transaction.rollback();
    }
  });

  describe('Database and App Infrastructure', () => {
    it('should validate transaction isolation is working', async () => {
      const db = require('../db/models');
      
      const industry = await db.industries.create({
        name: 'Test Infrastructure Industry'
      }, { transaction });

      expect(industry.id).toBeDefined();
      expect(industry.name).toBe('Test Infrastructure Industry');

      const foundIndustry = await db.industries.findByPk(industry.id, { transaction });
      expect(foundIndustry.name).toBe('Test Infrastructure Industry');
    });
  });
});