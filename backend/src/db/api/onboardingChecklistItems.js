const db = require('../models');

module.exports = class OnboardingChecklistItemsDBApi {
  static async countBy(where, options = {}) {
    const transaction = options.transaction;

    const count = await db.onboardingChecklistItems.count({ where }, { transaction });

    return count;
  }
}; 