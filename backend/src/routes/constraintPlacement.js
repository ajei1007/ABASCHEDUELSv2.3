const express = require('express');
const ConstraintPlacementService = require('../services/constraintPlacement');
const ConstraintPlacementDBApi = require('../db/api/constraintPlacement');

const router = require('../utils/createRouter')();

router.post('/multiple', async (req, res) => {
  const constraintPlacements = req.body.data;

  for (const data of constraintPlacements) {
    if (!data.id) {
      await ConstraintPlacementService.create(
        data,
        req.currentUser,
        true,
        req.headers.referer,
      );
    } else {
      await ConstraintPlacementService.update(
        data,
        data.id,
        req.currentUser,
      );
    }
  }

  return res.status(200).send(true);
});

router.get('/', async (req, res) => {
  let payload = [];
  const role = req.currentUser?.roles?.[0];

  if (role) {
    const callCustomConstraint = role.flaggingFeature || role.optimizerFeature || role.createEvent;
    if (callCustomConstraint) {
      payload = await ConstraintPlacementDBApi.findAll(req.query);
    }
  }
  return res.status(200).send(payload);
});

module.exports = router;
