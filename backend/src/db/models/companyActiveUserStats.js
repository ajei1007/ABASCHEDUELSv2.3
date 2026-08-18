const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const companyActiveUserStats = sequelize.define(
    'companyActiveUserStats',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.UUID,
      },
      employeeNumber: {
        type: DataTypes.INTEGER,
      },
      clientNumber: {
        type: DataTypes.INTEGER,
      },
      date: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('date')
            ? moment.utc(this.getDataValue('date')).format('YYYY-MM-DD')
            : null;
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  companyActiveUserStats.associate = (db) => {
    db.companyActiveUserStats.belongsTo(db.companies, {
      as: 'company',
      constraints: false,
    });
  };

  return companyActiveUserStats;
};
