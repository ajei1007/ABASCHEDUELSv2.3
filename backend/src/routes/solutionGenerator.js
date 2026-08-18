const express = require('express');
const CapacityconstraintsDBApi = require('../db/api/capacityconstraints');
const SubgroupsDBApi = require('../db/api/subgroups');
const NewconstraintgeneratorDBApi = require('../db/api/newconstraintgenerator');
const BranchesDBApi = require('../db/api/branches');
const EventpairDBApi = require('../db/api/eventpair');
const getUsersByResourceName = require('../utils/getUsersByResourceName');

const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

router.get(
  '/data-gather',
  wrapAsync(async (req, res) => {
    // scheduler/availabilities?start={self.start_date}&end={self.end_date}&branches={self.branches_id}
    //    *start
    //    *end
    //    *branches

    // (DONE) capacityconstraints?page=1&capacityconstraints

    // scheduler/subgroups?branches={self.branches_id}&all={True}'
    //    *brnaches
    //    *all=True

    // (DONE) subgroups?branches={self.branches_id}'
    //    *branches

    // (DONE) users/resources/Location?bol2=true&branches={self.branches_id}'
    //    *branches
    //    *bol2=True

    // (DONE) newconstraintgenerator'

    // (DONE) scheduler/branch_structure'

    // (DONE) eventpair'

    // scheduler/events?locations={locations}&start={str(start_date)}&end={str(end_date)}&branches={branch}'
    //    *start
    //    *end
    //    *branches

    // (DONE) branches/optimizer'
    let response = {};

    //######################################################
    //############### CAPACITYCONSTRAINT ###################
    //######################################################

    const capacityConstraints = await CapacityconstraintsDBApi.findAll({
      companyId: req.currentUser.companyId,
    });
    response.capacityConstraints = capacityConstraints;

    //######################################################
    //#################### SUBGROUPS #######################
    //######################################################

    const subgroups = await SubgroupsDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });
    response.subgroups = subgroups;

    //######################################################
    //################## LOCATIONS #########################
    //######################################################

    const locations = await getUsersByResourceName(req, 'Location', true);
    response.locations = locations;

    //######################################################
    //################ BRANCH STRUCTURE ####################
    //######################################################

    const branchStructure = await BranchesDBApi.findBranchStructure({
      companyId: req.currentUser.companyId,
    });
    response.branchStructure = branchStructure;

    //######################################################
    //############# NEWCONSTRAINTGENERATOR #################
    //######################################################

    let newconstraintGenerators = {
      count: 0,
      rows: [],
    };
    const role = req.currentUser?.roles?.[0];
    if (role) {
      if (role.flaggingFeature || role.optimizerFeature || role.createEvent) {
        newconstraintGenerators = await NewconstraintgeneratorDBApi.findAll({
          companyId: req.currentUser.companyId,
        });
      }
    }
    response.newconstraintGenerators = newconstraintGenerators;

    //######################################################
    //################### EVENTPAIRS #######################
    //######################################################

    const eventpairs = await EventpairDBApi.findAll({
      companyId: req.currentUser.companyId,
    });
    response.eventpairs = eventpairs;

    //######################################################
    //################ BRANCHES OPTIMIZER ##################
    //######################################################

    const branchesOptimizer = await BranchesDBApi.findAllOptimizer({
      companyId: req.currentUser.companyId,
    });
    response.branchesOptimizer = branchesOptimizer;

    res.status(200).send(response);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
