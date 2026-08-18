
const express = require('express');

const PushnotificationsService = require('../services/pushnotifications');
const PushnotificationsDBApi = require('../db/api/pushnotifications');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
    await PushnotificationsService.create(req.body.data, req.currentUser, true, req.headers.referer);
    const payload = true;
    res.status(200).send(payload);
});

router.put('/:id', wrapAsync(async (req, res) => {
  await PushnotificationsService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.put('/read/bulk', wrapAsync(async (req, res) => {
  await PushnotificationsService.checkBulk(req.body.data, req.currentUser);
  res.status(200).send(true);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
  await PushnotificationsService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.get('/', wrapAsync(async (req, res) => {
  const payload = await PushnotificationsDBApi.findAll(
    req.query,
  );

  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await PushnotificationsDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );
  res.status(200).send(payload);
});

router.get('/:id', wrapAsync(async (req, res) => {
  const payload = await PushnotificationsDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
