const express = require('express');
const SettingscompanyService = require('../services/settingscompany');
const SettingscompanyDBApi = require('../db/api/settingscompany');
const wrapAsync = require('../helpers').wrapAsync;
const db = require('../db/models');
const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
  const payload = await SettingscompanyService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  res.status(200).send(payload);
});

router.put(
  '/:id',
  wrapAsync(async (req, res) => {
    await SettingscompanyService.update(
      req.body.data,
      req.body.id,
      req.currentUser,
    );
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.get(
  '/',
  wrapAsync(async (req, res) => {
    const payload = await SettingscompanyDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });

    res.status(200).send(payload);
  }),
);

router.get(
  '/company/:id',
  wrapAsync(async (req, res) => {
    const payload = await SettingscompanyDBApi.findByCompanyId(req.params.id);
    if (payload === 404) {
      return res.sendStatus(404);
    }
    return res.status(200).send(payload);
  }),
);

router.get(
  '/is-scheduler-locked/company/:id',
  wrapAsync(async (req, res) => {
    const payload = await SettingscompanyDBApi.findByCompanyId(req.params.id);
    return res.send({ schedulerLocked: payload.schedulerLocked });
  }),
);

router.put(
  '/company/scheduler-lock-switch/:id',
  wrapAsync(async (req, res) => {
    let hasUserPermission = false;
    for (let i = 0; i < req.currentUser.roles.length; i++) {
      let currentRole = req.currentUser.roles[i];
      if (currentRole.canEditEventSchedulerLocked) {
        hasUserPermission = true;
        break;
      }
    }
    // forbidden if user doesn't have permission
    if (!hasUserPermission) {
      return res.sendStatus(403);
    }

    const payload = await SettingscompanyDBApi.updateSchedulerLocked(
      req.params.id,
      req.currentUser
    );

    // if settingdcompany not found
    if (payload === 404) {
      return res.sendStatus(404);
    }

    // forbidden if user doesn't belong to company
    if (payload === 403) {
      return res.sendStatus(403);
    }
    
    return res.status(200).send(payload);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await SettingscompanyDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );
  res.status(200).send(payload);
});

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await SettingscompanyDBApi.findBy({ id: req.params.id });
    res.status(200).send(payload);
  }),
);

router.put('/:id/update-alias', async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { alias, aliasFormatType } = req.body;
    const payload = await SettingscompanyDBApi.updateAlias(
      req.params.id,
      alias,
      aliasFormatType ?? null,
      { transaction, currentUser: req.currentUser },
    );
    await transaction.commit();
    res.status(200).send(payload);
  } catch (error) {
    await transaction.rollback();
    res.status(500).send(error);
  }
});

module.exports = router;
