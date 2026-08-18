const config = require('../../config');
const express = require('express');
const axios = require('axios');
const { wrapAsync } = require('../../helpers');

const router = require('../../utils/createRouter')();

router.post(
  '/',
  wrapAsync(async (req, res) => {
    const tenantId = req.get('X-Tenant-ID');
    if (!tenantId) return res.status(400).json({ error: 'Missing X-Tenant-ID header' });

    const response = await axios.post(`${config.optimizer[tenantId].url}/optimzer`, JSON.stringify(req.body), {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': tenantId
      },
      withCredentials: true,
    });
    return res.status(200).send(response.data);
  }))

router.post(
  '/staff_tracker',
  wrapAsync(async (req, res) => {
    const tenantId = req.get('X-Tenant-ID');
    if (!tenantId) return res.status(400).json({ error: 'Missing X-Tenant-ID header' });

    const response = await axios.post(`${config.optimizer[tenantId].url}/staff_tracker`, JSON.stringify(req.body), {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return res.status(200).send(response.data);
  }))

router.post(
  '/staff_equilibrium',
  wrapAsync(async (req, res) => {
    const tenantId = req.get('X-Tenant-ID');
    if (!tenantId) return res.status(400).json({ error: 'Missing X-Tenant-ID header' });

    const response = await axios.post(`${config.optimizer[tenantId].url}/staff_equilibrium`, JSON.stringify(req.body), {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return res.status(200).send(response.data);
  }))

module.exports = router;
