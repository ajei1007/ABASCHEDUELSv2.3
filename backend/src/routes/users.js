const express = require('express');
const moment = require('moment');
const wrapAsync = require('../helpers').wrapAsync;
const UsersService = require('../services/users');
const UsersDBApi = require('../db/api/users');
const GroupingsDBApi = require('../db/api/groupings');
const DistancematrixDBApi = require('../db/api/distancematrix');
const RolesDBApi = require('../db/api/roles');
const NewconstraintgeneratorService = require('../services/newconstraintgenerator');
const { getRoleHierarchy } = require('../utils/roleHierarchy');
const getBranchTreeOfBranchList = require('../utils/getBranchTreeOfBranchList');
const getAvailabilitiesForDateRange = require('../utils/statistcs/getAvailabilitiesForDateRange');
const {
  getTimeconstraintUserRelation,
  getMatchingconstraintUserRelation,
  getUnmatchingconstraintUserRelation,
  getUserToSessionFrequencyConstraintRelation,
  getUserToUserFrequencyConstraintRelation,
  getNotProperSlostOnDayForUser,
  getGapsconstraintUserRelation,
  getDriveconstraintUserRelation,
  getDistanceconstraintUserRelation,
  getGroupingconstraintUserRelation,
  getAuthConstraintUserRelation,
  getSessionLengthconstraintUserRelation,
  getBreakQuantityconstraintUserRelation,
  getBacktobackconstraintUserRelation,
  getStartOfWeekOfDate,
  getSupervisionRateconstraintUserRelation,
  getSiblingBranchConstraintUserRelation,
} = require('../utils/flaging');
const { getUserAndRole } = require('../utils/getUserRole');
const AvailabilitiesService = require('../services/availabilities');
const PrioritiesService = require('../services/priorities');
const TimeconstraintsService = require('../services/timeconstraints');
const { getRolesByGroupName } = require('../utils/rolesUtils');
const BranchesDBApi = require('../db/api/branches');
const SubgroupsDBApi = require('../db/api/subgroups');
const NewconstraintgeneratorDBApi = require('../db/api/newconstraintgenerator');
const getUsersByType = require('../utils/getUsersByType');
const getUsersByResourceName = require('../utils/getUsersByResourceName');
const getAllAutocompleteUsers = require('../utils/getAllUsers');
const EventsDBApi = require('../db/api/events');

const calculateMinutesBetweenTimesIgnoreDates = (end, begin) => {
  const beginTime = moment.utc(begin).format('HH:mm');
  const endTime = moment.utc(end).format('HH:mm');

  let diffInMinutes = moment
    .utc(endTime, 'HH:mm')
    .diff(moment.utc(beginTime, 'HH:mm'), 'minutes');

  //in case the ending and beginning on different dates then the difference will be 1440 minutes less than actual
  if (diffInMinutes < 0) {
    diffInMinutes += 1440;
  }
  return diffInMinutes;
};

function checkIntersection(arr1, arr2) {
  return arr1.some((item) => arr2.includes(item));
}

const router = require('../utils/createRouter')();

router.post(
  '/',
  wrapAsync(async (req, res, next) => {
    if (req.body.data?.resourceName) {
      if (
        ['Activity', 'Block', 'Funder'].includes(req.body.data?.resourceName)
      ) {
        const roles = await RolesDBApi.findAll({
          companyId: req.currentUser.companyId,
        });
        const recourceRole = roles.rows.find(
          (role) => role.name === req.body.data?.resourceName,
        )?.id;
        if (recourceRole) {
          req.body.data.roles = [recourceRole];
        }
      }
    }
    delete req.body.data.immutable; // 'immutable' value shouldn't be set from the client side
    const newUser = await UsersService.create(
      req.body.data,
      req.currentUser,
      true,
      req.headers.referer,
      next,
    );

    // Create Availabilities
    if (req.body.data.availabilities && newUser) {
      if (req.body.data.availabilities.length) {
        for (let i = 0; i < req.body.data.availabilities.length; i++) {
          const availability = req.body.data.availabilities[i];
          const newAvailability = {
            ...availability,
            user: newUser.id,
          };

          await AvailabilitiesService.create(
            newAvailability,
            req.currentUser,
            true,
            req.headers.referer,
          );
        }
      }
    }

    // Create Constraints
    //TODO: chech the selected branch on constriant info
    if (req.body.data.constraints && newUser) {
      if (req.body.data.constraints.length) {
        for (let i = 0; i < req.body.data.constraints.length; i++) {
          let constraint = req.body.data.constraints[i];

          //make sure this is user specific
          constraint.antecedentTypeUser = newUser.id;
          constraint.antecedentRoleId = null;
          constraint.antecedentSubgroupId = null;

          await NewconstraintgeneratorService.create(
            constraint,
            req.currentUser,
            true,
            req.headers.referer,
          );
        }
      }
    }

    // Create Priorities
    if (req.body.data.priorities && newUser) {
      if (req.body.data.priorities.length) {
        for (let j = 0; j < req.body.data.priorities.length; j++) {
          const priority = req.body.data.priorities[j];
          const newPriority = {
            ...priority,
            user1: newUser.id,
            user2: priority.user2,
          };

          await PrioritiesService.create(
            newPriority,
            req.currentUser,
            true,
            req.headers.referer,
          );
        }
      }
    }

    // Create Timeconstraints
    if (req.body.data.timeconstraints && newUser) {
      if (req.body.data.timeconstraints.length) {
        for (let j = 0; j < req.body.data.timeconstraints.length; j++) {
          const timeconstraint = req.body.data.timeconstraints[j];
          const newTimeconstraint = {
            ...timeconstraint,
            user1: newUser.id,
            user2: timeconstraint.user2,
          };

          await TimeconstraintsService.create(
            newTimeconstraint,
            req.currentUser,
            true,
            req.headers.referer,
          );
        }
      }
    }

    res.status(200).send(true);
  }),
);

// Import Clients sheet
router.post('/form-sheet', async (req, res, next) => {
  // Create clients
  const resources = req.body.data.resources;
  const newResourcesArr = [];
  for (const resource of resources) {
    if (resource?.resourceName) {
      if (['Activity', 'Block', 'Funder'].includes(resource?.resourceName)) {
        const roles = await RolesDBApi.findAll({
          companyId: req.currentUser.companyId,
        });
        const recourceRole = roles.rows.find(
          (role) => role.name === resource?.resourceName,
        )?.id;
        if (recourceRole) {
          resource.roles = [recourceRole];
        }
      }
    }
    delete resource.immutable; // 'immutable' value shouldn't be set from the client side
    const newResource = await UsersService.create(
      resource,
      req.currentUser,
      true,
      req.headers.referer,
      next,
    );

    newResourcesArr.push(newResource);
  }

  // Create Availabilities
  const availabilities = req.body.data.availabilities;
  if (availabilities.length) {
    for (const availability of availabilities) {
      const user =
        newResourcesArr.find((cl) => {
          const resourceName =
            cl.firstName + (cl.lastName ? ` ${cl.lastName}` : '');
          return resourceName.toLowerCase() === availability.user.toLowerCase();
        })?.id ?? null;
      if (user) {
        const newAvailability = {
          ...availability,
          user,
        };
        await AvailabilitiesService.create(
          newAvailability,
          req.currentUser,
          true,
          req.headers.referer,
        );
      }
    }
  }

  // Create Priorities
  const priorities = req.body.data.priorities;
  if (priorities.length) {
    for (const priority of priorities) {
      const user1 =
        newResourcesArr.find((cl) => {
          const resourceName =
            cl.firstName + (cl.lastName ? ` ${cl.lastName}` : '');
          return resourceName.toLowerCase() === priority.user1.toLowerCase();
        })?.id ?? null;
      if (user1) {
        const newPriority = {
          ...priority,
          user1,
          user2: priority.user2,
        };
        await PrioritiesService.create(
          newPriority,
          req.currentUser,
          true,
          req.headers.referer,
        );
      }
    }
  }

  // Create Timeconstraints
  const timeconstraints = req.body.data.timeconstraints;
  if (timeconstraints.length) {
    for (const timeconstraint of timeconstraints) {
      const user1 =
        newResourcesArr.find((cl) => {
          const resourceName =
            cl.firstName + (cl.lastName ? ` ${cl.lastName}` : '');
          return (
            resourceName.toLowerCase() === timeconstraint.user1.toLowerCase()
          );
        })?.id ?? null;
      const newTimeconstraint = {
        ...timeconstraint,
        user1,
        user2: timeconstraint.user2,
      };
      await TimeconstraintsService.create(
        newTimeconstraint,
        req.currentUser,
        true,
        req.headers.referer,
      );
    }
  }

  const payload = true;
  res.status(200).send(payload);
});

router.put(
  '/:id',
  wrapAsync(async (req, res) => {
    await UsersService.update(req.body.data, req.body.id, req.currentUser);

    // Delete availabilities
    if (
      req.body.data.deletedAvailabilities &&
      req.body.data.deletedAvailabilities.length > 0
    ) {
      const deletedAvailabilities = req.body.data.deletedAvailabilities;

      for (let i = 0; i < deletedAvailabilities.length; i++) {
        const availabilityId = deletedAvailabilities[i];
        await AvailabilitiesService.remove(availabilityId, req.currentUser);
      }
    }
    // Create/Update availabilities
    if (
      req.body.data.availabilities &&
      req.body.data.availabilities.length > 0
    ) {
      for (let i = 0; i < req.body.data.availabilities.length; i++) {
        const availability = req.body.data.availabilities[i];
        const updatedAvailability = { ...availability, user: req.body.id };
        if (availability.id) {
          await AvailabilitiesService.update(
            updatedAvailability,
            availability.id,
            req.currentUser,
          );
        } else {
          await AvailabilitiesService.create(
            updatedAvailability,
            req.currentUser,
            true,
            req.headers.referer,
          );
        }
      }
    }

    // Delete constraints
    //TODO : check if it is user specific
    if (
      req.body.data.deletedConstraints &&
      req.body.data.deletedConstraints.length > 0
    ) {
      const deletedConstraints = req.body.data.deletedConstraints;

      for (let i = 0; i < deletedConstraints.length; i++) {
        const constraintID = deletedConstraints[i];
        await NewconstraintgeneratorService.remove(
          constraintID,
          req.currentUser,
        );
      }
    }

    // Create/Update constraints
    //TODO: chech the selected branch on constriant info
    if (req.body.data.constraints && req.body.data.constraints.length > 0) {
      for (let i = 0; i < req.body.data.constraints.length; i++) {
        const constraint = req.body.data.constraints[i];

        //make sure this is user specific
        constraint.antecedentTypeUser = req.body.id;
        constraint.antecedentRoleId = null;
        constraint.antecedentSubgroupId = null;
        if (constraint.id) {
          // if the constraint is matching then it will update only soft column
          if (constraint.constraintType === 'unmatching') {
            await NewconstraintgeneratorService.updateSoft(
              { soft: constraint.soft },
              constraint.id,
              req.currentUser,
            );
            continue;
          }

          NewconstraintgeneratorService.update(
            constraint,
            constraint.id,
            req.currentUser,
          );
        } else {
          await NewconstraintgeneratorService.create(
            constraint,
            req.currentUser,
            true,
            req.headers.referer,
          );
        }
      }
    }

    // Delete Priorities
    if (
      req.body.data.deletedPriorities &&
      req.body.data.deletedPriorities.length > 0
    ) {
      const deletedPriorities = req.body.data.deletedPriorities;

      for (let i = 0; i < deletedPriorities.length; i++) {
        const priorityId = deletedPriorities[i];
        await PrioritiesService.remove(priorityId, req.currentUser);
      }
    }
    // Create/Update Priorities
    if (req.body.data.priorities && req.body.data.priorities.length > 0) {
      for (let j = 0; j < req.body.data.priorities.length; j++) {
        const priority = req.body.data.priorities[j];
        const updatedPriority = {
          ...priority,
          user1: req.body.id,
          user2: priority.user2,
        };
        if (priority.id) {
          await PrioritiesService.update(
            updatedPriority,
            priority.id,
            req.currentUser,
          );
        } else {
          await PrioritiesService.create(
            updatedPriority,
            req.currentUser,
            true,
            req.headers.referer,
          );
        }
      }
    }

    // Delete Timeconstraints
    if (
      req.body.data.deletedTimeConstrains &&
      req.body.data.deletedTimeConstrains.length > 0
    ) {
      const deletedTimeConstrains = req.body.data.deletedTimeConstrains;

      for (let i = 0; i < deletedTimeConstrains.length; i++) {
        const timeconstraintId = deletedTimeConstrains[i];
        await TimeconstraintsService.remove(timeconstraintId, req.currentUser);
      }
    }
    // Create/Update Timeconstraints
    if (
      req.body.data.timeconstraints &&
      req.body.data.timeconstraints.length > 0
    ) {
      for (let j = 0; j < req.body.data.timeconstraints.length; j++) {
        const timeconstraint = req.body.data.timeconstraints[j];
        const updatedTimeconstraint = {
          ...timeconstraint,
          user1: req.body.id,
          user2: timeconstraint.user2,
        };

        if (timeconstraint.id) {
          await TimeconstraintsService.update(
            updatedTimeconstraint,
            timeconstraint.id,
            req.currentUser,
          );
        } else {
          await TimeconstraintsService.create(
            updatedTimeconstraint,
            req.currentUser,
            true,
            req.headers.referer,
          );
        }
      }
    }

    const payload = true;
    res.status(200).send(payload);
  }),
);

router.put(
  '/dynamic/:id',
  wrapAsync(async (req, res) => {
    await UsersService.updateDynamic(
      req.body.data,
      req.body.id,
      req.currentUser,
    );
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await UsersService.remove(req.params.id, req.currentUser, req.query);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.get(
  '/coordinates',
  wrapAsync(async (req, res) => {
    let branches = req.currentUser.branches.map((e) => e.id);
    branches = branches.length == 0 ? ['d'] : branches;
    const payload = await UsersDBApi.findAllCoordinates({
      ...req.query,
      companyId: req.currentUser.companyId,
    });
    res.status(200).send(payload);
  }),
);

router.get(
  '/',
  wrapAsync(async (req, res) => {
    let branches = req.currentUser.branches.map((e) => e.id);
    branches = branches.length == 0 ? ['d'] : branches;
    const payload = await UsersDBApi.findAll({
      ...req.query,
      branches: branches.join('|'),
      companyId: req.currentUser.companyId,
    });
    res.status(200).send(payload);
  }),
);

router.get(
  '/resources/:name',
  wrapAsync(async (req, res) => {
    const payload = await getUsersByResourceName(req, req.params.name, true);
    res.status(200).send(payload);
  }),
);

router.get('/siblingGroups', async (req, res) => {
  let payload = await UsersDBApi.findAllSiblingGroups({
    query: req.query.query.toLowerCase() || '',
    limit: Number(req.query.limits) || 100,
    companyId: req.currentUser.companyId,
  });
  res.status(200).send(payload);
});

router.get('/autocomplete', async (req, res) => {
  const payload = await getAllAutocompleteUsers(req);
  res.status(200).send(payload);
});

router.get('/autocomplete/:name', async (req, res) => {
  const payload = await getUsersByType(req, req.params.name);
  res.status(200).send(payload);
});

router.get(
  '/sheet-data/:name',
  wrapAsync(async (req, res) => {
    const resourceName = req.params.name;
    // Get locations
    const locations = await getUsersByType(req, 'Location');
    // Get activities
    const activities = await getUsersByType(req, 'Activity');
    // Get users
    const users = await getAllAutocompleteUsers(req);

    let returnObj = {
      locationsData: locations,
      activitiesData: activities
        ? activities.map((ac) => ({
            id: ac.id,
            label: ac.label,
          }))
        : [],
      users: users.map((usr) => ({
        id: usr.id,
        label: usr.label,
        email: usr.email,
      })),
    };

    if (resourceName === 'Activity') {
      const branches = await BranchesDBApi.findAllAutocomplete(
        req.query.query,
        req.query.limit,
        { companyId: req.currentUser.companyId },
      );

      returnObj = {
        ...returnObj,
        branches,
      };
    }
    if (resourceName === 'Block') {
      const branches = await BranchesDBApi.findAllAutocomplete(
        req.query.query,
        req.query.limit,
        { companyId: req.currentUser.companyId },
      );

      const blocks = await getUsersByType(req, 'Block');

      returnObj = {
        ...returnObj,
        branches,
        blocksData: blocks.map((b) => ({ id: b.id, label: b.label })),
      };
    }
    if (resourceName === 'Funder') {
      const branches = await BranchesDBApi.findAllAutocomplete(
        req.query.query,
        req.query.limit,
        { companyId: req.currentUser.companyId },
      );
      const roles = await getRolesByGroupName(req, 'Person');
      const funders = await getUsersByType(req, 'Funder');

      returnObj = {
        ...returnObj,
        branches,
        roles,
        fundersData: funders,
      };
    }
    if (resourceName === 'Location') {
      const branches = await BranchesDBApi.findAllAutocomplete(
        req.query.query,
        req.query.limit,
        { companyId: req.currentUser.companyId },
      );
      const roles = await getRolesByGroupName(req, 'Location');

      returnObj = {
        ...returnObj,
        roles,
        branches,
      };
    }
    if (resourceName === 'Client' || resourceName === 'Employee') {
      // Get subgroups
      const subgroups = await SubgroupsDBApi.findAllAutocomplete(
        req.query.query,
        req.query.limit,
        { companyId: req.currentUser.companyId },
      );
      // Get branches
      const branches = await BranchesDBApi.findAllAutocomplete(
        req.query.query,
        req.query.limit,
        { companyId: req.currentUser.companyId },
      );
      // Get roles
      const roles = await getRolesByGroupName(req, resourceName);

      // Get funders
      const funders = await getUsersByType(req, 'Funder');

      returnObj = {
        ...returnObj,
        roles,
        branches,
        funders,
        subgroups: subgroups.map((sb) => ({
          ...sb,
          group: sb.group?.name || '',
        })),
      };
    }

    return res.status(200).send(returnObj);
  }),
);

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const { user, role } = await getUserAndRole(
      req.params.id,
      req.currentUser,
      false,
    );
    if (user.password) {
      delete user.password;
    }
    const usersConstraints =
      await NewconstraintgeneratorDBApi.findUserOnlyProfileConstraints({
        userId: req.params.id,
      });

    let matchingPersons = new Array();
    let matchingGroupConstraintSoft = null;

    //Check if there is group with name `Matching`
    const matchingGroup = await GroupingsDBApi.findMatchingGroupID({
      companyId: req.currentUser.companyId,
    });

    if (matchingGroup && matchingGroup.id) {
      // check if the matching tag of user exists
      const matchingTag = await SubgroupsDBApi.findBy({
        groupId: matchingGroup.id,
        relatedUserId: user.id,
      });

      // if tag exists then look for constraint
      if (matchingTag) {
        // check if the matching constraint exists for this user
        let matchingConstraint = await NewconstraintgeneratorDBApi.findBy({
          antecedentUserId: user.id,
          consequenceSubgroupId: matchingTag.id,
          constraintType: 'matching',
        });

        if (matchingConstraint) {
          matchingGroupConstraintSoft = matchingConstraint.soft;
          for (let m = 0; m < matchingTag.user.length; m++) {
            let crntUser = matchingTag.user[m].dataValues;
            matchingPersons.push({
              id: crntUser.id,
              firstName: crntUser.firstName,
              lastName: crntUser.lastName,
            });
          }
        }
      }
    }

    res.status(200).send({
      ...user,
      constraints: usersConstraints,
      role_mobile: role,
      matchingGroup: {
        users: matchingPersons,
        soft: matchingGroupConstraintSoft,
      },
    });
  }),
);

router.get(
  '/constraints/:id',
  wrapAsync(async (req, res) => {
    const user = await UsersDBApi.getUserRoleSubgroupBranchList({
      id: req.params.id,
    });

    let roleList = [];
    let subgroupList = [];
    let branchList = [];

    //set role set
    if (user.roles.length > 0) {
      // Fetch from backend
      const roleNameArray = user.roles.map((role) => role.name);
      const roleHierarchy = await getRoleHierarchy(user.companyId);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        //push the decendents
        if (checkIntersection(roleNameArray, value)) {
          roleList.push(key);
        }

        //push the ancestors
        if (checkIntersection(roleNameArray, [key])) {
          const filteredValues = value.filter((item) => item !== key);
          roleList.push(...filteredValues);
        }
      });
    }

    //set subgroup set
    if (user.subgroups.length > 0) {
      subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
    }

    //set branch set
    if (user.branches.length > 0) {
      // Fetch from backend
      const branchIds = user.branches.map((branch) => branch.id);
      branchList = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: branchIds.join('|'),
      });
    }

    const payload =
      await NewconstraintgeneratorDBApi.findConstraintsForUserSpecific({
        branches: branchList,
        roles: roleList,
        subgroups: subgroupList,
        userId: user.id,
        companyId: req.currentUser.companyId,
      });
    let resp = new Array();
    for (let i = 0; i < payload.count; i++) {
      resp.push({
        id: payload.rows[i].id,
        description: payload.rows[i].description,
        start: payload.rows[i].start,
        end: payload.rows[i].end,
      });
    }

    res.status(200).send(resp);
  }),
);

router.get(
  '/check-timeconstraint/:id',
  wrapAsync(async (req, res) => {
    const user = await UsersDBApi.getUserRoleSubgroupBranchList({
      id: req.params.id,
    });

    let roleList = [];
    let subgroupList = [];
    let branchList = [];
    const roleHierarchy = await getRoleHierarchy(user.companyId);

    //set role set
    if (user.roles.length > 0) {
      // Fetch from backend
      const roleNameArray = user.roles.map((role) => role.name);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        //push the decendents
        if (checkIntersection(roleNameArray, value)) {
          roleList.push(key);
        }

        //push the ancestors
        if (checkIntersection(roleNameArray, [key])) {
          const filteredValues = value.filter((item) => item !== key);
          roleList.push(...filteredValues);
        }
      });
    }

    //set subgroup set
    if (user.subgroups.length > 0) {
      subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
    }

    //set branch set
    if (user.branches.length > 0) {
      // Fetch from backend
      const branchIds = user.branches.map((branch) => branch.id);
      branchList = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: branchIds.join('|'),
      });
    }

    const result =
      await NewconstraintgeneratorDBApi.findConstraintsForUserSpecific({
        id: req.query.constraintId,
        branches: branchList,
        roles: roleList,
        subgroups: subgroupList,
        userId: user.id,
        date: req.query.date || undefined,
        companyId: req.currentUser.companyId,
      });
    if (result.count !== 1) {
      res.status(200).send('Not found');
      return;
    }

    if (result.rows[0].constraintType !== 'time') {
      res.status(200).send('Not found');
      return;
    }

    let payload = await getTimeconstraintUserRelation({
      timeconstraint: result.rows[0],
      branchList: branchList,
      roleList: roleList,
      subgroupList: subgroupList,
      userId: user.id,
      date: req.query.date,
      roleHierarchy: roleHierarchy,
      events: false,
    });

    res.status(200).send(payload);
  }),
);

router.get(
  '/check-matchingconstraint/:id',
  wrapAsync(async (req, res) => {
    const user = await UsersDBApi.getUserRoleSubgroupBranchList({
      id: req.params.id,
    });

    let roleList = [];
    let subgroupList = [];
    let branchList = [];
    const roleHierarchy = await getRoleHierarchy(user.companyId);

    //set role set
    if (user.roles.length > 0) {
      // Fetch from backend
      const roleNameArray = user.roles.map((role) => role.name);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        //push the decendents
        if (checkIntersection(roleNameArray, value)) {
          roleList.push(key);
        }

        //push the ancestors
        if (checkIntersection(roleNameArray, [key])) {
          const filteredValues = value.filter((item) => item !== key);
          roleList.push(...filteredValues);
        }
      });
    }

    //set subgroup set
    if (user.subgroups.length > 0) {
      subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
    }

    //set branch set
    if (user.branches.length > 0) {
      // Fetch from backend
      const branchIds = user.branches.map((branch) => branch.id);
      branchList = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: branchIds.join('|'),
      });
    }

    const result =
      await NewconstraintgeneratorDBApi.findConstraintsForUserSpecific({
        id: req.query.constraintId,
        branches: branchList,
        roles: roleList,
        subgroups: subgroupList,
        userId: user.id,
        date: req.query.date || undefined,
        companyId: req.currentUser.companyId,
      });
    if (result.count !== 1) {
      res.status(200).send('Not found');
      return;
    }

    if (result.rows[0].constraintType !== 'matching') {
      res.status(200).send('Not found');
      return;
    }

    let payload = await getMatchingconstraintUserRelation({
      matchingconstraint: result.rows[0],
      branchList: branchList,
      roleList: roleList,
      subgroupList: subgroupList,
      userId: user.id,
      date: req.query.date,
      roleHierarchy: roleHierarchy,
      events: false,
    });

    res.status(200).send(payload);
  }),
);

router.get(
  '/check-unmatchingconstraint/:id',
  wrapAsync(async (req, res) => {
    const user = await UsersDBApi.getUserRoleSubgroupBranchList({
      id: req.params.id,
    });

    let roleList = [];
    let subgroupList = [];
    let branchList = [];
    const roleHierarchy = await getRoleHierarchy(user.companyId);

    //set role set
    if (user.roles.length > 0) {
      // Fetch from backend
      const roleNameArray = user.roles.map((role) => role.name);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        //push the decendents
        if (checkIntersection(roleNameArray, value)) {
          roleList.push(key);
        }

        //push the ancestors
        if (checkIntersection(roleNameArray, [key])) {
          const filteredValues = value.filter((item) => item !== key);
          roleList.push(...filteredValues);
        }
      });
    }

    //set subgroup set
    if (user.subgroups.length > 0) {
      subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
    }

    //set branch set
    if (user.branches.length > 0) {
      // Fetch from backend
      const branchIds = user.branches.map((branch) => branch.id);
      branchList = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: branchIds.join('|'),
      });
    }

    const result =
      await NewconstraintgeneratorDBApi.findConstraintsForUserSpecific({
        id: req.query.constraintId,
        branches: branchList,
        roles: roleList,
        subgroups: subgroupList,
        userId: user.id,
        date: req.query.date || undefined,
        companyId: req.currentUser.companyId,
      });
    if (result.count !== 1) {
      res.status(200).send('Not found');
      return;
    }

    if (result.rows[0].constraintType !== 'unmatching') {
      res.status(200).send('Not found');
      return;
    }

    let payload = await getUnmatchingconstraintUserRelation({
      unmatchingconstraint: result.rows[0],
      branchList: branchList,
      roleList: roleList,
      subgroupList: subgroupList,
      userId: user.id,
      date: req.query.date,
      roleHierarchy: roleHierarchy,
      events: false,
    });

    res.status(200).send(payload);
  }),
);

router.get(
  '/check-usertouserconstraint/:id',
  wrapAsync(async (req, res) => {
    const user = await UsersDBApi.getUserRoleSubgroupBranchList({
      id: req.params.id,
    });

    let roleList = [];
    let subgroupList = [];
    let branchList = [];
    const roleHierarchy = await getRoleHierarchy(user.companyId);

    //set role set
    if (user.roles.length > 0) {
      // Fetch from backend
      const roleNameArray = user.roles.map((role) => role.name);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        //push the decendents
        if (checkIntersection(roleNameArray, value)) {
          roleList.push(key);
        }

        //push the ancestors
        if (checkIntersection(roleNameArray, [key])) {
          const filteredValues = value.filter((item) => item !== key);
          roleList.push(...filteredValues);
        }
      });
    }

    //set subgroup set
    if (user.subgroups.length > 0) {
      subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
    }

    //set branch set
    if (user.branches.length > 0) {
      // Fetch from backend
      const branchIds = user.branches.map((branch) => branch.id);
      branchList = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: branchIds.join('|'),
      });
    }

    const result =
      await NewconstraintgeneratorDBApi.findConstraintsForUserSpecific({
        id: req.query.constraintId,
        branches: branchList,
        roles: roleList,
        subgroups: subgroupList,
        userId: user.id,
        date: req.query.date || undefined,
        companyId: req.currentUser.companyId,
      });
    if (result.count !== 1) {
      res.status(200).send('Not found');
      return;
    }

    if (result.rows[0].constraintType !== 'usertouser') {
      res.status(200).send('Not found');
      return;
    }

    let payload = await getUserToUserFrequencyConstraintRelation({
      userToUserFrequencyConstraint: result.rows[0],
      branchList: branchList,
      roleList: roleList,
      subgroupList: subgroupList,
      userId: user.id,
      date: req.query.date,
      roleHierarchy: roleHierarchy,
      events: false,
    });

    res.status(200).send(payload);
  }),
);

router.get(
  '/check-usertosessionconstraint/:id',
  wrapAsync(async (req, res) => {
    const user = await UsersDBApi.getUserRoleSubgroupBranchList({
      id: req.params.id,
    });

    let roleList = [];
    let subgroupList = [];
    let branchList = [];
    const roleHierarchy = await getRoleHierarchy(user.companyId);

    //set role set
    if (user.roles.length > 0) {
      // Fetch from backend
      const roleNameArray = user.roles.map((role) => role.name);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        //push the decendents
        if (checkIntersection(roleNameArray, value)) {
          roleList.push(key);
        }

        //push the ancestors
        if (checkIntersection(roleNameArray, [key])) {
          const filteredValues = value.filter((item) => item !== key);
          roleList.push(...filteredValues);
        }
      });
    }

    //set subgroup set
    if (user.subgroups.length > 0) {
      subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
    }

    //set branch set
    if (user.branches.length > 0) {
      // Fetch from backend
      const branchIds = user.branches.map((branch) => branch.id);
      branchList = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: branchIds.join('|'),
      });
    }

    const result =
      await NewconstraintgeneratorDBApi.findConstraintsForUserSpecific({
        id: req.query.constraintId,
        branches: branchList,
        roles: roleList,
        subgroups: subgroupList,
        userId: user.id,
        date: req.query.date || undefined,
        companyId: req.currentUser.companyId,
      });
    if (result.count !== 1) {
      res.status(200).send('Not found');
      return;
    }

    if (result.rows[0].constraintType !== 'usertosession') {
      res.status(200).send('Not found');
      return;
    }

    let payload = await getUserToSessionFrequencyConstraintRelation({
      userToSessionFrequencyConstraint: result.rows[0],
      branchList: branchList,
      roleList: roleList,
      subgroupList: subgroupList,
      userId: user.id,
      date: req.query.date,
      roleHierarchy: roleHierarchy,
      events: false,
    });

    res.status(200).send(payload);
  }),
);

router.post(
  '/constraint-gap/flags',
  wrapAsync(async (req, res) => {
    // TODO Remove this when enabling the feature
    // return res.status(200).send([])

    let response = new Array();
    let userIds = new Array();
    let mostPriorConstriants = new Array();
    if (req.body.userIds && req.body.userIds.length > 0) {
      userIds = req.body.userIds.split('|');
    }
    if (req.body.hard && req.body.hard.length > 0) {
      mostPriorConstriants.push(...req.body.hard.split('|'));
    }

    if (req.body.highPriority && req.body.highPriority.length > 0) {
      mostPriorConstriants.push(...req.body.highPriority.split('|'));
      mostPriorConstriants.push(...req.body.soft.split('|'));
    }

    // temporary cheat code for not breaking the FE for req.body.date
    if (!req.body.start && !req.body.date) {
      res.status(200).send([]);
      return;
    }

    if (!req.body.start || !req.body.end) {
      if (!req.body.start) {
        req.body.start = req.body.date;
      }
      req.body.end = moment.utc(req.body.start).add(1, 'days').toDate();
    }

    // By default all the flags are true
    let calculateConstraints = true;
    let calculateEmptyAvailabilities = true;
    let calculateNotAvailableBusy = true;
    let calculateOverbookings = true;
    let calculateSiblingBranchPeopleEvents = true;

    // If onlyOverbooking is true, then only calculate overbooking
    if (req.body?.onlyOverbooking) {
      calculateConstraints = false;
      calculateEmptyAvailabilities = false;
      calculateNotAvailableBusy = false;
      calculateSiblingBranchPeopleEvents = false;
    }

    // consider the requested timezone while calculating overbooking
    const timezone = req.body?.timezone ?? 'America/Los_Angeles';

    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    let endDate = moment.utc(req.body.end).toDate();
    let startDate = moment.utc(req.body.start).toDate();
    let totalDays = moment(endDate).diff(moment(startDate), 'days');
    if (totalDays > 7) {
      res.status(200).send([]);
    }

    // Get the start of the week (Monday)
    let minStartForAllDates = getStartOfWeekOfDate(req.body.start);
    let weekBeginningOfRequestedEnd = getStartOfWeekOfDate(req.body.end);
    let toBeAddedDayNumber = 7;
    if (minStartForAllDates < weekBeginningOfRequestedEnd) {
      toBeAddedDayNumber = 14;
    }

    let maxEndForAllDates = moment
      .utc(minStartForAllDates)
      .add(toBeAddedDayNumber, 'days')
      .toDate();

    //get all events once
    let allEventsForAlluser =
      await EventsDBApi.findAllEventsOfMultipleUsersForConstraintBreakCheck({
        start: minStartForAllDates,
        end: maxEndForAllDates,
        userIds: userIds,
        sandboxMode: req.body.sandboxMode,
      });

    const filteredEvents = allEventsForAlluser.rows.filter(
      (e) => !e.isCancelled,
    );

    allEventsForAlluser.rows = filteredEvents;
    allEventsForAlluser.count = filteredEvents.length;

    // get all distances once
    let distanceMatrix = new Map();
    // We need distance matrix only if we are calculating constraints
    if (calculateConstraints) {
      let distances = await DistancematrixDBApi.findAllDistanceMatrixOfCompany({
        companyId: req.currentUser.companyId,
      });

      for (let dist = 0; dist < distances.length; dist++) {
        let key = [distances[dist].address1, distances[dist].address2]
          .sort()
          .join('|');
        distanceMatrix.set(key, {
          distanceInMeter: distances[dist].distance,
          durationInSecond: distances[dist].duration,
        });
      }
    }

    // get all users role, subgroup, branches in single db call
    let allUserRoleSubgroupBranchInfo = new Map();
    let allUsers = await UsersDBApi.getUserRoleSubgroupBranchListInBulk({
      userIds: userIds,
    });
    // Loop through allUsers and set each element to the map
    allUsers.forEach((user) => {
      allUserRoleSubgroupBranchInfo.set(user.id, user);
    });

    // get branch hierarchy , and then use it when generating for each user
    let branchHierarchy = await BranchesDBApi.getBranchIdParentIds({
      companyId: req.currentUser.companyId,
    });

    let userConstraintWeeklyRelation = new Map()
    let userConstraintWholeRangeRelation = new Map()

    for (let b = 0; b < totalDays; b++) {
      req.body.date = moment.utc(startDate).add(b, 'days').toDate();
      let usersCostraints = new Array();
      let userIdArray = new Array();
      let allBranchIds = new Array();
      let allSubgroupIds = new Array();
      let allRoleIds = new Array();
      let userHasPersonRole = false;

      for (let k = 0; k < userIds.length; k++) {
        let currentUser = userIds[k];
        if (!allUserRoleSubgroupBranchInfo.has(currentUser)) {
          continue;
        }
        let user = allUserRoleSubgroupBranchInfo.get(currentUser);

        let roleList = [];
        let subgroupList = [];
        let branchList = [];

        //set role set
        if (user.roles.length > 0) {
          // Fetch from backend
          const roleNameArray = user.roles.map((role) => role.name);
          Object.entries(roleHierarchy).map((t) => {
            const [key, value] = t;
            //push the decendents
            if (checkIntersection(roleNameArray, value)) {
              roleList.push(key);
            }

            //push the ancestors
            if (checkIntersection(roleNameArray, [key])) {
              const filteredValues = value.filter((item) => item !== key);
              roleList.push(...filteredValues);
            }
          });
        }

        if (checkIntersection(roleList, ['Person'])) {
          userHasPersonRole = true;
        }

        //set subgroup set
        if (user.subgroups.length > 0) {
          subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
        }

        //set branch set
        if (user.branches.length > 0) {
          const branchIds = user.branches.map((branch) => branch.id);
          branchList = getBranchTreeOfBranchList(branchIds, branchHierarchy);
        }

        usersCostraints.push({
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          companyId: user.companyId,
          roles: user.roles,
          subgroups: user.subgroups,
          branches: branchList,
          branchList: branchList,
          subgroupList: subgroupList,
          roleList: roleList,
          constraints: [],
        });

        userIdArray.push(user.id);

        // We need to populate allBranchIds, allRoleIds, allSubgroupIds only if we are calculating constraints
        if (calculateConstraints) {
          // collect all users role, branch, subgroups for collecting
          // the constraints in single db call
          allBranchIds.push(...branchList);
          allRoleIds.push(...roleList);
          allSubgroupIds.push(...subgroupList);
        }
      }

      // remove duplicates
      allBranchIds = Array.from(new Set(allBranchIds));
      allRoleIds = Array.from(new Set(allRoleIds));
      allSubgroupIds = Array.from(new Set(allSubgroupIds));

      // Initialize as empty first
      let allConstraintsForAllUser = {
        rows: [],
      };

      if (calculateConstraints) {
        // get all constraints
        allConstraintsForAllUser =
          await NewconstraintgeneratorDBApi.findConstraintsForBulkUser({
            branches: allBranchIds,
            roles: allRoleIds,
            subgroups: allSubgroupIds,
            userIds: userIdArray,
            date: req.body.date || undefined,
            companyId: req.currentUser.companyId,
          });
      }

      // distribute constriants to each user
      for (let w = 0; w < allConstraintsForAllUser.rows.length; w++) {
        let crntConstraint = allConstraintsForAllUser.rows[w];
        let constraintAntecedentRoleHierarchy = [];
        let constraintsBranchIds = crntConstraint.branches.map(
          (brnch) => brnch.id,
        );

        // generate constriant antecedent role hierarchy
        Object.entries(roleHierarchy).map((t) => {
          const [key, value] = t;
          //push the decendents
          if (
            crntConstraint.antecedentRole &&
            checkIntersection([crntConstraint.antecedentRole.name], value)
          ) {
            constraintAntecedentRoleHierarchy.push(key);
          }
        });

        for (let ww = 0; ww < usersCostraints.length; ww++) {
          let crntUser = usersCostraints[ww];
          // check if antecedentUser not null
          if (
            crntConstraint.antecedentUserId &&
            crntUser.userId !== crntConstraint.antecedentUserId
          ) {
            continue;
          }

          // check if antecedentRole not null
          if (
            crntConstraint.antecedentRoleId &&
            !checkIntersection(
              crntUser.roleList,
              constraintAntecedentRoleHierarchy,
            )
          ) {
            continue;
          }

          // check if antecedentSubgroup not null
          if (
            crntConstraint.antecedentSubgroupId &&
            !checkIntersection(crntUser.subgroupList, [
              crntConstraint.antecedentSubgroupId,
            ])
          ) {
            continue;
          }

          // check the branch maching
          if (
            constraintsBranchIds.length > 0 &&
            !checkIntersection(constraintsBranchIds, crntUser.branchList)
          ) {
            continue;
          }

          crntUser.constraints.push(crntConstraint);
        }
      }


      let availabilitiesListData = {
        data: {
          rows: [],
          count: 0,
        },
      };

      // if any of the flags are true, then only get the availabilities
      if (calculateEmptyAvailabilities || calculateNotAvailableBusy || calculateConstraints) {
        // here I get the date's availability for all users
        let startAvailability = moment.utc(req.body.date).toDate();
        let endAvailability = moment.utc(req.body.date).add(1, 'days').toDate();
        availabilitiesListData = await getAvailabilitiesForDateRange(
          startAvailability,
          endAvailability,
          req.currentUser.companyId,
          [],
          [],
          [],
          userIdArray,
          true,
        );
      }

      // here I distribute the events and availabilities of
      // each user
      for (let k = 0; k < usersCostraints.length; k++) {
        let crntUser = usersCostraints[k];
        let events = new Array();
        let availabilities = new Array();
        for (let p = 0; p < allEventsForAlluser.count; p++) {
          let e = allEventsForAlluser.rows[p];

          for (let q = 0; q < e.users.length; q++) {
            if (e.users[q].id === crntUser.userId) {
              events.push(e);
              break;
            }
          }
        }

        // NOTE: availabilitiesListData will be empty if calculateEmptyAvailabilities, 
        // calculateNotAvailableBusy and calculateConstraints are false
        for (let n = 0; n < availabilitiesListData.data.count; n++) {
          let a = availabilitiesListData.data.rows[n];
          if (a.user.id === crntUser.userId) {
            availabilities.push(a);
          }
        }

        crntUser.events = {
          rows: events,
          count: events.length,
        };

        crntUser.availabilities = {
          rows: availabilities,
          count: availabilities.length,
        };
      }

      for (let t = 0; t < usersCostraints.length; t++) {
        let user = usersCostraints[t];
        let constraintList = new Array();
        let emptyAvailabilities = new Array();
        let notAvailableBusy = new Array();
        let overbooking = new Array();
        let siblingBranchPeopleEvents = new Array();

        //////////////------------------------Constraints-------------------------////////////////

        //loop thorugh constrainst for deciding the min start and max end
        let allEvents = user.events;

        let allAvailabilities = user.availabilities;

        // NOTE: user.constraints will be empty if calculateConstraints is false or there are no constraints
        for (let i = 0; i < user.constraints.length; i++) {
          let constraint = user.constraints[i];
          if (!mostPriorConstriants.includes(constraint.id)) {
            continue;
          }

          if (constraint.constraintType === 'time') {
            // if time constraint is  weekly and the week was already calculated
            // then do not calculate it twice and use the result of previous calculation
            let thisIsAlreadyCalculated = false
            let setTheResultToUserConstraintWeeklyRelation = false
            if (constraint.frequency === 'week') {
              let startOfThisDatesWeek = moment(
                getStartOfWeekOfDate(req.body.date),
              ).format('YYYY-MM-DD');
               // the key = userId|constraintId|startOfWeek because it is for week range
              let generatedKey = [user.userId, constraint.id, startOfThisDatesWeek].join("|")
              thisIsAlreadyCalculated = userConstraintWeeklyRelation.has(generatedKey)
              if (!thisIsAlreadyCalculated){
                setTheResultToUserConstraintWeeklyRelation = true
              }
            }
            let result = false
            if (!thisIsAlreadyCalculated){
              let relatedEvents = false;
              if (constraint.frequency !== 'custom') {
                relatedEvents = allEvents;
              }
              result = await getTimeconstraintUserRelation({
                timeconstraint: constraint,
                userId: user.userId,
                date: req.body.date,
                roleHierarchy: roleHierarchy,
                events: relatedEvents,
              });

              if (setTheResultToUserConstraintWeeklyRelation){
                let startOfThisDatesWeek = moment(
                  getStartOfWeekOfDate(req.body.date),
                ).format('YYYY-MM-DD');
                let key = [user.userId, constraint.id, startOfThisDatesWeek].join("|")
                userConstraintWeeklyRelation.set(key, result)
              }
            }else{
              let startOfThisDatesWeek = moment(
                getStartOfWeekOfDate(req.body.date),
              ).format('YYYY-MM-DD');
              let key = [user.userId, constraint.id, startOfThisDatesWeek].join("|")
              result = userConstraintWeeklyRelation.get(key)
            }
           
            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              unit: constraint.units,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              each: {
                consequenceUsers: [],
              },
              all: {
                actual: 0,
              },
              brokenSessions: [],
              broken: false,
            };

            //userPair checking
            for (let j = 0; j < result.userPairsRelations.length; j++) {
              let actualAfterConvertion = result.userPairsRelations[j].actual;
              if (constraint.units === 'unit') {
                actualAfterConvertion =
                  result.userPairsRelations[j].actual / (60 * 15);
                
                // specific for each date in WEEKLY time constraint only
                if (result.userPairsRelations[j].dates){
                  result.userPairsRelations[j].dates = result.userPairsRelations[j].dates.map((entry) => ({
                    ...entry,
                    duration: entry.duration / (60 * 15),
                  }));
                }
              }
              if (constraint.units === 'hours') {
                actualAfterConvertion =
                  result.userPairsRelations[j].actual / (60 * 60);

                // specific for each date in WEEKLY time constraint only
                if (result.userPairsRelations[j].dates){
                  result.userPairsRelations[j].dates = result.userPairsRelations[j].dates.map((entry) => ({
                    ...entry,
                    duration: entry.duration / (60 * 60),
                  }));
                }
              }

              if (constraint.units === 'minutes') {
                actualAfterConvertion =
                  result.userPairsRelations[j].actual / 60;

                // specific for each date in WEEKLY time constraint only
                if (result.userPairsRelations[j].dates){
                  result.userPairsRelations[j].dates = result.userPairsRelations[j].dates.map((entry) => ({
                    ...entry,
                    duration: entry.duration / 60,
                  }));
                }
              }

              constraintInfo.each.consequenceUsers.push({
                userId: result.userPairsRelations[j].userId,
                firstName: result.userPairsRelations[j].firstName,
                lastName: result.userPairsRelations[j].lastName,
                actual: actualAfterConvertion,
                dates: result.userPairsRelations[j].dates,
              });

              if (
                (result.userPairsRelations[j].actual != 0 &&
                  result.userPairsRelations[j].actual < constraint.min) ||
                result.userPairsRelations[j].actual > constraint.max
              ) {
                constraintInfo.broken = true;
              }
            }

            //total checking
            for (let j = 0; j < result.totalRelation.length; j++) {
              let actualAfterConvertion = result.totalRelation[j].actual;
              if (constraint.units === 'unit') {
                actualAfterConvertion =
                  result.totalRelation[j].actual / (60 * 15);

                // specific for each date in WEEKLY time constraint only
                if (result.totalRelation[j].dates){
                  result.totalRelation[j].dates = result.totalRelation[j].dates.map((entry) => ({
                    ...entry,
                    duration: entry.duration / (60 * 15),
                  }));
                }
              }
              if (constraint.units === 'hours') {
                actualAfterConvertion =
                  result.totalRelation[j].actual / (60 * 60);

                // specific for each date in WEEKLY time constraint only
                if (result.totalRelation[j].dates){
                  result.totalRelation[j].dates = result.totalRelation[j].dates.map((entry) => ({
                    ...entry,
                    duration: entry.duration / (60 * 60),
                  }));
                }
              }

              if (constraint.units === 'minutes') {
                actualAfterConvertion = result.totalRelation[j].actual / 60;

                // specific for each date in WEEKLY time constraint only
                if (result.totalRelation[j].dates){
                  result.totalRelation[j].dates = result.totalRelation[j].dates.map((entry) => ({
                    ...entry,
                    duration: entry.duration / 60,
                  }));
                }
              }

              constraintInfo.all.actual = actualAfterConvertion;
              constraintInfo.all.dates = result.totalRelation[j].dates;

              if (
                (result.totalRelation[j].actual != 0 &&
                  result.totalRelation[j].actual < constraint.min) ||
                result.totalRelation[j].actual > constraint.max
              ) {
                constraintInfo.broken = true;
              }
            }

            //session checking
            for (let j = 0; j < result.sessionRelations.length; j++) {
              if (
                result.sessionRelations[j].actual > constraint.max ||
                (result.sessionRelations[j].actual != 0 &&
                  result.sessionRelations[j].actual < constraint.min)
              ) {
                let actualAfterConvertion = result.sessionRelations[j].actual;
                if (constraint.units === 'unit') {
                  actualAfterConvertion =
                    result.sessionRelations[j].actual / (60 * 15);
                }
                if (constraint.units === 'hours') {
                  actualAfterConvertion =
                    result.sessionRelations[j].actual / (60 * 60);
                }

                if (constraint.units === 'minutes') {
                  actualAfterConvertion =
                    result.sessionRelations[j].actual / 60;
                }

                constraintInfo.brokenSessions.push({
                  eventId: result.sessionRelations[j].eventId,
                  actual: actualAfterConvertion,
                  users: result.sessionRelations[j].users,
                });
                constraintInfo.broken = true;
              }
            }

            if (constraint.units === 'unit') {
              constraintInfo.min = constraintInfo.min / (15 * 60);
              constraintInfo.max = constraintInfo.max / (15 * 60);
            }
            if (constraint.units === 'hours') {
              constraintInfo.min = constraintInfo.min / (60 * 60);
              constraintInfo.max = constraintInfo.max / (60 * 60);
            }

            if (constraint.units === 'minutes') {
              constraintInfo.min = constraintInfo.min / 60;
              constraintInfo.max = constraintInfo.max / 60;
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'sessionlength') {
            let result = await getSessionLengthconstraintUserRelation({
              sessionlengthconstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
            });
            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              unit: constraint.units,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              each: null,
              all: null,
              brokenSessions: [],
              broken: false,
            };

            // //session checking
            for (let j = 0; j < result.sessionRelations.length; j++) {
              if (
                result.sessionRelations[j].actual > constraint.max ||
                (result.sessionRelations[j].actual != 0 &&
                  result.sessionRelations[j].actual < constraint.min)
              ) {
                let actualAfterConvertion = result.sessionRelations[j].actual;
                if (constraint.units === 'unit') {
                  actualAfterConvertion = Number(
                    (result.sessionRelations[j].actual / (60 * 15)).toFixed(2),
                  );
                }
                if (constraint.units === 'hours') {
                  actualAfterConvertion = Number(
                    (result.sessionRelations[j].actual / (60 * 60)).toFixed(2),
                  );
                }

                if (constraint.units === 'minutes') {
                  Number(
                    (actualAfterConvertion =
                      result.sessionRelations[j].actual / 60).toFixed(2),
                  );
                }

                constraintInfo.brokenSessions.push({
                  eventId: result.sessionRelations[j].eventId,
                  actual: actualAfterConvertion,
                  users: result.sessionRelations[j].users,
                });
                constraintInfo.broken = true;
              }
            }

            if (constraint.units === 'unit') {
              Number(
                (constraintInfo.min = constraintInfo.min / (15 * 60)).toFixed(
                  2,
                ),
              );
              Number(
                (constraresult.max = constraintInfo.max / (15 * 60)).toFixed(2),
              );
            }
            if (constraint.units === 'hours') {
              Number(
                (constraintInfo.min = constraintInfo.min / (60 * 60)).toFixed(
                  2,
                ),
              );
              Number(
                (constraintInfo.max = constraintInfo.max / (60 * 60)).toFixed(
                  2,
                ),
              );
            }

            if (constraint.units === 'minutes') {
              Number((constraintInfo.min = constraintInfo.min / 60).toFixed(2));
              Number((constraintInfo.max = constraintInfo.max / 60).toFixed(2));
            }

            if (constraintInfo.broken) {
              constraintList.push(constraintInfo);
            }
          }

          if (constraint.constraintType === 'authorization') {
            let thisIsAlreadyCalculated = false
            let setTheResultToUserConstraintWeeklyRelation = false
            let setTheResultToUserConstraintWholeRelation = false

            if (!constraint.rollover) {
              // if authorization constraint is not rollovered and the week was already calculated
              // then do not calculate it twice and use the result of previous calculation
              // the key = userId|constraintId|startOfWeek because it is for week range
              let startOfThisDatesWeek = moment(
                getStartOfWeekOfDate(req.body.date),
              ).format('YYYY-MM-DD');
              let generatedKey = [user.userId, constraint.id, startOfThisDatesWeek].join("|")
              thisIsAlreadyCalculated = userConstraintWeeklyRelation.has(generatedKey)
              if (!thisIsAlreadyCalculated){
                setTheResultToUserConstraintWeeklyRelation = true
              }
            }else{
              // if authorization constraint is rollovered and any date is already calculated
              // then do not calculate it twice and use the result of previous calculation
              // the key = userId|constraintId because it is for whole range
              let generatedKey = [user.userId, constraint.id].join("|")
              thisIsAlreadyCalculated = userConstraintWholeRangeRelation.has(generatedKey)
              if (!thisIsAlreadyCalculated){
                setTheResultToUserConstraintWholeRelation = true
              }
            }
            let result = false
            if (!thisIsAlreadyCalculated){
              result = await getAuthConstraintUserRelation({
                authconstraint: constraint,
                userId: user.userId,
                date: req.body.date,
                roleHierarchy: roleHierarchy,
                events: false,
              });

              // constraint not rollovered and it is the first calculation, set the result to Weekly
              if (setTheResultToUserConstraintWeeklyRelation){
                let startOfThisDatesWeek = moment(
                  getStartOfWeekOfDate(req.body.date),
                ).format('YYYY-MM-DD');
                let key = [user.userId, constraint.id, startOfThisDatesWeek].join("|")
                userConstraintWeeklyRelation.set(key, result)
              }

              // constraint is rollovered and it is the first calculation, set the result to Whole
              if (setTheResultToUserConstraintWholeRelation){
                let key = [user.userId, constraint.id].join("|")
                userConstraintWholeRangeRelation.set(key, result)
              }
            }else{
              if (!constraint.rollover){
                // if it is not rollovered then get the result from Weekly array
                let startOfThisDatesWeek = moment(
                  getStartOfWeekOfDate(req.body.date),
                ).format('YYYY-MM-DD');
                let key = [user.userId, constraint.id, startOfThisDatesWeek].join("|")
                result = userConstraintWeeklyRelation.get(key)
              }else{
                // if it is rollovered then get the result from Whole array
                let key = [user.userId, constraint.id].join("|")
                result = userConstraintWholeRangeRelation.get(key)
              }
            }

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              unit: constraint.units,
              rollover: constraint.rollover,
              each: null,
              actual: result.userPairsRelations.actual,
              activity: {
                id: result.userPairsRelations.activity.id,
                firstName: result.userPairsRelations.activity.firstName,
              },
              broken: false,
            };

            if (!constraintInfo.rollover) {
              if (constraintInfo.actual != constraintInfo.min) {
                constraintInfo.broken = true;
              }
            } else {
              if (constraintInfo.actual != constraintInfo.max) {
                constraintInfo.broken = true;
              }
            }

            if (constraint.units === 'unit') {
              constraintInfo.actual = Number(
                (constraintInfo.actual / (60 * 15)).toFixed(2),
              );
              constraintInfo.min = Number(
                (constraintInfo.min / (60 * 15)).toFixed(2),
              );
              constraintInfo.max = Number(
                (constraintInfo.max / (60 * 15)).toFixed(2),
              );
            }
            if (constraint.units === 'hours') {
              constraintInfo.actual = Number(
                (constraintInfo.actual / (60 * 60)).toFixed(2),
              );
              constraintInfo.min = Number(
                (constraintInfo.min / (60 * 60)).toFixed(2),
              );
              constraintInfo.max = Number(
                (constraintInfo.max / (60 * 60)).toFixed(2),
              );
            }

            if (constraint.units === 'minutes') {
              constraintInfo.actual = Number(
                (constraintInfo.actual / 60).toFixed(2),
              );
              constraintInfo.min = Number((constraintInfo.min / 60).toFixed(2));
              constraintInfo.max = Number((constraintInfo.max / 60).toFixed(2));
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'supervisionrate') {
            // supervisionconstraint must have activity
            if (!constraint.antecedentTypeActivityId) {
              continue;
            }
            const activityOfConstraint = await UsersDBApi.findAllByIds(
              constraint.antecedentTypeActivityId,
            );
            let relatedEvents = false;
            if (constraint.frequency === 'week') {
              relatedEvents = allEvents;
            }
            let result = await getSupervisionRateconstraintUserRelation({
              supervisionrateconstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: relatedEvents,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              unit: constraint.units,
              each: null,
              actual: result.supervisionRate,
              activity: {
                id: activityOfConstraint[0].id,
                firstName: activityOfConstraint[0].firstName,
              },
              broken: false,
            };

            // if it is bigger than max
            if (constraintInfo.actual > constraintInfo.max) {
              constraintInfo.broken = true;
            }

            // if it is less than min and not equal to 0
            if (
              constraintInfo.actual < constraintInfo.min &&
              constraintInfo.actual > 0
            ) {
              constraintInfo.broken = true;
            }

            // TODO supervisionrate
            // constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'unmatching') {
            let result = await getUnmatchingconstraintUserRelation({
              unmatchingconstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              each: null,
              all: null,
              brokenSessions: [],
              broken: false,
            };

            for (let j = 0; j < result.brokenEvents.length; j++) {
              constraintInfo.brokenSessions.push(result.brokenEvents[j]);
              constraintInfo.broken = true;
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'matching') {
            let result = await getMatchingconstraintUserRelation({
              matchingconstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              each: null,
              all: null,
              brokenSessions: [],
              broken: false,
            };

            for (let j = 0; j < result.brokenEvents.length; j++) {
              constraintInfo.brokenSessions.push({
                eventId: result.brokenEvents[j],
              });
              constraintInfo.broken = true;
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'usertouser') {
            let relatedEvents = false;
            if (constraint.frequency !== 'custom') {
              relatedEvents = allEvents;
            }
            let result = await getUserToUserFrequencyConstraintRelation({
              userToUserFrequencyConstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: relatedEvents,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              consequenceTypeEachOrAll: 'all',
              each: null,
              all: {
                actual: 0,
                users: [],
              },
              brokenSessions: [],
              broken: false,
            };

            // total checking
            constraintInfo.all.actual = result.actualWorkedUserNumber;
            constraintInfo.all.users = result.usersWorkedWith;
            if (
              (constraintInfo.all.actual != 0 &&
                constraintInfo.all.actual < constraint.min) ||
              constraintInfo.all.actual > constraint.max
            ) {
              constraintInfo.broken = true;
            }

            if (result.usersWorkedWithByDate){
              constraintInfo.all.dates = result.usersWorkedWithByDate
            }

            //session checking
            for (let j = 0; j < result.sessionRelations.length; j++) {
              if (
                result.sessionRelations[j].userNumber > constraint.max ||
                (result.sessionRelations[j].userNumber != 0 &&
                  result.sessionRelations[j].userNumber < constraint.min)
              ) {
                constraintInfo.brokenSessions.push(result.sessionRelations[j]);
                constraintInfo.broken = true;
              }
            }
            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'usertosession') {
            let relatedEvents = false;
            if (constraint.frequency !== 'custom') {
              relatedEvents = allEvents;
            }
            let result = await getUserToSessionFrequencyConstraintRelation({
              userToSessionFrequencyConstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: relatedEvents,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              each: {
                consequenceUsers: [],
              },
              all: {
                actual: 0,
              },
              brokenSessions: null,
              broken: false,
            };

            //userPair checking
            for (let j = 0; j < result.userPairsRelations.length; j++) {
              if (
                (result.userPairsRelations[j].actual != 0 &&
                  result.userPairsRelations[j].actual < constraint.min) ||
                result.userPairsRelations[j].actual > constraint.max
              ) {
                constraintInfo.each.consequenceUsers.push({
                  userId: result.userPairsRelations[j].userId,
                  firstName: result.userPairsRelations[j].firstName,
                  lastName: result.userPairsRelations[j].lastName,
                  actual: result.userPairsRelations[j].actual,
                });
                constraintInfo.broken = true;
              }
            }

            //total checking
            for (let j = 0; j < result.totalRelation.length; j++) {
              constraintInfo.all.actual = result.totalRelation[j].actual;
              constraintInfo.all.dates = result.totalRelation[j].dates ?? []
              if (
                (result.totalRelation[j].actual != 0 &&
                  result.totalRelation[j].actual < constraint.min) ||
                result.totalRelation[j].actual > constraint.max
              ) {
                constraintInfo.broken = true;
              }
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'gaps') {
            let result = await getGapsconstraintUserRelation({
              gapsconstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
              availabilities: allAvailabilities,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              unit: constraint.units,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              each: null,
              all: {
                actual: 0,
              },
              broken: false,
              gaps: [],
            };

            constraintInfo.all.actual = result.totalGapDurationInSecond;
            if (constraintInfo.all.actual > constraintInfo.max) {
              constraintInfo.broken = true;
            }
            for (let p = 0; p < result.gaps.length; p++) {
              constraintInfo.gaps.push({
                startTime: moment(result.gaps[p].start).format('h:mm A'),
                endTime: moment(result.gaps[p].end).format('h:mm A'),
              });
            }

            if (constraint.units === 'unit') {
              constraintInfo.all.actual = constraintInfo.all.actual / (15 * 60);
              constraintInfo.max = constraintInfo.max / (15 * 60);
              constraintInfo.min = constraintInfo.min / (15 * 60);
            }
            if (constraint.units === 'hours') {
              constraintInfo.all.actual = constraintInfo.all.actual / (60 * 60);
              constraintInfo.max = constraintInfo.max / (60 * 60);
              constraintInfo.min = constraintInfo.min / (60 * 60);
            }

            if (constraint.units === 'minutes') {
              constraintInfo.all.actual = constraintInfo.all.actual / 60;
              constraintInfo.max = constraintInfo.max / 60;
              constraintInfo.min = constraintInfo.min / 60;
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'backToBack') {
            let result = await getBacktobackconstraintUserRelation({
              backtobackconstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
            });

            if (result.backtobacks.length > 0) {
              let constraintInfo = {
                id: constraint.id,
                constraintType: constraint.constraintType,
                description: constraint.description,
                frequency: constraint.frequency,
                min: constraint.min,
                max: constraint.max,
                minSeconds: constraint.min,
                maxSeconds: constraint.max,
                unit: constraint.units,
                consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
                each: null,
                all: {
                  actual: 0,
                },
                broken: true,
                backtobackedTimes: [],
              };

              for (let p = 0; p < result.backtobacks.length; p++) {
                constraintInfo.backtobackedTimes.push(
                  moment(result.backtobacks[p]).format('h:mm A'),
                );
              }
              constraintList.push(constraintInfo);
            }
          }

          if (constraint.constraintType === 'grouping') {
            let result = await getGroupingconstraintUserRelation({
              groupingconstraint: constraint,
              user: user,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              antecedentUserSubgroups: result.antecedentUserSubgroups,
              each: null,
              all: null,
              brokenSessions: [],
              broken: false,
            };

            for (const [eventId, detailedInfo] of result.brokenEvents) {
              constraintInfo.brokenSessions.push({
                eventId: eventId,
                breakingUsers: detailedInfo.breakingUsers,
              });
              constraintInfo.broken = true;
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'breakQuantity') {
            let result = await getBreakQuantityconstraintUserRelation({
              breakQuantityconstraint: constraint,
              userId: user.userId,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
            });
            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              unit: constraint.units,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              actualBreakCount: result.actualNumberBreaks,
              actualDurationExceptBreaks:
                result.actualTotalDurationExceptBreaksInSeconds,
              broken: false,
            };

            if (constraint.units === 'unit') {
              constraintInfo.max = Number(
                (constraintInfo.max / (15 * 60)).toFixed(2),
              );
              constraintInfo.actualDurationExceptBreaks = Number(
                (constraintInfo.actualDurationExceptBreaks / (15 * 60)).toFixed(
                  2,
                ),
              );
            }
            if (constraint.units === 'hours') {
              constraintInfo.max = Number(
                (constraintInfo.max / (60 * 60)).toFixed(2),
              );
              constraintInfo.actualDurationExceptBreaks = Number(
                (constraintInfo.actualDurationExceptBreaks / (60 * 60)).toFixed(
                  2,
                ),
              );
            }

            if (constraint.units === 'minutes') {
              constraintInfo.max = Number((constraintInfo.max / 60).toFixed(2));
              constraintInfo.actualDurationExceptBreaks = Number(
                (constraintInfo.actualDurationExceptBreaks / 60).toFixed(2),
              );
            }

            if (
              constraintInfo.maxSeconds <=
                result.actualTotalDurationExceptBreaksInSeconds &&
              constraintInfo.actualBreakCount < constraintInfo.min
            ) {
              constraintInfo.broken = true;
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'drive') {
            let result = await getDriveconstraintUserRelation({
              driveConstraint: constraint,
              userId: user.userId,
              userAddress: user.address,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
              distanceMatrix: distanceMatrix,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minSeconds: constraint.min,
              maxSeconds: constraint.max,
              unit: constraint.units,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              each: null,
              all: {
                actual: 0,
              },
              broken: false,
            };

            constraintInfo.all.actual = result.totalDriveTimeInSecond;
            if (constraintInfo.all.actual > constraintInfo.max) {
              constraintInfo.broken = true;
            }

            if (constraint.units === 'unit') {
              constraintInfo.all.actual = (
                constraintInfo.all.actual /
                (15 * 60)
              ).toFixed(2);
              constraintInfo.max = (constraintInfo.max / (15 * 60)).toFixed(2);
              constraintInfo.min = (constraintInfo.min / (15 * 60)).toFixed(2);
            }
            if (constraint.units === 'hours') {
              constraintInfo.all.actual = (
                constraintInfo.all.actual /
                (60 * 60)
              ).toFixed(2);
              constraintInfo.max = (constraintInfo.max / (60 * 60)).toFixed(2);
              constraintInfo.min = (constraintInfo.min / (60 * 60)).toFixed(2);
            }

            if (constraint.units === 'minutes') {
              constraintInfo.all.actual = (
                constraintInfo.all.actual / 60
              ).toFixed(2);
              constraintInfo.max = (constraintInfo.max / 60).toFixed(2);
              constraintInfo.min = (constraintInfo.min / 60).toFixed(2);
            }

            constraintList.push(constraintInfo);
          }

          if (constraint.constraintType === 'distance') {
            let result = await getDistanceconstraintUserRelation({
              distanceConstraint: constraint,
              userId: user.userId,
              userAddress: user.address,
              date: req.body.date,
              roleHierarchy: roleHierarchy,
              events: allEvents,
              distanceMatrix: distanceMatrix,
            });

            let constraintInfo = {
              id: constraint.id,
              constraintType: constraint.constraintType,
              description: constraint.description,
              frequency: constraint.frequency,
              min: constraint.min,
              max: constraint.max,
              minMeters: constraint.min,
              maxMeters: constraint.max,
              unit: constraint.units,
              consequenceTypeEachOrAll: constraint.consequenceTypeEachOrAll,
              each: null,
              all: {
                actual: 0,
              },
              broken: false,
            };

            constraintInfo.all.actual = result.totalPassedDistanceInMeters;
            if (constraintInfo.all.actual > constraintInfo.max) {
              constraintInfo.broken = true;
            }

            if (constraint.units === 'miles') {
              constraintInfo.all.actual = (
                constraintInfo.all.actual / 1610
              ).toFixed(2);
              constraintInfo.max = (constraintInfo.max / 1610).toFixed(2);
              constraintInfo.min = (constraintInfo.min / 1610).toFixed(2);
            }
            if (constraint.units === 'kilometers') {
              constraintInfo.all.actual = (
                constraintInfo.all.actual / 1000
              ).toFixed(2);
              constraintInfo.max = (constraintInfo.max / 1000).toFixed(2);
              constraintInfo.min = (constraintInfo.min / 1000).toFixed(2);
            }

            constraintList.push(constraintInfo);
          }
        }

        let result = await getNotProperSlostOnDayForUser({
          events: allEvents,
          availabilities: allAvailabilities,
          start: moment.utc(req.body.date).startOf('day').toDate(),
          end: moment.utc(req.body.date).add(1, 'days').startOf('day').toDate(),
          timezone: timezone,
          calculateEmptyAvailabilities,
          calculateNotAvailableBusy,
          calculateOverbookings,
        });

        /////////------------------EMPTY-AVAILABILITIES------------------------------------------////////
        // NOTE: result.empty will be empty if calculateEmptyAvailabilities is false
        for (let p = 0; p < result.empty.length; p++) {
          emptyAvailabilities.push({
            startTime: moment.utc(result.empty[p].start).format('h:mm A'),
            endTime: moment.utc(result.empty[p].end).format('h:mm A'),
          });
        }

        /////////------------------NOT-AVAILABLE-BUSY------------------------------------------////////
        // NOTE: result.notAvailableBusy will be empty if calculateNotAvailableBusy is false
        for (let p = 0; p < result.notAvailableBusy.length; p++) {
          if (result.notAvailableBusy[p]) {
            notAvailableBusy.push({
              startTime: moment
                .utc(result.notAvailableBusy[p].start)
                .format('h:mm A'),
              endTime: moment
                .utc(result.notAvailableBusy[p].end)
                .format('h:mm A'),
              events: result.notAvailableBusy[p].events,
            });
          }
        }

        /////////------------------OVERBOOKING----------------------------/////
        if (userHasPersonRole) {
          // NOTE: result.overbooking will be empty if calculateOverbookings is false
          for (let p = 0; p < result.overbooking.length; p++) {
            overbooking.push({
              conflict: {
                startTime: moment
                  .utc(result.overbooking[p].conflict.start)
                  .format('h:mm A'),
                endTime: moment
                  .utc(result.overbooking[p].conflict.end)
                  .format('h:mm A'),
              },
              events: result.overbooking[p].events,
            });
          }
        }

        /////////----------------------SIBLING BRANCH PEOPLE ------------------------------------/////////
        if (calculateSiblingBranchPeopleEvents) {
          siblingBranchPeopleEvents =
            await getSiblingBranchConstraintUserRelation({
              userId: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
              date: req.body.date,
              events: allEvents,
              userBranches: user.branches,
            });
        }  

        response.push({
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          date: moment.utc(req.body.date).format('YYYY-MM-DD'),
          constraints: constraintList,
          emptyAvailabilities: emptyAvailabilities,
          notAvailableBusy: notAvailableBusy,
          overbookings: overbooking,
          siblingBranchPeopleEvents: siblingBranchPeopleEvents,
        });
      }
    }

    res.status(200).send(response);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
