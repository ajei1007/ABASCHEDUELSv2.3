module.exports = (sequelize, DataTypes) => {
  const OptimizerObjectiveactivitiesmanyUsers = sequelize.define('optimizerObjectiveactivitiesmanyUsers', {
    optimizerId: {
      type: DataTypes.UUID,
      references: {
        model: 'optimizer',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    rank: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    // options
  });

  return OptimizerObjectiveactivitiesmanyUsers;
};