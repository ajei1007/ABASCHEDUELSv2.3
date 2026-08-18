
const express = require('express');

const DrivetimebranchService = require('../services/drivetimebranch');
const DrivetimebranchDBApi = require('../db/api/drivetimebranch');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
    await DrivetimebranchService.create(req.body.data, req.currentUser, true, req.headers.referer);
    const payload = true;
    res.status(200).send(payload);
});

router.put('/:id', wrapAsync(async (req, res) => {
  await DrivetimebranchService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
  await DrivetimebranchService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.get('/', wrapAsync(async (req, res) => {
  const payload = await DrivetimebranchDBApi.findAll(
    req.query,
  );

  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await DrivetimebranchDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );

  res.status(200).send(payload);
});

router.get('/:id', wrapAsync(async (req, res) => {
  const payload = await DrivetimebranchDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
