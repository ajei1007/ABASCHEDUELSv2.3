const express = require('express');
const AuthIntegrationsDBApi = require('../db/api/authIntegrations');
const wrapAsync = require('../helpers').wrapAsync;

const db = require('../db/models');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

const router = require('../utils/createRouter')();

router.get(
  '/theralytics',
  wrapAsync(async (req, res) => {
    const userCreds = await AuthIntegrationsDBApi.findBy({
      userId: req.currentUser.id,
      integratingSoftware: { [Op.in]: ['theralytics', ''] }
    });
    if (!userCreds) {
      return res.status(404).send("User's creds are not saved!")
    }
    return res.status(200).send(userCreds)
  }))

module.exports = router;