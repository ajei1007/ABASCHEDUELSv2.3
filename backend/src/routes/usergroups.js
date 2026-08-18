
const express = require('express');

const UsergroupsService = require('../services/usergroups');
const UsergroupsDBApi = require('../db/api/usergroups');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
    await UsergroupsService.create(req.body.data, req.currentUser, true, req.headers.referer);
    const payload = true;
    res.status(200).send(payload);
});

router.put('/:id', wrapAsync(async (req, res) => {
  await UsergroupsService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
  await UsergroupsService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.get('/', wrapAsync(async (req, res) => {
  const payload = await UsergroupsDBApi.findAll(
    req.query,
  );

  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await UsergroupsDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );

  res.status(200).send(payload);
});

router.get('/:id', wrapAsync(async (req, res) => {
  const payload = await UsergroupsDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
