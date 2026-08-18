module.exports = function (sequelize, DataTypes) {
  const companies = sequelize.define(
    'companies',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.TEXT,
      },

      membership: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      disabled: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      stripeId: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

      onboarded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  companies.associate = (db) => {
    db.companies.belongsTo(db.industries, {
      as: 'industry',
      allowNull: true,
      constraints: false,
    });
    db.companies.belongsTo(db.users, {
      as: 'createdBy',
    });
    db.companies.belongsTo(db.users, {
      as: 'updatedBy',
    });
    db.companies.hasOne(db.settingscompany, {
      as: 'settingscompany',
      foreignKey: 'companyId',
      constraints: false,
    });
    // db.companies.belongsTo(db.users, {
    //   as: 'admin',
    // });
  };

  return companies;
};
