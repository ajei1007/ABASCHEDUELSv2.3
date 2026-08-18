const db = require('../db/models');
const onboardingCompanyChecklistItemsDBApi = require('../db/api/onboardingCompanyChecklistItems');
const onboardingChecklistItemsDBApi = require('../db/api/onboardingChecklistItems');
const onboardingChecklistTemplatesDBApi = require('../db/api/onboardingChecklistTemplates');
const CompaniesService = require('./companies');
const { UnauthorizedError, NotFoundError } = require('../common/errors');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');
const checkUserPermission = require('../utils/checkUserPermission');

module.exports = class OnboardingChecklistService {
  static async getCompanyChecklist(currentUser) {
    // Check if user has permission to view onboarding checklist
    if (!checkUserPermission(currentUser, 'viewOnboardingChecklist')) {
      throw new UnauthorizedError('Access denied: viewOnboardingChecklist permission required');
    }

    const transaction = await db.sequelize.transaction();
    const companyId = currentUser.companyId;

    try {
      // Get all templates with their items and company completion status using LEFT JOIN
      const templates = await onboardingChecklistTemplatesDBApi.findAll(
        {},
        { 
          transaction,
          include: [
            {
              model: db.onboardingChecklistItems,
              as: 'items',
              include: [
                {
                  model: db.onboardingCompanyChecklistItems,
                  as: 'companyItems',
                  where: { companyId },
                  required: false, // This makes it a LEFT JOIN
                }
              ],
            }
          ],
          order: [
            ['order', 'ASC'],
            [{ model: db.onboardingChecklistItems, as: 'items' }, 'order', 'ASC'],
          ],
        }
      );

      if (!templates || templates.length === 0) {
        await transaction.commit();
        return [];
      }

      // Process the results to format them properly
      const processedTemplates = templates.map(template => {
        const templateData = template.get({ plain: true });
        
        const processedItems = templateData.items.map(item => {
          // If company item exists, use its data; otherwise, assume not completed
          const companyItem = item.companyItems && item.companyItems.length > 0 ? item.companyItems[0] : null;
          
          return {
            id: item.id,
            title: item.title,
            content: item.content,
            order: item.order,
            isCompleted: companyItem?.isCompleted ?? false,
            completedAt: companyItem?.completedAt ?? null,
          };
        });

        return {
            checklist: {
                id: templateData.id,
                title: templateData.title,
                description: templateData.description,
                order: templateData.order,
                items: processedItems,
            }
        }
      });

      await transaction.commit();
      return processedTemplates;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }



  static async toggleTask(checklistItemId, currentUser) {
    // Check if user has permission to toggle onboarding checklist
    if (!checkUserPermission(currentUser, 'toggleOnboardingChecklist')) {
      throw new UnauthorizedError('Access denied: toggleOnboardingChecklist permission required');
    }

    // Check if user has permission to view onboarding checklist (required for toggling tasks)
    if (!checkUserPermission(currentUser, 'viewOnboardingChecklist')) {
      throw new UnauthorizedError('Access denied: viewOnboardingChecklist permission required');
    }

    const transaction = await db.sequelize.transaction();
    const companyId = currentUser.companyId;

    try {
      const checklistItemCount = await onboardingChecklistItemsDBApi.countBy({ id: checklistItemId }, { transaction });

      if (checklistItemCount === 0) {
        throw new NotFoundError('Checklist item not found');
      }

      // Make sure the checklist item is created for the company
      const { companyChecklistItem } = await onboardingCompanyChecklistItemsDBApi.findOrCreate(
        {
          companyId,
          checklistItemId,
        },
        {
          companyId,
          checklistItemId,
          isCompleted: false,
        },
        { transaction }
      );

      // Toggle the completion state
      const newCompletionState = !companyChecklistItem.isCompleted;
      const updateData = {
        isCompleted: newCompletionState,
        completedAt: newCompletionState ? new Date() : null,
      };

      // Update the checklist item
      await onboardingCompanyChecklistItemsDBApi.update(
        companyChecklistItem.id,
        updateData,
        { transaction }
      );

      // Check if all checklist items are completed and update company onboarded status
      await this._checkAndUpdateCompanyOnboardedStatus(companyId, transaction);

      await transaction.commit();
      return updateData;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async _checkAndUpdateCompanyOnboardedStatus(companyId, transaction) {
    const templates = await onboardingChecklistTemplatesDBApi.findAll(
      {},
      { 
        transaction,
        include: [
          {
            model: db.onboardingChecklistItems,
            as: 'items',
            include: [
              {
                model: db.onboardingCompanyChecklistItems,
                as: 'companyItems',
                where: { companyId },
                required: false, // This makes it a LEFT JOIN
              }
            ],
          }
        ],
      }
    );
    
    // Check if all items are completed
    const allCompleted = templates.length > 0 &&
      templates.every(template =>
        (template.items || []).every(item => {
          const companyItems = item.companyItems || [];
          // If no companyItems, treat as not completed
          if (companyItems.length === 0) return false;
        
          // All companyItems must be completed
          return companyItems.every(ci => ci.isCompleted);
        })
      );
    
    // Update company onboarded status based on completion state
    await CompaniesService.updateOnboardedStatus(companyId, allCompleted, { transaction });

    return allCompleted;
  }
}