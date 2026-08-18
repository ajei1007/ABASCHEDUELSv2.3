const db = require('../models');

module.exports = class OnboardingCompanyChecklistItemsDBApi {
  static async update(id, data, options = {}) {
    const transaction = options.transaction;

    const onboardingCompanyChecklistItem = await db.onboardingCompanyChecklistItems.findByPk(id, {
      transaction,
    });

    await onboardingCompanyChecklistItem.update(
      {
        isCompleted: data.isCompleted ?? false,
        completedAt: data.completedAt ?? null,
      },
      { transaction },
    );

    return onboardingCompanyChecklistItem;
  }

  static async findOrCreate(where, data, options = {}) {
    const transaction = options.transaction;
  
    const [companyChecklistItem, created] =
      await db.onboardingCompanyChecklistItems.findOrCreate({
        where,
        defaults: data,
        transaction,
      });
  
    return { companyChecklistItem, created };
  }
}; 