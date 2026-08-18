module.exports = (sequelize, DataTypes) => {
  const eventsIntegrationData = sequelize.define(
    'eventsIntegrationData',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      integratingSoftware: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      eventIdOther: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      recurringEventIdOther: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );

  eventsIntegrationData.associate = (db) => {
    db.eventsIntegrationData.belongsTo(db.events, {
      as: 'event',
      foreignKey: 'eventId',
      constraints: false,
    });
  };

  return eventsIntegrationData;
};