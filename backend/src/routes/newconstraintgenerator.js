const express = require('express');

const NewconstraintgeneratorService = require('../services/newconstraintgenerator');
const NewconstraintgeneratorDBApi = require('../db/api/newconstraintgenerator');
const UsergroupsService = require('../services/usergroups');
const RolegroupsService = require('../services/rolegroups');
const SubgroupgroupsService = require('../services/subgroupgroups');
const BranchgroupsService = require('../services/branchgroups');
const wrapAsync = require('../helpers').wrapAsync;
const { requireInternalAdmin } = require('../middlewares/requireInternalAdmin');
const router = require('../utils/createRouter')();

// Create Constraint Groups
const createUserGroups = async (req, arr) => {
  let createdIds = [];
  if (arr && arr.length > 0 && arr?.[0].length > 0) {
    for (const innerArr of arr) {
      const payload = await UsergroupsService.create(
        { users: innerArr },
        req.currentUser,
        true,
        req.headers.referer,
      );
      createdIds.push(payload.id);
    }
  }
  return createdIds;
};
const createRolesGroups = async (req, arr) => {
  let createdIds = [];
  if (arr && arr.length > 0 && arr?.[0].length > 0) {
    for (const innerArr of arr) {
      const payload = await RolegroupsService.create(
        { roles: innerArr },
        req.currentUser,
        true,
        req.headers.referer,
      );
      createdIds.push(payload.id);
    }
  }
  return createdIds;
};
const createSubgroupsGroups = async (req, arr) => {
  let createdIds = [];
  if (arr && arr.length > 0 && arr?.[0].length > 0) {
    for (const innerArr of arr) {
      const payload = await SubgroupgroupsService.create(
        { subgroups: innerArr },
        req.currentUser,
        true,
        req.headers.referer,
      );
      createdIds.push(payload.id);
    }
  }
  return createdIds;
};
const createBranchesGroups = async (req, arr) => {
  let createdIds = [];
  if (arr && arr.length > 0 && arr?.[0].length > 0) {
    for (const innerArr of arr) {
      const payload = await BranchgroupsService.create(
        { branches: innerArr },
        req.currentUser,
        true,
        req.headers.referer,
      );
      createdIds.push(payload.id);
    }
  }
  return createdIds;
};

// Update Constraint Groups
const updateUserGroups = async (req, arr) => {
  // TODO remove prev relations
  // TODO Create new data
};

router.post('/', requireInternalAdmin, async (req, res) => {
  const data = req.body.data;

  // /* Users */
  // // Create antecedentTypeUsers
  // const antecedentTypeUsers = data?.antecedentTypeUsers;
  // let groupAntecedentTypeUsers = await createUserGroups(
  //   req,
  //   antecedentTypeUsers,
  // );
  // // Create antecedentTypeUsers
  // const consequenceTypeUsers = data?.consequenceTypeUsers;
  // let groupConsequenceTypeUsers = await createUserGroups(
  //   req,
  //   consequenceTypeUsers,
  // );

  // /* Roles */
  // // Create antecedentTypeRoles
  // const antecedentTypeRoles = data?.antecedentTypeRoles;
  // let groupAntecedentTypeRoles = await createRolesGroups(
  //   req,
  //   antecedentTypeRoles,
  // );
  // // Create antecedentTypeRoles
  // const consequenceTypeRoles = data?.consequenceTypeRoles;
  // let groupConsequenceTypeRoles = await createRolesGroups(
  //   req,
  //   consequenceTypeRoles,
  // );

  // /* Subgroups */
  // // Create antecedentTypeSubgroups
  // const antecedentTypeSubgroups = data?.antecedentTypeSubgroups;
  // let groupAntecedentTypeSubgroups = await createSubgroupsGroups(
  //   req,
  //   antecedentTypeSubgroups,
  // );
  // // Create antecedentTypeSubgroups
  // const consequenceTypeSubgroups = data?.consequenceTypeSubgroups;
  // let groupConsequenceTypeSubgroups = await createSubgroupsGroups(
  //   req,
  //   consequenceTypeSubgroups,
  // );

  // /* Branches */
  // // Create antecedentTypeSubgroups
  // const antecedentTypeBranches = data?.antecedentTypeBranches;
  // let groupAntecedentTypeBranches = await createBranchesGroups(
  //   req,
  //   antecedentTypeBranches,
  // );
  // // Create antecedentTypeSubgroups
  // const consequenceTypeBranches = data?.consequenceTypeBranches;
  // let groupConsequenceTypeBranches = await createBranchesGroups(
  //   req,
  //   consequenceTypeBranches,
  // );

  await NewconstraintgeneratorService.create(
    data,
    req.currentUser,
    true,
    req.headers.referer,
  );

  res.status(200).send(true);
});

router.put(
  '/:id',
  requireInternalAdmin,
  wrapAsync(async (req, res) => {
    const data = req.body.data;

    // /* Users */
    // // Create antecedentTypeUsers
    // const antecedentTypeUsers = data?.antecedentTypeUsers;
    // let groupAntecedentTypeUsers = await createUserGroups(
    //   req,
    //   antecedentTypeUsers,
    // );
    // // Create antecedentTypeUsers
    // const consequenceTypeUsers = data?.consequenceTypeUsers;
    // let groupConsequenceTypeUsers = await createUserGroups(
    //   req,
    //   consequenceTypeUsers,
    // );

    // /* Roles */
    // // Create antecedentTypeRoles
    // const antecedentTypeRoles = data?.antecedentTypeRoles;
    // let groupAntecedentTypeRoles = await createRolesGroups(
    //   req,
    //   antecedentTypeRoles,
    // );
    // // Create antecedentTypeRoles
    // const consequenceTypeRoles = data?.consequenceTypeRoles;
    // let groupConsequenceTypeRoles = await createRolesGroups(
    //   req,
    //   consequenceTypeRoles,
    // );

    // /* Subgroups */
    // // Create antecedentTypeSubgroups
    // const antecedentTypeSubgroups = data?.antecedentTypeSubgroups;
    // let groupAntecedentTypeSubgroups = await createSubgroupsGroups(
    //   req,
    //   antecedentTypeSubgroups,
    // );
    // // Create antecedentTypeSubgroups
    // const consequenceTypeSubgroups = data?.consequenceTypeSubgroups;
    // let groupConsequenceTypeSubgroups = await createSubgroupsGroups(
    //   req,
    //   consequenceTypeSubgroups,
    // );

    // /* Branches */
    // // Create antecedentTypeSubgroups
    // const antecedentTypeBranches = data?.antecedentTypeBranches;
    // let groupAntecedentTypeBranches = await createBranchesGroups(
    //   req,
    //   antecedentTypeBranches,
    // );
    // // Create antecedentTypeSubgroups
    // const consequenceTypeBranches = data?.consequenceTypeBranches;
    // let groupConsequenceTypeBranches = await createBranchesGroups(
    //   req,
    //   consequenceTypeBranches,
    // );

  
    await NewconstraintgeneratorService.update(
      data,
      req.body.id,
      req.currentUser,
    );

    res.status(200).send(true);
  }),
);

router.delete(
  '/:id',
  requireInternalAdmin,
  wrapAsync(async (req, res) => {
    await NewconstraintgeneratorService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.get(
  '/',
  wrapAsync(async (req, res) => {
    let payload = {
      count: 0,
      rows: [],
    };
    const role = req.currentUser?.roles?.[0];

    if (role) {
      const callCustomConstraint = role.flaggingFeature || role.optimizerFeature || role.createEvent;
      if (callCustomConstraint) {
        payload = await NewconstraintgeneratorDBApi.findAll({
          ...req.query,
          companyId: req.currentUser.companyId,
        });
      } 
    }
    res.status(200).send(payload); 
  }),
);

router.get(
  '/for-scheduler',
  wrapAsync(async (req, res) => {
    let payload = [];
    const role = req.currentUser?.roles?.[0];

    if (role) {
      const callCustomConstraint = role.flaggingFeature || role.optimizerFeature || role.createEvent;
      if (callCustomConstraint) {
        payload = await NewconstraintgeneratorDBApi.findForScheduler({
          ...req.query,
          companyId: req.currentUser.companyId,
        });
      } 
    }
    res.status(200).send(payload); 
  }),
);

router.get(
  '/table',
  wrapAsync(async (req, res) => {
    let payload = [];
    const role = req.currentUser?.roles?.[0];

    if (role) {
      const callCustomConstraint = role.flaggingFeature || role.optimizerFeature || role.createEvent;
      if (callCustomConstraint) {
        payload = await NewconstraintgeneratorDBApi.findForTable({
          ...req.query,
          companyId: req.currentUser.companyId,
        });
      } 
    }
    res.status(200).send(payload); 
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await NewconstraintgeneratorDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );

  res.status(200).send(payload);
});

router.get(
  '/:id',
  requireInternalAdmin,
  wrapAsync(async (req, res) => {
    const payload = await NewconstraintgeneratorDBApi.findByDetailed({
      id: req.params.id,
    });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
