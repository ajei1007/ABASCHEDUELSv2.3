module.exports = (sequelize, DataTypes) => {
  const siblingsUsers = sequelize.define(
    'siblingsUsers',
    {
      id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      // additional model options
    },
  );

  return siblingsUsers;
};
