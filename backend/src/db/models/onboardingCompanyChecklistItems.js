module.exports = function (sequelize, DataTypes) {
  const onboardingCompanyChecklistItems = sequelize.define(
    'onboardingCompanyChecklistItems',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      checklistItemId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,

      indexes: [
        {
          unique: true,
          fields: ['companyId', 'checklistItemId'],
          name: 'unique_task_per_company',
        },
      ],
    },
  );

  onboardingCompanyChecklistItems.associate = (db) => {
    db.onboardingCompanyChecklistItems.belongsTo(db.companies, {
      as: 'company',
      foreignKey: 'companyId',
      onDelete: 'CASCADE',
    });
    db.onboardingCompanyChecklistItems.belongsTo(db.onboardingChecklistItems, {
      as: 'checklistItem',
      foreignKey: 'checklistItemId',
      onDelete: 'CASCADE',
    });
  };

  return onboardingCompanyChecklistItems;
}; 