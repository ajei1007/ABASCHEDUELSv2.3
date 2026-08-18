'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if the templates table exists
      let templateTableExists = true;
      let itemTableExists = true;

      try {
        await queryInterface.describeTable('onboardingChecklistTemplates');
      } catch (err) {
        templateTableExists = false;
      }

      try {
        await queryInterface.describeTable('onboardingChecklistItems');
      } catch (err) {
        itemTableExists = false;
      }

      if (!templateTableExists || !itemTableExists) {
        console.warn('onboardingChecklistTemplates or onboardingChecklistItems table does not exist. Skipping seeding.');
        return;
      }

      // Create onboarding checklist templates
      const templates = [
        {
          id: uuidv4(),
          title: 'Gather Data',
          description: 'Collect all necessary information to set up your account',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          title: 'Onboarding',
          description: 'Account setup and discovery phase',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          title: 'Implementation',
          description: 'Learn the platform features and workflows',
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await queryInterface.bulkInsert('onboardingChecklistTemplates', templates, { transaction });

      // Get the template IDs for reference
      const templateIds = templates.map(t => t.id);

      // Create onboarding checklist items
      const items = [
        // Gather Data Items
        {
          id: uuidv4(),
          templateId: templateIds[0],
          title: 'Gather Client Information',
          content: '[Complete the client information spreadsheet](https://docs.google.com/spreadsheets/d/1KElgsJqAkLoRCTvBGqgnB-WyJPqwfkm2W94JzfYI-Zw/edit?usp=sharing)',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[0],
          title: 'Gather Employee Information',
          content: '[Complete the employee information spreadsheet](https://docs.google.com/spreadsheets/d/1lY2n37EEf-mb9J2WdMclZ7nf7GJLys-VnSMH3xGfgQc/edit?usp=sharing)',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[0],
          title: 'How to complete spreadsheet',
          content: '[Watch the tutorial video on how to fill out spreadsheets](https://www.loom.com/share/3f476f23f8cf49259983a3e94604e11a?sid=0b3bec36-27a1-4117-b1dd-468f9150a308)',
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[0],
          title: 'Complete onboarding form',
          content: '[Fill out the comprehensive onboarding form](https://forms.gle/eoyMgPjhG2EtPxRx6)',
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[0],
          title: 'Provide ABAS with Teams & sample schedule',
          content: 'Send CSM a sample schedule and instructions how to match clients and therapists together',
          order: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        },
    
        // Onboarding Items
        {
          id: uuidv4(),
          templateId: templateIds[1],
          title: 'ABAS Sets Up Account',
          content: 'Allow 3-5 working days for this process',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[1],
          title: 'ABAS Sets up Discovery',
          content: 'This is generally set up within one week to review any questions. During this meeting any meetings for the duration of your 30 days paid trial will be set up.',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[1],
          title: 'Review videos prior to meeting 1',
          content: 'Review videos for meeting and prepare for first meeting with CSM',
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Implementation Items
        {
          id: uuidv4(),
          templateId: templateIds[2],
          title: 'Meeting #1',
          content: `Review all basic features on the calendar.  
- [Make an Appointment](https://abaschedules-v2.atlassian.net/wiki/x/AgDkBQ) 
- [Copy/Paste](https://abaschedules-v2.atlassian.net/wiki/x/eIBDAw) 
- [Create New Employee & Client](https://abaschedules-v2.atlassian.net/wiki/x/CoBMAw) 
- [Matching/Unmatching](https://abaschedules-v2.atlassian.net/wiki/pages/resumedraft.action?draftId=106102789&draftShareId=ba85b9bc-4958-4761-b01b-ff4a9b28900e) 
- [Edit/Add Activity](https://abaschedules-v2.atlassian.net/wiki/x/L4BIAw) 
- [Make a User Inactive](https://abaschedules-v2.atlassian.net/wiki/x/AQBWBg) 
- [Solution Generator](https://abaschedules-v2.atlassian.net/wiki/x/aoBIAw) & [Color Coding](https://abaschedules-v2.atlassian.net/wiki/x/MQBEAw) 
- [Tags](https://abaschedules-v2.atlassian.net/wiki/x/KgBLAw)`,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[2],
          title: 'Meeting #2',
          content: `How to use Smart Features:
- [Flagging](https://abaschedules-v2.atlassian.net/wiki/x/QABQAw)
- [Custom Constraint Builder](https://abaschedules-v2.atlassian.net/wiki/x/DABPAw)
- [Optimizer](https://abaschedules-v2.atlassian.net/wiki/x/JoBHAw)
- [Stats](https://abaschedules-v2.atlassian.net/wiki/x/KIBMAw)
- [Quickview Stats](https://abaschedules-v2.atlassian.net/wiki/x/Q4BGAw)
- [Push Notifications](https://abaschedules-v2.atlassian.net/wiki/x/MwBNAw)
- [Mobile App](https://abaschedules-v2.atlassian.net/wiki/x/AoBGAw)`,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[2],
          title: 'Meeting #3',
          content: 'Review workflows and ask questions',
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          templateId: templateIds[2],
          title: '30 Day Review Meeting',
          content: 'After 30 days this can be used to answer any final questions. Inquire about adding in a new location, or provide feedback to ABAS.',
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ];

      await queryInterface.bulkInsert('onboardingChecklistItems', items, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete('onboardingChecklistItems', {}, { transaction });
      await queryInterface.bulkDelete('onboardingChecklistTemplates', {}, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}; 