'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'newconstraintgenerator',
        'antecedentRoleId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'newconstraintgenerator',
        'antecedentUserId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'newconstraintgenerator',
        'antecedentSubgroupId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'newconstraintgenerator',
        'antecedentLocationId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'newconstraintgenerator',
        'consequenceSubgroupId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'newconstraintgenerator',
        'consequenceRoleId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'newconstraintgenerator',
        'consequenceUserId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );


      await queryInterface.addColumn(
        'newconstraintgenerator',
        'consequenceLocationId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );

      
      //////////////////////////////////////////////////////////

      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['antecedentUserId'],
        type: 'foreign key',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_antecedent_users',
      });
      

      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['antecedentSubgroupId'],
        type: 'foreign key',
        references: {
          table: 'subgroups',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_antecedent_subgroups',
      });

      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['antecedentRoleId'],
        type: 'foreign key',
        references: {
          table: 'roles',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_antecedent_roles',
      });

      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['antecedentLocationId'],
        type: 'foreign key',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_antecedent_location',
      });

      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['consequenceUserId'],
        type: 'foreign key',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_consequence_users',
      });

      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['consequenceSubgroupId'],
        type: 'foreign key',
        references: {
          table: 'subgroups',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_consequence_subgroups',
      });

      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['consequenceRoleId'],
        type: 'foreign key',
        references: {
          table: 'roles',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_consequence_roles',
      });


      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['consequenceLocationId'],
        type: 'foreign key',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_consequence_location',
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //remove constraints

      await queryInterface.removeConstraint(
        'newconstraintgenerator',
        'fk_newconstraintgenerator_consequence_roles',
        {
          transaction,
        },
      );

      await queryInterface.removeConstraint(
        'newconstraintgenerator',
        'fk_newconstraintgenerator_consequence_subgroups',
        {
          transaction,
        },
      );

      await queryInterface.removeConstraint(
        'newconstraintgenerator',
        'fk_newconstraintgenerator_consequence_users',
        {
          transaction,
        },
      );

      await queryInterface.removeConstraint(
        'newconstraintgenerator',
        'fk_newconstraintgenerator_consequence_location',
        {
          transaction,
        },
      );

      await queryInterface.removeConstraint(
        'newconstraintgenerator',
        'fk_newconstraintgenerator_antecedent_roles',
        {
          transaction,
        },
      );

      await queryInterface.removeConstraint(
        'newconstraintgenerator',
        'fk_newconstraintgenerator_antecedent_subgroups',
        {
          transaction,
        },
      );

      await queryInterface.removeConstraint(
        'newconstraintgenerator',
        'fk_newconstraintgenerator_antecedent_users',
        {
          transaction,
        },
      );

      await queryInterface.removeConstraint(
        'newconstraintgenerator',
        'fk_newconstraintgenerator_antecedent_location',
        {
          transaction,
        },
      );

      //remove columns
      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'antecedentRoleId',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'antecedentUserId',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'antecedentSubgroupId',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'antecedentLocationId',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'consequenceUserId',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'consequenceRoleId',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'consequenceSubgroupId',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'consequenceLocationId',
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
