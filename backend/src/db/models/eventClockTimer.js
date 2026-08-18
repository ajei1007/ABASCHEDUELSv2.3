'use strict';

module.exports = (sequelize, DataTypes) => {
  const eventClockTimer = sequelize.define('eventClockTimer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'event_id',
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
    },
    end_time: {
      type: DataTypes.DATE,
      field: 'end_time',
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      field: 'duration_seconds',
    },
    lat_start: {
      type: DataTypes.DECIMAL(10,8),
      field: 'lat_start',
    },
    lon_start: {
      type: DataTypes.DECIMAL(11,8),
      field: 'lon_start',
    },
    lat_end: {
      type: DataTypes.DECIMAL(10,8),
      field: 'lat_end',
    },
    lon_end: {
      type: DataTypes.DECIMAL(11,8),
      field: 'lon_end',
    },
    note: {
      type: DataTypes.TEXT,
      field: 'note',
    },
  }, {
    tableName: 'eventClockTimer',
    timestamps: true,
    paranoid: true,
    freezeTableName: true,
  });

  eventClockTimer.associate = (db) => {
    db.eventClockTimer.belongsTo(db.events, {
      foreignKey: 'event_id'
    });
    
    db.eventClockTimer.belongsTo(db.users, {
      foreignKey: 'user_id'
    });
  };

  return eventClockTimer;
};
