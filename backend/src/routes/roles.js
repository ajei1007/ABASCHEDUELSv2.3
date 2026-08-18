
const express = require('express');
const Joi = require('joi');

const RolesService = require('../services/roles');
const RolesDBApi = require('../db/api/roles');
const wrapAsync = require('../helpers').wrapAsync;
const resource_ids = require('../db/uuids/resources');
const { getRolesByGroupName, get_role_hierarchy } = require('../utils/rolesUtils');
const { getRoleHierarchy } = require('../utils/roleHierarchy');
const validateRequest = require('../middlewares/validation');
const { NotFoundError } = require('../common/errors');
const router = require('../utils/createRouter')();

const roleDataSchema = Joi.object({
  name: Joi.string().required(),
  branchType: Joi.string().uuid().required(),
  dataAccess: Joi.string().valid('User', 'All', 'Branch').required(),
  resourceName: Joi.string().valid('Employee', 'Client', 'Location').required(),
  supervisor: Joi.boolean().default(false),
  standardRoles: Joi.string()
    .valid('superAdmin', 'admin', 'clinician', 'technician', 'patient', 'unspecified')
    .default('unspecified'),
}).unknown(true);

const createRoleSchema = Joi.object({
  data: roleDataSchema.required()
});

const updateRoleSchema = Joi.object({
  data: roleDataSchema.required()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     RoleBase:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         branchType:
 *           type: string
 *           format: uuid
 *         dataAccess:
 *           type: string
 *           enum: [All, Branch, User]
 *         resourceName:
 *           type: string
 *           enum: [Employee, Client, Location]
 *         statistics:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         constraints:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         events:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         subgroups:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         scheduler:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         availabilities:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         branches:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         cancellations:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         cancellationtypes:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         capacityconstraints:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         clock:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         distanceconstraints:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         eventpair:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         groupings:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         matches:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         nogapsconstraint:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         priorities:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         relationships:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         roles:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         settings:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         settingscompany:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         statusevents:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         timeconstraints:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         timeoff:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         timeofftypes:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         users:
 *           type: string
 *           enum: [E, V, NA]
 *           nullable: true
 *         createEvent:
 *           type: boolean
 *         openshift:
 *           type: boolean
 *         editEvent:
 *           type: boolean
 *         deleteEvent:
 *           type: boolean
 *         createUser:
 *           type: boolean
 *         editUser:
 *           type: boolean
 *         deleteUser:
 *           type: boolean
 *         createCancelation:
 *           type: boolean
 *         deleteCancelation:
 *           type: boolean
 *         createAvailability:
 *           type: boolean
 *         editAvailability:
 *           type: boolean
 *         deleteAvailability:
 *           type: boolean
 *         viewReport:
 *           type: boolean
 *         viewRole:
 *           type: boolean
 *         createRole:
 *           type: boolean
 *         editRole:
 *           type: boolean
 *         deleteRole:
 *           type: boolean
 *         viewUser:
 *           type: boolean
 *         viewAvailability:
 *           type: boolean
 *         viewCancelation:
 *           type: boolean
 *         createBranch:
 *           type: boolean
 *         editBranch:
 *           type: boolean
 *         deleteBranch:
 *           type: boolean
 *         viewBranch:
 *           type: boolean
 *         createConstraint:
 *           type: boolean
 *         editConstraint:
 *           type: boolean
 *         deleteConstraint:
 *           type: boolean
 *         viewConstraint:
 *           type: boolean
 *         createSubgroup:
 *           type: boolean
 *         editSubgroup:
 *           type: string
 *           nullable: true
 *         deleteSubgroup:
 *           type: boolean
 *         viewSubgroup:
 *           type: boolean
 *         editSubgroups:
 *           type: boolean
 *         adminPushNotification:
 *           type: boolean
 *         editStaffTrackerSettings:
 *           type: boolean
 *         requestCancelation:
 *           type: boolean
 *         requestTimeoff:
 *           type: boolean
 *         requestAvailability:
 *           type: boolean
 *         requestConfirmation:
 *           type: boolean
 *         importHash:
 *           type: string
 *           nullable: true
 *         canEditEventSchedulerLocked:
 *           type: boolean
 *         optimizerFeature:
 *           type: boolean
 *         flaggingFeature:
 *           type: boolean
 *         requestsFeature:
 *           type: boolean
 *         productivityInclude:
 *           type: boolean
 *         enableRequestNotifications:
 *           type: boolean
 *         integrationFeature:
 *           type: boolean
 *         canLockScheduler:
 *           type: boolean
 *         createActivity:
 *           type: boolean
 *         editActivity:
 *           type: boolean
 *         supportRequest:
 *           type: boolean
 *         viewPayments:
 *           type: boolean
 *         managePayments:
 *           type: boolean
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         locationstypesId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         dataAccessGroupId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *
 *     RoleResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/RoleBase'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *             deletedAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *             parent:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *             createdBy:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 firstName:
 *                   type: string
 *             branchType:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *
 *     RoleRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/RoleBase'
 * 
 *     RolesResponse:
 *       type: object
 *       properties:
 *         rows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RoleResponse'
 *         count:
 *           type: integer
 *           description: Total number of roles
 */

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: API endpoints for managing roles within the system
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Create a new role
 *     description: Creates a new role with the specified parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/RoleRequest'
 *     responses:
 *       200:
 *         description: Role successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post('/', validateRequest(createRoleSchema), async (req, res) => {
  const { data } = req.body;

  const roles = await RolesDBApi.findAll({ ...req.query, companyId: req.currentUser.companyId });

  const resourceName = data.resourceName;
  
  const parent = roles.rows.find((role) => role.name.toLowerCase() === resourceName.toLowerCase())
  if (parent) {
    data.parent = parent.id
  }
  
  await RolesService.create(data, req.currentUser); 
  
  res.status(200).send(true);
});

/**
 * @swagger
 * /api/roles/resources/{name}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Get roles by resource name
 *     description: Retrieves all roles associated with a specific resource type
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Employee, Client, Location]
 *         description: Resource name to filter roles by
 *     responses:
 *       200:
 *         description: List of roles successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolesResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/resources/:name', wrapAsync(async (req, res) => {
  const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

  let roles_list = [];
  Object.entries(roleHierarchy).map((t) => {
    const [key, value] = t;
    if (value.includes(req.params.name) && key !== req.params.name) {
      roles_list.push(key);
    }
  });

  let payload = await RolesDBApi.findAll(
    { 
      ...req.query,
      companyId: req.currentUser.companyId,
      resource: roles_list.join('|'),
    }
   
  );


  res.status(200).send({rows:payload.rows,count:payload.count});
}));

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Update a role
 *     description: Update the data of a specific role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the role to update
 *     requestBody:
 *       description: The new data for the role
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/RoleRequest'
 *     responses:
 *       200:
 *         description: The role data was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.put('/:id', validateRequest(updateRoleSchema), wrapAsync(async (req, res) => {
  const { data } = req.body;

  const roles = await RolesDBApi.findAll({ ...req.query, companyId: req.currentUser.companyId });

  const resourceName = data.resourceName;

  const parent = roles.rows.find((role) => role.name?.toLowerCase() === resourceName?.toLowerCase())
  if (parent) {
    data.parent = parent.id
  }

  await RolesService.update(data, req.params.id, req.currentUser);
  
  res.status(200).send(true);
}));

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Delete the selected role
 *     description: Delete a role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the role to delete
 *     responses:
 *       200:
 *         description: The role was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await RolesService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
}));

/**
 * @swagger
 * /api/roles:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Get all roles
 *     description: Retrieve a list of all roles with pagination
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolesResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/', wrapAsync(async (req, res) => {
  const payload = await RolesDBApi.findAll(
    {...req.query, companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
}));

/**
 * @swagger
 * /api/roles/autocomplete:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Autocomplete roles
 *     description: Retrieve a list of roles matching the query for autocomplete functionality
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: The search query for role names
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The maximum number of results to return
 *     responses:
 *       200:
 *         description: List of roles for autocomplete
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   label:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/autocomplete', async (req, res) => {
  const payload = await RolesDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    {companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
});

/**
 * @swagger
 * /api/roles/autocomplete/{name}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Autocomplete roles by name
 *     description: Retrieve a list of roles matching the specified name for autocomplete functionality
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name to search for in role names
 *     responses:
 *       200:
 *         description: List of roles for autocomplete by name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   label:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/autocomplete/:name', async (req, res) => {  
  let payload = await getRolesByGroupName(req, req.params.name)

  res.status(200).send(payload);
});

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Get a specific role by ID
 *     description: Retrieve detailed information about a specific role using its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the role
 *     responses:
 *       200:
 *         description: Role successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/:id', wrapAsync(async (req, res) => {
  const payload = await RolesDBApi.findBy(
    { id: req.params.id },
  );

  if (!payload) {
    throw new NotFoundError('Role not found');
  }

  res.status(200).send(payload);
}));

module.exports = router;