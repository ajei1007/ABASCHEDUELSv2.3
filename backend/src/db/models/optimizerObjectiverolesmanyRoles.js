module.exports = (sequelize, DataTypes) => {
  const OptimizerObjectiveRolesManyRoles = sequelize.define('optimizerObjectiverolesmanyRoles', {
    optimizerId: {
      type: DataTypes.UUID,
      references: {
        model: 'optimizer',
        key: 'id',
      },
    },
    roleId: {
      type: DataTypes.UUID,
      references: {
        model: 'roles',
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

  return OptimizerObjectiveRolesManyRoles;
};