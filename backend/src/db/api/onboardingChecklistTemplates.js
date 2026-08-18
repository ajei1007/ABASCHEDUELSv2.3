const db = require('../models');

module.exports = class OnboardingChecklistTemplatesDBApi {
  static async findAll(where, options = {}) {
    const transaction = options.transaction;
    const include = options.include || [];
    const order = options.order || [['order', 'ASC']];

    const onboardingChecklistTemplates = await db.onboardingChecklistTemplates.findAll({
      where,
      order,
      include,
      transaction,
    });

    return onboardingChecklistTemplates;
  }
}; 