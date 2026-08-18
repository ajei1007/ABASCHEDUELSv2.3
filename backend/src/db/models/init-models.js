// models/init-models.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

/**
 * Dynamically loads all models in the "models" folder
 * and attaches them to the given sequelize instance.
 */
function initModels(sequelize, SequelizeLib) {
  const db = {};

  fs.readdirSync(__dirname)
    .filter((file) => {
      // Adjust logic if needed
      return (
        file.indexOf('.') !== 0 &&             // skip hidden files
        file !== basename &&                  // skip this file (init-models.js)
        file !== 'index.js' &&               // skip index.js
        file.slice(-3) === '.js'             // only .js files
      );
    })
    .forEach((file) => {
      // Each model file exports a function: (sequelize, DataTypes) => model
      const model = require(path.join(__dirname, file))(sequelize, SequelizeLib.DataTypes);
      db[model.name] = model;
    });

  // Run model.associate if defined (so that associations work)
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  return db;
}

module.exports = initModels;
