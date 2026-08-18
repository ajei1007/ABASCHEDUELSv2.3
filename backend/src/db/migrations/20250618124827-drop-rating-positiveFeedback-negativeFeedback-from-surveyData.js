'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      const tableDescription = await queryInterface.describeTable('surveyData');
      
      // drop rating column if it exists
      if (tableDescription.rating) {
        await queryInterface.removeColumn('surveyData', 'rating', { transaction });
      }
      
      // drop positiveFeedback column if it exists
      if (tableDescription.positiveFeedback) {
        await queryInterface.removeColumn('surveyData', 'positiveFeedback', { transaction });
      }
      
      // drop negativeFeedback column if it exists
      if (tableDescription.negativeFeedback) {
        await queryInterface.removeColumn('surveyData', 'negativeFeedback', { transaction });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add back the columns - no need to check existence since we're adding them back
      await queryInterface.addColumn('surveyData', 'rating', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });
      
      await queryInterface.addColumn('surveyData', 'positiveFeedback', {
        type: Sequelize.TEXT,
        allowNull: true,
      }, { transaction });
      
      await queryInterface.addColumn('surveyData', 'negativeFeedback', {
        type: Sequelize.TEXT,
        allowNull: true,
      }, { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};