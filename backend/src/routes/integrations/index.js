const express = require('express');
const router = express.Router();
// Routes
const branchesRoutes = require('./branches');
const usersRoutes = require('./users');
const availabilityRoutes = require('./availabilities');


router.use('/branches', branchesRoutes);
router.use('/users', usersRoutes);
router.use('/availabilities', availabilityRoutes);


module.exports = router;