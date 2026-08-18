const express = require('express');

const MobiletokensService = require('../services/mobiletokens');
const MobiletokensDBApi = require('../db/api/mobiletokens');
const passport = require('passport');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

router.post('/', passport.authenticate('jwt', { session: false }), wrapAsync(async (req, res) => {
  // Check expo token
  const mobiletoken = await MobiletokensDBApi.findBy(
    { token: req.body.data.token },
  );
  
  // if mobiletoken not exists in db, then create a new mobiletoken
  if (!mobiletoken) {
    const payload = await MobiletokensService.create(req.body.data, req.currentUser, true, req.headers.referer);
    return res.status(200).send(payload.id);
  }
  // if exists but currentUser.id is not equal mobiletoken createdById, then update mobiletoken createdById and updatedById
  if (mobiletoken.createdById !== req.currentUser.id) {
    const newMobiletokenData = {
      token: mobiletoken.token
    }
    const payload = await MobiletokensService.update(newMobiletokenData, mobiletoken.id, req.currentUser);
    return res.status(200).send(payload.id);
  }
  return res.status(200).send(mobiletoken.id);
}));

router.put('/:id', wrapAsync(async (req, res) => {
  await MobiletokensService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
  await MobiletokensService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

router.get('/', wrapAsync(async (req, res) => {
  const payload = await MobiletokensDBApi.findAll(
    req.query,
  );

  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await MobiletokensDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );

  res.status(200).send(payload);
});

router.get('/:id', wrapAsync(async (req, res) => {
  const payload = await MobiletokensDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
