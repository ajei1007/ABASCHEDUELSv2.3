const express = require('express');

const OptimizerService = require('../services/optimizer');
const OptimizerDBApi = require('../db/api/optimizer');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
  await OptimizerService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  const payload = true;
  res.status(200).send(payload);
});

router.put(
  '/:id',
  wrapAsync(async (req, res) => {
    await OptimizerService.update(req.body.data, req.body.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.put(
  '/',
  wrapAsync(async (req, res) => {
    let payload = await OptimizerDBApi.findAll({
      createdBy: req.currentUser.id,
      companyId: req.currentUser.companyId,
    });
    const id = payload.rows[0].id;
    await OptimizerService.update(req.body.data, id, req.currentUser);
    payload = true;
    res.status(200).send(payload);
  }),
);

router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await OptimizerService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.get(
  '/',
  wrapAsync(async (req, res) => {
    let payload = await OptimizerDBApi.findAll({
      createdBy: req.currentUser.id,
      companyId: req.currentUser.companyId,
    });
    const data = { data: {} };
    if (payload.rows.length == 0) {
      payload = await OptimizerService.create(
        { data: {} },
        req.currentUser,
        true,
        req.headers.referer,
      );
      payload = { rows: [data.data] };
    }
    res.status(200).send(payload);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await OptimizerDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );

  res.status(200).send(payload);
});

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await OptimizerDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
