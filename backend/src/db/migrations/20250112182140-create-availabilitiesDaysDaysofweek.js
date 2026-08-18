'use strict';
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
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const [results] = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE 'availabilitiesDaysDaysofweek';`
    );
    if (results.length !== 0) {
      return;
    }

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
    );

    const availabilities = await queryInterface.sequelize.query(
      `SELECT id, U, M, T, W, R, F, S FROM availabilities`,
      {
        type: Sequelize.QueryTypes.SELECT,
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
        );
      }
    }
  },

  async down (queryInterface, Sequelize) {
  }
};
