'use strict';

const { AsyncLocalStorage } = require('async_hooks');
const SequelizeClass = require('sequelize');
const configs = require('../db.config');
const initModels = require('./init-models');

const als = new AsyncLocalStorage();
const pools = {};
const caches = {};
const DEFAULT_TENANT = Object.keys(configs)[0];

// lazy‑create one Sequelize instance per tenant
function getPool(tenantId) {
  const cfg = configs[tenantId];
  if (cfg === undefined || cfg === null) throw new Error(`Unknown tenant "${tenantId}"`);

  if (!pools[tenantId]) {
    // pull exactly the props Sequelize needs, plus whatever else you want
    const {
      database,
      username,
      password,
      host,
      port,
      dialect,
      seederStorage,
      isolationLevel,
      logging,
      dialectOptions,
      // any other custom options you have in your cfg …
      ...otherOptions
    } = cfg;

    pools[tenantId] = new SequelizeClass(
      database,
      username,
      password,
      {
        host,
        port,
        dialect,           // ← must be explicitly here
        seederStorage,
        isolationLevel,
        logging,
        dialectOptions,
        ...otherOptions    // anything else you passed in your cfg
      }
    );
  }

  return pools[tenantId];
}

// lazy‑init that tenant’s models via your initModels
function getModels(tenantId) {
  if (!caches[tenantId]) {
    const sequelize = getPool(tenantId);
    caches[tenantId] = initModels(sequelize, SequelizeClass);
  }
  return caches[tenantId];
}

// one‑line middleware to set the current tenant in AsyncLocalStorage
function tenantMiddleware(req, res, next) {
  const tenantId = req.get('X-Tenant-ID') ?? DEFAULT_TENANT;
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing X-Tenant-ID header' });
  }
  als.enterWith(tenantId);
  return next();
}

// the Proxy you `module.exports` so all your old `db.Foo` calls still work
const proxy = new Proxy({}, {
  get(_, prop) {
    // --- always‑available utilities (no tenant needed)
    if (prop === 'tenantMiddleware') return tenantMiddleware;
    if (prop === 'getModels') return getModels;
    if (prop === 'syncAll') {
      return async () => {
        await Promise.all(
          Object.keys(configs)
            .map(id => getModels(id).sequelize.sync())
        );
      };
    }
    if (prop === 'Sequelize') return SequelizeClass;
    if (prop === 'Op') return SequelizeClass.Op;

    // --- everything else is a model lookup
    let tenantId = als.getStore();
    if (!tenantId) {
      tenantId = DEFAULT_TENANT;
    }

    const models = getModels(tenantId);
    if (!(prop in models)) {
      throw new Error(`Model "${prop}" not found for tenant "${tenantId}"`);
    }
    return models[prop];
  },
});

module.exports = proxy;
