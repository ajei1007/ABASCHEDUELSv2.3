module.exports = function (sequelize, DataTypes) {
  const onboardingChecklistItems = sequelize.define(
    'onboardingChecklistItems',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
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

  onboardingChecklistItems.associate = (db) => {
    db.onboardingChecklistItems.belongsTo(db.onboardingChecklistTemplates, {
      as: 'template',
      foreignKey: 'templateId',
      onDelete: 'CASCADE',
    });
    db.onboardingChecklistItems.hasMany(db.onboardingCompanyChecklistItems, {
      as: 'companyItems',
      foreignKey: 'checklistItemId',
    });
  };

  return onboardingChecklistItems;
}; 