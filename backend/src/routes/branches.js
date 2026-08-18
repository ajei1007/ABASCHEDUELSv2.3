const express = require('express');

const BranchesService = require('../services/branches');
const BranchesDBApi = require('../db/api/branches');
const BranchtypeDBApi = require('../db/api/branchtype');
const logger = require('../services/logger/logger');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();


router.post(
  '/',
  wrapAsync(async (req, res) => {
    await BranchesService.create(
      req.body.data,
      req.currentUser,
      true,
      req.headers.referer,
    );
    res.status(200).send(true);
  }),
);

// Import Branches sheet
router.post('/form-sheet', async (req, res, next) => {
  // Create branches
  const branches = req.body.data.branches;
  for (const branch of branches) {
    await BranchesService.create(
      branch,
      req.currentUser,
      true,
      req.headers.referer,
      next,
    );
  }

  res.status(200).send(true);
});

router.put(
  '/:id',
  wrapAsync(async (req, res) => {
    await BranchesService.update(req.body.data, req.body.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);


router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await BranchesService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.put(
  '/scheduler-lock-switch/:id',
  wrapAsync(async (req, res) => {
    let hasUserPermission = false;
    for (let i = 0; i < req.currentUser.roles.length; i++) {
      let currentRole = req.currentUser.roles[i];
      if (currentRole.canEditEventSchedulerLocked) {
        hasUserPermission = true;
        break;
      }
    }
    // forbidden if user doesn't have permission
    if (!hasUserPermission) {
      return res.sendStatus(403);
    }

    const payload = await BranchesDBApi.updateSchedulerLocked(
      req.params.id,
      req.currentUser,
    );
    
    // if branch not found
    if (payload === 404) {
      return res.sendStatus(404);
    }

    if (payload && req.currentUser) {
      logger.schedulerAction(req.currentUser, {
        schedulerLocked: payload.schedulerLocked,
        branchId: payload.id,
        branchName: payload.name,
      });
    }
    
    return res.status(200).send(payload);
  }),
);

router.get(
  '/is-scheduler-locked/branch/:id',
  wrapAsync(async (req, res) => {
    let ancestorsBranchsMap =
      await BranchesDBApi.getAntecedentBranchesSchedulerLock(
        req.params.id,
        req.currentUser.companyId,
        true
      );

    if (!ancestorsBranchsMap.branches || ancestorsBranchsMap.branches.length === 0) {
      return res.sendStatus(404);
    }

    let lockedBranchNames = [];

    if (ancestorsBranchsMap.hasLock) {
      lockedBranchNames = ancestorsBranchsMap.branches
        .filter(
          (branch) =>
            branch.schedulerLocked === true && branch.id !== req.params.id,
        )
        .map((branch) => branch.name);
    }

    return res.send({
      schedulerLocked: ancestorsBranchsMap.hasLock,
      lockedParents: lockedBranchNames,
    });
  }),
);

router.get(
  '/optimizer',
  wrapAsync(async (req, res) => {
    let query_now = { ...req.query, companyId: req.currentUser.companyId };
    const payload = await BranchesDBApi.findAllOptimizer(query_now);
    res.status(200).send(payload);
  }),
);

router.get(
  '/',
  wrapAsync(async (req, res) => {
    let branches = req.currentUser.branches.map((e) => e.id).join('|');
    const dataAccessArray = req.currentUser.roles.map(
      (role) => role.dataAccess,
    );
    let query_now = { ...req.query, companyId: req.currentUser.companyId };
    if (!dataAccessArray.includes('All')) {
      query_now = { ...query_now, branches: branches };
    }
    const payload = await BranchesDBApi.findAll(query_now);

    res.status(200).send(payload);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await BranchesDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    { companyId: req.currentUser.companyId },
  );

  res.status(200).send(payload);
});

router.get('/lowest/autocomplete', async (req, res) => {
  // get branchtypes
  const branchTypes = await BranchtypeDBApi.findAll({
    companyId: req.currentUser.companyId,
  });

  // collect the lowest level branchtypes
  let childBranchTypes = new Array();
  let parentBranchTypes = new Array();
  let lowestBranchTypes = new Array();

  for (let m = 0; m < branchTypes.rows.length; m++) {
    childBranchTypes.push(branchTypes.rows[m].dataValues.id);
    parentBranchTypes.push(branchTypes.rows[m].dataValues.parentId);
  }

  for (let n = 0; n < childBranchTypes.length; n++) {
    if (!parentBranchTypes.includes(childBranchTypes[n])) {
      lowestBranchTypes.push(childBranchTypes[n]);
    }
  }

  // remove duplicates
  lowestBranchTypes = [...new Set(lowestBranchTypes)];

  // get branches from lowest level branchtype
  const payload = await BranchesDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    { companyId: req.currentUser.companyId, branchTypeIds: lowestBranchTypes },
  );

  res.status(200).send(payload);
});

router.get('/highest/autocomplete', async (req, res) => {
  // get branchtypes
  const branchTypes = await BranchtypeDBApi.findAll({
    companyId: req.currentUser.companyId,
  });

  // collect the highest level branchtypes
  let highestBranchTypes = new Array();

  for (let m = 0; m < branchTypes.rows.length; m++) {
    // if the parent is NULL then it means it is on top
    if (!branchTypes.rows[m].dataValues.parentId) {
      highestBranchTypes.push(branchTypes.rows[m].dataValues.id);
    }
  }

  // remove duplicates
  highestBranchTypes = [...new Set(highestBranchTypes)];

  // get branches from highest level branchtype
  const payload = await BranchesDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    { companyId: req.currentUser.companyId, branchTypeIds: highestBranchTypes },
  );

  res.status(200).send(payload);
});

router.get(
  '/sheet-data',
  wrapAsync(async (req, res) => {
    // Branch Types
    const branchTypes = await BranchtypeDBApi.findAllAutocomplete(
      req.query.query,
      req.query.limit,
      { companyId: req.currentUser.companyId },
    );

    // Parents
    const parents = await BranchesDBApi.findAllAutocomplete(
      req.query.query,
      req.query.limit,
      { companyId: req.currentUser.companyId },
    );

    return res.status(200).send({
      branchTypes,
      parents,
    });
  }),
);


router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await BranchesDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
