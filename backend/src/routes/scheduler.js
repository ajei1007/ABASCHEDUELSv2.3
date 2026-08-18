const _ = require('lodash');
const weekdayOptions = require('../constants/weekdayOptions');
const express = require('express');
const passport = require('passport');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const moment = require('moment');
const { Client } = require('@googlemaps/google-maps-services-js');
const rule_RRule = require('rrule');
const ClientsService = require('../services/users');
const EventpairService = require('../services/eventpair');
const AvailabilitiesService = require('../services/availabilities');
const GroupingsService = require('../services/groupings');
const ClientsDBApi = require('../db/api/users');
const EmployeesDBApi = require('../db/api/users');
const StatuseventsDBApi = require('../db/api/statusevents');
const LocationsDBApi = require('../db/api/users');
const ActivitiesDBApi = require('../db/api/users');
const UsersDBApi = require('../db/api/users');
const SiblingsUsersDBApi = require('../db/api/siblingsusers');
const CancellationtypesService = require('../services/cancellationtypes');
const SubgroupServiceService = require('../services/subgroups');
const BranchesService = require('../services/branches');
const RolesService = require('../services/roles');
const BranchtypeService = require('../services/branchtype');
const TotaltypesDBApi = require('../db/api/totaltypes');
const EventsDBApi = require('../db/api/events');
const EventsService = require('../services/events');
const Locations_typesDBApi = require('../db/api/locationstypes');
const EventpairDBApi = require('../db/api/eventpair');
const AvailabilitiesDBApi = require('../db/api/availabilities');
const GroupingsDBApi = require('../db/api/groupings');
const RolesDBApi = require('../db/api/roles');
const SubgroupsDBApi = require('../db/api/subgroups');
const DistancematrixDBApi = require('../db/api/distancematrix');
const CompaniesService = require('../services/companies');
const CancellationtypesDBApi = require('../db/api/cancellationtypes');
const BranchesDBApi = require('../db/api/branches');
const BranchtypeDBApi = require('../db/api/branchtype');
const day_ids = require('../db/uuids/days');
const getAvailabilitiesForDateRange = require('../utils/statistcs/getAvailabilitiesForDateRange');
const wrapAsync = require('../helpers').wrapAsync;
const moment2 = require('moment-timezone');
const filterDisabled = require('../utils/filterDisabled');
const { getRoleHierarchy } = require('../utils/roleHierarchy');
const filterUsersFromEvents = require('../utils/filterUsersFromEvents');
const UsersService = require('../services/users');
const { events } = require('../services/notifications/list');
const {
  sendEmails,
  getWeeklySchedulesOfUsers,
  getScheduleOfUserForCalendar,
} = require('../controllers/scheduler');
const getFullName = require('../utils/getFullName');
const { getDays } = require('../utils/schedulerUtils');
const { generateSchedulerEvents } = require('../controllers/events');
const formatEventForScheduler = require('../utils/formatEventForScheduler');
const getUsersAccordingBranchRoleSubgroup = require('../utils/statistcs/getUsersAccordingBranchRoleSubgroup');
const prepareAvailabilitiesForSchedulerResponse = require('../utils/prepareAvailabilitiesForSchedulerResponse');
const isDateInDST = require('../utils/isDateInDST');
const timezoneUsesDLS = require('../utils/timezoneUsesDLS');
const config = require('../config');

// TODO move to utils folder
function calculateUnionLengthOfIntervals(arr, excludeEdges) {
  // This function for returning 3 if the input is [1, 3] as the edges are included
  // We gonna use `excludeEdges` for returning if we need to exlucde the edges
  if (arr.length === 0) {
    return 0;
  }

  arr.sort((a, b) => a[0] - b[0]);

  let result = 0;
  let currentStart = arr[0][0];
  let currentEnd = arr[0][1];
  // Iterate over the pairs and update the current start and end
  // points of the union as needed
  for (let i = 1; i < arr.length; i++) {
    const [start, end] = arr[i];
    if (start > currentEnd) {
      result += currentEnd - currentStart + 1;
      if (excludeEdges) {
        result -= 1;
      }
      currentStart = start;
      currentEnd = end;
    } else if (end > currentEnd) {
      currentEnd = end;
    }
  }

  // Add the length of the last segment to the result
  result += currentEnd - currentStart + 1;
  if (excludeEdges) {
    result -= 1;
  }
  return result;
}
function findIntervalsNotInArray2(array1, array2) {
  for (let i = 0; i < array1.length; ) {
    let interval1 = array1[i];
    const start1 = interval1[0];
    const end1 = interval1[1];
    let trimmed = false;
    for (const interval2 of array2) {
      const start2 = interval2[0];
      const end2 = interval2[1];

      if (start1 < end2 && end1 > start2) {
        let partlyTrimmed = false;
        // Check if interval1 starts before interval2
        if (start1 < start2) {
          array1.push([interval1[0], interval2[0] - 1]);
          partlyTrimmed = true;
          trimmed = true;
        }

        // Check if interval1 ends after interval2
        if (end1 > end2) {
          array1.push([interval2[1] + 1, interval1[1]]);
          partlyTrimmed = true;
          trimmed = true;
        }

        if (!partlyTrimmed) {
          trimmed = true;
        }
      }

      if (trimmed) {
        break;
      }
    }

    if (trimmed) {
      array1.splice(i, 1);
    } else {
      i++;
    }
  }

  return array1;
}
const getPositiveModulo = (dividend, divisor) => {
  return ((dividend % divisor) + divisor) % divisor;
};
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
const shorten_name = (name) => {
  let index = name.indexOf(' ');
  if (index == -1) {
    return name;
  } else {
    return name.substring(0, index + 2);
  }
};
const intersect_arrays = (arr1, arr2) => {
  return arr1 ? arr1.filter((e) => arr2.includes(e)) : [];
};
function checkIntersection(arr1, arr2) {
  return arr1.some((item) => arr2.includes(item));
}
const convert_unit_label_moment = (e) => {
  switch (e) {
    case 'Hours':
      return 'hour';
    case 'Annually':
      return 'year';
    case 'Daily':
      return 'day';
    case 'Weekly':
      return 'week';
    case 'Days':
      return 'day';
    case 'Monthly':
      return 'month';
    case 'Seconds':
      return 'second';
  }
};
const convert_weekday = (day) => {
  if (day == day_ids['sunday_id']) {
    return 0;
  } else if (day == day_ids['monday_id']) {
    return 1;
  } else if (day == day_ids['tuesday_id']) {
    return 2;
  } else if (day == day_ids['wednesday_id']) {
    return 3;
  } else if (day == day_ids['thursday_id']) {
    return 4;
  } else if (day == day_ids['friday_id']) {
    return 5;
  } else if (day == day_ids['saturday_id']) {
    return 6;
  }
};

function getRoleHierarchyChildren(roles) {
  const items = roles.rows;
  // First, create a map of id to children names
  const childrenMap = {};

  // Initialize map with all items (each item at least contains itself)
  items.forEach(item => {
      childrenMap[item.name] = [item.name];
  });
  
  // Helper function to get all descendant names for a given parent id
  function getDescendantNames(parentId) {
      // Get the parent item first
      const parentItem = items.find(item => item.id === parentId);
      if (!parentItem) return [];
      
      // Start with the parent's name
      const names = [parentItem.name];
      
      // Add all descendants
      const descendants = items
          .filter(item => item.parent?.id === parentId)
          .map(item => {
              // For each direct child, get its name and its descendants
              const childDescendants = getDescendantNames(item.id);
              return [item.name, ...childDescendants];
          })
          .flat();
          
      return [...names, ...descendants];
  }
  
  // Process each item that has a parent
  items.forEach(item => {
      if (item.parent) {
          // Get all descendants for this parent's parent
          const parentName = items.find(i => i.id === item.parent.id)?.name;
          if (parentName) {
              const descendants = getDescendantNames(item.parent.id);
              childrenMap[parentName] = [...new Set(descendants)];
          }
      }
  });
  
  return childrenMap;
}

// TODO
const getDataAccess = async (req) => {
  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);
  let dataAccess = 'User';
  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
  } else if (dataAccessArray.includes('Branch')) {
    dataAccess = 'Branch';
  }
  return dataAccess;
};

const getUsersForStaffTracker = async ({
  req,
  filterSearchQuery,
  filterResourceIds,
  filterResourceTypes,
  filterExcludeDescendents,
  filterExcludeRooms,
  filterExcludeSupervision,
  page,
  limit,
}) => {
  const dataAccess = await getDataAccess(req);
  let payload = {};
  let branchList = [];
  let green_oncall_users = [];
  let oncall_branches = {};
  let roleNames = [];

  if (filterResourceTypes) {
    const resourceTypes = filterResourceTypes.split('|');
    const roles = await getRoles(req);
    const rolesChildrenMap = getRoleHierarchyChildren(roles);

    roleNames = resourceTypes.reduce((acc, resourceType) => {
      const children = rolesChildrenMap[resourceType] || [resourceType];
      return [...acc, ...children];
    }, []);

    roleNames = [...new Set(roleNames)];

    if (filterExcludeRooms) {
      const roomRoles = rolesChildrenMap['Room'] || [];
      roleNames = roleNames.filter((roleName) => !roomRoles.includes(roleName));
    }
  }

  if (dataAccess == 'User') {
    let ids = [req.currentUser.id];
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    currentUserRoles = req.currentUser.roles.map((role) => role.name);
    const role_names = ['Employee'].filter((e) => {
      for (let index = 0; index < currentUserRoles.length; index++) {
        const element = currentUserRoles[index];
        if (roleHierarchy[element].includes(e)) {
          return true;
        }
      }
      return false;
    });
    if (role_names.includes('Employee')) {
      branchList = filterExcludeDescendents
        ? await BranchesDBApi.getAncestorBranches({
            branchIds: req.query.branches,
          })
        : await BranchesDBApi.getDescendentAndAncestorBranches({
            branchIds: req.query.branches,
          });
      payload = await UsersDBApi.findOpenShifts({
        companyId: req.currentUser.companyId,
        branches: branchList,
      });

      const openshift_ids = payload.rows.map((t) => t.id);
      ids = [...ids, ...openshift_ids];
    }

    if (req.currentUser.siblingGroupId) {
      const siblingId = req.currentUser.siblingGroupId.id
        ? req.currentUser.siblingGroupId.id
        : req.currentUser.siblingGroupId;
      if (siblingId) {
        payload = await UsersDBApi.findUserIdsInSiblingGroup({
          siblingGroupId: siblingId,
        });
        ids = [...ids, ...payload];
      }
    }

    if (filterResourceIds) {
      ids = [...ids, ...`${filterResourceIds}`.split('|')];
    }

    payload = await UsersDBApi.findAll({
      ids: ids,
      field: 'firstName',
      sort: 'asc',
      companyId: req.currentUser.companyId,
      roleNames,
      excludeSupervision: filterExcludeSupervision,
      query: filterSearchQuery,
      page,
      limit,
    });
    return filterDisabled(payload);
  } else {
    if (req.query.branches) {
      branchList = filterExcludeDescendents
        ? await BranchesDBApi.getAncestorBranches({
            branchIds: req.query.branches,
          })
        : await BranchesDBApi.getDescendentAndAncestorBranches({
            branchIds: req.query.branches,
          });
    }

    req.query.branches = branchList;
    let additionalUsers = new Array();

    // get all additonal users
    const staffTracker = req.query.staffTracker || false;
    payload = await UsersDBApi.findAllForStaffTracker({
      ...req.query,
      ids: filterResourceIds ? filterResourceIds.split('|') : undefined,
      field: 'firstName',
      staffTracker,
      additionalUsers,
      companyId: req.currentUser.companyId,
      onlyAdditional: req.query.onlyOncall,
      roleNames,
      excludeSupervision: filterExcludeSupervision,
      query: filterSearchQuery,
      page,
      limit,
    });

    payload.rows.forEach((row, i) => {
      if (additionalUsers.includes(row['id'])) {
        payload.rows[i] = {
          ...payload.rows[i],
          callout: true,
          callout_green: green_oncall_users.includes(row['id']),
          callout_branch: oncall_branches[row['id']],
        };
      }
    });

    return filterDisabled(payload);
  }
};
const get_team_hierarchy = async (req) => {
  const new_req = _.cloneDeep(req);
  delete new_req.query.branches;
  const branches = await getBranches(new_req);
  let parents = {};

  for (let i = 0; i < branches.rows.length; i++) {
    let b = branches.rows[i];
    let parentID = null;
    let parentName = null;
    let parentType = null;
    let level = 1;
    if (b.parentId) {
      parentID = b.parentId;
      parentName = b.parent.name;
      parentType = b.parent.branchTypeId;
    }

    let branctype = b.branchType;
    if (branctype) {
      switch (branctype.name) {
        case 'Team':
          level = 1;
          break;
        case 'Center':
          level = 2;
          break;
        case 'Neighborhood':
          level = 3;
          break;
        case 'Region':
          level = 4;
          break;
        case 'Market':
          level = 5;
          break;
        case 'Organization':
          level = 6;
          break;
        default:
          level = 1;
          break;
      }
    }

    parents[b.name] = {
      keylabel: b.name,
      keyid: b.id,
      id: parentID,
      label: parentName,
      level: level,
      type: parentType,
      inactive: b.inactive,
    };
  }
  return parents;
};
const getEvents = async (req, bol = false) => {
  let branches = req.currentUser.branches.map((e) => e.id);
  branches = branches.length == 0 ? ['d'] : branches;
  let dataAccess = 'User';
  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);

  let query = { ...req.query };

  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
  } else if (dataAccessArray.includes('Branch')) {
    dataAccess = 'Branch';
  }
  if (dataAccess == 'User') {
  } else if (dataAccess == 'Branch') {
  }
  if (bol) {
    query = { branches: query.branches };
  }

  const payload = await EventsDBApi.findAll({
    ...query,
    companyId: req.currentUser.companyId,
  });
  return payload;
};
const getEventsForTimezone = async (req, bol = false) => {
  let branches = req.currentUser.branches.map((e) => e.id);
  branches = branches.length == 0 ? ['d'] : branches;
  let dataAccess = 'User';
  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);
  const viewCancelationArray = req.currentUser.roles.map(
    (role) => role.viewCancelation,
  );
  const viewCancelation = viewCancelationArray.includes(true);

  let query = { ...req.query };

  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
  } else if (dataAccessArray.includes('Branch')) {
    dataAccess = 'Branch';
  }
  if (dataAccess == 'User') {
  } else if (dataAccess == 'Branch') {
  }
  if (bol) {
    query = { branches: query.branches };
  }

  if (query.start) {
    query.start = moment.utc(query.start).format('YYYY-MM-DD HH:mm:ss');
  }

  if (query.end) {
    query.end = moment.utc(query.end).format('YYYY-MM-DD HH:mm:ss');
  }

  // console.time("old")
  // const payload = await EventsDBApi.findAllForTimezone({
  //   ...query,
  //   companyId: req.currentUser.companyId,
  // });

  // //console.timeEnd("old")

  const payload = await EventsDBApi.findAllForTimezoneGetEventSeperately({
    ...query,
    companyId: req.currentUser.companyId,
    viewCancelation: viewCancelation,
  });

  return payload;
};
const getEventsForStaffTracking = async (query) => {
  let branchList = [];
  if (query.branches) {
    branchList = await BranchesDBApi.getDescendentBranches({
      branchIds: query.branches,
    });
  }

  if (!query.activities || query.activities.length == 0) {
    query.activity = 'catchingTheEmptyCase';
  } else {
    query.activity = query.activities;
  }

  if (query.start) {
    query.start = moment.utc(query.start).format('YYYY-MM-DD HH:mm:ss');
  }

  if (query.end) {
    query.end = moment.utc(query.end).format('YYYY-MM-DD HH:mm:ss');
  }

  if (branchList.length < 50) {
    query.branchList = branchList;
  }

  const payload = await EventsDBApi.findAllForTimezone(query);

  if (branchList.length < 50) {
    return payload;
  }

  let resp = { rows: [], count: 0 };

  for (let i = 0; i < payload.count; i++) {
    let e = payload.rows[i];
    let passedFromFilter = false;
    for (let m = 0; m < e.dataValues.users.length; m++) {
      let branchesOfUser = e.dataValues.users[m].branches;
      if (branchesOfUser) {
        for (let k = 0; k < branchesOfUser.length; k++) {
          if (branchList.includes(branchesOfUser[k].id)) {
            passedFromFilter = true;
            continue;
          }
        }
      }
    }

    if (passedFromFilter) {
      resp.rows.push(e);
      resp.count++;
    }
  }

  return resp;
};
const getRoles = async (req) => {
  const payload = await RolesDBApi.findAll({
    ...req.query,
    companyId: req.currentUser.companyId,
  });
  return payload;
};
const getSubgroups = async (req) => {
  let query = {
    companyId: req.currentUser.companyId,
  };
  if (req.query.branches) {
    query = { ...query, branches: req.query.branches };
  }
  const payload = await SubgroupsDBApi.findAll(query);
  return payload;
};
const getGroupings = async (req) => {
  const payload = await GroupingsDBApi.findAll({
    ...req.query,
    companyId: req.currentUser.companyId,
  });
  return payload;
};
const getBranchType = async (req) => {
  let branches = req.currentUser.branches.map((e) => e.id).join('|');
  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);
  let query_now = { ...req.query, companyId: req.currentUser.companyId };

  if (!dataAccessArray.includes('All')) {
    query_now = { ...query_now, branches: branches };
  }

  const payload = await BranchtypeDBApi.findAll(query_now);
  return payload;
};
const getBranches = async (req) => {
  const query_now = { ...req.query, companyId: req.currentUser.companyId };
  const payload = await BranchesDBApi.findAll(query_now);
  return payload;
};
const getAvailabilities = async (req) => {
  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);
  let dataAccess = 'User';
  let payload = [];
  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
  } else if (dataAccessArray.includes('Branch')) {
    dataAccess = 'Branch';
  }
  if (dataAccess == 'User') {
    payload = await AvailabilitiesDBApi.findAll({
      user: req.currentUser.id,
      companyId: req.currentUser.companyId,
    });
  } else {
    payload = await AvailabilitiesDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });
  }
  return filterDisabled(payload);
};
const getEventsStats = async (req, bol = false) => {
  let branches = req.currentUser.branches.map((e) => e.id);
  branches = branches.length == 0 ? ['d'] : branches;
  let dataAccess = 'User';
  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);

  let query = { ...req.query };
  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
  } else if (dataAccessArray.includes('Branch')) {
    dataAccess = 'Branch';
  }
  if (dataAccess == 'User') {
  } else if (dataAccess == 'Branch') {
  }
  if (bol) {
    query = { branches: query.branches };
  }

  const payload = await EventsDBApi.findAllStats({
    ...query,
    companyId: req.currentUser.companyId,
  });

  return payload;
};
const get_role_hierarchy = (roles) => {
  roleHierarchy = {};
  roles.rows.map((e) => {
    let roles_all = [e.name];

    let parent_id = e.parent ? e.parent.name : null;
    let i = 0;
    while (parent_id != null && i < 1000) {
      roles_all.push(parent_id);
      const role_parent = roles.rows.find((r) => r.name == parent_id)?.parent;
      parent_id = role_parent != null ? role_parent.name : null;
      i++;
    }
    roleHierarchy[e.name] = roles_all;
  });
  return roleHierarchy;
};
const turn_into_resources = async (req, resources) => {
  const team_hierarchy = await get_team_hierarchy(req);
  const roles_api = await getRoles(req);
  const roleHierarchy = get_role_hierarchy(roles_api);
  //console.timeEnd('hemmer3');

  const resources_roles = roles_api.rows
    .filter((e) => e.parent && e.parent.name == 'Person')
    .map((e) => e.name)
    .concat(['Person', 'Location', 'Activity', 'Funder', 'Block']);

  let filteredResources = resources.rows.filter((e) => e.roles.length > 0);

  let mappedArray = [];
  for (const data of filteredResources) {
    let resource = data;
    let subgroup_icons = resource.subgroups
      ?.filter((t) => t.iconName)
      .map((t) => [t.name, t.iconName]);
    let actual_subgroups = resource.subgroups?.map((t) => t.name);
    const roles = resource.roles
      .map((t) => t.name)
      .filter((t) => t != 'Male' && t != 'Female');

    const subgroups = resource.branches.map((t) => t.name);
    const subgroup_keys = intersect_arrays(
      Object.keys(team_hierarchy),
      subgroups,
    );
    let subgroup_key = '';
    let parentId = '';
    if (subgroup_keys.length > 0) {
      subgroup_key = subgroup_keys[0];
      parentId = subgroup_key;
    }
    const roles2 = [...new Set(roles.flatMap((role) => roleHierarchy[role]))];

    let assignUserFunder = null;
    if (resource?.credentialFunders?.length > 0) {
      assignUserFunder = {
        id: resource.credentialFunders[0].id,
        label: resource.credentialFunders[0].firstName,
      };
    }

    mappedArray.push({
      id: resource.id,
      name: resource.lastName
        ? `${resource.firstName} ${resource.lastName}`
        : resource.firstName,
      title: resource.lastName
        ? `${resource.firstName} ${resource.lastName}`
        : resource.firstName,
      email: resource.email,
      email1: resource.email1,
      email2: resource.email2,
      resourceTypeId: resource.resourceId,
      type: resources_roles.find(
        (r) =>
          roles[0] && (roles[0] == r || roleHierarchy[roles[0]]?.includes(r)),
      ),
      roles: roles2,
      overlap: resource.overlap,
      firstName: resource.firstName,
      lastName: resource.lastName,
      billable: resource.billable,
      callout: resource.callout ?? false,
      callout_green: resource.callout_green ?? false,
      callout_branch: resource.callout_branch ?? null,
      notWorking: resource.notWorking,
      auth: resource.auth,
      latitude: resource.latitude,
      longitude: resource.longitude,
      needroom: resource.needroom,
      needseat: resource.needseat,
      subgroups: subgroups,
      actual_subgroups: actual_subgroups,
      subgroup_icons: subgroup_icons,
      address: resource.address,
      branches: resource.branches.map((y) => y.id),
      parentId: parentId,
      waitlisted: resource.waitlisted,
      capacity: resource.capacity,
      employeeratio: resource.employeeratio,
      clientratio: resource.clientratio,
      calendarhide: resource.calendarhide,
      customAddressId: resource.customAddressId,
      birthday: resource.birthday,
      color: resource.color ? resource.color : 'green',
      location_type: resource.locationTypeId,
      funder: assignUserFunder,
      supervision: resource.supervision,
      rooms: resource.rooms,
      empNotReq: resource.empNotReq,
      clientReq: resource.clientReq,
      locReq: resource.locReq,
      defaultDuration: resource.defaultDuration,
    });
  }

  return mappedArray;
};
const resources_fetch = async ({
  req,
  filterSearchQuery,
  filterResourceIds,
  filterResourceTypes,
  filterExcludeDescendents,
  filterExcludeRooms,
  filterExcludeSupervision,
  page,
  limit,
}) => {
  const users = await getUsersForStaffTracker({
    req,
    filterSearchQuery,
    filterResourceIds,
    filterResourceTypes,
    filterExcludeDescendents,
    filterExcludeRooms,
    filterExcludeSupervision,
    page,
    limit,
  });
  let clients_resources = await turn_into_resources(req, users);
  return clients_resources;
};
const get_connected_events = (
  id_specific,
  events,
  start,
  end,
  bol_rec = true,
) => {
  if (bol_rec) {
    events['rows'] = events.rows.flatMap((e) => {
      let dataValues = e.dataValues;
      const duration = moment(dataValues.end).diff(dataValues.start, 'seconds');
      const days = [];
      const ff = get_dates_recurring2({
        query_start: start,
        query_end: end,
        duration: duration,
        days: days,
        bysetpos: dataValues.bysetpos,
        frequency: dataValues.frequency,
        interval: dataValues.interval,
        start: dataValues.start,
        end: dataValues.end,
        startRecur: dataValues.startRecur,
        endRecur: dataValues.endRecur,
      });
      return ff.map((r) => {
        return { ...e, dataValues: { ...dataValues, start: r[0], end: r[1] } };
      });
    });
  }

  let event_obj = {};

  let t = events['rows']
    .map((e) => {
      event_obj[e.dataValues.id] = {};
      return {
        id: e.dataValues.id,
        start: e.dataValues.start,
        end: e.dataValues.end,
        users: e.users.map((r) => r.id),
      };
    })
    .sort((A, B) => moment(A.start) - moment(B.start));

  t.filter((e) => id_specific == '' || id_specific == e.id).map((e, index) => {
    const true_id1 = e.id;
    const a = moment(e.start);
    const b = moment(e.end);
    for (let index2 = 0; index2 < t.length; index2++) {
      const true_id2 = t[index2].id;
      const r = t[index2];
      const c = moment(r.start);
      const d = moment(r.end);
      if (c > b) {
        break;
      }
      if (true_id1 != true_id2 && index2 > index) {
        const lo = Math.max(a, c);
        const hi = Math.min(b, d);
        if (lo < hi && intersect_arrays(r.users, e.users).length > 0) {
          const date = a.format('MM-DD-YYYY');
          const duration = hi - lo;
          if (event_obj[e.id][date]) {
            event_obj[e.id][date].push([r.id, r.start, r.end, duration]);
          } else {
            event_obj[e.id] = {
              ...event_obj[e.id],
              [date]: [[r.id, r.start, r.end, duration]],
            };
          }
          if (event_obj[r.id][date]) {
            event_obj[r.id][date].push([e.id, e.start, e.end, duration]);
          } else {
            event_obj[r.id] = {
              ...event_obj[r.id],
              [date]: [[e.id, e.start, e.end, duration]],
            };
          }
        }
      }
    }
  });
  Object.entries(event_obj).map((e) => {
    const [key, value] = e;
    if (Object.keys(value).length === 0) {
      delete event_obj[key];
    }
  });
  return event_obj;
};
const get_dates_recurring2 = (obj) => {
  const interval = obj.interval;
  const days = obj.days;
  const duration = obj.duration;
  obj.startRecur;
  let dates = [];
  let dates2 = [];

  let end_date = moment(
    `${moment(Math.min(new Date(obj.endRecur), new Date(obj.query_end)))
      .utcOffset(0)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .format('MM/DD/YYYY')} ${moment(obj.end).format('HH:mm:ss')}`,
    'MM/DD/YYYY HH:mm:ss',
  );
  let start_date = moment(
    `${moment(Math.max(new Date(obj.startRecur), new Date(obj.query_start)))
      .utcOffset(0)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .format('MM/DD/YYYY')} ${moment(obj.start).format('HH:mm:ss')}`,
    'MM/DD/YYYY HH:mm:ss',
  );

  const formattedStart = moment(obj?.start)?.format();
  const startNow = moment2(formattedStart)
    .set(
      'date',
      moment(
        Math.max(new Date(obj.startRecur), new Date(obj.query_start)),
      ).date(),
    )
    .set(
      'month',
      moment(
        Math.max(new Date(obj.startRecur), new Date(obj.query_start)),
      ).month(),
    )
    .set(
      'year',
      moment(
        Math.max(new Date(obj.startRecur), new Date(obj.query_start)),
      ).year(),
    )
    .toDate();

  const frequency = obj.frequency ? obj.frequency.toUpperCase() : 'WEEKLY';
  if (startNow instanceof Date && !isNaN(startNow)) {
    let rruleObject = {
      freq: rule_RRule.RRule[frequency],
      interval: Number(obj.interval) || 1,
      byweekday: days.map((t) => (t == 0 ? 6 : t - 1)),
      dtstart: startNow,
      until: new Date(obj.endRecur),
    };
    if (rruleObject.interval > 1) {
      const startNowForDifferentInterval = moment
        .utc(
          obj.startRecur + ' ' + moment.utc(obj.start).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .format();
      rruleObject.dtstart = new Date(startNowForDifferentInterval);
    }
    let rule_start_arr = [];
    if (frequency == 'MONTHLY') {
      rruleObject = {
        ...rruleObject,
        bysetpos: obj.bysetpos ? Number(obj.bysetpos) : 1,
      };
      rruleObject.byweekday.forEach((day) => {
        let rule = new rule_RRule.RRule({ ...rruleObject, byweekday: [day] });
        rule_start_arr = rule_start_arr.concat(
          rule.between(
            start_date.startOf('day').toDate(),
            end_date.startOf('day').toDate(),
          ),
        );
      });
    } else {
      let rule_start = new rule_RRule.RRule(rruleObject);
      rule_start_arr = rule_start.between(
        start_date.startOf('day').toDate(),
        end_date.startOf('day').toDate(),
      );
    }
    let rule_end_arr = rule_start_arr.map((e) => {
      const formattedDate = moment(e).format();
      return moment(formattedDate).add(obj.duration, 'seconds').toDate();
    });
    rule_start_arr.map((start, index) => {
      dates2.push([start, rule_end_arr[index]]);
    });
    return dates2;
  }
};
const findIntersection = (A, B) => {
  const res = [];
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    let [a, b, e] = A[i];
    let [c, d, f] = B[j];
    const lo = Math.max(a, c);
    const hi = Math.min(b, d);
    if (e == 0) {
      e = f;
    }
    if (f == 0) {
      f = e;
    }
    if (lo < hi) {
      res.push([new Date(Math.max(a, c)), new Date(Math.min(b, d)), e, f]);
    }
    if (b < d) {
      i++;
    } else {
      j++;
    }
  }
  return res;
};

/* Routes */
const router = require('../utils/createRouter')();

router.post('/', async (req, res) => {
  await ClientsService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  const payload = true;
  res.status(200).send(payload);
});
// TODO Need?
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    await ClientsService.update(req.body.data, req.body.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);
// TODO Need?
router.delete(
  '/eventDelete',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    // await EventsDBApi.RemoveEventsNow(
    //   {
    //     start: req.query.start,
    //     end: req.query.end,
    //     password: req.query.password,
    //   },
    //   req.currentUser,
    // );
    const payload = true;
    res.status(200).send(payload);
  }),
);
// TODO Need?
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    await ClientsService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);
// TODO Need?
router.get(
  '/external-events',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    let resourceIds = [];
    const turn_into_external_resources = (resources, type) => {
      return resources.rows.map((resource) => {
        resourceIds = resource.employee1
          .map((emp) => {
            return emp.dataValues.id;
          })
          .concat(
            resource.client1.map((client) => {
              return client.dataValues.id;
            }),
            [resource.location1Id],
            [resource.activity1Id],
          );
        resource = resource.dataValues;
        return {
          id: resource.id,
          title: 'bloop',
          start: resource.start1,
          end: resource.end1,
          resourceIds: resourceIds,
          calendar: 'Personal',
        };
      });
    };

    const clients = await ClientsDBApi.findAll(req.query);
    const employees = await EmployeesDBApi.findAll(req.query);
    const activities = await ActivitiesDBApi.findAll(req.query);
    const locations = await LocationsDBApi.findAll(req.query);
    let clients_resources = turn_into_external_events(clients, 'Clients');
    let employees_resources = turn_into_external_events(employees, 'Employees');
    let locations_resources = turn_into_external_events(locations, 'Locations');
    let activities_resources = turn_into_external_events(
      activities,
      'Activities',
    );

    let events_all = turn_into_events(events, 'Events');
    res.status(200).send(events_all);
  }),
);
// TODO remove after /api/statistics is implemented
router.post(
  '/statistics',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    // let events = req.body.events
    //   .filter((event) => !event.reason_canceled)
    //   .map((t) => ({
    //     ...t,
    //     users: [...t.actual_users],
    //     start: t.start_real,
    //   }));
    let users = req.body.resources.map((t) => ({
      ...t,
      roles2: t.roles,
      roles: t.roles.map((role) => ({ dataValues: { name: role } })),
    }));
    let total_arr = [];
    let total_total = false;

    if (req.body.totalType == 'total') {
      total_total = true;
    } else {
      const totalType = await TotaltypesDBApi.findBy({
        id: req.body.totalType,
      });
      total_arr = totalType?.activities.map((r) => r.dataValues.id);
    }

    if (req.query.start && req.query.start.includes(' ')) {
      req.query.start = req.query.start.replace(' ', '+');
    }

    if (req.query.end && req.query.end.includes(' ')) {
      req.query.end = req.query.end.replace(' ', '+');
    }

    let people = users.filter((t) => t.roles2.includes('Resource'));
    let people2 = users.filter((t) => t.roles2.includes('Resource'));

    let people3 = users.filter((t) => t.roles2.includes('Person'));
    const personReal = req.body.people.split('|');
    let people4 = users.filter((t) => personReal.includes(t.id));
    let activities = users.filter((t) => t.roles2.includes('Activity'));
    let canceled_events = [];

    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

    eventFunction = (events) => {
      events = events.rows
        .filter(
          (e) =>
            e.dataValues.start &&
            e.dataValues.end &&
            moment(e.dataValues.end).diff(moment(e.dataValues.start)) > 0 &&
            moment(e.dataValues.end).diff(moment(e.dataValues.start), 'days') <
              1,
        )
        .flatMap((e) => {
          let dataValues = e.dataValues;
          const duration = moment(dataValues.end).diff(
            dataValues.start,
            'seconds',
          );
          //CHANGE DAYS HERE
          //const days = dataValues.daysOfWeek.map((d) => convert_weekday(d.id));
          const days = getDays(dataValues);
          const event = dataValues;
          let start_real = moment
            .utc(new Date(req.query.start))
            .subtract(req.body.offset, 'minutes')
            .toDate();
          let end_real = moment
            .utc(new Date(req.query.end))
            .subtract(req.body.offset, 'minutes')
            .toDate();

          const startNow = moment
            .utc(
              event.startRecur + ' ' + moment.utc(event.start).subtract(req.body.offset, 'minutes').format('HH:mm'),
              'YYYY-MM-DD HH:mm',
            )
            .format();
          const endNow = moment.utc(event.endRecur).format('YYYY-MM-DD');
          const frequency = event.frequency
            ? event.frequency.toUpperCase()
            : 'WEEKLY';
          let rruleObject = {
            interval: event.interval || 1,
            byweekday: [...new Set([...days.map((t) => (t == 0 ? 6 : t - 1))])],
            freq: rule_RRule.RRule[frequency],
            dtstart: moment.utc(startNow).toDate(),
            until: moment.utc(endNow).subtract(1, 'seconds').toDate(),
          };
          if (frequency == 'MONTHLY') {
            rruleObject = {
              ...rruleObject,
              bysetpos: event.bysetpos ? Number(event.bysetpos) : 1,
            };
          }
          let rule2 = [];
          if (frequency == 'MONTHLY') {
            rruleObject.byweekday.forEach((day) => {
              let rule = new rule_RRule.RRule({
                ...rruleObject,
                byweekday: [day],
              });
              rule2 = rule2.concat(rule.between(start_real, end_real));
            });
          } else {
            let rule = new rule_RRule.RRule(rruleObject);
            rule2 = rule.between(start_real, end_real);
          }

          ff = rule2.map((t) => [
            t,
            moment(t).add(duration, 'seconds').toDate(),
          ]);
          return (
            ff &&
            ff
              .filter((p) => {
                if (!e.isCancelled) {
                  return true;
                } else {
                  return false;
                }
              })
              .map((r) => {
                return {
                  ...e,
                  start: r[0],
                  end: r[1],
                };
              })
          );
        });

      // TODO New
      // const res_res = (res1, res2, type2) => {
      //   let resourceObject = {};
      //   res2.forEach(p => {
      //     resourceObject[p.id] = 0
      //   })
      //   const initialObj = {
      //     total: 0,
      //     tally: {},
      //     [type2]: resourceObject,
      //   }
      //   let result = {};
      //   res1.forEach((e) => {
      //     result[e.id] = {
      //       ...initialObj,
      //       roles: e.roles.map((p) => p.dataValues.name),
      //       name: shorten_name(getFullName(e)),
      //     };
      //   });
      //   return result;
      // };
      // OLD
      const res_res = (res1, res2, type2) => {
        let result = {};
        res1.map((e) => {
          result = {
            ...result,
            [e.id]: {
              total: 0,
              eventStartEndLine: new Array(),
              tally: {},
              efficiency: 0,
              productivity: 0,
              productiveDuration: 0,
              shouldBeProductiveDuration: 0,
              overAllTotal: 0,
              converted: 0,
              totalConvertedDuration: 0,
              //roles: e.roles.map((p) => p.dataValues.name),
              name: shorten_name(getFullName(e)),
              activitiesEventStartEndLines: {},
              [type2]: {},
            },
          };
          // res2.map((p) => {
          //   result = {
          //     ...result,
          //     [e.id]: {
          //       ...result[e.id],
          //       [type2]: { ...result[e.id][type2], [p.id]: 0 },
          //     },
          //   };
          // });
        });
        return result;
      };

      let emp = res_res(people, activities, 'activities');
      let emp_canceled = emp;

      let tot = activities.map((ac) => ({ ...ac, [ac.id]: 0 }));

      if (canceled_events && canceled_events.length) {
        canceled_events.forEach((e) => {
          const dataValues = e.event_obj.dataValues;
          const users = dataValues.users.map((u) => u.id);
          const duration = dataValues.end - dataValues.start;

          const activity = filterUsersFromEvents(
            e.event_obj.users,
            roleHierarchy,
            ['Activity'],
          )[0]?.id;

          users.map((id) => {
            if (emp[id]) {
              emp_canceled[id].total += duration;
              emp_canceled[id].activities[activity] += duration;
            }
          });
        });
      }
      //const parsedEvents = JSON.parse(JSON.stringify(events));
      const parsedEvents = events;
      for (const eventData of parsedEvents) {
        let eventCreatedDate = moment.utc(eventData.dataValues.start).startOf('day').toDate();
        let createdInDaylightSaving = isDateInDST(moment.utc(eventCreatedDate).toDate());
        let currentDateInDaylightSaving = isDateInDST(moment.utc(eventData.start).toDate());
        const eventTimezone = eventData.dataValues.timezone ?? 'America/Los_Angeles';
        let eventsTZUsesDLS = timezoneUsesDLS(eventTimezone);

        if (eventsTZUsesDLS){
          if (currentDateInDaylightSaving !== createdInDaylightSaving) {
            if (currentDateInDaylightSaving) {
              eventData.start = moment.utc(eventData.start).add(-1, 'hours').toDate();
              eventData.end = moment.utc(eventData.end).add(-1, 'hours').toDate();
            } else {
              eventData.start = moment.utc(eventData.start).add(1, 'hours').toDate();
              eventData.end = moment.utc(eventData.end).add(1, 'hours').toDate();
            }
          }
        }
        const duration = eventData.duration
          ? eventData.duration.seconds * 1000
          : eventData.end - eventData.start;
        const convertedDuration =
          eventData.dataValues.converted &&
          eventData.dataValues.endActual &&
          eventData.dataValues.startActual
            ? eventData.dataValues.endActual - eventData.dataValues.startActual
            : duration;
        let startUnixEpoch = new Date(eventData.start).getTime();
        let endUnixEpoch = new Date(eventData.end).getTime();
        let activity = filterUsersFromEvents(eventData.users, roleHierarchy, [
          'Activity',
        ])[0];
        if (activity) {
          const activityId = activity.id;
          tot[activityId] += duration;

          const timeNow = moment2(eventData.start);
          const remainder = timeNow.minute() % 30;
          const minutes = Math.ceil((duration / 60000 + remainder) / 30);

          for (const user of eventData.users) {
            const id = user.id;
            if (!emp[id]) continue;
            if (minutes > 0) {
              for (let index = 0; index < minutes; index++) {
                const dst1 = moment2(eventData.dataValues.start).isDST();
                const dst2 = moment2(eventData.start).isDST();
                let dat = 0;
                if (dst1 != dst2) {
                  if (dst1) {
                    dat = 1;
                  } else {
                    dat = -1;
                  }
                }
                const udpatedTimeNow = moment(timeNow)
                  .subtract(remainder, 'minutes')
                  .add(req.body.offset * 1, 'minutes')
                  .add(dat, 'hours')
                  .add(index * 30, 'minutes')
                  .valueOf();

                if (emp[id].tally[udpatedTimeNow]) {
                  emp[id].tally[udpatedTimeNow]++;
                } else {
                  emp[id].tally[udpatedTimeNow] = 1;
                }
              }
            }
          }
          filterUsersFromEvents(eventData.users, roleHierarchy, [
            'Resource',
          ]).forEach((y) => {
            const id = y.id;
            if (emp[id]) {
              if (eventData.activity0.productivityInclude) {
                emp[id].productiveDuration += duration;
              }

              if (!eventData.activity0.productivityExclude) {
                emp[id].shouldBeProductiveDuration += duration;
              }

              if (total_total || total_arr?.includes(activityId)) {
                emp[id].total += duration;
                emp[id].eventStartEndLine.push([startUnixEpoch, endUnixEpoch]);
              }

              // I set this overAllTotal for calculating the efficiency
              // because while it comes to calculating efficiency or productivity
              // we shouldn't calculate it for only selected totalType (if it is not all)
              // We need to collect all activities durations for calculating the efficiency
              emp[id].overAllTotal += duration;
              // I set 100 just in case if this user doesn't have availability
              // then it must be 100 as it has event
              emp[id].efficiency = 100;

              // We will temporarily sum up all converted durations here
              // totalConvertedDuration field will be deleted before sending to client
              emp[id].totalConvertedDuration += convertedDuration;

              if (emp[id].activities[activityId]) {
                emp[id].activities[activityId] += duration;
                emp[id].activitiesEventStartEndLines[activityId].push([
                  startUnixEpoch,
                  endUnixEpoch,
                ]);
              } else {
                emp[id].activities = {
                  ...emp[id].activities,
                  [activityId]: duration,
                };
                emp[id].activitiesEventStartEndLines = {
                  ...emp[id].activitiesEventStartEndLines,
                  [activityId]: new Array([startUnixEpoch, endUnixEpoch]),
                };
              }
            }
          });
        }
      }
      return {
        users: emp,
        total: tot,
        // users_canceled: emp_canceled,
      };
    };

    let h1 = {
      users: [],
      total: {},
      // users_canceled: emp_canceled,
    };
    let h2 = {
      users: [],
      total: {},
      // users_canceled: emp_canceled,
    };
    if (req.body.level >= 4) {
      let events = await getEventsStats({
        ...req,
        ['query']: {
          ...req['query'],
          people: people3.map((t) => t.id).join('|'),
          //people:req.body.people
        },
      });

      h1 = eventFunction(events);

      let startForAvailabilty = moment(req['query'].start).toDate();
      let endForAvailability = moment(req['query'].end).toDate();
      let companyId = req.currentUser.companyId;
      let users = people3.map((t) => t.id);
      let totalMinuteNumber = moment(req['query'].end).diff(
        moment(req['query'].start),
        'minutes',
      );

      const availabilitiesListData = await getAvailabilitiesForDateRange(
        startForAvailabilty,
        endForAvailability,
        companyId,
        [],
        [],
        [],
        users,
        true,
      );

      let availabilitiesForDateRange = availabilitiesListData.data;
      let userList = new Map();

      //loop thotigh availabilities for calculating the efficiency
      for (let j = 0; j < availabilitiesForDateRange.count; j++) {
        let availability = availabilitiesForDateRange.rows[j];
        // generate the rule of event
        const startRule = moment
          .utc(
            availability.startRange +
              ' ' +
              moment.utc(availability.startTime).format('HH:mm'),
            'YYYY-MM-DD HH:mm',
          )
          .toDate();
        const endRule = new Date(
          moment.utc(availability.endRange).format('YYYY-MM-DD'),
        );

        let start = new Date(startRule);
        let end = new Date(endRule);

        // if the range is so big trim it for 2 weeks (atmost)
        const oneWeekBefore = moment
          .utc(
            startForAvailabilty.toISOString().split('T')[0] +
              ' ' +
              moment.utc(availability.startTime).format('HH:mm'),
            'YYYY-MM-DD HH:mm',
          )
          .add(-7, 'days')
          .toDate();
        const oneWeekLater = moment
          .utc(endForAvailability.toISOString().split('T')[0], 'YYYY-MM-DD')
          .add(7, 'days')
          .toDate();

        if (start < oneWeekBefore) {
          start = oneWeekBefore;
        }

        if (end > oneWeekLater) {
          end = oneWeekLater;
        }

        // set the weekdays of rule
        const weekDaysOfAvailability = getDays(availability).map((d) =>
          d == 0 ? 6 : d - 1,
        );
        const interval = availability?.interval || 1;
        const freq = availability?.frequency?.toUpperCase() ?? 'WEEKLY';

        // For simple recurrence cases dtstart can be startCalendar or av.startRange (little optimization trick)
        const dtstart =
          freq === 'WEEKLY' && interval === 1
            ? moment.max(moment(start), moment(startRule)).toDate()
            : startRule;

        // For simple recurrence cases until can be endCalendar or av.endRange (little optimization trick)
        const until =
          freq === 'WEEKLY' && interval === 1
            ? moment.min(moment(end), moment(endRule)).toDate()
            : endRule;

        // get all recurring availablities
        let allAvailabilitiesWithRule = [];
        const rruleObject = {
          interval,
          freq: rule_RRule.RRule[freq],
          wkst: rule_RRule.RRule.SU,
          byweekday: weekDaysOfAvailability,
          dtstart,
          until,
        };
        if (freq == 'MONTHLY') {
          const bysetpos = availability.bysetpos
            ? Number(availability.bysetpos)
            : 1;
          rruleObject.byweekday.forEach((day) => {
            const rule = new rule_RRule.RRule({
              ...rruleObject,
              byweekday: [day],
              bysetpos,
            });
            allAvailabilitiesWithRule = [
              ...allAvailabilitiesWithRule,
              ...rule.between(start, end, true),
            ];
          });
        } else {
          const rule = new rule_RRule.RRule(rruleObject);
          allAvailabilitiesWithRule = rule.between(start, end, true);
        }

        for (let p = 0; p < allAvailabilitiesWithRule.length; p++) {
          let duration = calculateMinutesBetweenTimesIgnoreDates(
            availability.endTime,
            availability.startTime,
          );

          let isItValidAvailability = false;
          let isTheEndingInside = false;
          let isTheBeginningInside = false;
          //check if the event lies in our range
          let s;
          let e;
          s = allAvailabilitiesWithRule[p];
          e = moment
            .utc(allAvailabilitiesWithRule[p])
            .add(duration, 'minutes')
            .toDate();

          let availabilityCreatedDate = moment
            .utc(availability.startTime)
            .startOf('day')
            .toDate();

          let createdInDaylightSaving = moment(availabilityCreatedDate).isDST();
          let currentDateInDaylightSaving = moment(s).isDST();

          if (currentDateInDaylightSaving !== createdInDaylightSaving) {
            if (currentDateInDaylightSaving) {
              s = moment.utc(s).add(-1, 'hours').toDate();
              e = moment.utc(e).add(-1, 'hours').toDate();
            } else {
              s = moment.utc(s).add(1, 'hours').toDate();
              e = moment.utc(e).add(1, 'hours').toDate();
            }
          }

          if (s >= startForAvailabilty && s < endForAvailability) {
            isItValidAvailability = true;
            isTheBeginningInside = true;
            if (e <= endForAvailability) {
              isTheEndingInside = true;
            } else {
              duration = moment
                .utc(endForAvailability)
                .diff(moment.utc(s), 'minutes');
            }
          }

          if (
            e > startForAvailabilty &&
            e <= endForAvailability &&
            !isTheBeginningInside
          ) {
            isTheEndingInside = true;
            isItValidAvailability = true;
            duration = moment
              .utc(e)
              .diff(moment.utc(startForAvailabilty), 'minutes');
          }

          //if it lies increase our i
          if (isItValidAvailability) {
            if (!userList.has(availability.user.id)) {
              userList.set(availability.user.id, {
                availableLine: [],
                notavailableLine: [],
              });
            }
            let userAvailabilityInfo = userList.get(availability.user.id);
            // if the only ending in range
            if (!isTheBeginningInside) {
              //fill the user available duration
              if (availability.available === true) {
                userAvailabilityInfo.availableLine.push([1, duration]);
              } else {
                userAvailabilityInfo.notavailableLine.push([1, duration]);
              }
              continue;
            }

            // if the only beginning in range
            if (!isTheEndingInside) {
              //fill the user available duration
              if (availability.available === true) {
                userAvailabilityInfo.availableLine.push([
                  totalMinuteNumber + 1 - duration,
                  totalMinuteNumber,
                ]);
              } else {
                userAvailabilityInfo.notavailableLine.push([
                  totalMinuteNumber + 1 - duration,
                  totalMinuteNumber,
                ]);
              }
            }

            // if fully inside
            let distanceOfStartingWithBeginning = moment
              .utc(s)
              .diff(moment.utc(startForAvailabilty), 'minutes');

            if (availability.available === true) {
              userAvailabilityInfo.availableLine.push([
                distanceOfStartingWithBeginning + 1,
                distanceOfStartingWithBeginning + duration,
              ]);
            } else {
              userAvailabilityInfo.notavailableLine.push([
                distanceOfStartingWithBeginning + 1,
                distanceOfStartingWithBeginning + duration,
              ]);
            }
          }
        }
      }

      for (const [id, userAvailabilityInfo] of userList) {
        if (h1.users[id]) {
          let totalActiveTime = h1.users[id].overAllTotal / 60000;
          if (totalActiveTime === 0) {
            continue;
          }
          let totalAvailableTime = calculateUnionLengthOfIntervals(
            findIntervalsNotInArray2(
              userAvailabilityInfo.availableLine,
              userAvailabilityInfo.notavailableLine,
            ),
            false,
          );

          h1.users[id].efficiency = Number(
            ((totalActiveTime / totalAvailableTime) * 100).toFixed(2),
          );
          if (h1.users[id].efficiency > 100) {
            h1.users[id].efficiency = 100;
          }
        }
      }

      for (let m = 0; m < users.length; m++) {
        let currentID = users[m];
        if (h1.users[currentID]) {
          if (h1.users[currentID].shouldBeProductiveDuration > 0) {
            h1.users[currentID].productivity = Number(
              (
                (h1.users[currentID].productiveDuration /
                  h1.users[currentID].shouldBeProductiveDuration) *
                100
              ).toFixed(2),
            );
          }
        }
      }

      // Iterate through all resources to calculate converted percentage
      // and total duration, and calculate the duration for every activity
      for (const user of Object.values(h1.users)) {
        user.converted =
          // Check to avoid divide by zero case
          user.overAllTotal > 0
            ? Number(
                // Making sure to not exceed 100%
                Math.min(
                  (user.totalConvertedDuration / user.overAllTotal) * 100,
                  100,
                ).toFixed(2),
              )
            : 0;

        // We don't need totalConvertedDuration to be included in response
        delete user.totalConvertedDuration;

        // Calculate the total
        user.total = calculateUnionLengthOfIntervals(
          user.eventStartEndLine,
          true,
        );

        // Calculate total for every activity
        for (let key in user.activitiesEventStartEndLines) {
          if (
            user.activitiesEventStartEndLines[key].length > 1 &&
            key in user.activities
          ) {
            user.activities[key] = calculateUnionLengthOfIntervals(
              user.activitiesEventStartEndLines[key],
              true,
            );
          }
        }

        // We don't need activitiesEventStartEndLines and eventStartEndLine to be included in response
        delete user.activitiesEventStartEndLines;
        delete user.eventStartEndLine;
      }
    }

    res.status(200).send({ capacity: h1, individual: h1 });
  }),
);

router.get(
  '/connected_events',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const events = await getEvents(req);
    const event_obj = get_connected_events(
      req.query.id_specific,
      events,
      req.query.start,
      req.query.end,
    );

    res.status(200).send(event_obj);
  }),
);
// TODO Need?
router.get(
  '/connected_events2',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

    const eventpair_payload = await EventpairDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });
    let events = await getEvents(req);
    const event_main_id = req.query.event_main_id;
    const event_main = events.rows.find((e) => e.id == event_main_id);
    const event_main_users = event_main
      ? event_main.dataValues.users.map((u) => u.id)
      : [];
    const start = req.query.start;
    const end = req.query.end;
    const start_real = new Date(req.query.start_real);
    const end_real = new Date(req.query.end_real);

    events['rows'] = events.rows.flatMap((e) => {
      let dataValues = e.dataValues;
      const duration = moment(dataValues.end).diff(dataValues.start, 'seconds');
      const days = getDays(dataValues);
      const ff = get_dates_recurring2({
        query_start: start,
        query_end: end,
        duration: duration,
        days: days,
        bysetpos: dataValues.bysetpos,
        frequency: dataValues.frequency,
        interval: dataValues.interval,
        start: dataValues.start,
        end: dataValues.end,
        startRecur: dataValues.startRecur,
        endRecur: dataValues.endRecur,
      });
      return ff.map((r) => {
        return { ...e, dataValues: { ...dataValues, start: r[0], end: r[1] } };
      });
    });
    let connected_events = [];

    eventpair_payload.rows.map((e) => {
      const activity1 = e.activity1Id;
      const activity2 = e.activity2Id;
      let activity_main = activity1;
      let activity_search = activity2;
      let event_primary = [];
      let main_type = 'primary';
      let bol = false;
      const link_users_primary = e.roles1.map((role) => role.dataValues.name);
      let link_users_main = [...link_users_primary];

      if (event_main_users.includes(activity1)) {
        event_primary = [];
        bol = true;
      } else if (event_main_users.includes(activity2)) {
        main_type = 'secondary';
        activity_main = activity2;
        activity_search = activity1;
        bol = true;
      }
      if (bol) {
        const users = filterUsersFromEvents(
          event_main.dataValues.users,
          roleHierarchy,
          link_users_main,
        ).map((u) => u.id);
        events.rows.map((event) => {
          event_users = event.dataValues.users.map((u) => u.id);
          if (event_users.includes(activity_search)) {
            if (intersect_arrays(users, event_users).length > 0) {
              const lo = Math.max(start_real, new Date(event.dataValues.start));
              const hi = Math.min(end_real, new Date(event.dataValues.end));

              if (lo < hi) {
                connected_events.push(event.dataValues.id);
              }
            }
          }
        });
      }
    });
    res.status(200).send(connected_events);
  }),
);

router.get(
  '/get_distance_matrix',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const distancematrix = await DistancematrixDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });
    let distancematrix_obj = {};
    distancematrix.rows.map((e) => {
      const address1 = e.dataValues.address1;
      const address2 = e.dataValues.address2;
      const duration = e.dataValues.duration;
      const distance = e.dataValues.distance;
      if (distancematrix_obj[address1]) {
        distancematrix_obj[address1] = {
          ...distancematrix_obj[address1],
          [address2]: [distance, duration],
        };
      } else {
        distancematrix_obj = {
          ...distancematrix_obj,
          [address1]: { [address2]: [distance, duration] },
        };
      }
      if (distancematrix_obj[address2]) {
        distancematrix_obj[address2] = {
          ...distancematrix_obj[address2],
          [address1]: [distance, duration],
        };
      } else {
        distancematrix_obj = {
          ...distancematrix_obj,
          [address2]: { [address1]: [distance, duration] },
        };
      }
    });
    res.status(200).send(distancematrix_obj);
  }),
);
// TODO Need?
router.get(
  '/event_pairs',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const eventpair_payload = await EventpairDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });

    const eventpair_arr = eventpair_payload.rows.map((e) => {
      return {
        activityName1: e.activity1.dataValues.firstName,
        activityName2: getFullName(e.activity2.dataValues),
        activity1: e.activity1Id,
        activity2: e.activity2Id,
      };
    });

    res.status(200).send(eventpair_arr);
  }),
);
// TODO Need?
router.get(
  '/distance',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const client = new Client({});

    client
      .distancematrix({
        params: {
          //locations: [{ lat: 45, lng: -110 },{ lat: 48, lng: -115 }],
          // origins:[{lat: 45, lng: -110}],
          // destinations:[{lat: 48, lng: -115 }],
          origins: ['827 NW 64th Ter Gainesville'],
          destinations: ['Florida 938 SW 82nd Ter Gainesville, Florida'],
          key: 'AIzaSyDCObA9hIjPPHlcRHUsE0nhv7y9LQwI8ZQ',
        },
        timeout: 1000, // milliseconds
      })
      .then((r) => {})
      .catch((e) => {});
    const distance = [];
    res.status(200).send(distance);
  }),
);

router.get(
  '/frontend_roles_all',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    const roleNames = Object.keys(roleHierarchy);

    res.status(200).send(roleNames);
  }),
);

router.get(
  '/branches',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const new_req = { ...req };
    delete new_req.query['branches'];
    let children = {};

    const req_new = _.cloneDeep(req);
    delete req_new.query.branches;
    const branches = await getBranches(req_new);
    const branchTypes = await getBranchType(req);
    let branchTypeHierarchy = {};
    branchTypes.rows.map((b) => {
      branchTypeHierarchy = { ...branchTypeHierarchy, [b.id]: 1 };
    });
    const findNum = (id, id2) => {
      const parent = branchTypes.rows.find((b) => b.id == id2.parentId);
      if (id2 && parent) {
        branchTypeHierarchy = {
          ...branchTypeHierarchy,
          [id]: branchTypeHierarchy[id] + 1,
        };
        findNum(id, parent.dataValues);
      }
    };
    branchTypes.rows.map((b) => {
      findNum(b.id, b.dataValues);
    });
    const branchTypeHierarchy_keys = Object.keys(branchTypeHierarchy);
    let branchTypesUser = req.currentUser.roles.map((t) => t.branchTypeId);
    let branchTypeRank = 1000;
    branchTypesUser.forEach((p) => {
      if (
        branchTypeHierarchy_keys.includes(p) &&
        branchTypeHierarchy[p] < branchTypeRank
      ) {
        branchTypeRank = branchTypeHierarchy[p];
      }
    });
    Object.keys(branchTypeHierarchy);

    const sortable = Object.entries(branchTypeHierarchy)
      .sort(([, a], [, b]) => a - b)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    const actual_branch = req_new.currentUser.branches.map((t) => t.id);
    let ancBranches = [];
    if (branchTypeRank == 1000) {
      ancBranches = await BranchesDBApi.getDescendentBranches({
        branchIds: actual_branch.join('|'),
      });
    } else {
      ancBranches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: actual_branch.join('|'),
      });
    }

    const userBranches = req.currentUser.branches.map((branch) => branch.id);
    let branchesAll = [];
    let keyCollector = [];
    branches.rows.forEach((bra) => {
      if (
        ancBranches.includes(bra.id) &&
        (branchTypeRank == 1000 ||
          branchTypeHierarchy[bra.branchTypeId] >= branchTypeRank)
      ) {
        keyCollector.push(bra.id);
      }
    });
    ancBranches = await BranchesDBApi.getDescendentBranches({
      branchIds: keyCollector.join('|'),
    });
    branches.rows.forEach((bra) => {
      if (
        ancBranches.includes(bra.id) &&
        (branchTypeRank == 1000 ||
          branchTypeHierarchy[bra.branchTypeId] >= branchTypeRank)
      ) {
        branchesAll = branchesAll.concat([bra.id]);
      }
    });
    let final_branches = {};
    Object.entries(sortable).map((t) => {
      const [key, value] = t;
      const branchType = branchTypes.rows.find((b) => b.id == key);
      final_branches = {
        ...final_branches,
        [branchType.name]: {
          label: branchType.name,
          value: branchType.name,
          bol: branchType.bol,
          options: [],
        },
      };
    });

    final_branches = {
      ...final_branches,
      ['']: { label: '', value: '', options: [] },
    };
    branches.rows.forEach((e) => {
      if (branchesAll.includes(e.id)) {
        const branchType = e.branchType ? e.branchType.name : '';

        const t = branchTypes.rows.find((b) => b.name == branchType);
        const obj = {
          id: e.id,
          value: e.id,
          label: e.name,
          timezone: e.timezone,
          replyToEmail: e.replyToEmail,
          bol: t?.bol,
          level: branchTypeHierarchy[t?.id],
          parentId: e?.parent?.id ?? null,
          inactive: e?.inactive ?? false,
        };
        final_branches[branchType].options.push(obj);
      }
    });
    const keys = Object.keys(final_branches);

    //const diff = 1;
    const diff = keys.length - 6;
    if (diff >= 0) {
      for (let index = 0; index < diff; index++) {
        const element = keys[index];
        delete final_branches[element];
      }
    }

    res.status(200).send(Object.values(final_branches));
  }),
);

router.get(
  '/subgroups',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    // Used to exclude the teams hierarchy from the response
    const excludeTeamsHierarchy = !!req.query.excludeTeamsHierarchy;

    const subgroups = await getSubgroups(req);

    /* Stop operation if request is aborted (Before query requests or functions) */
    if (req.aborted) return;

    const groupings = await getGroupings(req);

    /* Stop operation if request is aborted (Before query requests or functions) */
    if (req.aborted) return;

    let subgroups_obj = {};

    groupings.rows.map((e) => {
      const name = e.dataValues.name;
      subgroups_obj = { ...subgroups_obj, [name]: [] };
    });

    subgroups.rows
      .filter((e) => e.group)
      .map((e) => {
        const group_name = e.group.dataValues.name;
        const subgroup_name = e.dataValues.name;

        if (subgroups_obj[group_name]) {
          subgroups_obj = {
            ...subgroups_obj,
            [group_name]: [subgroup_name, ...subgroups_obj[group_name]],
          };
        }
      });

    const teams_hierarchy = !excludeTeamsHierarchy
      ? await get_team_hierarchy(req)
      : {};

    res
      .status(200)
      .send([
        subgroups_obj,
        ...(!excludeTeamsHierarchy ? [teams_hierarchy, teams_hierarchy] : []),
      ]);
  }),
);

router.get(
  '/teams-hierarchy',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {    
    const teamsHierarchy = await get_team_hierarchy(req);
    res.status(200).send(teamsHierarchy);
  }),
);

router.get(
  '/frontend_roles',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const roles = await getRoles(req);
    const roleHierarchy = get_role_hierarchy(roles);

    currentUserRoles = req.currentUser.roles.map((role) => role.name);
    const dataAccess = await getDataAccess(req);
    let role_names = roles.rows
      .filter(
        (e) =>
          e.parent &&
          (e.name == 'Location' ||
            e.name == 'Block' ||
            e.name == 'Activity' ||
            e.name == 'Employee' ||
            e.name == 'Client' ||
            e.name == 'Funder'),
      )
      .map((e) => {
        return {
          name: e.name,
          color: null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    if (dataAccess == 'User') {
      role_names = role_names.filter((e) => {
        for (let index = 0; index < currentUserRoles.length; index++) {
          const element = currentUserRoles[index];
          if (roleHierarchy[element].includes(e.name)) {
            return true;
          }
        }
        return false;
      });
    }
    res.status(200).send(role_names);
  }),
);

router.post(
  '/overbooking',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    let bol = [];
    let intersection_events = [];
    let overlapping_events = [];

    if (req.query.overbook == 'true') {
      let people = req.body.people;
      if (people == '') {
        people = 'lk';
      }
      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;

      let events = await getEventsStats({
        ...req,
        query: { ...req.query, people },
      });
      let people2 = [];

      people2 = [
        ...new Set(
          events.rows.flatMap((e) => e.dataValues.users.flatMap((t) => t.id)),
        ),
      ].join('|');

      // const employee_time_constraints = await getTimeconstraints({
      //   ...req,
      //   query: { ...req.query, user1:people },
      // });
      // totals = employee_time_constraints.rows.map(t=>t.dataValues.frequency == 'Total')

      const event_obj = req.body.obj;
      const event_id = event_obj.id;
      const event_start = event_obj.data.start;
      const event_end = event_obj.data.end;
      const event_frequency = event_obj.data.frequency;
      const event_startRecur = event_obj.data.startRecur;
      const event_endRecur = event_obj.data.endRecur;
      const event_interval = event_obj.data.interval;
      const event_daysOfWeek = event_obj.data.daysOfWeek; //array of ids
      const event_bysetpos = event_obj.data.bysetpos;
      const event_duration = moment(event_end).diff(event_start, 'seconds');
      const event_days = event_daysOfWeek.map((d) => convert_weekday(d));
      const events_recur = get_dates_recurring2({
        query_start: event_startRecur,
        query_end: event_endRecur,
        duration: event_duration,
        bysetpos: event_bysetpos,
        days: event_days,
        frequency: event_frequency,
        interval: event_interval,
        start: event_start,
        end: event_end,
        startRecur: event_startRecur,
        endRecur: event_endRecur,
      });
      const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
      let person_roles = [];
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        if (value.includes('Person')) {
          person_roles.push(key);
        }
      });
      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;

      events['rows'] = events.rows
        .filter((e) => !e.dataValues.isCancelled)
        .flatMap((e) => {
          let dataValues = e.dataValues;
          const duration = moment(dataValues.end).diff(
            dataValues.start,
            'seconds',
          );
          //CHANGE DAYS HERE
          //const days = dataValues.daysOfWeek.map((d) => convert_weekday(d.id));
          const days = getDays(dataValues);
          let ff = get_dates_recurring2({
            query_start: event_startRecur,
            query_end: event_endRecur,
            duration: duration,
            days: days,
            bysetpos: dataValues.bysetpos,
            frequency: dataValues.frequency,
            interval: dataValues.interval,
            start: dataValues.start,
            end: dataValues.end,
            startRecur: dataValues.startRecur,
            endRecur: dataValues.endRecur,
          });

          // Consider daylight saving
          const eventTimezone = dataValues.timezone ?? 'America/Los_Angeles';
          let eventsTZUsesDLS = timezoneUsesDLS(eventTimezone);
          let eventStartIsInDLS = isDateInDST(moment.utc(dataValues.start).toDate());
          if (eventsTZUsesDLS){
            if (!eventStartIsInDLS) {
              ff = ff.map(([start, end]) => {
                let subtractHour = isDateInDST(moment.utc(start).toDate()) ? 1 : 0;
                const newStart = moment(start).subtract(subtractHour, 'hours').toDate();
                const newEnd = moment(end).subtract(subtractHour, 'hours').toDate();
                return [newStart, newEnd];
              });
            }
            if (eventStartIsInDLS) {
              ff = ff.map(([start, end]) => {
                let addHour = !isDateInDST(moment.utc(start).toDate()) ? 1 : 0;
                const newStart = moment(start).add(addHour, 'hours').toDate();
                const newEnd = moment(end).add(addHour, 'hours').toDate();
                return [newStart, newEnd];
              });
            }
          }

          return (
            ff &&
            ff.map((r) => {
              return {
                ...e,
                dataValues: { ...dataValues, start: r[0], end: r[1] },
              };
            })
          );
        });

      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;

      let resources = [];

      const resource_type = ['users'];
      let data = people.split('|');

      if (Array.isArray(data)) {
        resources = resources.concat(data);
      }
      let resources_new = [];
      resources = resources.filter((res) => res != '[object Object]');

      // get not wanted roles
      let notWantedRoles = [];
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        if (
          !checkIntersection(['Person'], value)
          //checkIntersection(['Activity', 'Location', 'Block', 'Funder'], value)
        ) {
          notWantedRoles.push(key);
        }
      });

      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;

      // get resourceIds and related roles
      const idAndRolesOfResources = await UsersDBApi.findRolesOfUsers({
        ids: resources,
      });

      // get the resourceIds without notwanted roles
      for (let i = 0; i < idAndRolesOfResources.length; i++) {
        const rolesOfUser = idAndRolesOfResources[i].roles.map((r) => r.name);
        if (!checkIntersection(rolesOfUser, notWantedRoles)) {
          resources_new.push(idAndRolesOfResources[i].id);
        }
      }
      resources = [...resources_new];

      bol = events.rows.filter((event) => {
        if (!event) {
          return false;
        }
        if (event.dataValues.id == event_id) {
          return false;
        }
        let resources_in_event = resource_type.flatMap((res) =>
          event[res].map((emp) => emp.dataValues.id),
        );
        let intersection = resources.filter((res) =>
          resources_in_event.includes(res),
        );
        return intersection.length > 0;
      });

      bol = bol.map((event) => {
        let resources_in_event = resource_type.flatMap((res) =>
          event[res].map((emp) => emp.dataValues.id),
        );
        let intersection = resources.filter((res) =>
          resources_in_event.includes(res),
        );
        const users_now = event.dataValues.users
          .filter((t) => intersection.includes(t.id))
          .map((t) => getFullName(t.dataValues));
        let activity = event.dataValues.users
          .filter((t) => t.dataValues?.roles[0]?.dataValues?.name == 'Activity')
          .map((t) => t.dataValues?.firstName);

        let employee = event.dataValues.users
          .filter(
            (t) =>
              intersect_arrays(
                roleHierarchy[t.dataValues?.roles[0]?.dataValues?.name],
                ['Employee'],
              ).length != 0,
          )
          .map((t) => t?.dataValues?.firstName);
        let client = event.dataValues.users
          .filter(
            (t) =>
              intersect_arrays(
                roleHierarchy[t.dataValues?.roles[0]?.dataValues?.name],
                ['Client'],
              ).length != 0,
          )
          .map((t) => t?.dataValues?.firstName);
        event['dataValues'] = {
          ...event['dataValues'],
          activity: activity?.[0],
          inter: users_now,
          employee: employee.join(' - '),
          client: client.join(' - '),
        };
        return event;
      });

      const bol2 = _.cloneDeep(bol)
        .map((event) => {
          let resources_in_event = resource_type.flatMap((res) =>
            event[res].map((emp) => emp.dataValues.id),
          );
          let intersection = resources.filter((res) =>
            resources_in_event.includes(res),
          );
          const users_now = event.dataValues.users
            .filter((t) => intersection.includes(t.id))
            .map((t) => getFullName(t.dataValues));
          return [event.dataValues.start, event.dataValues.end, users_now];
        })
        .sort(([a0], [b0]) => a0 - b0);

      intersection_events = findIntersection(events_recur, bol2);

      if (intersection_events.length > 0) {
        overlapping_events = [
          ...overlapping_events,
          ...bol
            .filter((event) => {
              if (
                intersection_events.filter((event2) => {
                  const [a, b] = [event.dataValues.start, event.dataValues.end];
                  const [c, d] = [event2[0], event2[1]];
                  const lo = Math.max(a, c);
                  const hi = Math.min(b, d);
                  if (lo < hi) {
                    return true;
                  }
                }).length > 0
              ) {
                return true;
              }
              return false;
            })
            .map((event) => {
              intersection_events.map((event2) => {
                const [a, b] = [event.dataValues.start, event.dataValues.end];
                const [c, d] = [event2[0], event2[1]];
                const lo = Math.max(a, c);
                const hi = Math.min(b, d);

                event['dataValues'] = {
                  ...event['dataValues'],
                  lo_time: lo,
                  hi_time: hi,
                };
              });
              return event;
            }),
        ];
      }
    }
    res.status(200).send({
      intersection_events,
      overlapping_events: overlapping_events.map((p) => p.dataValues),
    });
  }),
);

router.get(
  '/roles_hierarchy',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    res.status(200).send(roleHierarchy);
  }),
);

router.get(
  '/roles',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const roles = await getRoles(req);
    res.status(200).send(roles.rows.map((t) => ({ id: t.id, name: t.name })));
  }),
);

router.get(
  '/branch_structure',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const bran = await BranchesDBApi.findBranchStructure({
      companyId: req.currentUser.companyId,
    });
    res.status(200).send(bran);
  }),
),
  // TODO Need?
  router.post(
    '/add_company',
    passport.authenticate('jwt', { session: false }),
    wrapAsync(async (req, res) => {
      const add_uuid = (e) => {
        return e.map((f) => f.map((t) => ({ ...t, uuid: uuidv4() })));
      };
      const cancellationTypes = add_uuid(req.body.cancellationTypesStructure);
      const branches = add_uuid(req.body.branchStructure);
      const roles = add_uuid(req.body.roleStructure);
      let users = add_uuid(req.body.industry.users);

      const cancellationTypes_flattened = _.flatten(cancellationTypes);
      const branches_flattened = _.flatten(branches);
      const roles_flattened = _.flatten(roles);

      const users_flattened = _.flatten(users);

      const permissions = req.body.industry.permissions;

      let branch_list = [];
      let roles_list = [];
      const employee_id = roles_flattened.find(
        (e) => e.name == 'Employee',
      ).uuid;
      const client_id = roles_flattened.find((e) => e.name == 'Client').uuid;
      const resource_id = roles_flattened.find(
        (e) => e.name == 'Resource',
      ).uuid;
      const person_id = roles_flattened.find((e) => e.name == 'Person').uuid;
      const funder_id = roles_flattened.find((e) => e.name == 'Funder').uuid;

      const direct_id = users_flattened.find(
        (e) => e.firstName == 'Direct 1:1',
      ).uuid;
      const supervision_id = users_flattened.find(
        (e) => e.firstName == 'Supervision',
      ).uuid;

      const gender_id = uuidv4();
      const teams_id = uuidv4();
      const funder_group_id = uuidv4();
      const certifications_id = uuidv4();
      const employee_specific_id = uuidv4();
      const client_specific_id = uuidv4();

      const group_list = [
        { id: gender_id, name: 'Gender', roles1: [person_id] },
        { id: funder_group_id, name: 'Funder', roles1: [funder_id, person_id] },
        {
          id: certifications_id,
          name: 'Certifications',
          roles1: [employee_id],
        },
        {
          id: client_specific_id,
          name: 'Client Specific',
          roles1: [client_id],
        },
        {
          id: employee_specific_id,
          name: 'Employee Specific',
          roles1: [employee_id],
        },
      ];

      let tags = [
        { id: uuidv4(), name: 'Male', group: gender_id },
        { id: uuidv4(), name: 'Female', group: gender_id },
        {
          id: uuidv4(),
          name: 'Safety Care certified',
          group: certifications_id,
        },
        { id: uuidv4(), name: 'CPR certified', group: certifications_id },
        { id: uuidv4(), name: 'High Support', group: client_specific_id },
      ];

      funder_users = users_flattened.filter((e) => e.roles.includes('Funder'));
      tags = [
        ...tags,
        ...funder_users.map((e) => ({
          id: uuidv4(),
          group: funder_group_id,
          user: [e.uuid],
          name: e.firstName,
        })),
      ];
      //Add company
      company_id = uuidv4();
      company_obj = {
        id: company_id,
        name: req.body.companyName,
      };
      await CompaniesService.create(
        company_obj,
        req.currentUser,
        true,
        req.headers.referer,
      );

      //Add Branch Structure & initial branches
      for (let index = 0; index < branches_flattened.length; index++) {
        const branch = branches_flattened[index];
        let branchType_data = {
          id: branch.uuid,
          name: branch.name,
        };
        const branch_id = uuidv4();
        branch_list.push(branch_id);
        let branch_data = {
          id: branch_id,
          name: `${branch.name} branch`,
          branchType: branch.uuid,
        };
        if (index > 0) {
          parentId = branches_flattened.find(
            (b) => b.name == branch.parent,
          ).uuid;
          branchType_data = { ...branchType_data, parent: parentId };
          branch_data = { ...branch_data, parent: branch_list[index - 1] };
        } else {
          top_branch = branch_id;
        }
        if (index == branches_flattened.length - 1) {
          low_branch = branch_id;
        }

        await BranchtypeService.create(
          branchType_data,
          req.currentUser,
          true,
          req.headers.referer,
        );
        await BranchesService.create(
          branch_data,
          req.currentUser,
          true,
          req.headers.referer,
        );
      }

      //Add Role Structure
      for (let index = 0; index < roles_flattened.length; index++) {
        const role = roles_flattened[index];
        let roles_data = {
          id: role.uuid,
          name: role.name,
        };
        if (index > 0) {
          parentId = roles_flattened.find((b) => b.name == role.parent).uuid;
          roles_data = { ...roles_data, parent: parentId };
          if (permissions[role.name]) {
            roles_data = { ...roles_data, ...permissions[role.name] };
          }
        }

        await RolesService.create(
          roles_data,
          req.currentUser,
          true,
          req.headers.referer,
        );
      }

      //Add Cancellation Types
      for (let index = 0; index < cancellationTypes_flattened.length; index++) {
        const cancellationType = roles_flattened[index];
        let cancellationTypes_data = {
          id: cancellationType.uuid,
          name: cancellationType.name,
        };
        await CancellationtypesService.create(
          cancellationTypes_data,
          req.currentUser,
          true,
          req.headers.referer,
        );
      }

      //Add Groups
      for (let index = 0; index < group_list.length; index++) {
        const groups_data = group_list[index];
        await GroupingsService.create(
          groups_data,
          //{ id: groups_data.id, name: groups_data.name },
          req.currentUser,
          true,
          req.headers.referer,
        );
      }

      // for (let index = 0; index < group_list.length; index++) {
      //   const groups_data = group_list[index];
      //   setTimeout(() => {
      //     GroupingsService.update(
      //       groups_data,
      //       req.currentUser.id,
      //       req.currentUser,
      //     );
      //   }, 500);
      // }

      const user_data = await UsersDBApi.findBy({
        id: req.currentUser.id,
        cache: false,
      });
      const user_data2 = await UsersDBApi.findBy({
        email: `ABA.${req.currentUser.email}`,
        cache: false,
      });
      let user_data_new = _.cloneDeep(user_data);
      let user_data_new2 = _.cloneDeep(user_data2);
      const super_admin_id = roles_flattened.find(
        (t) => t.name == 'Super Admin',
      ).uuid;
      user_data_new = {
        ...user_data_new,
        company: company_id,
        branches: [low_branch],
        roles: [super_admin_id],
      };

      user_data_new2 = {
        ...user_data_new2,
        company: company_id,
        roles: [super_admin_id],
        active: true,
        branches: [low_branch],
        calendarhide: true,
      };
      //Add branches and roles to superadmin
      await ClientsService.update(
        user_data_new,
        req.currentUser.id,
        req.currentUser,
      );

      //Add branches and roles to superadmin
      await ClientsService.update(
        user_data_new2,
        user_data_new2.id,
        req.currentUser,
      );

      for (let index = 0; index < users_flattened.length; index++) {
        const user = users_flattened[index];
        let user_roles = user.roles.map(
          (role) => roles_flattened.find((r) => r.name == role).uuid,
        );

        let user_data = {
          id: user.uuid,
          firstName: user.firstName,
          color: user.color,
          companyId: company_id,
          resourceName: user.roles[0],
          billable: user.billable || false,
          branches: [top_branch],
          roles: user_roles,
        };

        await UsersService.create(
          user_data,
          req.currentUser,
          true,
          req.headers.referer,
        );
      }

      //Add Tags
      for (let index = 0; index < tags.length; index++) {
        const tags_data = tags[index];
        await SubgroupServiceService.create(
          tags_data,
          req.currentUser,
          true,
          req.headers.referer,
        );
      }

      await EventpairService.create(
        { id: uuidv4(), activity1: direct_id, activity2: supervision_id },
        req.currentUser,
        true,
        req.headers.referer,
      );

      res.status(200).send([]);
    }),
  );

router.get(
  '/events/history',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const { createdById, updatedById } = req.query;

    let userIds = [createdById];
    if (createdById !== updatedById) userIds.push(updatedById);

    const users = await UsersDBApi.findAllByIds(userIds);

    const findCreatedBy = users.find((user) => user.id === createdById);
    const findUpdatedBy = users.find((user) => user.id === updatedById);

    const createdBy = getFullName(findCreatedBy);
    const updatedBy = getFullName(findUpdatedBy);

    res.status(200).send({ createdBy, updatedBy });
  }),
);

router.get(
  '/events-pdf',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const payload = await getWeeklySchedulesOfUsers(req.query, req.currentUser);
    res.status(200).send(payload);
  }),
);

router.get(
  '/events-calendar',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const payload = await getScheduleOfUserForCalendar(req.query, req.currentUser);
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${req.query.start}-${req.query.end}-event.ics"`)
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.set('Pragma', 'no-cache')
    res.status(200).send(payload);
  }),
)
// TODO Need?
router.post(
  '/events2',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const people = req.body.people;
    const events = await getEvents({
      ...req,
      ['query']: { ...req['query'], people: people },
    });

    res.status(200).send(events);
  }),
);

router.post(
  '/remove_availabilities',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    for (let index = 0; index < req.body.ids.length; index++) {
      const id = req.body.ids[index];
      await AvailabilitiesService.remove(id, req.currentUser);
    }
    res.status(200).send(true);
  }),
);

const timeMiddleware = (name, middleware) => {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      next(err); // Pass any errors to the next middleware
    });
  };
};
const timedAuthMiddleware = timeMiddleware(
  'Passport Authentication',
  passport.authenticate('jwt', { session: false }),
);

router.post(
  '/events',
  timedAuthMiddleware,
  wrapAsync(async (req, res) => {
    const start = Date.now(); // Capture the start time
    //console.time('scheduler/events Query Execution5');
    const timezone = req.body?.timezone ?? 'America/Los_Angeles';
    let events_all = [];
    //hi
    if (!req.query.branches || req.query.branches.length > 10) {
      let statusEvents_obj = {};
      //console.time('scheduler/events Query Execution4');
      const dataAccess = await getDataAccess(req);
      //console.timeEnd('scheduler/events Query Execution4');
      const all = req.body.all;
      const people = req.body.people;

      if (req.query.start && req.query.start.includes(' ')) {
        req.query.start = req.query.start.replace(' ', '+')
      }
      if (req.query.end && req.query.end.includes(' ')) {
        req.query.end = req.query.end.replace(' ', '+');
      }

      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;
      //console.time('scheduler/events Query Execution3');
      const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
      //console.timeEnd('scheduler/events Query Execution3');
      const turn_into_events = (events) => {
        const start_real = new Date(req.query.start);
        const end_real = new Date(req.query.end);

        return events.rows
          .filter((event) => {
            if (!event.dataValues.start || !event.dataValues.end) {
              return false;
            }
            const lo = Math.max(start_real, new Date(event.startRecur));
            const hi = Math.min(end_real, new Date(event.endRecur));

            if (lo >= hi) {
              return false;
            }
            const users = event.users.map((e) => e.dataValues.id);
            return (
              all ||
              true ||
              dataAccess == 'User' ||
              req.body.activities
                .concat(req.body.locations)
                .filter((e) => users.includes(e)).length > 1
            );
          })
          .flatMap((event) =>
            formatEventForScheduler(event, req, roleHierarchy),
          )
          .filter((event) => {
            //console.log('filler', event);
            return true;
          });
      };

      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;
      //console.time('scheduler/events Query Execution1');
      const events = await getEventsForTimezone({
        ...req,
        ['query']: { ...req['query'], people: people },
      });
      //console.timeEnd('scheduler/events Query Execution1');
      //console.time('scheduler/events Query Execution2');
      const eventIds = events.rows.map((event) => event.dataValues.id);
      for (let k = 0; k < events.rows.length; k++) {
        eventIds.push(events.rows[k].dataValues.id);
      }

      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;

      // let statusEvents = { rows: [] };
      // TODO ?
      // if (eventIds.length > 0) {
      //   statusEvents = await StatuseventsDBApi.findAll({
      //     event: eventIds.join('|'),
      //     status: 'Pending Cancelation',
      //     ...req['query'],
      //   });
      // }

      // statusEvents.rows.forEach((s) => {
      //   s.eventId;
      //   if (Object.keys(statusEvents_obj).includes(s.dataValues.eventId)) {
      //     statusEvents_obj = {
      //       ...statusEvents_obj,
      //       [s.dataValues.eventId]: [
      //         ...statusEvents_obj[s.dataValues.eventId],
      //         s.dataValues,
      //       ],
      //     };
      //   } else {
      //     statusEvents_obj = {
      //       ...statusEvents_obj,
      //       [s.dataValues.eventId]: [s.dataValues],
      //     };
      //   }
      // });

      events_all = turn_into_events(events);
      //console.timeEnd('scheduler/events Query Execution2');
    }
    //console.timeEnd('scheduler/events Query Execution5');
    const end = Date.now(); // Capture the end time
    //console.log(`Request completed at: ${new Date(end).toISOString()}`);
    //console.log(`Processing time: ${end - start} ms`);
    return res.status(200).send(events_all);
  }),
);

router.post(
  '/events/staff-track',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const timezone = req.body?.timezone ?? 'America/Los_Angeles';
    let events_all = [];
    let socketArr = [];
    if (!req.query.branches || req.query.branches.length > 10) {
      let resourceIds = [];
      let resources = [];
      let color = 'black';
      const dataAccess = await getDataAccess(req);
      const all = req.body.all;
      const people = req.body.people;
      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;

      const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

      const turn_into_events = (events) => {
        const start_real = new Date(req.query.start);
        const end_real = new Date(req.query.end);

        return events.rows
          .filter((event) => {
            if (!event.dataValues.start || !event.dataValues.end) {
              return false;
            }
            const lo = Math.max(start_real, new Date(event.startRecur));
            const hi = Math.min(end_real, new Date(event.endRecur));

            if (lo >= hi) {
              return false;
            }
            const users = event.users.map((e) => e.dataValues.id);
            return (
              all ||
              true ||
              dataAccess == 'User' ||
              req.body.activities
                .concat(req.body.locations)
                .filter((e) => users.includes(e)).length > 1
            );
          })
          .flatMap((event) => {
            resources = event.users.map((emp) => {
              return {
                id: emp.dataValues.id,
                name: getFullName(emp.dataValues),
              };
            });
            const clients_list = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Client'],
            ).map((ty) => getFullName(ty.dataValues));
            const employees_list = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Employee'],
            ).map((ty) => getFullName(ty.dataValues));
            const activities_l = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Activity'],
            );
            const activity_priority =
              activities_l.length > 0
                ? activities_l[0].dataValues.priority
                : null;
            const activities_list = activities_l.map((ty) =>
              getFullName(ty.dataValues),
            );
            const locations_list = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Location'],
            );
            const locations_list2 = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Location'],
            ).map((ty) => getFullName(ty.dataValues));

            const clients_list_ids = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Client'],
            ).map((ty) => ty.dataValues.id);
            const employees_list_ids = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Employee'],
            ).map((ty) => ty.dataValues.id);
            const activities_list_ids = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Activity'],
            ).map((ty) => ty.dataValues.id);
            const locations_list_ids = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Location'],
            );
            const locations_list_ids2 = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Location'],
            ).map((ty) => ty.dataValues.id);
            let locationColor = 'Black';
            if (locations_list.length > 0) {
              locationColor = locations_list[0]?.dataValues?.color || 'black';
            }
            const people_list = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Person'],
            ).map((ty) => getFullName(ty.dataValues));
            const resource_list = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Resource'],
            ).map((ty) => getFullName(ty.dataValues));
            const people_list_ids = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Person'],
            ).map((ty) => ty.dataValues.id);
            const resource_list_ids = filterUsersFromEvents(
              event.users,
              roleHierarchy,
              ['Resource'],
            ).map((ty) => ty.dataValues.id);
            const roles_list = {
              Employee: employees_list,
              Client: clients_list,
              Activity: activities_list,
            };
            const activity = filterUsersFromEvents(event.users, roleHierarchy, [
              'Activity',
            ]).find((t) => {
              const role_names = t.dataValues.roles.map(
                (ro) => ro.dataValues.name,
              );

              for (let index = 0; index < role_names.length; index++) {
                const element = role_names[index];
                if (roleHierarchy[element].includes('Activity')) {
                  return true;
                }
              }
              return false;
            });
            //CHANGE DAYS HERE
            //const days = event.daysOfWeek.map((d) => convert_weekday(d.id));
            const days = getDays(event);
            resourceIds = resources.map((e) => e.id);
            color =
              activity && activity.dataValues.color
                ? activity.dataValues.color.toLowerCase()
                : 'black';
            event = event.dataValues;

            const startNow = moment
              .utc(
                event.startRecur +
                  ' ' +
                  moment.utc(event.start).format('HH:mm'),
                'YYYY-MM-DD HH:mm',
              )
              .format();
            let startNowCopy = moment
              .utc(
                event.startRecur +
                  ' ' +
                  moment.utc(event.start).format('HH:mm'),
                'YYYY-MM-DD HH:mm',
              )
              .format();
            const endNow = moment(event.endRecur).format('YYYY-MM-DD');

            const frequency = event.frequency
              ? event.frequency.toUpperCase()
              : 'WEEKLY';

            start_real.setUTCHours(0, 0, 0, 0);
            let rruleObject = {
              interval: event.interval || 1,
              byweekday: [
                ...new Set([...days.map((t) => (t == 0 ? 6 : t - 1))]),
              ],
              freq: rule_RRule.RRule[frequency],
              dtstart: moment2.tz(startNow, timezone)
                .add(req.body.offset * -1, 'minutes')
                .toDate(),
              until: new Date(endNow),
            };

            if (frequency == 'MONTHLY') {
              rruleObject = {
                ...rruleObject,
                bysetpos: event.bysetpos ? Number(event.bysetpos) : 1,
              };
            }
            let rule2 = [];
            if (frequency == 'MONTHLY') {
              rruleObject.byweekday.forEach((day) => {
                let rule = new rule_RRule.RRule({
                  ...rruleObject,
                  byweekday: [day],
                });
                rule2 = rule2.concat(rule.between(start_real, end_real));
              });
            } else {
              let rule = new rule_RRule.RRule(rruleObject);
              rule2 = rule.between(start_real, end_real);
            }
            let final = rule2.map((dat) => {
              duration_now = moment(event.end).diff(
                moment(event.start),
                'seconds',
              );
              dat = moment(dat).add(req.body.offset, 'minutes').toDate();
              dat_end = moment(dat)
                .add(duration_now, 'seconds')
                .add(req.body.offset, 'minutes')
                .toDate();
              const dat2 = new Date(dat.getTime());
              dat2.setUTCHours(23, 59, 59, 999);

              const dst1 = moment2.tz(dat, timezone).isDST();
              const dst2 = moment2.tz(event.start, timezone).isDST();
              if (dst1 != dst2) {
                if (dst1) {
                  dat = moment(dat).add(-1, 'hours').toDate();
                  startNowCopy = moment(startNowCopy).add(-1, 'hours').toDate();
                } else {
                  dat = moment(dat).add(+1, 'hours').toDate();
                  startNowCopy = moment(startNowCopy).add(+1, 'hours').toDate();
                }
              }
              const time1 = moment(dat).format().split('T')[0];

              let obj_now = {
                id: event.id,
                title: resource_list.filter((e) => e != undefined).join(' - '),
                startNow: startNowCopy,
                endNow: endNow,
                roles_list: roles_list,
                activity: activity?.dataValues?.firstName,
                ap: activity_priority,
                start_real: dat,
                end_real_time: dat_end,
                end_real: moment(dat2)
                  .endOf('day')
                  .add(2, 'days')
                  .format('YYYY-MM-DD'),
                duration: {
                  seconds: duration_now,
                },
                duration_real: {
                  seconds: moment(event.end).diff(
                    moment(event.start),
                    'seconds',
                  ),
                },
                startTime: moment(event.start).format('HH:mm'),
                endTime: moment(event.end).format('HH:mm'),
                resourceIds: resourceIds,
                calendar: 'Personal',
                newColor: color,
                activity0Id: event.activity0Id,
                location0Id: event.location0Id,
                daysOfWeek: days,
                deletedAt: event.deletedAt,
                bysetpos: event.bysetpos,
                visible: event.visible,
                borderLocationColor: locationColor,
                daysOfWeek_real: days,

                // Cancellations
                canceled: event.isCancelled,
                user_canceled: event.isCancelled ? event.cancelledByUserId : '',
                reason_canceled: event.isCancelled
                  ? event.cancellationReasonId
                  : '',
                //cancelPending: cancelPending,

                startRecur1: event.startRecur,
                endRecur1: event.endRecur,
                startRecur: event.startRecur,
                endRecur: event.endRecur,

                createdById: event.createdById,
                updatedById: event.updatedById,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
                notes: event.notes,
                address: event.address,
                actual_users: event.users.map((r) => {
                  return {
                    id: r.id,
                    roles: r.roles,
                  };
                }),
                users: [
                  ...new Set([
                    ...people_list_ids,
                    ...locations_list_ids2,
                    ...resource_list_ids,
                  ]),
                ],
                users_names: [
                  ...new Set([
                    ...people_list,
                    ...locations_list2,
                    ...resource_list,
                  ]),
                ],

                interval: event.interval,
                frequency: event.frequency,
                sandboxMode: event.sandboxMode,
              };

              if (event.updatedById == req.currentUser.id) {
                socketArr.push({ o: obj_now, rule: rruleObject });
              }
              return obj_now;
            });

            return final;
          });
      };

      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;

      const events = await getEventsForStaffTracking(req['query']);

      /* Stop operation if request is aborted (Before query requests or functions) */
      if (req.aborted) return;

      events_all = turn_into_events(events);
    }

    res.status(200).send(events_all);
  }),
);

router.get(
  '/constraints',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    res.status(200).send([]);
  }),
);

router.get(
  '/availabilities',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const branchId = req.query.branches;
    const isValid = uuidValidate(branchId);
    //commented out because it only related to ONcall below which is commented for now
    // const bran = await BranchesDBApi.findBranchStructure({
    //   companyId: req.currentUser.companyId,
    // });

    if (!isValid) {
      res.status(200).send([]);
      return;
    }

    const timezone = req.query?.timezone ?? 'America/Los_Angeles';
    const startCalendar = new Date(
      moment2.tz(req.query.start, timezone).format('YYYY-MM-DD'),
    );
    const endCalendar = new Date(
      moment2.tz(req.query.end, timezone).subtract(1, 'day').format('YYYY-MM-DD'),
    );

    // const users = await getUsers(req);
    const branchList = await BranchesDBApi.getDescendentAndAncestorBranches({
      branchIds: branchId,
    });
    const usersAfterFilterList = await getUsersAccordingBranchRoleSubgroup(
      req.currentUser.companyId,
      branchList,
      [],
      [],
      [],
      //subgroups,
      //roles,
      //users,
      true,
      false,
    );
    const usersAfterFilterIds = usersAfterFilterList.data.rows.map((u) => u.id);
    const availabilities = await getAvailabilities({
      ...req,
      query: {
        ...req.query,
        users: usersAfterFilterIds,
        branches: '',
      },
    });
    const resources = [];
    availabilities.rows.map((r) => {
      if (r.dataValues.user) {
        resources.push(r.dataValues.user.id);
      }
    });

    return res.status(200).send(
      prepareAvailabilitiesForSchedulerResponse({
        availabilities,
        resources: [...new Set(resources)],
        type: 'user',
        startCalendar,
        endCalendar,
        timezone,
      }),
    );
  }),
);

router.post(
  '/resource-availabilities',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const timezone = req.query?.timezone ?? 'America/Los_Angeles';
    const startCalendar = new Date(
      moment2.tz(req.query.start, timezone).format('YYYY-MM-DD'),
    );
    const endCalendar = new Date(
      moment2.tz(req.query.end, timezone).subtract(1, 'day').format('YYYY-MM-DD'),
    );
    const resourceIds = `${req.body?.resourceIds ?? ''}`.split('|');

    const availabilities = await getAvailabilities({
      ...req,
      query: {
        ...req.query,
        users: resourceIds,
        branches: '',
      },
    });

    const resources = [];
    availabilities.rows.map((r) => {
      if (r.dataValues.user) {
        resources.push(r.dataValues.user.id);
      }
    });

    return res.status(200).send(
      prepareAvailabilitiesForSchedulerResponse({
        availabilities,
        resources: [...new Set(resources)],
        type: 'user',
        startCalendar,
        endCalendar,
        timezone,
      }),
    );
  }),
);

router.get(
  '/locations_types',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const turn_into_locations_types = (locations_types) => {
      return locations_types.rows.map((locations_type) => {
        locations_type = locations_type.dataValues;

        return {
          value: locations_type.id,
          label: locations_type.name,
        };
      });
    };

    const locations_t = await Locations_typesDBApi.findAll(req.query);

    res.status(200).send(turn_into_locations_types(locations_t));
  }),
);

router.get(
  '/reasons_canceled',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const turn_into_reasons_canceled = (reasons_canceled) => {
      return reasons_canceled.rows.map((reason_canceled) => {
        reason_canceled = reason_canceled.dataValues;

        return {
          value: reason_canceled.id,
          label: reason_canceled.name,
        };
      });
    };

    const cancellation_type = await CancellationtypesDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });

    res.status(200).send(turn_into_reasons_canceled(cancellation_type));
  }),
);

router.get(
  '/resources',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const branchIds = (req.query?.branches || '').split('|');

    const isValid = branchIds.every((branchId) => uuidValidate(branchId));
    if (!isValid) {
      return res.status(200).send([]);
    }

    const clients_resources = await resources_fetch({
      req,
    });
    return res.status(200).send(clients_resources);
  }),
);

router.post(
  '/resources',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const branchIds = (req.query?.branches || '').split('|');

    const isValid = branchIds.every((branchId) => uuidValidate(branchId));
    if (!isValid) {
      return res.status(200).send([]);
    }

    const filterSearchQuery = req.body?.query;
    const filterResourceIds = req.body?.resourceIds;
    const filterResourceTypes = req.body?.resourceTypes;
    const filterExcludeDescendents = req.body?.excludeDescendents;
    const filterExcludeRooms = req.body?.excludeRooms;
    const filterExcludeSupervision = req.body?.excludeSupervision;
    const page = req.body?.page;
    const limit = req.body?.limit;

    const clients_resources = await resources_fetch({
      req,
      filterSearchQuery,
      filterResourceIds,
      filterResourceTypes,
      filterExcludeDescendents,
      filterExcludeRooms,
      filterExcludeSupervision,
      page,
      limit,
    });
    return res.status(200).send(clients_resources);
  }),
);

router.get(
  '/resource-by-ids',
  wrapAsync(async (req, res) => {
    const userIds = req.query.users;
    let clients_resources = [];
    if (userIds.length > 0) {
      const users = await UsersDBApi.findUserManyToManyRelationsByIds(userIds);
      clients_resources = await turn_into_resources(req, users);
    }
    res.status(200).send(clients_resources);
  }),
);

router.post(
  '/send-emails',
  wrapAsync(async (req, res) => {
    const body = req.body;
    const host = req.headers.origin;
    const payload = await sendEmails(body, req.currentUser, host, req);

    return res.status(200).send(payload);
  }),
);

// TODO Need?
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const payload = await ClientsDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
