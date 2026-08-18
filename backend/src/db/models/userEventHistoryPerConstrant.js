// Import Sequelize and the DataTypes you need
const { DataTypes } = require('sequelize');

// Define your model
module.exports = (sequelize) => {
  const userEventHistoryPerConstraint = sequelize.define(
    'userEventHistoryPerConstraint',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      constraintFrequency: {
        type: DataTypes.ENUM(
          'day',
          'week',
          'session',
          'month',
          'year',
          'custom',
        ),
        allowNull: false,
      },
      eventDuration: {
        type: DataTypes.INTEGER,
      },
      eventCount: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  userEventHistoryPerConstraint.associate = (db) => {
    db.userEventHistoryPerConstraint.belongsTo(db.users, {
      as: 'antecedentUser',
      constraints: false,
    });

    db.userEventHistoryPerConstraint.belongsTo(db.users, {
      as: 'consequenceUser',
      constraints: false,
    });

    db.userEventHistoryPerConstraint.belongsTo(db.newconstraintgenerator, {
      as: 'constraint',
      constraints: false,
    });
  };


  return userEventHistoryPerConstraint;
};
