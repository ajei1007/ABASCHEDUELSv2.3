const express = require('express');
const getUsersByResourceName = require('../../utils/getUsersByResourceName');
const wrapAsync = require('../../helpers').wrapAsync;
const RolesDBApi = require('../../db/api/roles');
const UsersService = require('../../services/users');
const AvailabilitiesService = require('../../services/availabilities');
const PrioritiesService = require('../../services/priorities');
const TimeconstraintsService = require('../../services/timeconstraints');
const UsersDBApi = require('../../db/api/users');


const { getUserAndRole } = require('../../utils/getUserRole');

const router = require('../../utils/createRouter')();

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Resources:
 *        type: object
 *        required: [id, firstName, lastName, email, password, passwordConfirm, roles, branches]
 *        properties:
 *          id:
 *            type: string
 *            default: 00000000-00000000-00000000-00000000
 *          idCustom:
 *            type: string
 *          firstName:
 *            type: string
 *            default: firstName
 *          lastName:
 *            type: string
 *            default: lastName
 *          email:
 *            type: string
 *            default: email
 *          birthday:
 *            type: string
 *            format: date
 *            default: 1999-06-30
 *          address:
 *            type: string
 *            default: address
 *          longitude:
 *            type: integer
 *            format: int64
 *          latitude:
 *            type: integer
 *            format: int64
 *          disabled:
 *            type: boolean
 *            default: false
 *          roles:
 *            type: array
 *            items:
 *              type: object
 *            example: [{'id':'1472b8a6-9435-444d-aa02-c3f1a2c8d44d', 'name':'role1'}, {'id':'2dd63a97-f856-4df9-b08e-3d7ace1b3f37', 'name':'rol2'}]
 *          branches:
 *            type: array
 *            items:
 *              type: object
 *            example: [{'id':'56913f87-64fb-4f23-b918-9819c5fccc0c', 'name':'branch1'}, {'id':'3935fad2-1971-4636-b92d-4c3dedb78113', 'name':'branch2'}]
 *          credentialFunders:
 *            type: array
 *            items:
 *              type: object
 *            example: [{'id':'4ea9fd46-ca42-48e3-9291-c2311976060c', 'firstName':'funder1'}, {'id':'150c83a6-f3fe-419d-a5d7-3efe6bae50b8', 'name':'funder2'}]
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      UsersCreate:
 *        type: object
 *        required: [firstName, lastName, email, password, passwordConfirm, roles, branches]
 *        properties:
 *          idCustom:
 *            type: string
 *          firstName:
 *            type: string
 *            default: firstName
 *          lastName:
 *            type: string
 *            default: lastName
 *          email:
 *            type: string
 *            default: email
 *          phoneNumber:
 *            type: string
 *            default: phoneNumber
 *          password:
 *            type: string
 *            default: Must contain minimum 8 characters, one uppercase, one lowercase, one number and one symbol
 *          passwordConfirm:
 *            type: string
 *            default: Should be the same as password
 *          otherPhones:
 *            type: string
 *            default: otherPhones
 *          otherEmails:
 *            type: string
 *            default: otherEmails
 *          roles:
 *            type: array
 *            items:
 *              type: string
 *            example: ['role_id' , 'role_id']
 *          branches:
 *            type: array
 *            items:
 *              type: string
 *            example: ['branch_id' , 'branch_id']
 *          credentialFunders:
 *            type: array
 *            items:
 *              type: string
 *            example: ['credentialFunders_id' , 'credentialFunders_id']
 *          birthday:
 *            type: string
 *            format: date
 *            default: 1999-06-30
 *          address:
 *            type: string
 *            default: address
 *          longitude:
 *            type: integer
 *            format: int64
 *          latitude:
 *            type: integer
 *            format: int64
 *          disabled:
 *            type: boolean
 *            default: false
 *          subgroups:
 *            type: array
 *            items:
 *              type: string
 *            example: ['subgroup_id' , 'subgroup_id']
 *          availabilities:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/AvailabilityInUserCreateUpdate'
 *          priorities:
 *            type: array
 *            items:
 *             $ref: '#/components/schemas/Priority'
 *          timeconstraints:
 *            type: array
 *            items:
 *             $ref: '#/components/schemas/Timeconstraints'
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      UsersUpdate:
 *        type: object
 *        required: [firstName, lastName, email, password, passwordConfirm, roles, branches]
 *        properties:
 *          idCustom:
 *            type: string
 *          firstName:
 *            type: string
 *            default: firstName
 *          lastName:
 *            type: string
 *            default: lastName
 *          email:
 *            type: string
 *            default: email
 *          phoneNumber:
 *            type: string
 *            default: phoneNumber
 *          password:
 *            type: string
 *            default: Must contain minimum 8 characters, one uppercase, one lowercase, one number and one symbol
 *          passwordConfirm:
 *            type: string
 *            default: Should be the same as password
 *          otherPhones:
 *            type: string
 *            default: otherPhones
 *          otherEmails:
 *            type: string
 *            default: otherEmails
 *          roles:
 *            type: array
 *            items:
 *              type: string
 *            example: ['role_id' , 'role_id']
 *          branches:
 *            type: array
 *            items:
 *              type: string
 *            example: ['branch_id' , 'branch_id']
 *          credentialFunders:
 *            type: array
 *            items:
 *              type: string
 *            example: ['credentialFunders_id' , 'credentialFunders_id']
 *          deletedAvailabilities:
 *            type: array
 *            items:
 *              type: string
 *            example: ['deletedAvailabilities_id' , 'deletedAvailabilities_id']
 *          deletedPriorities:
 *            type: array
 *            items:
 *              type: string
 *            example: ['deletedPriorities_id' , 'deletedPriorities_id']
 *          deletedTimeConstrains:
 *            type: array
 *            items:
 *              type: string
 *            example: ['deletedTimeConstrains_id' , 'deletedTimeConstrains_id']
 *          birthday:
 *            type: string
 *            format: date
 *            default: 1999-06-30
 *          address:
 *            type: string
 *            default: address
 *          longitude:
 *            type: integer
 *            format: int64
 *          latitude:
 *            type: integer
 *            format: int64
 *          disabled:
 *            type: boolean
 *            default: false
 *          subgroups:
 *            type: array
 *            items:
 *              type: string
 *            example: ['subgroup_id' , 'subgroup_id']
 *          availabilities:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/AvailabilityInUserCreateUpdate'
 *          priorities:
 *            type: array
 *            items:
 *             $ref: '#/components/schemas/Priority'
 *          timeconstraints:
 *            type: array
 *            items:
 *             $ref: '#/components/schemas/Timeconstraints'
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      AvailabilityInUserCreateUpdate:
 *        type: object
 *        required: [startTime, endTime, days, startRange, endRange]
 *        properties:
 *          startTime:
 *            type: string
 *            format: date-time
 *            default: 2022-02-28T15:00:00+05:00
 *          endTime:
 *            type: string
 *            format: date-time
 *            default: 2022-02-28T20:00:00+05:00
 *          days:
 *            type: array
 *            items:
 *              type: string
 *            example: ['day_id' , 'day_id']
 *          timezone:
 *            type: string
 *            default: America/New_York
 *          location2:
 *            type: string
 *            default: location_id
 *          startRange:
 *            type: string
 *            format: date
 *            default: 2022-11-27
 *          endRange:
 *            type: string
 *            format: date
 *            default: 2023-12-30
 *          available:
 *            type: boolean
 *            default: true
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Priority:
 *        type: object
 *        required: [user2, rank]
 *        properties:
 *          user2:
 *            type: string
 *            default: user_id
 *          rank:
 *            type: number
 *            default: 1
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Timeconstraints:
 *        type: object
 *        required: [min, max, unit, frequency, start, end]
 *        properties:
 *          user2:
 *            type: string
 *            default: activity_id
 *          offset:
 *            type: number
 *            default: 1
 *          min:
 *            type: number
 *            default: 10
 *          max:
 *            type: number
 *            default: 20
 *          unit:
 *            type: string
 *            enum: [Hours, Minutes, Seconds, Units]
 *          frequency:
 *            type: string
 *            enum: [Per session, Total, Daily, Weekly, Monthly, Annually]
 *          start:
 *            type: string
 *            format: date
 *            default: 2022-11-27
 *          end:
 *            type: string
 *            format: date
 *            default: 2022-11-30
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Funders:
 *        type: object
 *        required: [id, firstName, lastName, email, branches]
 *        properties:
 *          id:
 *            type: string
 *            default: 00000000-00000000-00000000-00000000
 *          firstName:
 *            type: string
 *            default: firstName
 *          lastName:
 *            type: string
 *            default: lastName
 *          branches:
 *            type: array
 *            items:
 *              type: object
 *            example: [{'id':'56913f87-64fb-4f23-b918-9819c5fccc0c', 'name':'branch1'}, {'id':'3935fad2-1971-4636-b92d-4c3dedb78113', 'name':'branch2'}]
 */

/**
 *  @swagger
 * tags:
 *   name: 'Users - Funder | Client | Emoloyee | Location'
 *   description: The Resources (Funder | Client | Emoloyee | Location) managing API
 */

/**
 * @swagger
 *  /api/integrations/users/resources/{name}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: ['Users - Funder | Client | Emoloyee | Location']
 *      summary: Get users by resource name - Highly recommend to use Postman to make this GET request
 *      description: Get users by resource name
 *      parameters:
 *        - in: path
 *          name: name
 *          description: Name of resource to get users (Funder, Employee, Client, Location)
 *          required: true
 *          schema:
 *            type: string
 *          example: Funder
 *      responses:
 *        200:
 *          description: Selected item successfully received
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  count:
 *                    type: integer
 *                  rows:
 *                    type: array
 *                    items:
 *                      oneOf:
 *                        - $ref: "#/components/schemas/Resources"
 *                        - $ref: "#/components/schemas/Funders"
 *        400:
 *          description: Invalid data supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

router.get(
  '/resources/:name',
  wrapAsync(async (req, res) => {
    delete req.query.limit;
    delete req.query.page;
    const payload = await getUsersByResourceName(req, req.params.name, true);

    for (let i = 0; i < payload.count; i++) {
      let obj = payload.rows[i];
      let newObj = {};
      newObj.id = obj.id;
      newObj.firstName = obj.firstName;
      newObj.lastName = obj.lastName;
      newObj.branches = obj.branches;
      if (req.params.name !== 'Funder') {
        newObj.email = obj.email;
        newObj.roles = obj.roles;
        newObj.address = obj.address;
        newObj.longitude = obj.longitude;
        newObj.latitude = obj.latitude;
        newObj.birthday = obj.birthday;
        newObj.credentialFunders = obj.credentialFunders;
        newObj.disabled = obj.disabled;
        newObj.idCustom = obj.idCustom;
      }
      payload.rows[i] = newObj;
    }

    res.status(200).send(payload);
  }),
);

/**
 * @swagger
 *  /api/integrations/users:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      tags: ['Users - Funder | Client | Emoloyee | Location']
 *      summary: Create Employee | Client | Location | Funder
 *      description: Creating Employee | Client | Location | Funder
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                data:
 *                  description: Data of the updated item
 *                  type: object
 *                  $ref: "#/components/schemas/UsersCreate"
 *      responses:
 *        200:
 *          description: Selected item successfully received
 *          content:
 *            application/json:
 *              schema:
 *               $ref: "#/components/schemas/Resources"
 *        400:
 *          description: Invalid data supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

router.post('/', async (req, res, next) => {
  if (req.body.data?.resourceName) {
    if (['Activity', 'Block', 'Funder'].includes(req.body.data?.resourceName)) {
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

  const user = await UsersDBApi.findBy({ id: newUser.id, cache: true});

  let newObj = {};
  newObj.id = user.id;
  newObj.firstName = user.firstName;
  newObj.lastName = user.lastName;
  newObj.branches = user.branches;
  if (req.params.name !== 'Funder') {
    newObj.email = user.email;
    newObj.address = user.address;
    newObj.longitude = user.longitude;
    newObj.latitude = user.latitude;
    newObj.birthday = user.birthday;
    newObj.disabled = user.disabled;
    newObj.idCustom = user.idCustom;
    newObj.credentialFunders = new Array();
    for (let i = 0; i < user.credentialFunders.length; i++) {
      newObj.credentialFunders.push({
        id: user.credentialFunders[i].id,
        firstName: user.credentialFunders[i].firstName,
      });
    }
    newObj.roles = new Array();
    for (let i = 0; i < user.roles.length; i++) {
      newObj.roles.push({ id: user.roles[i].id, name: user.roles[i].name });
    }
  }

  res.status(200).send(newObj);
});

/**
 *  @swagger
 *  /api/integrations/users/{id}:
 *    put:
 *      security:
 *        - bearerAuth: []
 *      tags: ['Users - Funder | Client | Emoloyee | Location']
 *      summary: Update the data of the selected user
 *      description: Update the data of the selected user
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Item ID to update
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Set new item data
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                id:
 *                  description: ID of the updated item
 *                  type: string
 *                data:
 *                  description: Data of the updated item
 *                  type: object
 *                  $ref: "#/components/schemas/UsersUpdate"
 *              required:
 *                - id
 *      responses:
 *        200:
 *          description: The item data was successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Resources"
 *        400:
 *          description: Invalid data supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

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

    const user = await UsersDBApi.findBy({ id: req.body.id, cache: true });

    let newObj = {};
    newObj.id = user.id;
    newObj.firstName = user.firstName;
    newObj.lastName = user.lastName;
    newObj.branches = user.branches;
    if (req.params.name !== 'Funder') {
      newObj.email = user.email;
      newObj.address = user.address;
      newObj.longitude = user.longitude;
      newObj.latitude = user.latitude;
      newObj.birthday = user.birthday;
      newObj.disabled = user.disabled;
      newObj.idCustom = user.idCustom;
      newObj.credentialFunders = new Array();
      for (let i = 0; i < user.credentialFunders.length; i++) {
        newObj.credentialFunders.push({
          id: user.credentialFunders[i].id,
          firstName: user.credentialFunders[i].firstName,
        });
      }
      newObj.roles = new Array();
      for (let i = 0; i < user.roles.length; i++) {
        newObj.roles.push({ id: user.roles[i].id, name: user.roles[i].name });
      }
    }

    res.status(200).send(newObj);
  }),
);


/**
 *  @swagger
 *  /api/integrations/users/{id}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: ['Users - Funder | Client | Emoloyee | Location']
 *      summary: Get selected user
 *      description: Get selected user
 *      parameters:
 *        - in: path
 *          name: id
 *          description: ID of user to get
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Selected user successfully received
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Resources"
 *        400:
 *          description: Invalid ID supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const user = await UsersDBApi.findBy({ id: req.params.id, cache: true });

    let newObj = {};
    newObj.id = user.id;
    newObj.firstName = user.firstName;
    newObj.lastName = user.lastName;
    newObj.branches = user.branches;
    if (req.params.name !== 'Funder') {
      newObj.email = user.email;
      newObj.address = user.address;
      newObj.longitude = user.longitude;
      newObj.latitude = user.latitude;
      newObj.birthday = user.birthday;
      newObj.disabled = user.disabled;
      newObj.idCustom = user.idCustom;
      newObj.credentialFunders = new Array();
      for (let i = 0; i < user.credentialFunders.length; i++) {
        newObj.credentialFunders.push({
          id: user.credentialFunders[i].id,
          firstName: user.credentialFunders[i].firstName,
        });
      }
      newObj.roles = new Array();
      for (let i = 0; i < user.roles.length; i++) {
        newObj.roles.push({ id: user.roles[i].id, name: user.roles[i].name });
      }
    }

    res.status(200).send(newObj);
  }),
);

router.use('/', require('../../helpers').commonErrorHandler);

module.exports = router;
