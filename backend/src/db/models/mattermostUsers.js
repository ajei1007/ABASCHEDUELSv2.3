module.exports = function (sequelize, DataTypes) {
  const mattermostUsers = sequelize.define(
    'mattermostUsers',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      mattermostUserId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mattermostUsername: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mattermostPassword: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mattermostTeamId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  mattermostUsers.associate = function (models) {
    mattermostUsers.belongsTo(models.users, {
      as: 'user',
      foreignKey: 'userId',
    });
  };

  return mattermostUsers;
}; 