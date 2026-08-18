const express = require('express');
const passport = require('passport');
const AvailabilitiesService = require('../services/availabilities');
const AvailabilitiesDBApi = require('../db/api/availabilities');
const wrapAsync = require('../helpers').wrapAsync;
const getAvailabilitiesByResourceName = require('../utils/getAvailabilitiesByResourceName');

const router = require('../utils/createRouter')();

router.post('/request', async (req, res) => {
  req.body.data['days'] = [...new Set(req.body.data['days'])];
  await AvailabilitiesService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  const payload = true;
  res.status(200).send(payload);
});

router.post('/', async (req, res) => {
  await AvailabilitiesService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  const payload = true;
  res.status(200).send(payload);
});

router.post('/unavailable', async (req, res) => {
  const users = req.body.data.users;
  for (const user of users) {
    const data = {
      ...req.body.data,
      user: user,
      startTime: req.body.data.start,
      endTime: req.body.data.end,
      days: req.body.data.daysOfWeek,
      available: false,
      startRange: req.body.data.startRecur,
      endRange: req.body.data.endRecur,
      // Adding predefined recurring options to make it backcompatible
      frequency: 'Weekly',
      interval: 1,
    };
    await AvailabilitiesService.create(
      data,
      req.currentUser,
      true,
      req.headers.referer,
    );
  }
  res.status(200).send(true);
});

router.post(
  '/create/multiple',
  wrapAsync(async (req, res) => {
    const arr = req.body.data;

    if (arr?.length) {
      for (const data of arr) {
        await AvailabilitiesService.create(
          data,
          req.currentUser,
          true,
          req.headers.referer,
        );
      }
    }
    return res.status(200).send(true);
  }),
);

router.put(
  '/request/:id',
  wrapAsync(async (req, res) => {
    await AvailabilitiesService.update(
      req.body.data,
      req.body.id,
      req.currentUser,
    );
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.put(
  '/:id',
  wrapAsync(async (req, res) => {
    await AvailabilitiesService.update(
      req.body.data,
      req.body.id,
      req.currentUser,
    );
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.put(
  '/status/multiple',
  wrapAsync(async (req, res) => {
    const availabilityRequests = req.body;

    if (availabilityRequests && availabilityRequests.length) {
      for (const data of availabilityRequests) {
        await AvailabilitiesService.updateStatus(
          data,
          data.id,
          req.currentUser,
        );
      }
    }

    res.status(200).send(true);
  }),
);
// TODO remove, use /status/multiple instead. update the route from the mobile
router.put(
  '/request/status/multiple',
  wrapAsync(async (req, res) => {
    const availabilityRequests = req.body;

    if (availabilityRequests && availabilityRequests.length) {
      for (const data of availabilityRequests) {
        await AvailabilitiesService.updateStatus(
          data,
          data.id,
          req.currentUser,
        );
      }
    }

    res.status(200).send(true);
  }),
);

router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await AvailabilitiesService.remove(req.params.id, req.currentUser);
    res.status(200).send(true);
  }),
);

router.post(
  '/remove/multiple',
  wrapAsync(async (req, res) => {
    for (let id of req.body.toBeDeletedIds) {
      await AvailabilitiesService.remove(id, req.currentUser);
    }
    res.status(200).send(true);
  }),
);

router.delete(
  '/oncall/remove',
  wrapAsync(async (req, res) => {
    console.log('glippy');
    const payload = await AvailabilitiesDBApi.getOncallAvailabilities(
      req.query,
    );
    for (let index = 0; index < payload.length; index++) {
      const element = payload[index];
      const id = element.id;
      await AvailabilitiesService.remove(id, req.currentUser);
    }
    //await AvailabilitiesService.remove(req.params.id, req.currentUser);
    res.status(200).send(true);
  }),
);

router.delete(
  '/unavailable/:id',
  wrapAsync(async (req, res) => {
    await AvailabilitiesService.remove(req.params.id, req.currentUser);
    res.status(200).send(true);
  }),
);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const payload = await AvailabilitiesDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });
    res.status(200).send(payload);
  }),
);

router.get(
  '/request/resources/:name',
  wrapAsync(async (req, res) => {
    const payload = await getAvailabilitiesByResourceName(
      req,
      req.params.name,
      true,
    );

    res.status(200).send(payload);
  }),
);

router.get(
  '/resources/:name',
  wrapAsync(async (req, res) => {
    const payload = await getAvailabilitiesByResourceName(
      req,
      req.params.name,
      true,
    );

    res.status(200).send(payload);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await AvailabilitiesDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    { companyId: req.currentUser.companyId },
  );

  res.status(200).send(payload);
});

router.get(
  '/request/:id',
  wrapAsync(async (req, res) => {
    const payload = await AvailabilitiesDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await AvailabilitiesDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
