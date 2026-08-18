// src/dbSync.js
const db = require('./db/models');
const configs = require('./db/db.config');

async function syncAllTenants() {
  await Promise.all(
    Object.keys(configs).map(tenantId => {
      const models = db.getModels(tenantId);
      return models.sequelize.sync();
    })
  );
  console.log('✅  DB SYNCED for all tenants!');
}

syncAllTenants().catch(err => {
  console.error('❌  Failed to sync databases:', err);
  process.exit(1);
});