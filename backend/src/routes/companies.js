const express = require('express');

const CompaniesService = require('../services/companies');
const CompaniesDBApi = require('../db/api/companies');
const wrapAsync = require('../helpers').wrapAsync;
const requireRole = require('../middlewares/requireRole');

const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
  await CompaniesService.create(req.body.data, req.currentUser, true, req.headers.referer);
  const payload = true;
  res.status(200).send(payload);
});

router.put('/:id', wrapAsync(async (req, res) => {
  await CompaniesService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
  await CompaniesService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.get('/', requireRole('superAdmin'), wrapAsync(async (req, res) => {
  const payload = await CompaniesDBApi.findAll({
    ...req.query,
    companyId: req.currentUser.companyId,
  });

  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await CompaniesDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,{companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
});

router.get('/:id', wrapAsync(async (req, res) => {
  const payload = await CompaniesDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
