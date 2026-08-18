'use strict';

const getWeekDayBooleanMap = require('../../utils/getWeekDayBooleanMap');
const dayIds = require('../uuids/days');

const getDays = (dataValues) => {
  const days = [];
  if (dataValues.U == 1) {
    days.push(dayIds.sunday_id);
  }
  if (dataValues.M == 1) {
    days.push(dayIds.monday_id);
  }
  if (dataValues.T == 1) {
    days.push(dayIds.tuesday_id);
  }
  if (dataValues.W == 1) {
    days.push(dayIds.wednesday_id);
  }
  if (dataValues.R == 1) {
    days.push(dayIds.thursday_id);
  }
  if (dataValues.F == 1) {
    days.push(dayIds.friday_id);
  }
  if (dataValues.S == 1) {
    days.push(dayIds.saturday_id);
  }
  return days;
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Fetch all existing relationships
      const availabilityDaysOfWeek = await queryInterface.sequelize.query(
        `SELECT a.id as availabilityId, JSON_ARRAYAGG(d.id) as dayIds 
          FROM \`availabilities\` a 
            JOIN \`availabilitiesDaysDaysofweek\` ad ON a.id = ad.availabilityId 
            JOIN \`daysofweek\` d ON d.id = ad.daysofweekId 
          GROUP BY a.id`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      for (const item of availabilityDaysOfWeek) {
        const boolMap = getWeekDayBooleanMap({ days: item.dayIds });
        await queryInterface.sequelize.query(
          `UPDATE availabilities 
            SET \`U\` = :U, \`M\` = :M, \`T\` = :T, \`W\` = :W, \`R\` = :R, \`F\` = :F, \`S\` = :S
           WHERE id = :availabilityId`,
          {
            replacements: {
              availabilityId: item.availabilityId,
              ...boolMap,
            },
            type: Sequelize.QueryTypes.UPDATE,
            transaction,
          },
        );
      }

      // Drop the junction table
      await queryInterface.dropTable('availabilitiesDaysDaysofweek', {
        transaction,
      });

      // Drop the junction table for events
      await queryInterface.dropTable('eventsDaysOfWeekDaysofweek', {
        transaction,
      });

      // Drop the junction table for constraints
      await queryInterface.dropTable(
        'newconstraintgeneratorAntecedentTypeWeekDaysDaysofweek',
        {
          transaction,
        },
      );

      // Drop the junction table for constraints
      await queryInterface.dropTable(
        'newconstraintgeneratorConsequenceTypeWeekDaysDaysofweek',
        {
          transaction,
        },
      );

      // Drop the daysOfWeek table
      await queryInterface.dropTable('daysofweek', {
        transaction,
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
      // Recreate daysofweek table
      await queryInterface.createTable(
        'daysofweek',
        {
          id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true,
          },
          name: {
            type: Sequelize.DataTypes.TEXT,
          },
          importHash: {
            type: Sequelize.DataTypes.STRING(255),
            allowNull: true,
            unique: true,
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          deletedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
        },
        {
          transaction,
        },
      );

      // Insert the seven days
      await queryInterface.bulkInsert(
        'daysofweek',
        [
          {
            id: dayIds.monday_id,
            name: 'Monday',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: dayIds.tuesday_id,
            name: 'Tuesday',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: dayIds.wednesday_id,
            name: 'Wednesday',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: dayIds.thursday_id,
            name: 'Thursday',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: dayIds.friday_id,
            name: 'Friday',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: dayIds.saturday_id,
            name: 'Saturday',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: dayIds.sunday_id,
            name: 'Sunday',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {
          transaction,
        },
      );

      // Recreate junction table
      await queryInterface.createTable(
        'availabilitiesDaysDaysofweek',
        {
          availabilityId: {
            type: Sequelize.DataTypes.UUID,
          },
          daysofweekId: {
            type: Sequelize.DataTypes.UUID,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
        {
          transaction,
        },
      );

      // Restore relationships from availabilities table
      const availabilities = await queryInterface.sequelize.query(
        `SELECT id, U, M, T, W, R, F, S FROM availabilities`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      for (const availability of availabilities) {
        const days = getDays(availability);
        if (days.length > 0) {
          await queryInterface.bulkInsert(
            'availabilitiesDaysDaysofweek',
            days.map((id) => ({
              availabilityId: availability.id,
              daysofweekId: id,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
            {
              transaction,
            },
          );
        }
      }

      // Recreate junction table
      await queryInterface.createTable(
        'newconstraintgeneratorAntecedentTypeWeekDaysDaysofweek',
        {
          newconstraintgeneratorId: {
            type: Sequelize.DataTypes.UUID,
          },
          daysofweekId: {
            type: Sequelize.DataTypes.UUID,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
        {
          transaction,
        },
      );

      // Recreate junction table
      await queryInterface.createTable(
        'newconstraintgeneratorConsequenceTypeWeekDaysDaysofweek',
        {
          newconstraintgeneratorId: {
            type: Sequelize.DataTypes.UUID,
          },
          daysofweekId: {
            type: Sequelize.DataTypes.UUID,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
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
