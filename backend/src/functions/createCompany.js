const { v4: uuidv4 } = require('uuid');
const UsersDBApi = require('../db/api/users');
const BranchesService = require('../services/branches');
const BranchtypeService = require('../services/branchtype');
const CancellationtypesService = require('../services/cancellationtypes');
const CapacityconstraintsService = require('../services/capacityconstraints');
const NewconstraintgeneratorService = require('../services/newconstraintgenerator')
const CompaniesService = require('../services/companies');
const GroupingsService = require('../services/groupings');
const RolesService = require('../services/roles');
const SubgroupsService = require('../services/subgroups');
const UsersService = require('../services/users');
const generateArrayOfObjectsWithId = require('../utils/generateArrayOfObjectsWithId');
const industryStarter = require('../constants/industryStarter');
const AvailabilitiesService = require('../services/availabilities');
const config = require('../config');

// TODO refactor: properly setup company steup by step, handle errors correctly (rollback operations if any db write fails)
const createCompany = async (req, next) => {
  // For now the industry is only ABA
  const newCompanyStarter = {
    industry: industryStarter['ABA'],
    roleStructure: industryStarter['ABA']['roles'],
    cancellationTypesStructure: industryStarter['ABA']['cancellationtypes'],
    branchStructure: industryStarter['ABA']['branches'],
    availabilities: industryStarter['ABA']['availabilities'],
  }
  const cancellationTypes = generateArrayOfObjectsWithId(newCompanyStarter.cancellationTypesStructure);
  const branches = generateArrayOfObjectsWithId(newCompanyStarter.branchStructure);
  const roles = generateArrayOfObjectsWithId(newCompanyStarter.roleStructure);
  const users = generateArrayOfObjectsWithId(newCompanyStarter.industry.users);
  const capacityconstraints = generateArrayOfObjectsWithId(newCompanyStarter.industry.capacityconstraints, false);
  const availabilities = generateArrayOfObjectsWithId(newCompanyStarter.availabilities, false)
  const userToSessionConstraints = generateArrayOfObjectsWithId(newCompanyStarter.industry.userToSessionConstraints, false);
  const sessionLengthConstraints = generateArrayOfObjectsWithId(newCompanyStarter.industry.sessionLengthConstraints, false);
  const unmatchingConstraints = generateArrayOfObjectsWithId(newCompanyStarter.industry.unmatchingConstraints, false);
  const breakQuantityConstraints = generateArrayOfObjectsWithId(newCompanyStarter.industry.breakQuantityConstraints, false);
  const priorityConstraints = generateArrayOfObjectsWithId(newCompanyStarter.industry.priorityConstraints, false);
  const blocks = generateArrayOfObjectsWithId(newCompanyStarter.industry.blocks, false);
  const permissions = newCompanyStarter.industry.permissions;
  let user = req.body.user;
  if (!user) return res.status(404).send('User is undefined!');

  // Find the registered user
  const registeredUser = await UsersDBApi.findBy({
    id: user.id,
    cache: false,
  });
  if (!registeredUser) return res.status(404).send('User is not found!');

  //Add company
  const companyId = uuidv4();
  const companyName = req.body.companyName;
  const companyObj = {
    id: companyId,
    name: companyName,
    industry: req.body.industry,
  };
  await CompaniesService.create(companyObj, user, true, req.headers.referer);
  user = { ...user, companyId };

  const employee_id = roles.find((e) => e.name == 'Employee').uuid;
  const client_id = roles.find((e) => e.name == 'Client').uuid;
  const person_id = roles.find((e) => e.name == 'Person').uuid;
  const funder_id = roles.find((e) => e.name == 'Funder').uuid;

  const funder_users = users.filter((e) => e.roles.includes('Funder'));
  const activity_users = users.filter((e) => e.roles.includes('Activity'));

  const gender_id = uuidv4();
  const funder_group_id = uuidv4();
  const certifications_id = uuidv4();
  const employee_specific_id = uuidv4();
  const client_specific_id = uuidv4();

  const group_list = [
    // { id: uuidv4(), name: 'Matching', roles1: [person_id] },
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
  tags = [
    ...tags,
    ...funder_users.map((e) => ({
      id: uuidv4(),
      group: funder_group_id,
      user: [e.uuid],
      name: e.firstName,
    })),
  ];

  let branch_list = [];
  //Add Branch Structure & initial branches
  for (let index = 0; index < branches.length; index++) {
    const branch = branches[index];
    let branchType_data = {
      id: branch.uuid,
      name: branch.name,
      bol: true,
      physical: branch.physical ?? false,
    };
    const branch_id = uuidv4();
    branch_list.push(branch_id);
    let branch_data = {
      id: branch_id,
      name: `${branch.name} branch`,
      branchType: branch.uuid,
    };
    if (index > 0) {
      parentId = branches.find((b) => b.name == branch.parent).uuid;
      branchType_data = { ...branchType_data, parent: parentId };
      branch_data = { ...branch_data, parent: branch_list[index - 1] };
    } else {
      top_branch = branch_id;
    }
    if (index == branches.length - 1) {
      low_branch = branch_id;
    }

    await BranchtypeService.create(
      branchType_data,
      user,
      true,
      req.headers.referer,
    );
    await BranchesService.create(
      branch_data,
      user,
      true,
      req.headers.referer,
    );
  }
  //Add Role Structure
  for (let index = 0; index < roles.length; index++) {
    const role = roles[index];
    let roles_data = {
      id: role.uuid,
      name: role.name,
    };
    if (index > 0) {
      parentId = roles.find((b) => b.name == role.parent).uuid;
      roles_data = { ...roles_data, parent: parentId };
      if (permissions[role.name]) {
        roles_data = { ...roles_data, ...permissions[role.name] };
      }
    }

    await RolesService.create(roles_data, user, true, req.headers.referer);
  }
  //Add Cancellation Types
  for (let index = 0; index < cancellationTypes.length; index++) {
    const cancellationType = cancellationTypes[index];
    let cancellationTypes_data = {
      id: cancellationType.uuid,
      name: cancellationType.name,
    };
    await CancellationtypesService.create(
      cancellationTypes_data,
      user,
      true,
      req.headers.referer,
    );
  }
  //Add Groups
  for (let index = 0; index < group_list.length; index++) {
    const groups_data = group_list[index];
    await GroupingsService.create(
      groups_data,
      user,
      true,
      req.headers.referer,
    );
  }

  // Add Activities And Funders And Locations
  for (let index = 0; index < users.length; index++) {
    const userObj = users[index];
    let user_roles = userObj.roles.map(
      (role) => roles.find((r) => r.name == role).uuid,
    );

    // Dynamically set company name as location name
    if (userObj.isCenterLocation) {
      userObj.firstName = companyName;
      userObj.branches = [low_branch];
      delete userObj.isCenterLocation;
    }

    let user_data = {
      id: userObj.uuid,
      firstName: userObj.firstName,
      companyId: companyId,
      resourceName: userObj.roles[0],
      billable: userObj.billable || false,
      branches: userObj.branches?.length ? userObj.branches : [top_branch],
      roles: user_roles,
      color: userObj?.color,
      borderColor: userObj?.borderColor,
      immutable: userObj?.immutable || false,
    };
    await UsersService.create(user_data, user, true, req.headers.referer, next);
  }

  // Add Blocks
  for (let index = 0; index < blocks.length; index++) {
    const userObj = blocks[index];
    const userRoles = userObj.roles.map(role => roles.find(r => r.name === role).uuid);

    let userData = {
      active: userObj.active,
      firstName: userObj.firstName,
      resourceName: userObj.resourceName,
      role: userObj.role,
      id: userObj.uuid,
      companyId: companyId,
      roles: userRoles,
      email: `${userObj.uuid}@mail.com`,
      branches: branch_list,
      siblingGroupId: registeredUser?.siblingGroupId?.id,
    }

    const newUser = await UsersService.create(userData, user, true, req.headers.referer, next);

    await Promise.all(userObj.availabilities.map((availability) =>
      AvailabilitiesService.create(
        {
          ...availability,
          user: newUser.id,
        },
        registeredUser
      )
    ));
  }

  //Add Tags
  for (let index = 0; index < tags.length; index++) {
    await SubgroupsService.create(
      tags[index],
      user,
      true,
      req.headers.referer,
    );
  }

  const allConstraints = [
    ...userToSessionConstraints,
    ...sessionLengthConstraints,
    ...unmatchingConstraints,
    ...breakQuantityConstraints,
    ...priorityConstraints,
  ];  

  // Add all different constraints
  for (const constraint of allConstraints) {
    const antecedentTypeRole = roles.find(a => a.name === constraint?.antecedentTypeRole)
    const antecedentTypeUser = users.find(a => a.firstName === constraint?.antecedentTypeUser)
    const antecedentTypeSubgroup = tags.find(a => a.name === constraint?.antecedentTypeSubgroup)

    const consequenceTypeRole = roles.find(a => a.name === constraint?.consequenceTypeRole)
    const consequenceTypeUser = users.find(a => a.firstName === constraint?.consequenceTypeUser)
    const consequenceTypeSubgroup = tags.find(a => a.name === constraint?.consequenceTypeSubgroup)

    const newConstraint = {
      ...constraint,
      id: constraint.uuid,
      branches: [low_branch],
      antecedentTypeRole: antecedentTypeRole?.uuid ?? null,
      antecedentTypeUser: antecedentTypeUser?.uuid ?? null,
      antecedentTypeSubgroup: antecedentTypeSubgroup?.id ?? null,
      consequenceTypeRole: consequenceTypeRole?.uuid ?? null,
      consequenceTypeUser: consequenceTypeUser?.uuid ?? null,
      consequenceTypeSubgroup: consequenceTypeSubgroup?.id ?? null,
    }
    await NewconstraintgeneratorService.create(newConstraint, user);
  }

  // Add Capacityconstraints
  for (const capacity of capacityconstraints) {
    const user1Id = activity_users.find(a => a.firstName === capacity?.user1Id)
    const role1Id = roles.find(a => a.name === capacity?.role1Id)
    const role2Id = roles.find(a => a.name === capacity?.role2Id)

    const newCapacityconstraint = {
      ...capacity,
      id: capacity.uuid,
      user1: user1Id?.uuid ?? null,
      role1: role1Id?.uuid ?? null,
      role2: role2Id?.uuid ?? null,
    };
    await CapacityconstraintsService.create(newCapacityconstraint, user);
  }
  // Add Availabilities
  // Add Activities
  for (const av of availabilities) {
    const activityUser = users.find(user => user.firstName === av.user);

    if (activityUser) {
      await AvailabilitiesService.create(
        {
          ...av,
          id: av.uuid,
          user: activityUser?.uuid,
        },
        req.currentUser,
        true,
        req.headers.referer,
      );
    }
  }

  const super_admin_id = roles.find((t) => t.name == 'Super Admin').uuid;
  const updatedUserObj = {
    ...registeredUser,
    siblingGroupId: registeredUser?.siblingGroupId?.id,
    company: companyId,
    branches: [low_branch],
    roles: [super_admin_id],
  };
  delete updatedUserObj.password;
  //Add branches and roles to superadmin
  await UsersService.update(updatedUserObj, user.id, user);
  // Create ABA Schedules Superadmin
  const superadmin = {
    email: `superadmin-${companyName.replace(/\s+/g, '').toLowerCase()}@mail.com`,
    firstName: `ABA Schedules`,
    lastName: companyName,
    password: config.admin.superAdminPassword,
    company: companyId,
    branches: [low_branch],
    roles: [super_admin_id],
  };
  await UsersDBApi.createSuperadmin(superadmin);

  return registeredUser;
};

module.exports = createCompany;
