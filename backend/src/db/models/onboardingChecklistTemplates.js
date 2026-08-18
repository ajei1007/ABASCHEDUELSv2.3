module.exports = function (sequelize, DataTypes) {
  const onboardingChecklistTemplates = sequelize.define(
    'onboardingChecklistTemplates',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    },
  );

  onboardingChecklistTemplates.associate = (db) => {
    db.onboardingChecklistTemplates.hasMany(db.onboardingChecklistItems, {
      as: 'items',
      foreignKey: 'templateId',
    });
  };

  return onboardingChecklistTemplates;
}; 