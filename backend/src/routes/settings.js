
const express = require('express');

const SettingsService = require('../services/settings');
const SettingsDBApi = require('../db/api/settings');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
  let payload = await SettingsService.create(req.body.data, req.currentUser, true, req.headers.referer);
  res.status(200).send(payload.id);
});

router.put('/:id', wrapAsync(async (req, res) => {
  await SettingsService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.put('/', wrapAsync(async (req, res) => {

  let payload = await SettingsDBApi.findAll(
    { createdBy: req.currentUser.id, companyId: req.currentUser.companyId }
  );
  const id = payload.rows[0].id
  await SettingsService.update(req.body.data, id, req.currentUser);
  payload = true;
  res.status(200).send(payload);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
  await SettingsService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));


router.get('/', wrapAsync(async (req, res) => {
  let payload = await SettingsDBApi.findAll(
    { createdBy: req.currentUser.id, companyId: req.currentUser.companyId }
  );
  const data = { data: { orange: false, overbooking: true, blocks: false, weekends: false, driveTime: false, noGaps: false } }
  if (payload.rows.length == 0) {
    payload = await SettingsService.create({ data: {} }, req.currentUser, true, req.headers.referer);
    payload = { "rows": [data.data] }
  }
  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await SettingsDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit, { companyId: req.currentUser.companyId }
  );

  res.status(200).send(payload);
});

router.get('/:id', wrapAsync(async (req, res) => {
  const payload = await SettingsDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
