const express = require('express');

const TotaltypesService = require('../services/totaltypes');
const TotaltypesDBApi = require('../db/api/totaltypes');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
  await TotaltypesService.create(
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
    await TotaltypesService.update(req.body.data, req.body.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await TotaltypesService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.get(
  '/',
  wrapAsync(async (req, res) => {
    const payload = await TotaltypesDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });

    res.status(200).send(payload);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await TotaltypesDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );

  res.status(200).send(payload);
});

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await TotaltypesDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
